// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";
import LayoutUtils from "./layout_utils";

import { WindowState, EngineWindow } from "../window";

import {
  Action,
  DecreaseLayoutMasterAreaSize,
  DecreaseMasterAreaWindowCount,
  IncreaseLayoutMasterAreaSize,
  IncreaseMasterAreaWindowCount,
} from "../../controller/action";

import { partitionArrayBySizes, clip, slide } from "../../util/func";
import { Rect, RectDelta } from "../../util/rect";
import { Config } from "../../config";
import { Controller } from "../../controller";
import { Engine } from "..";

export default class ThreeColumnLayout implements WindowsLayout {
  public static readonly MIN_MASTER_RATIO = 0.2;
  public static readonly MAX_MASTER_RATIO = 0.75;
  public static readonly id = "ThreeColumnLayout";
  public readonly classID = ThreeColumnLayout.id;
  public readonly name = "Three-Column Layout";
  public readonly icon = "bismuth-column";

  public get hint(): string {
    return String(this.masterSize);
  }

  private masterRatio: number;
  private masterSize: number;

  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.masterRatio = 0.6;
    this.masterSize = 1;
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
    } else if (tiles.length <= this.masterSize) {
      /* one column */
      LayoutUtils.adjustAreaWeights(
        area,
        tiles.map((tile) => tile.weight),
        this.config.tileLayoutGap,
        tiles.indexOf(basis),
        delta
      ).forEach((newWeight, i) => (tiles[i].weight = newWeight * tiles.length));
    } else if (tiles.length === this.masterSize + 1) {
      /* two columns */

      /* adjust master-stack ratio */
      this.masterRatio = LayoutUtils.adjustAreaHalfWeights(
        area,
        this.masterRatio,
        this.config.tileLayoutGap,
        basisIndex < this.masterSize ? 0 : 1,
        delta,
        true
      );

      /* adjust master tile weights */
      if (basisIndex < this.masterSize) {
        const masterTiles = tiles.slice(0, -1);
        LayoutUtils.adjustAreaWeights(
          area,
          masterTiles.map((tile) => tile.weight),
          this.config.tileLayoutGap,
          basisIndex,
          delta
        ).forEach(
          (newWeight, i) =>
            (masterTiles[i].weight = newWeight * masterTiles.length)
        );
      }
    } else if (tiles.length > this.masterSize + 1) {
      /* three columns */
      let basisGroup;
      if (basisIndex < this.masterSize) {
        /* master */
        basisGroup = 1;
      } else if (
        basisIndex < Math.floor((this.masterSize + tiles.length) / 2)
      ) {
        /* R-stack */
        basisGroup = 2;
      } else {
        basisGroup = 0; /* L-stack */
      }

      /* adjust master-stack ratio */
      const stackRatio = 1 - this.masterRatio;
      const newRatios = LayoutUtils.adjustAreaWeights(
        area,
        [stackRatio, this.masterRatio, stackRatio],
        this.config.tileLayoutGap,
        basisGroup,
        delta,
        true
      );
      const newMasterRatio = newRatios[1];
      const newStackRatio = basisGroup === 0 ? newRatios[0] : newRatios[2];
      this.masterRatio = newMasterRatio / (newMasterRatio + newStackRatio);

      /* adjust tile weight */
      const rstackNumTile = Math.floor((tiles.length - this.masterSize) / 2);
      const [masterTiles, rstackTiles, lstackTiles] =
        partitionArrayBySizes<EngineWindow>(tiles, [
          this.masterSize,
          rstackNumTile,
        ]);
      const groupTiles = [lstackTiles, masterTiles, rstackTiles][basisGroup];
      LayoutUtils.adjustAreaWeights(
        area /* we only need height */,
        groupTiles.map((tile) => tile.weight),
        this.config.tileLayoutGap,
        groupTiles.indexOf(basis),
        delta
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

    if (tiles.length <= this.masterSize) {
      /* only master */
      LayoutUtils.splitAreaWeighted(
        area,
        tiles.map((tile) => tile.weight),
        this.config.tileLayoutGap
      ).forEach((tileArea, i) => (tiles[i].geometry = tileArea));
    } else if (tiles.length === this.masterSize + 1) {
      /* master & R-stack (only 1 window in stack) */
      const [masterArea, stackArea] = LayoutUtils.splitAreaHalfWeighted(
        area,
        this.masterRatio,
        this.config.tileLayoutGap,
        true
      );

      const masterTiles = tiles.slice(0, this.masterSize);
      LayoutUtils.splitAreaWeighted(
        masterArea,
        masterTiles.map((tile) => tile.weight),
        this.config.tileLayoutGap
      ).forEach((tileArea, i) => (masterTiles[i].geometry = tileArea));

      tiles[tiles.length - 1].geometry = stackArea;
    } else if (tiles.length > this.masterSize + 1) {
      /* L-stack & master & R-stack */
      const stackRatio = 1 - this.masterRatio;

      /** Areas allocated to L-stack, master, and R-stack */
      const groupAreas = LayoutUtils.splitAreaWeighted(
        area,
        [stackRatio, this.masterRatio, stackRatio],
        this.config.tileLayoutGap,
        true
      );

      const rstackSize = Math.floor((tiles.length - this.masterSize) / 2);
      const [masterTiles, rstackTiles, lstackTiles] =
        partitionArrayBySizes<EngineWindow>(tiles, [
          this.masterSize,
          rstackSize,
        ]);
      [lstackTiles, masterTiles, rstackTiles].forEach((groupTiles, group) => {
        LayoutUtils.splitAreaWeighted(
          groupAreas[group],
          groupTiles.map((tile) => tile.weight),
          this.config.tileLayoutGap
        ).forEach((tileArea, i) => (groupTiles[i].geometry = tileArea));
      });
    }
  }

  public clone(): WindowsLayout {
    const other = new ThreeColumnLayout(this.config);
    other.masterRatio = this.masterRatio;
    other.masterSize = this.masterSize;
    return other;
  }

  public executeAction(engine: Engine, action: Action): void {
    if (action instanceof IncreaseMasterAreaWindowCount) {
      this.resizeMaster(engine, +1); // increase masterSize by 1
    } else if (action instanceof DecreaseMasterAreaWindowCount) {
      this.resizeMaster(engine, -1);
    } else if (action instanceof DecreaseLayoutMasterAreaSize) {
      this.masterRatio = clip(
        slide(this.masterRatio, -0.05),
        ThreeColumnLayout.MIN_MASTER_RATIO,
        ThreeColumnLayout.MAX_MASTER_RATIO
      );
    } else if (action instanceof IncreaseLayoutMasterAreaSize) {
      this.masterRatio = clip(
        slide(this.masterRatio, +0.05),
        ThreeColumnLayout.MIN_MASTER_RATIO,
        ThreeColumnLayout.MAX_MASTER_RATIO
      );
    } else {
      action.executeWithoutLayoutOverride();
    }
  }

  public toString(): string {
    return `ThreeColumnLayout(nmaster=${this.masterSize})`;
  }

  private resizeMaster(engine: Engine, step: -1 | 1): void {
    this.masterSize = clip(this.masterSize + step, 1, 10);
    engine.showLayoutNotification();
  }
}
