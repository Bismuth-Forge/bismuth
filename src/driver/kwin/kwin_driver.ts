// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import MonocleLayout from "../../layouts/monocle_layout";
import TileLayout from "../../layouts/tile_layout";
import ThreeColumnLayout from "../../layouts/three_column_layout";
import StairLayout from "../../layouts/stair_layout";
import SpreadLayout from "../../layouts/spread_layout";
import FloatingLayout from "../../layouts/floating_layout";
import QuarterLayout from "../../layouts/quarter_layout";

import TilingEngine from "../../engine/tiling_engine";
import TilingController from "../../engine/tiling_controler";
import IDriverContext from "../../idriver_context";
import ISurface from "../../isurface";
import Window from "../../engine/window";
import KWinSurface from "./kwin_surface";
import KWinWindow from "./kwin_window";
import { Shortcut } from "../../shortcut";
import KWinMousePoller from "./kwin_mouse_poller";
import { KWinSetTimeout } from "./kwin_set_timeout";
import { ILayoutClass } from "../../ilayout";
import { WindowState } from "../../engine/window";
import WrapperMap from "../../util/wrappermap";
import IConfig, { Config } from "../../config";
import Debug from "../../util/debug";

/**
 * Abstracts KDE implementation specific details.
 *
 * Driver is responsible for initializing the tiling logic, connecting
 * signals(Qt/KDE term for binding events), and providing specific utility
 * functions.
 */
export default class KWinDriver implements IDriverContext {
  public static backendName: string = "kwin";

  // TODO: split context implementation
  //#region implement properties of IDriverContext (except `setTimeout`)
  public get backend(): string {
    return KWinDriver.backendName;
  }

  public get currentSurface(): ISurface {
    return new KWinSurface(
      this.kwinApi.workspace.activeClient
        ? this.kwinApi.workspace.activeClient.screen
        : 0,
      this.kwinApi.workspace.currentActivity,
      this.kwinApi.workspace.currentDesktop,
      this.qml.activityInfo,
      this.kwinApi,
      this.config
    );
  }

  public set currentSurface(value: ISurface) {
    const ksrf = value as KWinSurface;

    /* NOTE: only supports switching desktops */
    // TODO: fousing window on other screen?
    // TODO: find a way to change activity

    if (this.kwinApi.workspace.currentDesktop !== ksrf.desktop)
      this.kwinApi.workspace.currentDesktop = ksrf.desktop;
  }

  public get currentWindow(): Window | null {
    const client = this.kwinApi.workspace.activeClient;
    return client ? this.windowMap.get(client) : null;
  }

  public set currentWindow(window: Window | null) {
    if (window !== null)
      this.kwinApi.workspace.activeClient = (
        window.window as KWinWindow
      ).client;
  }

  public get screens(): ISurface[] {
    const screens = [];
    for (let screen = 0; screen < this.kwinApi.workspace.numScreens; screen++)
      screens.push(
        new KWinSurface(
          screen,
          this.kwinApi.workspace.currentActivity,
          this.kwinApi.workspace.currentDesktop,
          this.qml.activityInfo,
          this.kwinApi,
          this.config
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
  private qml: Bismuth.Qml.Main;
  private kwinApi: KWin.Api;

  private config: IConfig;
  private debug: Debug;

  /**
   * @param qmlObjects objects from QML gui. Required for the interaction with QML, as we cannot access globals.
   * @param kwinApi KWin scripting API. Required for interaction with KWin, as we cannot access globals.
   * @param config Bismuth configuration. If none is provided, the configuration is read from KConfig (in most cases from config file).
   */
  constructor(
    qmlObjects: Bismuth.Qml.Main,
    kwinApi: KWin.Api,
    config?: IConfig
  ) {
    if (config) {
      this.config = config;
    } else {
      this.config = new Config(kwinApi);
    }
    this.debug = new Debug(this.config);

    if (this.config.preventMinimize && this.config.monocleMinimizeRest) {
      this.debug.debug(
        () => "preventMinimize is disabled because of monocleMinimizeRest."
      );
      this.config.preventMinimize = false;
    }

    this.engine = new TilingEngine(this.config, this.debug);
    this.control = new TilingController(this.engine, this.config, this.debug);
    this.windowMap = new WrapperMap(
      (client: KWin.Client) => KWinWindow.generateID(client),
      (client: KWin.Client) =>
        new Window(
          new KWinWindow(
            client,
            this.qml,
            this.kwinApi,
            this.config,
            this.debug
          ),
          this.config,
          this.debug
        )
    );
    this.entered = false;
    this.mousePoller = new KWinMousePoller(qmlObjects, this.config, this.debug);
    this.qml = qmlObjects;
    this.kwinApi = kwinApi;
  }

  /**
   * Entry point
   */
  public main() {
    console.log("Initiating systems!");

    this.debug.debug(() => "Config: " + this.config);

    this.bindEvents();
    this.bindShortcut();

    const clients = this.kwinApi.workspace.clientList();
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
    KWinSetTimeout(
      () => this.enter(func),
      timeout,
      this.qml.scriptRoot,
      this.debug
    );
  }

  public showNotification(text: string) {
    this.qml.popupDialog.show(text);
  }
  //#endregion

  private bindShortcut() {
    if (!this.kwinApi.KWin.registerShortcut) {
      this.debug.debug(
        () => "KWin.registerShortcut doesn't exist. Omitting shortcut binding."
      );
      return;
    }

    const bind = (seq: string, title: string, input: Shortcut) => {
      title = "Krohnkite: " + title;
      seq = "Meta+" + seq;
      this.kwinApi.KWin.registerShortcut(title, "", seq, () => {
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
      this.kwinApi.KWin.registerShortcut(title, "", seq, () => {
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
      if (typeof this.kwinApi.workspace === "undefined")
        signal.disconnect(wrapper);
      else this.enter(() => handler.apply(this, args));
    };
    signal.connect(wrapper);

    return wrapper;
  }

  /**
   * Run the given function in a protected(?) context to prevent nested event
   * handling.
   *
   * KWin emits signals as soon as window states are changed, even when
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
      this.debug.debug(() => e);
    } finally {
      this.entered = false;
    }
  }
  //#endregion

  private bindEvents() {
    this.connect(this.kwinApi.workspace.numberScreensChanged, (count: number) =>
      this.control.onSurfaceUpdate(this, "screens=" + count)
    );

    this.connect(this.kwinApi.workspace.screenResized, (screen: number) => {
      const srf = new KWinSurface(
        screen,
        this.kwinApi.workspace.currentActivity,
        this.kwinApi.workspace.currentDesktop,
        this.qml.activityInfo,
        this.kwinApi,
        this.config
      );
      this.control.onSurfaceUpdate(this, "resized " + srf.toString());
    });

    this.connect(
      this.kwinApi.workspace.currentActivityChanged,
      (activity: string) => this.control.onCurrentSurfaceChanged(this)
    );

    this.connect(
      this.kwinApi.workspace.currentDesktopChanged,
      (desktop: number, client: KWin.Client) =>
        this.control.onCurrentSurfaceChanged(this)
    );

    this.connect(this.kwinApi.workspace.clientAdded, (client: KWin.Client) => {
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

    this.connect(
      this.kwinApi.workspace.clientRemoved,
      (client: KWin.Client) => {
        const window = this.windowMap.get(client);
        if (window) {
          this.control.onWindowRemoved(this, window);
          this.windowMap.remove(client);
        }
      }
    );

    this.connect(
      this.kwinApi.workspace.clientMaximizeSet,
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
      this.kwinApi.workspace.clientFullScreenSet,
      (client: KWin.Client, fullScreen: boolean, user: boolean) =>
        this.control.onWindowChanged(
          this,
          this.windowMap.get(client),
          "fullscreen=" + fullScreen + " user=" + user
        )
    );

    this.connect(
      this.kwinApi.workspace.clientMinimized,
      (client: KWin.Client) => {
        if (this.config.preventMinimize) {
          client.minimized = false;
          this.kwinApi.workspace.activeClient = client;
        } else
          this.control.onWindowChanged(
            this,
            this.windowMap.get(client),
            "minimized"
          );
      }
    );

    this.connect(
      this.kwinApi.workspace.clientUnminimized,
      (client: KWin.Client) =>
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
      this.debug.debugObj(() => [
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
