// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import EngineContext from "../engine/engine_context";
import { ILayout } from "../ilayout";
import Window from "../engine/window";
import LayoutUtils from "./layout_utils";
import { Shortcut } from "../shortcut";
import { WindowState } from "../engine/window";
import { partitionArrayBySizes, clip, slide } from "../util/func";
import Rect from "../util/rect";
import RectDelta from "../util/rectdelta";
import IConfig from "../config";

export default class ThreeColumnLayout implements ILayout {
  public static readonly MIN_MASTER_RATIO = 0.2;
  public static readonly MAX_MASTER_RATIO = 0.75;
  public static readonly id = "ThreeColumnLayout";

  public readonly classID = ThreeColumnLayout.id;

  public get description(): string {
    return "Three-Column [" + this.masterSize + "]";
  }

  private masterRatio: number;
  private masterSize: number;

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
    this.masterRatio = 0.6;
    this.masterSize = 1;
  }

  public adjust(
    area: Rect,
    tiles: Window[],
    basis: Window,
    delta: RectDelta
  ): void {
    const basisIndex = tiles.indexOf(basis);
    if (basisIndex < 0) return;

    if (tiles.length === 0)
      /* no tiles */
      return;
    else if (tiles.length <= this.masterSize) {
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
      if (basisIndex < this.masterSize) basisGroup = 1;
      /* master */ else if (
        basisIndex < Math.floor((this.masterSize + tiles.length) / 2)
      )
        basisGroup = 2;
      /* R-stack */ else basisGroup = 0; /* L-stack */

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
        partitionArrayBySizes<Window>(tiles, [this.masterSize, rstackNumTile]);
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

  public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
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
        partitionArrayBySizes<Window>(tiles, [this.masterSize, rstackSize]);
      [lstackTiles, masterTiles, rstackTiles].forEach((groupTiles, group) => {
        LayoutUtils.splitAreaWeighted(
          groupAreas[group],
          groupTiles.map((tile) => tile.weight),
          this.config.tileLayoutGap
        ).forEach((tileArea, i) => (groupTiles[i].geometry = tileArea));
      });
    }
  }

  public clone(): ILayout {
    const other = new ThreeColumnLayout(this.config);
    other.masterRatio = this.masterRatio;
    other.masterSize = this.masterSize;
    return other;
  }

  public handleShortcut(
    ctx: EngineContext,
    input: Shortcut,
    data?: any
  ): boolean {
    switch (input) {
      case Shortcut.Increase:
        this.resizeMaster(ctx, +1);
        return true;
      case Shortcut.Decrease:
        this.resizeMaster(ctx, -1);
        return true;
      case Shortcut.Left:
        this.masterRatio = clip(
          slide(this.masterRatio, -0.05),
          ThreeColumnLayout.MIN_MASTER_RATIO,
          ThreeColumnLayout.MAX_MASTER_RATIO
        );
        return true;
      case Shortcut.Right:
        this.masterRatio = clip(
          slide(this.masterRatio, +0.05),
          ThreeColumnLayout.MIN_MASTER_RATIO,
          ThreeColumnLayout.MAX_MASTER_RATIO
        );
        return true;
      default:
        return false;
    }
  }

  public toString(): string {
    return "ThreeColumnLayout(nmaster=" + this.masterSize + ")";
  }

  private resizeMaster(ctx: EngineContext, step: -1 | 1): void {
    this.masterSize = clip(this.masterSize + step, 1, 10);
    ctx.showNotification(this.description);
  }
}
