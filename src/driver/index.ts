// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import MonocleLayout from "../layouts/monocle_layout";
import TileLayout from "../layouts/tile_layout";
import ThreeColumnLayout from "../layouts/three_column_layout";
import StairLayout from "../layouts/stair_layout";
import SpreadLayout from "../layouts/spread_layout";
import FloatingLayout from "../layouts/floating_layout";
import QuarterLayout from "../layouts/quarter_layout";

import TilingEngine from "../engine/tiling_engine";
import TilingController from "../controller";
import { DriverSurface } from "./surface";
import Window from "../engine/window";
import { KWinSurface } from "./surface";
import { KWinWindow } from "./window";
import { Shortcut } from "../controller/shortcut";
import KWinMousePoller from "./kwin_mouse_poller";
import { ILayoutClass } from "../layouts/ilayout";
import { WindowState } from "../engine/window";
import Config, { ConfigImpl } from "../config";
import Debug from "../util/debug";
import qmlSetTimeout, { TimersPool } from "../util/timer";

export interface DriverContext {
  readonly screens: DriverSurface[];
  readonly cursorPosition: [number, number] | null;

  currentSurface: DriverSurface;
  currentWindow: Window | null;

  showNotification(text: string): void;
}

/**
 * Abstracts KDE implementation specific details.
 *
 * Driver is responsible for initializing the tiling logic, connecting
 * signals (Qt/KDE term for binding events), and providing specific utility
 * functions.
 */
export class KWinDriver implements DriverContext {
  public get currentSurface(): DriverSurface {
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

  public set currentSurface(value: DriverSurface) {
    const ksrf = value as KWinSurface;

    /* NOTE: only supports switching desktops */
    // TODO: fousing window on other screen?
    // TODO: find a way to change activity

    if (this.kwinApi.workspace.currentDesktop !== ksrf.desktop) {
      this.kwinApi.workspace.currentDesktop = ksrf.desktop;
    }
  }

  public get currentWindow(): Window | null {
    const client = this.kwinApi.workspace.activeClient;
    return client ? this.windowMap.get(client) : null;
  }

  public set currentWindow(window: Window | null) {
    if (window !== null) {
      this.kwinApi.workspace.activeClient = (
        window.window as KWinWindow
      ).client;
    }
  }

  public get screens(): DriverSurface[] {
    const screensArr = [];
    for (let screen = 0; screen < this.kwinApi.workspace.numScreens; screen++) {
      screensArr.push(
        new KWinSurface(
          screen,
          this.kwinApi.workspace.currentActivity,
          this.kwinApi.workspace.currentDesktop,
          this.qml.activityInfo,
          this.kwinApi,
          this.config
        )
      );
    }
    return screensArr;
  }

  public get cursorPosition(): [number, number] | null {
    return this.mousePoller.mousePosition;
  }

  private engine: TilingEngine;
  private controller: TilingController;
  private windowMap: WrapperMap<KWin.Client, Window>;
  private entered: boolean;
  private mousePoller: KWinMousePoller;

  private qml: Bismuth.Qml.Main;
  private kwinApi: KWin.Api;

  private config: Config;
  private debug: Debug;

  /**
   * @param qmlObjects objects from QML gui. Required for the interaction with QML, as we cannot access globals.
   * @param kwinApi KWin scripting API. Required for interaction with KWin, as we cannot access globals.
   * @param config Bismuth configuration. If none is provided, the configuration is read from KConfig (in most cases from config file).
   */
  constructor(
    qmlObjects: Bismuth.Qml.Main,
    kwinApi: KWin.Api,
    config?: Config
  ) {
    if (config) {
      this.config = config;
    } else {
      this.config = new ConfigImpl(kwinApi);
    }
    this.debug = new Debug(this.config);

    // TODO: find a better way to to this
    if (this.config.preventMinimize && this.config.monocleMinimizeRest) {
      this.debug.debug(
        () => "preventMinimize is disabled because of monocleMinimizeRest."
      );
      this.config.preventMinimize = false;
    }

    this.engine = new TilingEngine(this.config, this.debug);
    this.controller = new TilingController(
      this.engine,
      this.config,
      this.debug
    );
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

    // Init timers singleton, so that we can use qmlSetTimeout freely
    TimersPool.instance(this.qml.scriptRoot, this.debug);
  }

  /**
   * Script entry point
   */
  public main() {
    console.log("Let's get down to bismuth!");

    this.debug.debug(() => "Config: " + this.config);

    this.bindEvents();
    this.bindShortcuts();

    this.manageWindows();

    // Arrange tiles
    this.engine.arrange(this);
  }

  /**
   * Bind script to the various KWin events
   */
  private bindEvents() {
    const onNumberScreensChanged = (count: number) => {
      this.controller.onSurfaceUpdate(this, "screens=" + count);
    };

    const onScreenRezized = (screen: number) => {
      const srf = new KWinSurface(
        screen,
        this.kwinApi.workspace.currentActivity,
        this.kwinApi.workspace.currentDesktop,
        this.qml.activityInfo,
        this.kwinApi,
        this.config
      );
      this.controller.onSurfaceUpdate(this, "resized " + srf.toString());
    };

    const onCurrentActivityChanged = (_activity: string) => {
      this.controller.onCurrentSurfaceChanged(this);
    };

    const onCurrentDesktopChanged = (
      _desktop: number,
      _client: KWin.Client
    ) => {
      this.controller.onCurrentSurfaceChanged(this);
    };

    const onClientAdded = (client: KWin.Client) => {
      // NOTE: windowShown can be fired in various situations.
      // We need only the first one - when window is created.
      let handled = false;
      const handler = () => {
        if (handled) return;
        handled = true;

        const window = this.windowMap.add(client);
        this.controller.onWindowAdded(this, window);
        if (window.state === WindowState.Unmanaged) {
          this.windowMap.remove(client);
        } else {
          this.bindWindowEvents(window, client);
        }

        client.windowShown.disconnect(wrapper);
      };

      const wrapper = this.connect(client.windowShown, handler);
      qmlSetTimeout(handler, 50);
    };

    const onClientRemoved = (client: KWin.Client) => {
      const window = this.windowMap.get(client);
      if (window) {
        this.controller.onWindowRemoved(this, window);
        this.windowMap.remove(client);
      }
    };

    const onClientMaximizeSet = (
      client: KWin.Client,
      h: boolean,
      v: boolean
    ) => {
      const maximized = h === true && v === true;
      const window = this.windowMap.get(client);
      if (window) {
        (window.window as KWinWindow).maximized = maximized;
        this.controller.onWindowMaximizeChanged(this, window, maximized);
      }
    };

    const onClientFullScreenSet = (
      client: KWin.Client,
      fullScreen: boolean,
      user: boolean
    ) => {
      this.controller.onWindowChanged(
        this,
        this.windowMap.get(client),
        "fullscreen=" + fullScreen + " user=" + user
      );
    };

    const onClientMinimized = (client: KWin.Client) => {
      if (this.config.preventMinimize) {
        client.minimized = false;
        this.kwinApi.workspace.activeClient = client;
      } else
        this.controller.onWindowChanged(
          this,
          this.windowMap.get(client),
          "minimized"
        );
    };

    const onClientUnminimized = (client: KWin.Client) =>
      this.controller.onWindowChanged(
        this,
        this.windowMap.get(client),
        "unminimized"
      );

    this.connect(
      this.kwinApi.workspace.numberScreensChanged,
      onNumberScreensChanged
    );
    this.connect(this.kwinApi.workspace.screenResized, onScreenRezized);
    this.connect(
      this.kwinApi.workspace.currentActivityChanged,
      onCurrentActivityChanged
    );
    this.connect(
      this.kwinApi.workspace.currentDesktopChanged,
      onCurrentDesktopChanged
    );
    this.connect(this.kwinApi.workspace.clientAdded, onClientAdded);
    this.connect(this.kwinApi.workspace.clientRemoved, onClientRemoved);
    this.connect(this.kwinApi.workspace.clientMaximizeSet, onClientMaximizeSet);
    this.connect(
      this.kwinApi.workspace.clientFullScreenSet,
      onClientFullScreenSet
    );
    this.connect(this.kwinApi.workspace.clientMinimized, onClientMinimized);
    this.connect(this.kwinApi.workspace.clientUnminimized, onClientUnminimized);

    // TODO: options.configChanged.connect(this.onConfigChanged);
    /* NOTE: How disappointing. This doesn't work at all. Even an official kwin script tries this.
     *       https://github.com/KDE/kwin/blob/master/scripts/minimizeall/contents/code/main.js */
  }

  /**
   * Rigister Bismuth shortcuts
   */
  private bindShortcuts() {
    this.bindMainShortcuts();
    this.bindLayoutShortcuts();
  }

  /**
   * Manage the windows
   */
  private manageWindows() {
    const clients = this.kwinApi.workspace.clientList();
    // TODO: provide interface for using the "for of" cycle
    for (let i = 0; i < clients.length; i++) {
      this.manageWindow(clients[i]);
    }
  }

  /**
   * Manage window with the particular KWin clientship
   * @param client window client object specified by KWin
   */
  private manageWindow(client: KWin.Client) {
    // Add window to our window map
    const window = this.windowMap.add(client);

    // Ask engine to manage window
    this.engine.manage(window);

    // If window is still unmanaged, remove it, otherwise bind to its events
    if (window.state === WindowState.Unmanaged) {
      this.windowMap.remove(client);
    } else {
      this.bindWindowEvents(window, client);
    }
  }

  public showNotification(text: string) {
    this.qml.popupDialog.show(text);
  }

  private bindMainShortcuts() {
    const bind = (seq: string, title: string, input: Shortcut) => {
      title = "Bismuth: " + title;
      seq = "Meta+" + seq;
      this.kwinApi.KWin.registerShortcut(title, "", seq, () => {
        this.enter(() => this.controller.onShortcut(this, input));
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
  }

  private bindLayoutShortcuts() {
    const bind = (seq: string, title: string, layoutClass: ILayoutClass) => {
      title = "Bismuth: " + title + " Layout";
      seq = seq !== "" ? "Meta+" + seq : "";
      this.kwinApi.KWin.registerShortcut(title, "", seq, () => {
        this.enter(() =>
          this.controller.onShortcut(this, Shortcut.SetLayout, layoutClass.id)
        );
      });
    };

    bind("T", "Tile", TileLayout);
    bind("M", "Monocle", MonocleLayout);
    bind("", "Three Column", ThreeColumnLayout);
    bind("", "Spread", SpreadLayout);
    bind("", "Stair", StairLayout);
    bind("", "Floating", FloatingLayout);
    bind("", "Quarter", QuarterLayout);
  }

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
          this.controller.onWindowMoveStart(window);
        } else {
          this.controller.onWindowMoveOver(this, window);
          this.mousePoller.stop();
        }
      }
      if (resizing !== client.resize) {
        resizing = client.resize;
        if (resizing) this.controller.onWindowResizeStart(window);
        else this.controller.onWindowResizeOver(this, window);
      }
    });

    this.connect(client.geometryChanged, () => {
      if (moving) this.controller.onWindowMove(window);
      else if (resizing) this.controller.onWindowResize(this, window);
      else {
        if (!window.actualGeometry.equals(window.geometry))
          this.controller.onWindowGeometryChanged(this, window);
      }
    });

    this.connect(client.activeChanged, () => {
      if (client.active) this.controller.onWindowFocused(this, window);
    });

    this.connect(client.screenChanged, () =>
      this.controller.onWindowChanged(this, window, "screen=" + client.screen)
    );

    this.connect(client.activitiesChanged, () =>
      this.controller.onWindowChanged(
        this,
        window,
        "activity=" + client.activities.join(",")
      )
    );

    this.connect(client.desktopChanged, () =>
      this.controller.onWindowChanged(this, window, "desktop=" + client.desktop)
    );
  }

  // TODO: private onConfigChanged = () => {
  //     this.loadConfig();
  //     this.engine.arrange();
  // }
  /* NOTE: check `bindEvents` for details */
}

/**
 * Wrapper map type.
 */
class WrapperMap<F, T> {
  private items: { [key: string]: T };

  constructor(
    public readonly hasher: (item: F) => string,
    public readonly wrapper: (item: F) => T
  ) {
    this.items = {};
  }

  public add(item: F): T {
    const key = this.hasher(item);

    if (this.items[key] !== undefined) {
      throw "WrapperMap: the key [" + key + "] already exists!";
    }

    const wrapped = this.wrapper(item);
    this.items[key] = wrapped;
    return wrapped;
  }

  public get(item: F): T | null {
    const key = this.hasher(item);
    return this.items[key] || null;
  }

  public getByKey(key: string): T | null {
    return this.items[key] || null;
  }

  public remove(item: F): boolean {
    const key = this.hasher(item);
    return delete this.items[key];
  }
}
