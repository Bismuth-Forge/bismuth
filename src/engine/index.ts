// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import MonocleLayout from "./layout/monocle_layout";

import LayoutStore from "./layout_store";
import EngineContext from "./engine_context";
import WindowStore from "./window_store";
import Window from "./window";
import { DriverContext } from "../driver";
import { DriverSurface } from "../driver/surface";
import { Shortcut } from "../controller/shortcut";
import { WindowState } from "./window";
import Rect from "../util/rect";
import RectDelta from "../util/rectdelta";
import { overlap, wrapIndex } from "../util/func";
import Config from "../config";
import Debug from "../util/debug";
import qmlSetTimeout from "../util/timer";
import TilingController from "../controller";

export type Direction = "up" | "down" | "left" | "right";

/**
 * Maintains tiling context and performs various tiling actions.
 */
export default class TilingEngine {
  public layouts: LayoutStore;
  public windows: WindowStore;

  private controller: TilingController;
  private config: Config;
  private debug: Debug;

  constructor(controller: TilingController, config: Config, debug: Debug) {
    this.controller = controller;
    this.config = config;
    this.debug = debug;
    this.layouts = new LayoutStore(this.config);
    this.windows = new WindowStore();
  }

  /**
   * Adjust layout based on the change in size of a tile.
   *
   * This operation is completely layout-dependent, and no general implementation is
   * provided.
   *
   * Used when tile is resized using mouse.
   */
  public adjustLayout(basis: Window) {
    const srf = basis.surface;
    const layout = this.layouts.getCurrentLayout(srf);
    if (layout.adjust) {
      const area = srf.workingArea.gap(
        this.config.screenGapLeft,
        this.config.screenGapRight,
        this.config.screenGapTop,
        this.config.screenGapBottom
      );
      const tiles = this.windows.getVisibleTiles(srf);
      layout.adjust(area, tiles, basis, basis.geometryDelta);
    }
  }

  /**
   * Resize the current floating window.
   *
   * @param window a floating window
   */
  public resizeFloat(
    window: Window,
    dir: "east" | "west" | "south" | "north",
    step: -1 | 1
  ) {
    const srf = window.surface;

    // TODO: configurable step size?
    const hStepSize = srf.workingArea.width * 0.05;
    const vStepSize = srf.workingArea.height * 0.05;

    let hStep, vStep;
    switch (dir) {
      case "east":
        (hStep = step), (vStep = 0);
        break;
      case "west":
        (hStep = -step), (vStep = 0);
        break;
      case "south":
        (hStep = 0), (vStep = step);
        break;
      case "north":
        (hStep = 0), (vStep = -step);
        break;
    }

    const geometry = window.actualGeometry;
    const width = geometry.width + hStepSize * hStep;
    const height = geometry.height + vStepSize * vStep;

    window.forceSetGeometry(new Rect(geometry.x, geometry.y, width, height));
  }

  /**
   * Resize the current tile by adjusting the layout.
   *
   * Used by grow/shrink shortcuts.
   */
  public resizeTile(
    basis: Window,
    dir: "east" | "west" | "south" | "north",
    step: -1 | 1
  ) {
    const srf = basis.surface;

    if (dir === "east") {
      const maxX = basis.geometry.maxX;
      const easternNeighbor = this.windows
        .getVisibleTiles(srf)
        .filter((tile) => tile.geometry.x >= maxX);
      if (easternNeighbor.length === 0) {
        dir = "west";
        step *= -1;
      }
    } else if (dir === "south") {
      const maxY = basis.geometry.maxY;
      const southernNeighbor = this.windows
        .getVisibleTiles(srf)
        .filter((tile) => tile.geometry.y >= maxY);
      if (southernNeighbor.length === 0) {
        dir = "north";
        step *= -1;
      }
    }

    // TODO: configurable step size?
    const hStepSize = srf.workingArea.width * 0.03;
    const vStepSize = srf.workingArea.height * 0.03;
    let delta: RectDelta;
    switch (dir) {
      case "east":
        delta = new RectDelta(hStepSize * step, 0, 0, 0);
        break;
      case "west":
        delta = new RectDelta(0, hStepSize * step, 0, 0);
        break;
      case "south":
        delta = new RectDelta(0, 0, vStepSize * step, 0);
        break;
      case "north": /* passthru */
      default:
        delta = new RectDelta(0, 0, 0, vStepSize * step);
        break;
    }

    const layout = this.layouts.getCurrentLayout(srf);
    if (layout.adjust) {
      const area = srf.workingArea.gap(
        this.config.screenGapLeft,
        this.config.screenGapRight,
        this.config.screenGapTop,
        this.config.screenGapBottom
      );
      layout.adjust(area, this.windows.getVisibleTileables(srf), basis, delta);
    }
  }

  /**
   * Resize the given window, by moving border inward or outward.
   *
   * The actual behavior depends on the state of the given window.
   *
   * @param dir which border
   * @param step which direction. 1 means outward, -1 means inward.
   */
  public resizeWindow(
    window: Window,
    dir: "east" | "west" | "south" | "north",
    step: -1 | 1
  ) {
    const state = window.state;
    if (Window.isFloatingState(state)) this.resizeFloat(window, dir, step);
    else if (Window.isTiledState(state)) this.resizeTile(window, dir, step);
  }

  /**
   * Arrange tiles on all screens.
   */
  public arrange(ctx: DriverContext) {
    this.debug.debug(() => "arrange");

    this.controller.screens.forEach((driverSurface: DriverSurface) => {
      this.arrangeScreen(ctx, driverSurface);
    });
  }

  /**
   * Arrange tiles on a screen.
   */
  public arrangeScreen(ctx: DriverContext, srf: DriverSurface) {
    const layout = this.layouts.getCurrentLayout(srf);

    const workingArea = srf.workingArea;

    let tilingArea: Rect;
    if (this.config.monocleMaximize && layout instanceof MonocleLayout)
      tilingArea = workingArea;
    else
      tilingArea = workingArea.gap(
        this.config.screenGapLeft,
        this.config.screenGapRight,
        this.config.screenGapTop,
        this.config.screenGapBottom
      );

    const visibles = this.windows.getVisibleWindows(srf);
    this.debug.debugObj(() => [
      "arrangeScreen",
      {
        layout,
        srf,
        visibles: visibles.length,
      },
    ]);

    visibles.forEach((window) => {
      if (window.state === WindowState.Undecided)
        window.state = window.shouldFloat
          ? WindowState.Floating
          : WindowState.Tiled;
    });

    const tileables = this.windows.getVisibleTileables(srf);
    if (this.config.maximizeSoleTile && tileables.length === 1) {
      tileables[0].state = WindowState.Maximized;
      tileables[0].geometry = workingArea;
    } else if (tileables.length > 0)
      layout.apply(new EngineContext(ctx, this), tileables, tilingArea);

    if (
      this.config.limitTileWidthRatio > 0 &&
      !(layout instanceof MonocleLayout)
    ) {
      const maxWidth = Math.floor(
        workingArea.height * this.config.limitTileWidthRatio
      );
      tileables
        .filter((tile) => tile.tiled && tile.geometry.width > maxWidth)
        .forEach((tile) => {
          const g = tile.geometry;
          tile.geometry = new Rect(
            g.x + Math.floor((g.width - maxWidth) / 2),
            g.y,
            maxWidth,
            g.height
          );
        });
    }

    visibles.forEach((window) => window.commit());
    this.debug.debugObj(() => ["arrangeScreen/finished", { srf }]);
  }

  /**
   * Re-apply window geometry, computed by layout algorithm.
   *
   * Sometimes applications move or resize windows without user intervention,
   * which is straight against the purpose of tiling WM. This operation
   * move/resize such windows back to where/how they should be.
   */
  public enforceSize(window: Window) {
    if (window.tiled && !window.actualGeometry.equals(window.geometry))
      qmlSetTimeout(() => {
        if (window.tiled) window.commit();
      }, 10);
  }

  /**
   * Register the given window to WM.
   */
  public manage(window: Window) {
    if (!window.shouldIgnore) {
      /* engine#arrange will update the state when required. */
      window.state = WindowState.Undecided;
      if (this.config.newWindowAsMaster) this.windows.unshift(window);
      else this.windows.push(window);
    }
  }

  /**
   * Unregister the given window from WM.
   */
  public unmanage(window: Window) {
    this.windows.remove(window);
  }

  /**
   * Focus the next or previous window.
   */
  public focusOrder(ctx: DriverContext, step: -1 | 1) {
    const window = ctx.currentWindow;

    /* if no current window, select the first tile. */
    if (window === null) {
      const tiles = this.windows.getVisibleTiles(ctx.currentSurface);
      if (tiles.length > 1) ctx.currentWindow = tiles[0];
      return;
    }

    const visibles = this.windows.getVisibleWindows(ctx.currentSurface);
    if (visibles.length === 0) /* nothing to focus */ return;

    const idx = visibles.indexOf(window);
    if (!window || idx < 0) {
      /* unmanaged window -> focus master */
      ctx.currentWindow = visibles[0];
      return;
    }

    const num = visibles.length;
    const newIndex = (idx + (step % num) + num) % num;

    ctx.currentWindow = visibles[newIndex];
  }

  /**
   * Focus a neighbor at the given direction.
   */
  public focusDir(ctx: DriverContext, dir: Direction) {
    const window = ctx.currentWindow;

    /* if no current window, select the first tile. */
    if (window === null) {
      const tiles = this.windows.getVisibleTiles(ctx.currentSurface);
      if (tiles.length > 1) ctx.currentWindow = tiles[0];
      return;
    }

    const neighbor = this.getNeighborByDirection(ctx, window, dir);
    if (neighbor) ctx.currentWindow = neighbor;
  }

  /**
   * Swap the position of the current window with the next or previous window.
   */
  public swapOrder(window: Window, step: -1 | 1) {
    const srf = window.surface;
    const visibles = this.windows.getVisibleWindows(srf);
    if (visibles.length < 2) return;

    const vsrc = visibles.indexOf(window);
    const vdst = wrapIndex(vsrc + step, visibles.length);
    const dstWin = visibles[vdst];

    this.windows.move(window, dstWin);
  }

  /**
   * Swap the position of the current window with a neighbor at the given direction.
   */
  public swapDirection(ctx: DriverContext, dir: Direction) {
    const window = ctx.currentWindow;
    if (window === null) {
      /* if no current window, select the first tile. */
      const tiles = this.windows.getVisibleTiles(ctx.currentSurface);
      if (tiles.length > 1) ctx.currentWindow = tiles[0];
      return;
    }

    const neighbor = this.getNeighborByDirection(ctx, window, dir);
    if (neighbor) this.windows.swap(window, neighbor);
  }

  /**
   * Move the given window towards the given direction by one step.
   * @param window a floating window
   * @param dir which direction
   */
  public moveFloat(window: Window, dir: Direction) {
    const srf = window.surface;

    // TODO: configurable step size?
    const hStepSize = srf.workingArea.width * 0.05;
    const vStepSize = srf.workingArea.height * 0.05;

    let hStep, vStep;
    switch (dir) {
      case "up":
        (hStep = 0), (vStep = -1);
        break;
      case "down":
        (hStep = 0), (vStep = 1);
        break;
      case "left":
        (hStep = -1), (vStep = 0);
        break;
      case "right":
        (hStep = 1), (vStep = 0);
        break;
    }

    const geometry = window.actualGeometry;
    const x = geometry.x + hStepSize * hStep;
    const y = geometry.y + vStepSize * vStep;

    window.forceSetGeometry(new Rect(x, y, geometry.width, geometry.height));
  }

  public swapDirOrMoveFloat(ctx: DriverContext, dir: Direction) {
    const window = ctx.currentWindow;
    if (!window) return;

    const state = window.state;
    if (Window.isFloatingState(state)) this.moveFloat(window, dir);
    else if (Window.isTiledState(state)) this.swapDirection(ctx, dir);
  }

  /**
   * Toggle float mode of window.
   */
  public toggleFloat(window: Window) {
    window.state = !window.tileable ? WindowState.Tiled : WindowState.Floating;
  }

  /**
   * Toggle float on all windows on the given surface.
   *
   * The behaviours of this operation depends on the number of floating
   * windows: windows will be tiled if more than half are floating, and will
   * be floated otherwise.
   */
  public floatAll(ctx: DriverContext, srf: DriverSurface) {
    const windows = this.windows.getVisibleWindows(srf);
    const numFloats = windows.reduce<number>((count, window) => {
      return window.state === WindowState.Floating ? count + 1 : count;
    }, 0);

    if (numFloats < windows.length / 2) {
      windows.forEach((window) => {
        /* TODO: do not use arbitrary constants */
        window.floatGeometry = window.actualGeometry.gap(4, 4, 4, 4);
        window.state = WindowState.Floating;
      });
      ctx.showNotification("Float All");
    } else {
      windows.forEach((window) => {
        window.state = WindowState.Tiled;
      });
      ctx.showNotification("Tile All");
    }
  }

  /**
   * Set the current window as the "master".
   *
   * The "master" window is simply the first window in the window list.
   * Some layouts depend on this assumption, and will make such windows more
   * visible than others.
   */
  public setMaster(window: Window) {
    this.windows.setMaster(window);
  }

  /**
   * Change the layout of the current surface to the next.
   */
  public cycleLayout(ctx: DriverContext, step: 1 | -1) {
    const layout = this.layouts.cycleLayout(ctx.currentSurface, step);
    if (layout) ctx.showNotification(layout.description);
  }

  /**
   * Set the layout of the current surface to the specified layout.
   */
  public setLayout(ctx: DriverContext, layoutClassID: string) {
    const layout = this.layouts.setLayout(ctx.currentSurface, layoutClassID);
    if (layout) ctx.showNotification(layout.description);
  }

  /**
   * Let the current layout override shortcut.
   *
   * @returns True if the layout overrides the shortcut. False, otherwise.
   */
  public handleLayoutShortcut(
    ctx: DriverContext,
    input: Shortcut,
    data?: any
  ): boolean {
    const layout = this.layouts.getCurrentLayout(ctx.currentSurface);
    if (layout.handleShortcut)
      return layout.handleShortcut(new EngineContext(ctx, this), input, data);
    return false;
  }

  private getNeighborByDirection(
    ctx: DriverContext,
    basis: Window,
    dir: Direction
  ): Window | null {
    let vertical: boolean;
    let sign: -1 | 1;
    switch (dir) {
      case "up":
        vertical = true;
        sign = -1;
        break;
      case "down":
        vertical = true;
        sign = 1;
        break;
      case "left":
        vertical = false;
        sign = -1;
        break;
      case "right":
        vertical = false;
        sign = 1;
        break;
      default:
        return null;
    }

    const candidates = this.windows
      .getVisibleTiles(ctx.currentSurface)
      .filter(
        vertical
          ? (tile) => tile.geometry.y * sign > basis.geometry.y * sign
          : (tile) => tile.geometry.x * sign > basis.geometry.x * sign
      )
      .filter(
        vertical
          ? (tile) =>
              overlap(
                basis.geometry.x,
                basis.geometry.maxX,
                tile.geometry.x,
                tile.geometry.maxX
              )
          : (tile) =>
              overlap(
                basis.geometry.y,
                basis.geometry.maxY,
                tile.geometry.y,
                tile.geometry.maxY
              )
      );
    if (candidates.length === 0) return null;

    const min =
      sign *
      candidates.reduce(
        vertical
          ? (prevMin, tile): number => Math.min(tile.geometry.y * sign, prevMin)
          : (prevMin, tile): number =>
              Math.min(tile.geometry.x * sign, prevMin),
        Infinity
      );

    const closest = candidates.filter(
      vertical
        ? (tile) => tile.geometry.y === min
        : (tile) => tile.geometry.x === min
    );

    return closest.sort((a, b) => b.timestamp - a.timestamp)[0];
  }
}
