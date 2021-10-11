// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import MonocleLayout from "./layout/monocle_layout";

import LayoutStore from "./layout_store";
import WindowStore from "./window_store";
import Window from "./window";
import { WindowState } from "./window";

import { Controller } from "../controller";

import { DriverSurface } from "../driver/surface";

import Rect from "../util/rect";
import RectDelta from "../util/rectdelta";
import { overlap, wrapIndex } from "../util/func";
import Config from "../config";
import Debug from "../util/log";
import { WindowsLayout } from "./layout";

export type Direction = "up" | "down" | "left" | "right";

export interface Engine {
  layouts: LayoutStore;
  windows: WindowStore;

  arrange(): void;
  manage(window: Window): void;
  unmanage(window: Window): void;
  adjustLayout(basis: Window): void;
  resizeFloat(
    window: Window,
    dir: "east" | "west" | "south" | "north",
    step: -1 | 1
  ): void;
  resizeTile(
    basis: Window,
    dir: "east" | "west" | "south" | "north",
    step: -1 | 1
  ): void;
  resizeWindow(
    window: Window,
    dir: "east" | "west" | "south" | "north",
    step: -1 | 1
  ): void;
  enforceSize(window: Window): void;
  currentLayoutOnCurrentSurface(): WindowsLayout;
  currentWindow(): Window | null;

  /**
   * Focus next or previous window
   * @param step Direction to step in (1=forward, -1=backward)
   * @param includeHidden Whether to step through (true) or skip over (false) minimized windows
   */
  focusOrder(step: -1 | 1, includeHidden: boolean): void;
  focusDir(dir: Direction): void;
  swapOrder(window: Window, step: -1 | 1): void;
  swapDirOrMoveFloat(dir: Direction): void;
  setMaster(window: Window): void;
  toggleFloat(window: Window): void;
  floatAll(srf: DriverSurface): void;
  cycleLayout(step: 1 | -1): void;
  setLayout(layoutClassID: string): void;
  minimizeOthers(window: Window): void;
  isLayoutMonocleAndMinimizeRest(): boolean;
  showNotification(text: string): void;
}

/**
 * Maintains tiling context and performs various tiling actions.
 */
export class TilingEngine implements Engine {
  public layouts: LayoutStore;
  public windows: WindowStore;

  constructor(
    private controller: Controller,
    private config: Config,
    private debug: Debug
  ) {
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
  public adjustLayout(basis: Window): void {
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
  ): void {
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
  ): void {
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
      case "north": // Pass through
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
  ): void {
    const state = window.state;
    if (Window.isFloatingState(state)) {
      this.resizeFloat(window, dir, step);
    } else if (Window.isTiledState(state)) {
      this.resizeTile(window, dir, step);
    }
  }

  /**
   * Arrange tiles on all screens.
   */
  public arrange(): void {
    this.debug.debug(() => "arrange");

    this.controller.screens.forEach((driverSurface: DriverSurface) => {
      this.arrangeScreen(driverSurface);
    });
  }

  /**
   * Arrange tiles on one screen
   *
   * @param screenSurface screen's surface, on which windows should be arranged
   */
  public arrangeScreen(screenSurface: DriverSurface): void {
    const layout = this.layouts.getCurrentLayout(screenSurface);

    const workingArea = screenSurface.workingArea;
    const tilingArea = this.getTilingArea(workingArea, layout);

    const visibleWindows = this.windows.getVisibleWindows(screenSurface);
    this.debug.debugObj(() => [
      "arrangeScreen",
      {
        layout,
        screenSurface,
        visibles: visibleWindows.length,
      },
    ]);

    // Set correct window state for new windows
    visibleWindows.forEach((win: Window) => {
      if (win.state === WindowState.Undecided) {
        win.state = win.shouldFloat ? WindowState.Floating : WindowState.Tiled;
      }
    });

    const tileableWindows = this.windows.getVisibleTileables(screenSurface);

    // Maximize sole tile if enabled or apply the current layout as expected
    if (this.config.maximizeSoleTile && tileableWindows.length === 1) {
      tileableWindows[0].state = WindowState.Maximized;
      tileableWindows[0].geometry = workingArea;
    } else if (tileableWindows.length > 0) {
      layout.apply(this.controller, tileableWindows, tilingArea);
    }

    // If enabled, limit the windows' width
    if (
      this.config.limitTileWidthRatio > 0 &&
      !(layout instanceof MonocleLayout)
    ) {
      const maxWidth = Math.floor(
        workingArea.height * this.config.limitTileWidthRatio
      );
      tileableWindows
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

    // Commit window assigned properties
    visibleWindows.forEach((win: Window) => win.commit());
    this.debug.debugObj(() => ["arrangeScreen/finished", { screenSurface }]);
  }

  public currentLayoutOnCurrentSurface(): WindowsLayout {
    return this.layouts.getCurrentLayout(this.controller.currentSurface);
  }

  public currentWindow(): Window | null {
    return this.controller.currentWindow;
  }

  /**
   * Re-apply window geometry, computed by layout algorithm.
   *
   * Sometimes applications move or resize windows without user intervention,
   * which is straight against the purpose of tiling WM. This operation
   * move/resize such windows back to where/how they should be.
   */
  public enforceSize(window: Window): void {
    if (window.tiled && !window.actualGeometry.equals(window.geometry)) {
      window.commit();
    }
  }

  /**
   * Register the given window to WM.
   */
  public manage(window: Window): void {
    if (!window.shouldIgnore) {
      /* engine#arrange will update the state when required. */
      window.state = WindowState.Undecided;
      if (this.config.newWindowAsMaster) {
        this.windows.unshift(window);
      } else {
        this.windows.push(window);
      }
    }
  }

  /**
   * Unregister the given window from WM.
   */
  public unmanage(window: Window): void {
    this.windows.remove(window);
  }

  /** Focus next or previous window
   * @param step direction to step in (1 for forward, -1 for back)
   * @param includeHidden whether to switch to or skip minimized windows
   */
  public focusOrder(step: -1 | 1, includeHidden = false): void {
    const window = this.controller.currentWindow;
    let windows;

    if (includeHidden) {
      windows = this.windows.getAllWindows(this.controller.currentSurface);
    } else {
      windows = this.windows.getVisibleWindows(this.controller.currentSurface);
    }

    if (windows.length === 0) {
      // Nothing to focus
      return;
    }

    /* If no current window, select the first one. */
    if (window === null) {
      this.controller.currentWindow = windows[0];
      return;
    }

    const idx = windows.indexOf(window);
    if (!window || idx < 0) {
      /* This probably shouldn't happen, but just in case... */
      this.controller.currentWindow = windows[0];
      return;
    }

    const num = windows.length;
    const newIndex = (idx + (step % num) + num) % num;

    this.controller.currentWindow = windows[newIndex];
  }

  /**
   * Focus a neighbor at the given direction.
   */
  public focusDir(dir: Direction): void {
    const window = this.controller.currentWindow;

    /* if no current window, select the first tile. */
    if (window === null) {
      const tiles = this.windows.getVisibleTiles(
        this.controller.currentSurface
      );
      if (tiles.length > 1) {
        this.controller.currentWindow = tiles[0];
      }
      return;
    }

    const neighbor = this.getNeighborByDirection(window, dir);
    if (neighbor) {
      this.controller.currentWindow = neighbor;
    }
  }

  /**
   * Swap the position of the current window with the next or previous window.
   */
  public swapOrder(window: Window, step: -1 | 1): void {
    const srf = window.surface;
    const visibles = this.windows.getVisibleWindows(srf);
    if (visibles.length < 2) {
      return;
    }

    const vsrc = visibles.indexOf(window);
    const vdst = wrapIndex(vsrc + step, visibles.length);
    const dstWin = visibles[vdst];

    this.windows.move(window, dstWin);
  }

  /**
   * Swap the position of the current window with a neighbor at the given direction.
   */
  public swapDirection(dir: Direction): void {
    const window = this.controller.currentWindow;
    if (window === null) {
      /* if no current window, select the first tile. */
      const tiles = this.windows.getVisibleTiles(
        this.controller.currentSurface
      );
      if (tiles.length > 1) {
        this.controller.currentWindow = tiles[0];
      }
      return;
    }

    const neighbor = this.getNeighborByDirection(window, dir);
    if (neighbor) {
      this.windows.swap(window, neighbor);
    }
  }

  /**
   * Move the given window towards the given direction by one step.
   * @param window a floating window
   * @param dir which direction
   */
  public moveFloat(window: Window, dir: Direction): void {
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

  public swapDirOrMoveFloat(dir: Direction): void {
    const window = this.controller.currentWindow;
    if (!window) {
      return;
    }

    const state = window.state;
    if (Window.isFloatingState(state)) {
      this.moveFloat(window, dir);
    } else if (Window.isTiledState(state)) {
      this.swapDirection(dir);
    }
  }

  /**
   * Toggle float mode of window.
   */
  public toggleFloat(window: Window): void {
    window.state = !window.tileable ? WindowState.Tiled : WindowState.Floating;
  }

  /**
   * Toggle float on all windows on the given surface.
   *
   * The behaviors of this operation depends on the number of floating
   * windows: windows will be tiled if more than half are floating, and will
   * be floated otherwise.
   */
  public floatAll(srf: DriverSurface): void {
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
      this.controller.showNotification("Float All");
    } else {
      windows.forEach((window) => {
        window.state = WindowState.Tiled;
      });
      this.controller.showNotification("Tile All");
    }
  }

  /**
   * Set the current window as the "master".
   *
   * The "master" window is simply the first window in the window list.
   * Some layouts depend on this assumption, and will make such windows more
   * visible than others.
   */
  public setMaster(window: Window): void {
    this.windows.setMaster(window);
  }

  /**
   * Change the layout of the current surface to the next.
   */
  public cycleLayout(step: 1 | -1): void {
    const layout = this.layouts.cycleLayout(
      this.controller.currentSurface,
      step
    );
    if (layout) {
      this.controller.showNotification(layout.description);

      // Minimize inactive windows if Monocle and config.monocleMinimizeRest
      if (
        this.isLayoutMonocleAndMinimizeRest() &&
        this.controller.currentWindow
      ) {
        this.minimizeOthers(this.controller.currentWindow);
      }
    }
  }

  /**
   * Set the layout of the current surface to the specified layout.
   */
  public setLayout(layoutClassID: string): void {
    const layout = this.layouts.setLayout(
      this.controller.currentSurface,
      layoutClassID
    );
    if (layout) {
      this.controller.showNotification(layout.description);

      // Minimize inactive windows if Monocle and config.monocleMinimizeRest
      if (
        this.isLayoutMonocleAndMinimizeRest() &&
        this.controller.currentWindow
      ) {
        this.minimizeOthers(this.controller.currentWindow);
      }
    }
  }

  /**
   * Minimize all windows on the surface except the given window.
   * Used mainly in Monocle mode with config.monocleMinimizeRest
   */
  public minimizeOthers(window: Window): void {
    for (const tile of this.windows.getVisibleTiles(window.surface)) {
      if (
        tile.screen == window.screen &&
        tile.id !== window.id &&
        this.windows.getVisibleTiles(window.surface).includes(window)
      ) {
        tile.minimized = true;
      } else {
        tile.minimized = false;
      }
    }
  }

  public isLayoutMonocleAndMinimizeRest(): boolean {
    return (
      this.currentLayoutOnCurrentSurface() instanceof MonocleLayout &&
      this.config.monocleMinimizeRest
    );
  }

  private getNeighborByDirection(basis: Window, dir: Direction): Window | null {
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
      .getVisibleTiles(this.controller.currentSurface)
      .filter(
        vertical
          ? (tile): boolean => tile.geometry.y * sign > basis.geometry.y * sign
          : (tile): boolean => tile.geometry.x * sign > basis.geometry.x * sign
      )
      .filter(
        vertical
          ? (tile): boolean =>
              overlap(
                basis.geometry.x,
                basis.geometry.maxX,
                tile.geometry.x,
                tile.geometry.maxX
              )
          : (tile): boolean =>
              overlap(
                basis.geometry.y,
                basis.geometry.maxY,
                tile.geometry.y,
                tile.geometry.maxY
              )
      );
    if (candidates.length === 0) {
      return null;
    }

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
        ? (tile): boolean => tile.geometry.y === min
        : (tile): boolean => tile.geometry.x === min
    );

    return closest.sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  public showNotification(text: string): void {
    this.controller.showNotification(text);
  }

  /**
   * Returns the tiling area for the given working area and the windows layout.
   *
   * Tiling area is the area we are allowed to put windows in, not counting the inner gaps
   * between them. I.e. working are without gaps.
   *
   * @param workingArea area in which we are allowed to work. @see DriverSurface#workingArea
   * @param layout windows layout used
   */
  private getTilingArea(workingArea: Rect, layout: WindowsLayout): Rect {
    if (this.config.monocleMaximize && layout instanceof MonocleLayout) {
      return workingArea;
    } else {
      return workingArea.gap(
        this.config.screenGapLeft,
        this.config.screenGapRight,
        this.config.screenGapTop,
        this.config.screenGapBottom
      );
    }
  }
}
