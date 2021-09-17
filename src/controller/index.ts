// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { Shortcut } from "./shortcut";

import { Engine, TilingEngine } from "../engine";
import Window from "../engine/window";
import { WindowState } from "../engine/window";

import { DriverContext, KWinDriver } from "../driver";
import { DriverSurface } from "../driver/surface";

import Config from "../config";
import Debug from "../util/debug";

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
   * Current cursor position.
   */
  readonly cursorPosition: [number, number] | null;

  /**
   * Current active window. In other words the window, that has focus.
   */
  currentWindow: Window | null;

  /**
   * Current screen. In other words the screen, that has focus.
   */
  currentSurface: DriverSurface;

  /**
   * Show a popup notification in the center of the screen.
   * @param text notification text
   */
  showNotification(text: string): void;

  /**
   * React to screen focus change
   */
  onCurrentSurfaceChanged(): void;

  /**
   * React to screen update. For example, when the new screen has connected.
   * @param comment the metadata string about the details of what has changed
   */
  onSurfaceUpdate(comment: string): void;

  /**
   * React to window geometry update
   * @param window the window whose geometry has changed
   */
  onWindowGeometryChanged(window: Window): void;

  /**
   * React to window resizing
   * @param window the window which is resized
   */
  onWindowResize(window: Window): void;

  /**
   * React to window resize operation start. The window
   * resize operation is started, when the users drags
   * the window with the mouse by the window edges.
   * @param window the window which is being resized
   */
  onWindowResizeStart(window: Window): void;

  /**
   * React to window resize operation end. The window
   * resize operation ends, when the users drops
   * the window.
   * @param window the window which was dropped
   */
  onWindowResizeOver(window: Window): void;

  /**
   * React to window addition
   * @param window new added window
   */
  onWindowAdded(window: Window): void;

  /**
   * React to window removal
   * @param window the window which was removed
   */
  onWindowRemoved(window: Window): void;

  /**
   * React to window maximization state change
   * @param window the window whose maximization state changed
   * @param maximized new maximization state
   */
  onWindowMaximizeChanged(window: Window, maximized: boolean): void;

  // TODO: add docs
  onWindowChanged(window: Window | null, comment?: string): void;

  /**
   * React to window being moved.
   * @param window the window, which it being moved.
   */
  onWindowMove(window: Window): void;

  /**
   * React to window move operation start. The move operation starts
   * when the user starts dragging the window with the mouse with
   * the mouse's button being pressed
   * @param window the window which is being dragged
   */
  onWindowMoveStart(window: Window): void;

  /**
   * React to window move operation over. The move operation ends
   * when the user stops dragging the window with the mouse with
   * the mouse's button being released.
   * @param window the window which was being dragged
   */
  onWindowMoveOver(window: Window): void;

  /**
   * React to the window gaining focus, attention and love it deserves ❤️
   * @param window the window which received the focus
   */
  onWindowFocused(window: Window): void;

  /**
   * React to a particular keyboard shortcut action from the user.
   * @param input the shortcut action. For example focus the next window, or change the layout.
   * @param data the action optional data, that it could held. For example the layout name to which user want to change.
   */
  onShortcut(input: Shortcut, data?: any): void;

  /**
   * Ask engine to manage the window
   * @param win the window which needs to be managed.
   */
  manageWindow(win: Window): void;
}

export class TilingController implements Controller {
  private engine: Engine;
  private driver: DriverContext;

  public constructor(
    qmlObjects: Bismuth.Qml.Main,
    kwinApi: KWin.Api,
    private config: Config,
    private debug: Debug
  ) {
    this.engine = new TilingEngine(this, config, debug);
    this.driver = new KWinDriver(qmlObjects, kwinApi, this, config, debug);
  }

  /**
   * Entry point: start tiling window management
   */
  public start(): void {
    console.log("Let's get down to bismuth!");

    this.debug.debug(() => `Config: ${this.config}`);

    this.driver.bindEvents();
    this.driver.bindShortcuts();

    this.driver.manageWindows();

    this.engine.arrange();
  }

  public get screens(): DriverSurface[] {
    return this.driver.screens;
  }

  public get currentWindow(): Window | null {
    return this.driver.currentWindow;
  }

  public set currentWindow(value: Window | null) {
    this.driver.currentWindow = value;
  }

  public get currentSurface(): DriverSurface {
    return this.driver.currentSurface;
  }

  public set currentSurface(value: DriverSurface) {
    this.driver.currentSurface = value;
  }

  public get cursorPosition(): [number, number] | null {
    return this.driver.cursorPosition;
  }

  public showNotification(text: string): void {
    this.driver.showNotification(text);
  }

  public onSurfaceUpdate(comment: string): void {
    this.debug.debugObj(() => ["onSurfaceUpdate", { comment }]);
    this.engine.arrange();
  }

  public onCurrentSurfaceChanged(): void {
    this.debug.debugObj(() => [
      "onCurrentSurfaceChanged",
      { srf: this.currentSurface },
    ]);
    this.engine.arrange();
  }

  public onWindowAdded(window: Window): void {
    this.debug.debugObj(() => ["onWindowAdded", { window }]);
    this.engine.manage(window);

    /* move window to next surface if the current surface is "full" */
    if (window.tileable) {
      const srf = this.currentSurface;
      const tiles = this.engine.windows.getVisibleTiles(srf);
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

  public onWindowRemoved(window: Window): void {
    this.debug.debugObj(() => ["onWindowRemoved", { window }]);
    this.engine.unmanage(window);
    this.engine.arrange();
  }

  public onWindowMoveStart(_window: Window): void {
    /* do nothing */
  }

  public onWindowMove(_window: Window): void {
    /* do nothing */
  }

  public onWindowMoveOver(window: Window): void {
    this.debug.debugObj(() => ["onWindowMoveOver", { window }]);

    /* swap window by dragging */
    if (window.state === WindowState.Tiled) {
      const tiles = this.engine.windows.getVisibleTiles(this.currentSurface);
      const cursorPos = this.cursorPosition || window.actualGeometry.center;

      const targets = tiles.filter(
        (tile) =>
          tile !== window && tile.actualGeometry.includesPoint(cursorPos)
      );

      if (targets.length === 1) {
        this.engine.windows.swap(window, targets[0]);
        this.engine.arrange();
        return;
      }
    }

    /* ... or float window by dragging */
    if (window.state === WindowState.Tiled) {
      const diff = window.actualGeometry.subtract(window.geometry);
      const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
      // TODO: arbitrary constant
      if (distance > 30) {
        window.floatGeometry = window.actualGeometry;
        window.state = WindowState.Floating;
        this.engine.arrange();
        return;
      }
    }

    /* ... or return to the previous position */
    window.commit();
  }

  public onWindowResizeStart(_window: Window): void {
    /* do nothing */
  }

  public onWindowResize(window: Window): void {
    this.debug.debugObj(() => ["onWindowResize", { window }]);
    if (this.config.adjustLayout && this.config.adjustLayoutLive) {
      if (window.state === WindowState.Tiled) {
        this.engine.adjustLayout(window);
        this.engine.arrange();
      }
    }
  }

  public onWindowResizeOver(window: Window): void {
    this.debug.debugObj(() => ["onWindowResizeOver", { window }]);
    if (this.config.adjustLayout && window.tiled) {
      this.engine.adjustLayout(window);
      this.engine.arrange();
    } else if (!this.config.adjustLayout) {
      this.engine.enforceSize(window);
    }
  }

  public onWindowMaximizeChanged(_window: Window, _maximized: boolean): void {
    this.engine.arrange();
  }

  public onWindowGeometryChanged(window: Window): void {
    this.debug.debugObj(() => ["onWindowGeometryChanged", { window }]);
    this.engine.enforceSize(window);
  }

  // NOTE: accepts `null` to simplify caller. This event is a catch-all hack
  // by itself anyway.
  public onWindowChanged(window: Window | null, comment?: string): void {
    if (window) {
      this.debug.debugObj(() => ["onWindowChanged", { window, comment }]);

      if (comment === "unminimized") {
        this.currentWindow = window;
      }

      this.engine.arrange();
    }
  }

  public onWindowFocused(window: Window): void {
    window.timestamp = new Date().getTime();
  }

  public onShortcut(input: Shortcut, data?: string): void {
    if (this.config.directionalKeyMode === "focus") {
      switch (input) {
        case Shortcut.Up:
          input = Shortcut.FocusUp;
          break;
        case Shortcut.Down:
          input = Shortcut.FocusDown;
          break;
        case Shortcut.Left:
          input = Shortcut.FocusLeft;
          break;
        case Shortcut.Right:
          input = Shortcut.FocusRight;
          break;

        case Shortcut.ShiftUp:
          input = Shortcut.SwapUp;
          break;
        case Shortcut.ShiftDown:
          input = Shortcut.SwapDown;
          break;
        case Shortcut.ShiftLeft:
          input = Shortcut.SwapLeft;
          break;
        case Shortcut.ShiftRight:
          input = Shortcut.SwapRight;
          break;
      }
    }

    if (this.engine.handleLayoutShortcut(input, data)) {
      this.engine.arrange();
      return;
    }

    const window = this.currentWindow;
    switch (input) {
      case Shortcut.Up:
        this.engine.focusOrder(-1);
        break;
      case Shortcut.Down:
        this.engine.focusOrder(+1);
        break;

      case Shortcut.FocusUp:
        this.engine.focusDir("up");
        break;
      case Shortcut.FocusDown:
        this.engine.focusDir("down");
        break;
      case Shortcut.FocusLeft:
        this.engine.focusDir("left");
        break;
      case Shortcut.FocusRight:
        this.engine.focusDir("right");
        break;

      case Shortcut.GrowWidth:
        if (window) {
          this.engine.resizeWindow(window, "east", 1);
        }
        break;
      case Shortcut.ShrinkWidth:
        if (window) {
          this.engine.resizeWindow(window, "east", -1);
        }
        break;
      case Shortcut.GrowHeight:
        if (window) {
          this.engine.resizeWindow(window, "south", 1);
        }
        break;
      case Shortcut.ShrinkHeight:
        if (window) {
          this.engine.resizeWindow(window, "south", -1);
        }
        break;

      case Shortcut.ShiftUp:
        if (window) {
          this.engine.swapOrder(window, -1);
        }
        break;
      case Shortcut.ShiftDown:
        if (window) {
          this.engine.swapOrder(window, +1);
        }
        break;

      case Shortcut.SwapUp:
        this.engine.swapDirOrMoveFloat("up");
        break;
      case Shortcut.SwapDown:
        this.engine.swapDirOrMoveFloat("down");
        break;
      case Shortcut.SwapLeft:
        this.engine.swapDirOrMoveFloat("left");
        break;
      case Shortcut.SwapRight:
        this.engine.swapDirOrMoveFloat("right");
        break;

      case Shortcut.SetMaster:
        if (window) {
          this.engine.setMaster(window);
        }
        break;
      case Shortcut.ToggleFloat:
        if (window) {
          this.engine.toggleFloat(window);
        }
        break;
      case Shortcut.ToggleFloatAll:
        this.engine.floatAll(this.currentSurface);
        break;

      case Shortcut.NextLayout:
        this.engine.cycleLayout(1);
        break;
      case Shortcut.PreviousLayout:
        this.engine.cycleLayout(-1);
        break;
      case Shortcut.SetLayout:
        if (typeof data === "string") {
          this.engine.setLayout(data);
        }
        break;
    }

    this.engine.arrange();
  }

  public manageWindow(win: Window): void {
    this.engine.manage(win);
  }
}
