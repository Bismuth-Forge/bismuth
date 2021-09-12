// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import TilingEngine from "../engine";
import { DriverContext } from "../driver";
import Window from "../engine/window";
import { WindowState } from "../engine/window";
import { Shortcut } from "./shortcut";
import Config from "../config";
import Debug from "../util/debug";

/**
 * TilingController translates events to actions, implementing high-level
 * window management logic.
 *
 * In short, this class is just a bunch of event handling methods.
 */
export default class TilingController {
  private engine: TilingEngine;
  private config: Config;
  private debug: Debug;

  public constructor(engine: TilingEngine, config: Config, debug: Debug) {
    this.engine = engine;
    this.config = config;
    this.debug = debug;
  }

  public onSurfaceUpdate(ctx: DriverContext, comment: string): void {
    this.debug.debugObj(() => ["onSurfaceUpdate", { comment }]);
    this.engine.arrange(ctx);
  }

  public onCurrentSurfaceChanged(ctx: DriverContext): void {
    this.debug.debugObj(() => [
      "onCurrentSurfaceChanged",
      { srf: ctx.currentSurface },
    ]);
    this.engine.arrange(ctx);
  }

  public onWindowAdded(ctx: DriverContext, window: Window): void {
    this.debug.debugObj(() => ["onWindowAdded", { window }]);
    this.engine.manage(window);

    /* move window to next surface if the current surface is "full" */
    if (window.tileable) {
      const srf = ctx.currentSurface;
      const tiles = this.engine.windows.getVisibleTiles(srf);
      const layoutCapcity = this.engine.layouts.getCurrentLayout(srf).capacity;
      if (layoutCapcity !== undefined && tiles.length > layoutCapcity) {
        const nsrf = ctx.currentSurface.next();
        if (nsrf) {
          // (window.window as KWinWindow).client.desktop = (nsrf as KWinSurface).desktop;
          window.surface = nsrf;
          ctx.currentSurface = nsrf;
        }
      }
    }

    this.engine.arrange(ctx);
  }

  public onWindowRemoved(ctx: DriverContext, window: Window): void {
    this.debug.debugObj(() => ["onWindowRemoved", { window }]);
    this.engine.unmanage(window);
    this.engine.arrange(ctx);
  }

  public onWindowMoveStart(_window: Window): void {
    /* do nothing */
  }

  public onWindowMove(_window: Window): void {
    /* do nothing */
  }

  public onWindowMoveOver(ctx: DriverContext, window: Window): void {
    this.debug.debugObj(() => ["onWindowMoveOver", { window }]);

    /* swap window by dragging */
    if (window.state === WindowState.Tiled) {
      const tiles = this.engine.windows.getVisibleTiles(ctx.currentSurface);
      const cursorPos = ctx.cursorPosition || window.actualGeometry.center;

      const targets = tiles.filter(
        (tile) =>
          tile !== window && tile.actualGeometry.includesPoint(cursorPos)
      );

      if (targets.length === 1) {
        this.engine.windows.swap(window, targets[0]);
        this.engine.arrange(ctx);
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
        this.engine.arrange(ctx);
        return;
      }
    }

    /* ... or return to the previous position */
    window.commit();
  }

  public onWindowResizeStart(window: Window): void {
    /* do nothing */
  }

  public onWindowResize(ctx: DriverContext, window: Window): void {
    this.debug.debugObj(() => ["onWindowResize", { window }]);
    if (this.config.adjustLayout && this.config.adjustLayoutLive) {
      if (window.state === WindowState.Tiled) {
        this.engine.adjustLayout(window);
        this.engine.arrange(ctx);
      }
    }
  }

  public onWindowResizeOver(ctx: DriverContext, window: Window): void {
    this.debug.debugObj(() => ["onWindowResizeOver", { window }]);
    if (this.config.adjustLayout && window.tiled) {
      this.engine.adjustLayout(window);
      this.engine.arrange(ctx);
    } else if (!this.config.adjustLayout) this.engine.enforceSize(ctx, window);
  }

  public onWindowMaximizeChanged(
    ctx: DriverContext,
    window: Window,
    maximized: boolean
  ): void {
    this.engine.arrange(ctx);
  }

  public onWindowGeometryChanged(ctx: DriverContext, window: Window): void {
    this.debug.debugObj(() => ["onWindowGeometryChanged", { window }]);
    this.engine.enforceSize(ctx, window);
  }

  // NOTE: accepts `null` to simplify caller. This event is a catch-all hack
  // by itself anyway.
  public onWindowChanged(
    ctx: DriverContext,
    window: Window | null,
    comment?: string
  ): void {
    if (window) {
      this.debug.debugObj(() => ["onWindowChanged", { window, comment }]);

      if (comment === "unminimized") ctx.currentWindow = window;

      this.engine.arrange(ctx);
    }
  }

  public onWindowFocused(ctx: DriverContext, window: Window) {
    window.timestamp = new Date().getTime();
  }

  public onShortcut(ctx: DriverContext, input: Shortcut, data?: any) {
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

    if (this.engine.handleLayoutShortcut(ctx, input, data)) {
      this.engine.arrange(ctx);
      return;
    }

    const window = ctx.currentWindow;
    switch (input) {
      case Shortcut.Up:
        this.engine.focusOrder(ctx, -1);
        break;
      case Shortcut.Down:
        this.engine.focusOrder(ctx, +1);
        break;

      case Shortcut.FocusUp:
        this.engine.focusDir(ctx, "up");
        break;
      case Shortcut.FocusDown:
        this.engine.focusDir(ctx, "down");
        break;
      case Shortcut.FocusLeft:
        this.engine.focusDir(ctx, "left");
        break;
      case Shortcut.FocusRight:
        this.engine.focusDir(ctx, "right");
        break;

      case Shortcut.GrowWidth:
        if (window) this.engine.resizeWindow(window, "east", 1);
        break;
      case Shortcut.ShrinkWidth:
        if (window) this.engine.resizeWindow(window, "east", -1);
        break;
      case Shortcut.GrowHeight:
        if (window) this.engine.resizeWindow(window, "south", 1);
        break;
      case Shortcut.ShrinkHeight:
        if (window) this.engine.resizeWindow(window, "south", -1);
        break;

      case Shortcut.ShiftUp:
        if (window) this.engine.swapOrder(window, -1);
        break;
      case Shortcut.ShiftDown:
        if (window) this.engine.swapOrder(window, +1);
        break;

      case Shortcut.SwapUp:
        this.engine.swapDirOrMoveFloat(ctx, "up");
        break;
      case Shortcut.SwapDown:
        this.engine.swapDirOrMoveFloat(ctx, "down");
        break;
      case Shortcut.SwapLeft:
        this.engine.swapDirOrMoveFloat(ctx, "left");
        break;
      case Shortcut.SwapRight:
        this.engine.swapDirOrMoveFloat(ctx, "right");
        break;

      case Shortcut.SetMaster:
        if (window) this.engine.setMaster(window);
        break;
      case Shortcut.ToggleFloat:
        if (window) this.engine.toggleFloat(window);
        break;
      case Shortcut.ToggleFloatAll:
        this.engine.floatAll(ctx, ctx.currentSurface);
        break;

      case Shortcut.NextLayout:
        this.engine.cycleLayout(ctx, 1);
        break;
      case Shortcut.PreviousLayout:
        this.engine.cycleLayout(ctx, -1);
        break;
      case Shortcut.SetLayout:
        if (typeof data === "string") this.engine.setLayout(ctx, data);
        break;
    }

    this.engine.arrange(ctx);
  }
}
