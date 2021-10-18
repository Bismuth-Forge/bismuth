// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { EngineWindow } from "./window";

import { DriverSurface } from "../driver/surface";

export default class WindowStore {
  public list: EngineWindow[];

  constructor(windows?: EngineWindow[]) {
    this.list = windows || [];
  }

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

    this.list.splice(srcIdx, 1);
    this.list.splice(after ? destIdx + 1 : destIdx, 0, srcWin);
  }

  public setMaster(window: EngineWindow): void {
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

  //#region Storage Operation

  public get length(): number {
    return this.list.length;
  }

  public at(idx: number): EngineWindow {
    return this.list[idx];
  }

  public indexOf(window: EngineWindow): number {
    return this.list.indexOf(window);
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
  //#endregion

  //#region Querying Windows

  /** Returns all visible windows on the given surface. */
  public getVisibleWindows(srf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.visible(srf));
  }

  /** Return all visible "Tile" windows on the given surface. */
  public getVisibleTiles(srf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.tiled && win.visible(srf));
  }

  /**
   * Return all visible "tileable" windows on the given surface
   * @see Window#tileable
   */
  public getVisibleTileables(srf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.tileable && win.visible(srf));
  }

  /**
   * Return all "tileable" windows on the given surface, including hidden
   */
  public getAllTileables(srf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.tileable && win.surface.id === srf.id);
  }

  /** Return all windows on this surface, including minimized windows */
  public getAllWindows(srf: DriverSurface): EngineWindow[] {
    return this.list.filter((win) => win.surface.id === srf.id);
  }

  //#endregion
}
