// SPDX-FileCopyrightText: 2022 Diogo Ferreira <diogo@underdev.org>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";
import LayoutUtils from "./layout_utils";

import { WindowState, EngineWindow } from "../window";

import {
  Action,
  DecreaseLayoutMasterAreaSize,
  IncreaseLayoutMasterAreaSize,
  IncreaseMasterAreaWindowCount,
  DecreaseMasterAreaWindowCount,
  Rotate,
  RotateReverse,
} from "../../controller/action";

import { partitionArrayBySizes, clip, slide } from "../../util/func";
import { Rect, RectDelta } from "../../util/rect";
import { Config } from "../../config";
import { Controller } from "../../controller";
import { Engine } from "..";

/**
 * A Vertical tiling layout which is tailored for portrait orientated
 * monitors but might have use cases in landscape as well.
 *
 * The intended behavior is for the master area to take a fixed (but
 * configurable via shortcut) percentage of the screen and for the
 * remaining panes to split the remaining space. Multiple masters are
 * supported and will share the master area equally.
 *
 *  ---------
 * |         |
 * |   M1    |
 * |         |
 * | ------- |
 * |         |
 * |   M2    |
 * |         |
 *  ---------
 * |    1    |
 *  ---------
 * |    2    |
 *  ---------
 */
export default class VerticalTileLayout implements WindowsLayout {
  public static readonly MIN_MASTER_RATIO = 0.2;
  public static readonly MAX_MASTER_RATIO = 0.75;
  public static readonly id = "VerticalTileLayout";
  public readonly classID = VerticalTileLayout.id;
  public readonly name = "Vertical Tile Layout";
  public readonly icon = "bismuth-vertical-tile";

  public get hint(): string {
    return String(this.masterCount);
  }

  private masterRatio: number;
  private masterCount: number;

  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.masterRatio = 0.75;
    this.masterCount = 1;
  }

  public adjust(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): void {
    const basisIndex = tiles.indexOf(basis);
    if (basisIndex < 0) {
      return;
    }

    if (tiles.length === 0) {
      /* no tiles */
      return;
    } else if (tiles.length <= this.masterCount) {
      /* every window takes a piece of the master area */
      LayoutUtils.adjustAreaWeights(
        area,
        tiles.map((tile) => tile.weight),
        this.config.tileLayoutGap,
        tiles.indexOf(basis),
        delta
      ).forEach((newWeight, i) => (tiles[i].weight = newWeight * tiles.length));
    } else if (tiles.length > this.masterCount) {
      /* Two rows */
      let basisGroup;
      if (basisIndex < this.masterCount) {
        /* master area */
        basisGroup = 1;
      } else {
        /* bottom stack */
        basisGroup = 0;
      }

      /* adjust master-stack ratio */
      const stackRatio = 1 - this.masterRatio;
      const newRatios = LayoutUtils.adjustAreaWeights(
        area,
        [stackRatio, this.masterRatio, stackRatio],
        this.config.tileLayoutGap,
        basisGroup,
        delta,
        false /* vertical */
      );
      const newMasterRatio = newRatios[1];
      const newStackRatio = basisGroup === 0 ? newRatios[0] : newRatios[2];
      this.masterRatio = newMasterRatio / (newMasterRatio + newStackRatio);

      /* adjust tile weight */
      const bottomStackNumTiles = tiles.length - this.masterCount;
      const [masterTiles, bottomStackTiles] =
        partitionArrayBySizes<EngineWindow>(tiles, [
          this.masterCount,
          bottomStackNumTiles,
        ]);
      const groupTiles = [masterTiles, bottomStackTiles][basisGroup];
      LayoutUtils.adjustAreaWeights(
        area /* we only need height */,
        groupTiles.map((tile) => tile.weight),
        this.config.tileLayoutGap,
        groupTiles.indexOf(basis),
        delta,
        false /* vertical */
      ).forEach(
        (newWeight, i) => (groupTiles[i].weight = newWeight * groupTiles.length)
      );
    }
  }

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void {
    /* Tile all tileables */
    tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
    const tiles = tileables;

    if (tiles.length <= this.masterCount) {
      /* only master */
      LayoutUtils.splitAreaWeighted(
        area,
        tiles.map((tile) => tile.weight),
        this.config.tileLayoutGap,
        false /* vertical */
      ).forEach((tileArea, i) => (tiles[i].geometry = tileArea));
    } else {
      /* master & bottom-stack */
      const stackRatio = 1 - this.masterRatio;

      /** Areas allocated to master, and bottom-stack */
      const groupAreas = LayoutUtils.splitAreaWeighted(
        area,
        [this.masterRatio, stackRatio],
        this.config.tileLayoutGap,
        false /* vertical */
      );

      const bottomStackNumTiles = tiles.length - this.masterCount;
      const [masterTiles, bottomStackTiles] =
        partitionArrayBySizes<EngineWindow>(tiles, [
          this.masterCount,
          bottomStackNumTiles,
        ]);
      [masterTiles, bottomStackTiles].forEach((groupTiles, group) => {
        LayoutUtils.splitAreaWeighted(
          groupAreas[group],
          groupTiles.map((tile) => tile.weight),
          this.config.tileLayoutGap,
          false /* vertical */
        ).forEach((tileArea, i) => (groupTiles[i].geometry = tileArea));
      });
    }
  }

  public clone(): WindowsLayout {
    const other = new VerticalTileLayout(this.config);
    other.masterRatio = this.masterRatio;
    return other;
  }

  public executeAction(engine: Engine, action: Action): void {
    if (action instanceof DecreaseLayoutMasterAreaSize) {
      this.masterRatio = clip(
        slide(this.masterRatio, -0.05),
        VerticalTileLayout.MIN_MASTER_RATIO,
        VerticalTileLayout.MAX_MASTER_RATIO
      );
    } else if (action instanceof IncreaseLayoutMasterAreaSize) {
      this.masterRatio = clip(
        slide(this.masterRatio, +0.05),
        VerticalTileLayout.MIN_MASTER_RATIO,
        VerticalTileLayout.MAX_MASTER_RATIO
      );
    } else if (action instanceof IncreaseMasterAreaWindowCount) {
      this.resizeMaster(engine, 1);
    } else if (action instanceof DecreaseMasterAreaWindowCount) {
      this.resizeMaster(engine, -1);
    } else {
      action.executeWithoutLayoutOverride();
    }
  }

  public toString(): string {
    return `VerticalTileLayout(masterCount=${this.masterCount})`;
  }

  private resizeMaster(engine: Engine, step: -1 | 1): void {
    this.masterCount = clip(this.masterCount + step, 1, 10);
    engine.showLayoutNotification();
  }
}
