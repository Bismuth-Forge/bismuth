// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Window from "./window";

import { DriverSurface } from "../driver/surface";

export default class WindowStore {
  public list: Window[];

  constructor(windows?: Window[]) {
    this.list = windows || [];
  }

  public move(srcWin: Window, destWin: Window, after?: boolean): void {
    const srcIdx = this.list.indexOf(srcWin);
    const destIdx = this.list.indexOf(destWin);
    if (srcIdx === -1 || destIdx === -1) {
      return;
    }

    this.list.splice(srcIdx, 1);
    this.list.splice(after ? destIdx + 1 : destIdx, 0, srcWin);
  }

  public setMaster(window: Window): void {
    const idx = this.list.indexOf(window);
    if (idx === -1) {
      return;
    }
    this.list.splice(idx, 1);
    this.list.splice(0, 0, window);
  }

  public swap(alpha: Window, beta: Window): void {
    const alphaIndex = this.list.indexOf(alpha);
    const betaIndex = this.list.indexOf(beta);
    if (alphaIndex < 0 || betaIndex < 0) {
      return;
    }

    this.list[alphaIndex] = beta;
    this.list[betaIndex] = alpha;
  }

  //#region Storage Operation

  public get length(): number {
    return this.list.length;
  }

  public at(idx: number): Window {
    return this.list[idx];
  }

  public indexOf(window: Window): number {
    return this.list.indexOf(window);
  }

  public push(window: Window): void {
    this.list.push(window);
  }

  public remove(window: Window): void {
    const idx = this.list.indexOf(window);
    if (idx >= 0) {
      this.list.splice(idx, 1);
    }
  }

  public unshift(window: Window): void {
    this.list.unshift(window);
  }
  //#endregion

  //#region Querying Windows

  /** Returns all visible windows on the given surface. */
  public getVisibleWindows(srf: DriverSurface): Window[] {
    return this.list.filter((win) => win.visible(srf));
  }

  /** Return all visible "Tile" windows on the given surface. */
  public getVisibleTiles(srf: DriverSurface): Window[] {
    return this.list.filter((win) => win.tiled && win.visible(srf));
  }

  /**
   * Return all visible "tileable" windows on the given surface
   * @see Window#tileable
   */
  public getVisibleTileables(srf: DriverSurface): Window[] {
    return this.list.filter((win) => win.tileable && win.visible(srf));
  }

  /** Return all windows on this surface, including minimized windows */
  public getAllWindows(srf: DriverSurface): Window[] {
    return this.list.filter((win) => win.surface.id === srf.id);
  }

  //#endregion
}
