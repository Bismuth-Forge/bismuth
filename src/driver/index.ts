// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { DriverSurface } from "./surface";
import { KWinSurface } from "./surface";
import { KWinWindow } from "./window";

import { Controller } from "../controller";
import { Action } from "../controller/action";

import Window from "../engine/window";

import { WindowState } from "../engine/window";

import Config from "../config";
import Debug from "../util/debug";
import { TimersPool } from "../util/timer";

export interface DriverContext {
  readonly screens: DriverSurface[];

  currentSurface: DriverSurface;
  currentWindow: Window | null;

  showNotification(text: string): void;

  bindEvents(): void;
  bindShortcut(action: Action): void;
  manageWindows(): void;
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
    const kwinSurface = value as KWinSurface;

    /* NOTE: only supports switching desktops */
    // TODO: focusing window on other screen?
    // TODO: find a way to change activity

    if (this.kwinApi.workspace.currentDesktop !== kwinSurface.desktop) {
      this.kwinApi.workspace.currentDesktop = kwinSurface.desktop;
    }
  }

  public get currentWindow(): Window | null {
    const client = this.kwinApi.workspace.activeClient;
    console.log(`Active client: ${client}`);
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

  private controller: Controller;
  private windowMap: WrapperMap<KWin.Client, Window>;
  private entered: boolean;

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
    controller: Controller,
    config: Config,
    debug: Debug
  ) {
    this.config = config;
    this.debug = debug;

    // TODO: find a better way to to this
    if (this.config.preventMinimize && this.config.monocleMinimizeRest) {
      this.debug.debug(
        () => "preventMinimize is disabled because of monocleMinimizeRest."
      );
      this.config.preventMinimize = false;
    }

    this.controller = controller;
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
    this.qml = qmlObjects;
    this.kwinApi = kwinApi;

    // Init timers singleton, so that we can use qmlSetTimeout freely
    TimersPool.instance(this.qml.scriptRoot, this.debug);
  }

  /**
   * Bind script to the various KWin events
   */
  public bindEvents(): void {
    const onNumberScreensChanged = (count: number): void => {
      this.controller.onSurfaceUpdate(`screens=${count}`);
    };

    const onScreenResized = (screen: number): void => {
      const srf = new KWinSurface(
        screen,
        this.kwinApi.workspace.currentActivity,
        this.kwinApi.workspace.currentDesktop,
        this.qml.activityInfo,
        this.kwinApi,
        this.config
      );
      this.controller.onSurfaceUpdate("resized " + srf.toString());
    };

    const onCurrentActivityChanged = (_activity: string): void => {
      this.controller.onCurrentSurfaceChanged();
    };

    const onCurrentDesktopChanged = (
      _desktop: number,
      _client: KWin.Client
    ): void => {
      this.controller.onCurrentSurfaceChanged();
    };

    const onClientAdded = (client: KWin.Client): void => {
      console.log(`Client added: ${client}`);

      const window = this.windowMap.add(client);
      this.controller.onWindowAdded(window);
      if (window.state === WindowState.Unmanaged) {
        console.log(
          `Window becomes unmanaged and gets removed :( The client was ${client}`
        );
        this.windowMap.remove(client);
      } else {
        console.log(`Client is ok, can manage. Bind events now...`);
        this.bindWindowEvents(window, client);
      }
    };

    const onClientRemoved = (client: KWin.Client): void => {
      const window = this.windowMap.get(client);
      if (window) {
        this.controller.onWindowRemoved(window);
        this.windowMap.remove(client);
      }
    };

    const onClientMaximizeSet = (
      client: KWin.Client,
      h: boolean,
      v: boolean
    ): void => {
      const maximized = h === true && v === true;
      const window = this.windowMap.get(client);
      if (window) {
        (window.window as KWinWindow).maximized = maximized;
        this.controller.onWindowMaximizeChanged(window, maximized);
      }
    };

    const onClientFullScreenSet = (
      client: KWin.Client,
      fullScreen: boolean,
      user: boolean
    ): void => {
      this.controller.onWindowChanged(
        this.windowMap.get(client),
        `fullscreen=${fullScreen} user=${user}`
      );
    };

    const onClientMinimized = (client: KWin.Client): void => {
      if (this.config.preventMinimize) {
        client.minimized = false;
        this.kwinApi.workspace.activeClient = client;
      } else {
        this.controller.onWindowChanged(
          this.windowMap.get(client),
          "minimized"
        );
      }
    };

    const onClientUnminimized = (client: KWin.Client): void =>
      this.controller.onWindowChanged(
        this.windowMap.get(client),
        "unminimized"
      );

    this.connect(
      this.kwinApi.workspace.numberScreensChanged,
      onNumberScreensChanged
    );
    this.connect(this.kwinApi.workspace.screenResized, onScreenResized);
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
   * Manage the windows
   */
  public manageWindows(): void {
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
  private manageWindow(client: KWin.Client): void {
    // Add window to our window map
    const window = this.windowMap.add(client);

    if (window.shouldIgnore) {
      this.windowMap.remove(client);
      return;
    }

    this.bindWindowEvents(window, client);

    this.controller.manageWindow(window);
  }

  public showNotification(text: string): void {
    this.qml.popupDialog.show(text);
  }

  public bindShortcut(action: Action): void {
    console.log(
      `Registering ${action.key} with the description ${action.description}`
    );
    this.kwinApi.KWin.registerShortcut(
      action.key,
      action.description,
      action.defaultKeybinding,
      (): void => {
        this.enter(() => action.execute());
      }
    );
  }

  /**
   * Binds callback to the signal w/ extra fail-safe measures, like re-entry
   * prevention and auto-disconnect on termination.
   */
  private connect(signal: QSignal, handler: (..._: any[]) => void): () => void {
    const wrapper = (...args: any[]): void => {
      // HACK: `workspace` become undefined when the script is disabled.
      // Idk why, but you can't just use brackets here
      if (typeof this.kwinApi.workspace === "undefined")
        // eslint-disable-next-line curly
        signal.disconnect(wrapper);
      // eslint-disable-next-line curly
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
  private enter(callback: () => void): void {
    if (this.entered) {
      return;
    }

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

  private bindWindowEvents(window: Window, client: KWin.Client): void {
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
          this.controller.onWindowMoveStart(window);
        } else {
          this.controller.onWindowMoveOver(window);
        }
      }
      if (resizing !== client.resize) {
        resizing = client.resize;
        if (resizing) {
          this.controller.onWindowResizeStart(window);
        } else {
          this.controller.onWindowResizeOver(window);
        }
      }
    });

    this.connect(client.geometryChanged, () => {
      if (moving) {
        this.controller.onWindowMove(window);
      } else if (resizing) {
        this.controller.onWindowResize(window);
      } else {
        if (!window.actualGeometry.equals(window.geometry)) {
          this.controller.onWindowGeometryChanged(window);
        }
      }
    });

    this.connect(client.activeChanged, () => {
      if (client.active) {
        this.controller.onWindowFocused(window);
      }
    });

    this.connect(client.screenChanged, () =>
      this.controller.onWindowChanged(window, `screen=${client.screen}`)
    );

    this.connect(client.activitiesChanged, () =>
      this.controller.onWindowChanged(
        window,
        "activity=" + client.activities.join(",")
      )
    );

    this.connect(client.desktopChanged, () =>
      this.controller.onWindowChanged(window, `desktop=${client.desktop}`)
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
