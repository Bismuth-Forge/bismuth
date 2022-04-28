// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { EngineWindow } from "./window";

import { DriverSurface } from "../driver/surface";

/**
 * Window storage facility with convenient window filters built-in.
 */
export interface WindowStore {
  /**
   * Returns all visible windows on the given surface.
   */
  visibleWindowsOn(surf: DriverSurface): EngineWindow[];

  /**
   * Return all visible "Tile" windows on the given surface.
   */
  visibleTiledWindowsOn(surf: DriverSurface): EngineWindow[];

  /**
   * Return all visible "tileable" windows on the given surface
   * @see Window#tileable
   */
  visibleTileableWindowsOn(surf: DriverSurface): EngineWindow[];

  /**
   * Return all "tileable" windows on the given surface, including hidden
   */
  tileableWindowsOn(surf: DriverSurface): EngineWindow[];

  /**
   * Return all windows on this surface, including minimized windows
   */
  allWindowsOn(surf: DriverSurface): EngineWindow[];

  /**
   * Insert a window after another one
   */
  insertAfter(after: EngineWindow, toInsert: EngineWindow): void;

  /**
   * Inserts the window at the beginning
   */
  unshift(window: EngineWindow): void;

  /**
   * Inserts the window at the end
   */
  push(window: EngineWindow): void;

  /**
   * Remove window from the store
   */
  remove(window: EngineWindow): void;

  /**
   * Move srcWin to the destWin position (before/after)
   * @param after if true, srcWin is moved after the destWindow. If false - it is moved before.
   */
  move(srcWin: EngineWindow, destWin: EngineWindow, after?: boolean): void;

  /**
   * Swap windows positions
   */
  swap(alpha: EngineWindow, beta: EngineWindow): void;

  /**
   * Put the window into the master area.
   * @param window window to put into the master area
   */
  putWindowToMaster(window: EngineWindow): void;
}

export class WindowStoreImpl implements WindowStore {
  /**
   * @param list window list to initialize from
   */
  constructor(public list: EngineWindow[] = []) {}

  public move(
    srcWin: EngineWindow,
    destWin: EngineWindow,
    after?: boolean
  ): void {
    const srcIdx = this.list.indexOf(srcWin);
    const destIdx = this.list.indexOf(destWin);
    if (srcIdx === -1 || destIdx === -1) {
      return;
    }

    // Delete the source window
    this.list.splice(srcIdx, 1);
    // Place the source window in before destination window or after it
    this.list.splice(after ? destIdx + 1 : destIdx, 0, srcWin);
  }

  public putWindowToMaster(window: EngineWindow): void {
    const idx = this.list.indexOf(window);
    if (idx === -1) {
      return;
    }
    this.list.splice(idx, 1);
    this.list.splice(0, 0, window);
  }

  public swap(alpha: EngineWindow, beta: EngineWindow): void {
    const alphaIndex = this.list.indexOf(alpha);
    const betaIndex = this.list.indexOf(beta);
    if (alphaIndex < 0 || betaIndex < 0) {
      return;
    }

    this.list[alphaIndex] = beta;
    this.list[betaIndex] = alpha;
  }

  public get length(): number {
    return this.list.length;
  }

  public at(idx: number): EngineWindow {
    return this.list[idx];
  }

  public indexOf(window: EngineWindow): number {
    return this.list.indexOf(window);
  }

  public insertAfter(after: EngineWindow, toInsert: EngineWindow) {
    this.list.splice(this.list.indexOf(after) + 1, 0, toInsert);
  }

  public push(window: EngineWindow): void {
    this.list.push(window);
  }

  public remove(window: EngineWindow): void {
    const idx = this.list.indexOf(window);
    if (idx >= 0) {
      this.list.splice(idx, 1);
    }
  }

  public unshift(window: EngineWindow): void {
    this.list.unshift(window);
  }

  public visibleWindowsOn(surf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.visibleOn(surf));
  }

  public visibleTiledWindowsOn(surf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.tiled && win.visibleOn(surf));
  }

  public visibleTileableWindowsOn(surf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.tileable && win.visibleOn(surf));
  }

  public tileableWindowsOn(surf: DriverSurface): EngineWindow[] {
    return this.list.filter(
      (win) => win.tileable && win.surface.id === surf.id
    );
  }

  public allWindowsOn(surf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.surface.id === surf.id);
  }
}
