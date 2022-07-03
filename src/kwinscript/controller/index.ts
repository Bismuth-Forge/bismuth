// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { Engine, EngineImpl } from "../engine";
import { EngineWindow } from "../engine/window";
import { WindowState } from "../engine/window";

import { Driver, DriverImpl } from "../driver";
import { DriverSurface } from "../driver/surface";

import { Config } from "../config";
import { Log } from "../util/log";

import * as Action from "./action";
import { TSProxy } from "../extern/proxy";

/**
 * Entry point of the script (apart from QML). Handles the user input (shortcuts)
 * and the events from the Driver (in other words KWin, the window manager/compositor).
 * Provides interface for the Engine to ask Driver about particular properties of the user
 * interface.
 *
 * Basically an adapter type controller from MVA pattern.
 */
export interface Controller {
  /**
   * A bunch of surfaces, that represent the user's screens.
   */
  readonly screens: DriverSurface[];
  /**
   * Current active window. In other words the window, that has focus.
   */
  currentWindow: EngineWindow | null;

  /**
   * Current screen. In other words the screen, that has focus.
   */
  currentSurface: DriverSurface;

  /**
   * Show a popup notification in the center of the screen.
   * @param text the main text of the notification.
   * @param icon an optional name of the icon to display in the pop-up.
   * @param hint an optional string displayed beside the main text.
   */
  showNotification(text: string, icon?: string, hint?: string): void;

  /**
   * React to screen focus change
   */
  onCurrentSurfaceChanged(): void;

  /**
   * React to screen update. For example, when the new screen has connected.
   */
  onSurfaceUpdate(): void;

  /**
   * React to window geometry update
   * @param window the window whose geometry has changed
   */
  onWindowGeometryChanged(window: EngineWindow): void;

  /**
   * React to window resizing
   * @param window the window which is resized
   */
  onWindowResize(window: EngineWindow): void;

  /**
   * React to window resize operation start. The window
   * resize operation is started, when the users drags
   * the window with the mouse by the window edges.
   * @param window the window which is being resized
   */
  onWindowResizeStart(window: EngineWindow): void;

  /**
   * React to window resize operation end. The window
   * resize operation ends, when the users drops
   * the window.
   * @param window the window which was dropped
   */
  onWindowResizeOver(window: EngineWindow): void;

  /**
   * React to window addition
   * @param window new added window
   */
  onWindowAdded(window: EngineWindow): void;

  /**
   * React to window removal
   * @param window the window which was removed
   */
  onWindowRemoved(window: EngineWindow): void;

  /**
   * React to window maximization state change
   * @param window the window whose maximization state changed
   * @param maximized new maximization state
   */
  onWindowMaximizeChanged(window: EngineWindow, maximized: boolean): void;

  // TODO: add docs
  onWindowChanged(window: EngineWindow | null, comment?: string): void;

  /**
   * React to window being moved.
   * @param window the window, which is being moved.
   */
  onWindowMove(window: EngineWindow): void;

  /**
   * React to window move operation start. The move operation starts
   * when the user starts dragging the window with the mouse with
   * the mouse's button being pressed
   * @param window the window which is being dragged
   */
  onWindowMoveStart(window: EngineWindow): void;

  /**
   * React to window move operation over. The move operation ends
   * when the user stops dragging the window with the mouse with
   * the mouse's button being released.
   * @param window the window which was being dragged
   */
  onWindowMoveOver(window: EngineWindow): void;

  /**
   * React to the window gaining focus, attention and love it deserves ❤️
   * @param window the window which received the focus
   */
  onWindowFocused(window: EngineWindow): void;

  /**
   * React to the window shade state change
   * @param window the window whose state was changed
   */
  onWindowShadeChanged(window: EngineWindow): void;

  /**
   * Ask engine to manage the window
   * @param window the window which needs to be managed.
   */
  manageWindow(window: EngineWindow): void;

  /**
   * The function is called when the script is destroyed.
   * In particular, it's called by QML Component.onDestroyed
   */
  drop(): void;
}

export class ControllerImpl implements Controller {
  private engine: Engine;
  private driver: Driver;
  public constructor(
    qmlObjects: Bismuth.Qml.Main,
    kwinApi: KWin.Api,
    private config: Config,
    private log: Log,
    private proxy: TSProxy
  ) {
    this.engine = new EngineImpl(this, config, log);
    this.driver = new DriverImpl(qmlObjects, kwinApi, this, config, log, proxy);
  }

  /**
   * Entry point: start tiling window management
   */
  public start(): void {
    this.driver.bindEvents();
    this.bindShortcuts();

    this.driver.manageWindows();

    this.engine.arrange();
  }

  public get screens(): DriverSurface[] {
    return this.driver.screens;
  }

  public get currentWindow(): EngineWindow | null {
    return this.driver.currentWindow;
  }

  public set currentWindow(value: EngineWindow | null) {
    this.driver.currentWindow = value;
  }

  public get currentSurface(): DriverSurface {
    return this.driver.currentSurface;
  }

  public set currentSurface(value: DriverSurface) {
    this.driver.currentSurface = value;
  }

  public showNotification(text: string, icon?: string, hint?: string): void {
    this.driver.showNotification(text, icon, hint);
  }

  public onSurfaceUpdate(): void {
    this.engine.arrange();
  }

  public onCurrentSurfaceChanged(): void {
    this.log.log(["onCurrentSurfaceChanged", { srf: this.currentSurface }]);
    this.engine.arrange();
  }

  public onWindowAdded(window: EngineWindow): void {
    this.log.log(["onWindowAdded", { window }]);
    this.engine.manage(window);

    /* move window to next surface if the current surface is "full" */
    if (window.tileable) {
      const srf = this.currentSurface;
      const tiles = this.engine.windows.visibleTiledWindowsOn(srf);
      const layoutCapacity = this.engine.layouts.getCurrentLayout(srf).capacity;
      if (layoutCapacity !== undefined && tiles.length > layoutCapacity) {
        const nextSurface = this.currentSurface.next();
        if (nextSurface) {
          // (window.window as KWinWindow).client.desktop = (nextSurface as KWinSurface).desktop;
          window.surface = nextSurface;
          this.currentSurface = nextSurface;
        }
      }
    }

    this.engine.arrange();
  }

  public onWindowRemoved(window: EngineWindow): void {
    this.log.log(`[Controller#onWindowRemoved] Window removed: ${window}`);

    this.engine.unmanage(window);

    if (this.engine.isLayoutMonocleAndMinimizeRest()) {
      // Switch to the next window if needed
      if (!this.currentWindow) {
        this.log.log(
          `[Controller#onWindowRemoved] Switching to the minimized window`
        );
        this.engine.focusOrder(1, true);
      }
    }

    this.engine.arrange();
  }

  public onWindowMoveStart(_window: EngineWindow): void {
    /* do nothing */
  }

  public onWindowMove(_window: EngineWindow): void {
    /* do nothing */
  }

  public onWindowMoveOver(window: EngineWindow): void {
    this.log.log(["onWindowMoveOver", { window }]);

    /* swap window by dragging */
    if (window.state === WindowState.Tiled) {
      const tiles = this.engine.windows.visibleTiledWindowsOn(
        this.currentSurface
      );
      const windowCenter = window.actualGeometry.center;

      const targets = tiles.filter(
        (tile) =>
          tile !== window && tile.actualGeometry.includesPoint(windowCenter)
      );

      if (targets.length === 1) {
        this.engine.windows.swap(window, targets[0]);
        this.engine.arrange();
        return;
      }
    }

    /* ... or float window */
    if (this.config.untileByDragging) {
      if (window.state === WindowState.Tiled) {
        const diff = window.actualGeometry.subtract(window.geometry);
        const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
        // TODO: arbitrary constant
        if (distance > 30) {
          window.floatGeometry = window.actualGeometry;
          window.state = WindowState.Floating;
          this.engine.arrange();
          this.engine.showNotification("Window Untiled");
          return;
        }
      }
    }

    /* ... or return to the previous position */
    window.commit();
  }

  public onWindowResizeStart(_window: EngineWindow): void {
    /* do nothing */
  }

  public onWindowResize(win: EngineWindow): void {
    this.log.log(`[Controller#onWindowResize] Window is resizing: ${win}`);

    if (win.state === WindowState.Tiled) {
      this.engine.adjustLayout(win);
      this.engine.arrange();
    }
  }

  public onWindowResizeOver(win: EngineWindow): void {
    this.log.log(
      `[Controller#onWindowResizeOver] Window resize is over: ${win}`
    );

    if (win.tiled) {
      this.engine.adjustLayout(win);
      this.engine.arrange();
    }
  }

  public onWindowMaximizeChanged(
    _window: EngineWindow,
    _maximized: boolean
  ): void {
    this.engine.arrange();
  }

  public onWindowGeometryChanged(window: EngineWindow): void {
    this.log.log(["onWindowGeometryChanged", { window }]);
    this.engine.enforceSize(window);
  }

  // NOTE: accepts `null` to simplify caller. This event is a catch-all hack
  // by itself anyway.
  public onWindowChanged(window: EngineWindow | null, comment?: string): void {
    if (window) {
      this.log.log(["onWindowChanged", { window, comment }]);

      if (comment === "unminimized") {
        this.currentWindow = window;
      }

      this.engine.arrange();
    }
  }

  public onWindowFocused(win: EngineWindow): void {
    win.timestamp = new Date().getTime();

    // Minimize other windows if Monocle and config.monocleMinimizeRest
    if (this.engine.isLayoutMonocleAndMinimizeRest()) {
      this.engine.minimizeOthers(win);
    }
  }

  public onWindowShadeChanged(win: EngineWindow): void {
    this.log.log(`onWindowShadeChanged, window: ${win}`);

    // NOTE: Float shaded windows and change their state back once unshaded
    // For some reason shaded windows break our tiling geometry,
    // once resized. To avoid that, we put them to floating state.
    if (win.shaded) {
      win.state = WindowState.Floating;
    } else {
      win.state = win.statePreviouslyAskedToChangeTo;
    }

    this.engine.arrange();
  }

  public manageWindow(win: EngineWindow): void {
    this.engine.manage(win);
  }

  public drop(): void {
    this.driver.drop();
  }

  private bindShortcuts(): void {
    const allPossibleActions = [
      new Action.FocusNextWindow(this.engine, this.log),
      new Action.FocusPreviousWindow(this.engine, this.log),
      new Action.FocusUpperWindow(this.engine, this.log),
      new Action.FocusBottomWindow(this.engine, this.log),
      new Action.FocusLeftWindow(this.engine, this.log),
      new Action.FocusRightWindow(this.engine, this.log),
      new Action.MoveActiveWindowToNextPosition(this.engine, this.log),

      new Action.MoveActiveWindowToPreviousPosition(this.engine, this.log),
      new Action.MoveActiveWindowUp(this.engine, this.log),
      new Action.MoveActiveWindowDown(this.engine, this.log),
      new Action.MoveActiveWindowLeft(this.engine, this.log),
      new Action.MoveActiveWindowRight(this.engine, this.log),

      new Action.IncreaseActiveWindowWidth(this.engine, this.log),
      new Action.IncreaseActiveWindowHeight(this.engine, this.log),
      new Action.DecreaseActiveWindowWidth(this.engine, this.log),
      new Action.DecreaseActiveWindowHeight(this.engine, this.log),

      new Action.IncreaseMasterAreaWindowCount(this.engine, this.log),
      new Action.DecreaseMasterAreaWindowCount(this.engine, this.log),
      new Action.IncreaseLayoutMasterAreaSize(this.engine, this.log),
      new Action.DecreaseLayoutMasterAreaSize(this.engine, this.log),

      new Action.ToggleActiveWindowFloating(this.engine, this.log),
      new Action.PushActiveWindowIntoMasterAreaFront(this.engine, this.log),

      new Action.SwitchToNextLayout(this.engine, this.log),
      new Action.SwitchToPreviousLayout(this.engine, this.log),
      new Action.ToggleTileLayout(this.engine, this.log),
      new Action.ToggleMonocleLayout(this.engine, this.log),
      new Action.ToggleThreeColumnLayout(this.engine, this.log),
      new Action.ToggleStairLayout(this.engine, this.log),
      new Action.ToggleSpreadLayout(this.engine, this.log),
      new Action.ToggleFloatingLayout(this.engine, this.log),
      new Action.ToggleQuarterLayout(this.engine, this.log),
      new Action.ToggleSpiralLayout(this.engine, this.log),

      new Action.Rotate(this.engine, this.log),
      new Action.RotateReverse(this.engine, this.log),
      new Action.RotatePart(this.engine, this.log),
    ];

    for (const action of allPossibleActions) {
      this.proxy.registerShortcut(action);
    }
  }
}
