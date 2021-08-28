// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

/**
 * Abstracts KDE implementation specific details.
 *
 * Driver is responsible for initializing the tiling logic, connecting
 * signals(Qt/KDE term for binding events), and providing specific utility
 * functions.
 */
class KWinDriver implements IDriverContext {
  public static backendName: string = "kwin";

  // TODO: split context implementation
  //#region implement properties of IDriverContext (except `setTimeout`)
  public get backend(): string {
    return KWinDriver.backendName;
  }

  public get currentSurface(): ISurface {
    return new KWinSurface(
      workspace.activeClient ? workspace.activeClient.screen : 0,
      workspace.currentActivity,
      workspace.currentDesktop
    );
  }

  public set currentSurface(value: ISurface) {
    const ksrf = value as KWinSurface;

    /* NOTE: only supports switching desktops */
    // TODO: fousing window on other screen?
    // TODO: find a way to change activity

    if (workspace.currentDesktop !== ksrf.desktop)
      workspace.currentDesktop = ksrf.desktop;
  }

  public get currentWindow(): Window | null {
    const client = workspace.activeClient;
    return client ? this.windowMap.get(client) : null;
  }

  public set currentWindow(window: Window | null) {
    if (window !== null)
      workspace.activeClient = (window.window as KWinWindow).client;
  }

  public get screens(): ISurface[] {
    const screens = [];
    for (let screen = 0; screen < workspace.numScreens; screen++)
      screens.push(
        new KWinSurface(
          screen,
          workspace.currentActivity,
          workspace.currentDesktop
        )
      );
    return screens;
  }

  public get cursorPosition(): [number, number] | null {
    return this.mousePoller.mousePosition;
  }

  //#endregion

  private engine: TilingEngine;
  private control: TilingController;
  private windowMap: WrapperMap<KWin.Client, Window>;
  private entered: boolean;
  private mousePoller: KWinMousePoller;

  constructor() {
    this.engine = new TilingEngine();
    this.control = new TilingController(this.engine);
    this.windowMap = new WrapperMap(
      (client: KWin.Client) => KWinWindow.generateID(client),
      (client: KWin.Client) => new Window(new KWinWindow(client))
    );
    this.entered = false;
    this.mousePoller = new KWinMousePoller();
  }

  /*
   * Main
   */

  public main() {
    CONFIG = KWINCONFIG = new KWinConfig();
    debug(() => "Config: " + KWINCONFIG);

    this.bindEvents();
    this.bindShortcut();

    const clients = workspace.clientList();
    for (let i = 0; i < clients.length; i++) {
      const window = this.windowMap.add(clients[i]);
      this.engine.manage(window);
      if (window.state !== WindowState.Unmanaged)
        this.bindWindowEvents(window, clients[i]);
      else this.windowMap.remove(clients[i]);
    }
    this.engine.arrange(this);
  }

  //#region implement methods of IDriverContext`
  public setTimeout(func: () => void, timeout: number) {
    KWinSetTimeout(() => this.enter(func), timeout);
  }

  public showNotification(text: string) {
    popupDialog.show(text);
  }
  //#endregion

  private bindShortcut() {
    if (!KWin.registerShortcut) {
      debug(
        () => "KWin.registerShortcut doesn't exist. Omitting shortcut binding."
      );
      return;
    }

    const bind = (seq: string, title: string, input: Shortcut) => {
      title = "Krohnkite: " + title;
      seq = "Meta+" + seq;
      KWin.registerShortcut(title, "", seq, () => {
        this.enter(() => this.control.onShortcut(this, input));
      });
    };

    bind("J", "Down/Next", Shortcut.Down);
    bind("K", "Up/Prev", Shortcut.Up);
    bind("H", "Left", Shortcut.Left);
    bind("L", "Right", Shortcut.Right);

    bind("Shift+J", "Move Down/Next", Shortcut.ShiftDown);
    bind("Shift+K", "Move Up/Prev", Shortcut.ShiftUp);
    bind("Shift+H", "Move Left", Shortcut.ShiftLeft);
    bind("Shift+L", "Move Right", Shortcut.ShiftRight);

    bind("Ctrl+J", "Grow Height", Shortcut.GrowHeight);
    bind("Ctrl+K", "Shrink Height", Shortcut.ShrinkHeight);
    bind("Ctrl+H", "Shrink Width", Shortcut.ShrinkWidth);
    bind("Ctrl+L", "Grow Width", Shortcut.GrowWidth);

    bind("I", "Increase", Shortcut.Increase);
    bind("D", "Decrease", Shortcut.Decrease);

    bind("F", "Float", Shortcut.ToggleFloat);
    bind("Shift+F", "Float All", Shortcut.ToggleFloatAll);
    bind("", "Cycle Layout", Shortcut.NextLayout); // TODO: remove this shortcut
    bind("\\", "Next Layout", Shortcut.NextLayout);
    bind("|", "Previous Layout", Shortcut.PreviousLayout);

    bind("R", "Rotate", Shortcut.Rotate);
    bind("Shift+R", "Rotate Part", Shortcut.RotatePart);

    bind("Return", "Set master", Shortcut.SetMaster);

    const bindLayout = (
      seq: string,
      title: string,
      layoutClass: ILayoutClass
    ) => {
      title = "Krohnkite: " + title + " Layout";
      seq = seq !== "" ? "Meta+" + seq : "";
      KWin.registerShortcut(title, "", seq, () => {
        this.enter(() =>
          this.control.onShortcut(this, Shortcut.SetLayout, layoutClass.id)
        );
      });
    };

    bindLayout("T", "Tile", TileLayout);
    bindLayout("M", "Monocle", MonocleLayout);
    bindLayout("", "Three Column", ThreeColumnLayout);
    bindLayout("", "Spread", SpreadLayout);
    bindLayout("", "Stair", StairLayout);
    bindLayout("", "Floating", FloatingLayout);
    bindLayout("", "Quarter", QuarterLayout);
  }

  //#region Helper functions
  /**
   * Binds callback to the signal w/ extra fail-safe measures, like re-entry
   * prevention and auto-disconnect on termination.
   */
  private connect(signal: QSignal, handler: (..._: any[]) => void): () => void {
    const wrapper = (...args: any[]) => {
      /* HACK: `workspace` become undefined when the script is disabled. */
      if (typeof workspace === "undefined") signal.disconnect(wrapper);
      else this.enter(() => handler.apply(this, args));
    };
    signal.connect(wrapper);

    return wrapper;
  }

  /**
   * Run the given function in a protected(?) context to prevent nested event
   * handling.
   *
   * KWin emits signals as soons as window states are changed, even when
   * those states are modified by the script. This causes multiple re-entry
   * during event handling, resulting in performance degradation and harder
   * debugging.
   */
  private enter(callback: () => void) {
    if (this.entered) return;

    this.entered = true;
    try {
      callback();
    } catch (e) {
      // TODO: investigate why this line prevents compiling
      // debug(() => "Error raised from line " + e.lineNumber);
      debug(() => e);
    } finally {
      this.entered = false;
    }
  }
  //#endregion

  private bindEvents() {
    this.connect(workspace.numberScreensChanged, (count: number) =>
      this.control.onSurfaceUpdate(this, "screens=" + count)
    );

    this.connect(workspace.screenResized, (screen: number) => {
      const srf = new KWinSurface(
        screen,
        workspace.currentActivity,
        workspace.currentDesktop
      );
      this.control.onSurfaceUpdate(this, "resized " + srf.toString());
    });

    this.connect(workspace.currentActivityChanged, (activity: string) =>
      this.control.onCurrentSurfaceChanged(this)
    );

    this.connect(
      workspace.currentDesktopChanged,
      (desktop: number, client: KWin.Client) =>
        this.control.onCurrentSurfaceChanged(this)
    );

    this.connect(workspace.clientAdded, (client: KWin.Client) => {
      /* NOTE: windowShown can be fired in various situations.
       *       We need only the first one - when window is created. */
      let handled = false;
      const handler = () => {
        if (handled) return;
        handled = true;

        const window = this.windowMap.add(client);
        this.control.onWindowAdded(this, window);
        if (window.state !== WindowState.Unmanaged)
          this.bindWindowEvents(window, client);
        else this.windowMap.remove(client);

        client.windowShown.disconnect(wrapper);
      };

      const wrapper = this.connect(client.windowShown, handler);
      this.setTimeout(handler, 50);
    });

    this.connect(workspace.clientRemoved, (client: KWin.Client) => {
      const window = this.windowMap.get(client);
      if (window) {
        this.control.onWindowRemoved(this, window);
        this.windowMap.remove(client);
      }
    });

    this.connect(
      workspace.clientMaximizeSet,
      (client: KWin.Client, h: boolean, v: boolean) => {
        const maximized = h === true && v === true;
        const window = this.windowMap.get(client);
        if (window) {
          (window.window as KWinWindow).maximized = maximized;
          this.control.onWindowMaximizeChanged(this, window, maximized);
        }
      }
    );

    this.connect(
      workspace.clientFullScreenSet,
      (client: KWin.Client, fullScreen: boolean, user: boolean) =>
        this.control.onWindowChanged(
          this,
          this.windowMap.get(client),
          "fullscreen=" + fullScreen + " user=" + user
        )
    );

    this.connect(workspace.clientMinimized, (client: KWin.Client) => {
      if (KWINCONFIG.preventMinimize) {
        client.minimized = false;
        workspace.activeClient = client;
      } else
        this.control.onWindowChanged(
          this,
          this.windowMap.get(client),
          "minimized"
        );
    });

    this.connect(workspace.clientUnminimized, (client: KWin.Client) =>
      this.control.onWindowChanged(
        this,
        this.windowMap.get(client),
        "unminimized"
      )
    );

    // TODO: options.configChanged.connect(this.onConfigChanged);
    /* NOTE: How disappointing. This doesn't work at all. Even an official kwin script tries this.
     *       https://github.com/KDE/kwin/blob/master/scripts/minimizeall/contents/code/main.js */
  }

  private bindWindowEvents(window: Window, client: KWin.Client) {
    let moving = false;
    let resizing = false;

    this.connect(client.moveResizedChanged, () => {
      debugObj(() => [
        "moveResizedChanged",
        { window, move: client.move, resize: client.resize },
      ]);
      if (moving !== client.move) {
        moving = client.move;
        if (moving) {
          this.mousePoller.start();
          this.control.onWindowMoveStart(window);
        } else {
          this.control.onWindowMoveOver(this, window);
          this.mousePoller.stop();
        }
      }
      if (resizing !== client.resize) {
        resizing = client.resize;
        if (resizing) this.control.onWindowResizeStart(window);
        else this.control.onWindowResizeOver(this, window);
      }
    });

    this.connect(client.geometryChanged, () => {
      if (moving) this.control.onWindowMove(window);
      else if (resizing) this.control.onWindowResize(this, window);
      else {
        if (!window.actualGeometry.equals(window.geometry))
          this.control.onWindowGeometryChanged(this, window);
      }
    });

    this.connect(client.activeChanged, () => {
      if (client.active) this.control.onWindowFocused(this, window);
    });

    this.connect(client.screenChanged, () =>
      this.control.onWindowChanged(this, window, "screen=" + client.screen)
    );

    this.connect(client.activitiesChanged, () =>
      this.control.onWindowChanged(
        this,
        window,
        "activity=" + client.activities.join(",")
      )
    );

    this.connect(client.desktopChanged, () =>
      this.control.onWindowChanged(this, window, "desktop=" + client.desktop)
    );
  }

  // TODO: private onConfigChanged = () => {
  //     this.loadConfig();
  //     this.engine.arrange();
  // }
  /* NOTE: check `bindEvents` for details */
}
