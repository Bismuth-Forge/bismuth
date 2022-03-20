// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import { WindowState, EngineWindow } from "../window";

import { clip } from "../../util/func";
import { Rect, RectDelta } from "../../util/rect";
import { Config } from "../../config";
import { Controller } from "../../controller";

export default class QuarterLayout implements WindowsLayout {
  public static readonly MAX_PROPORTION = 0.8;
  public static readonly id = "QuarterLayout";
  public readonly classID = QuarterLayout.id;
  public readonly name = "Quarter Layout";
  public readonly icon = "bismuth-quarter";

  public get capacity(): number {
    return 4;
  }

  private lhsplit: number;
  private rhsplit: number;
  private vsplit: number;

  private config: Config;

  public constructor(config: Config) {
    this.lhsplit = 0.5;
    this.rhsplit = 0.5;
    this.vsplit = 0.5;

    this.config = config;
  }

  public adjust(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): void {
    if (tiles.length <= 1 || tiles.length > 4) {
      return;
    }

    const idx = tiles.indexOf(basis);
    if (idx < 0) {
      return;
    }

    /* vertical split */
    if ((idx === 0 || idx === 3) && delta.east !== 0) {
      this.vsplit =
        (Math.floor(area.width * this.vsplit) + delta.east) / area.width;
    } else if ((idx === 1 || idx === 2) && delta.west !== 0) {
      this.vsplit =
        (Math.floor(area.width * this.vsplit) - delta.west) / area.width;
    }

    /* left-side horizontal split */
    if (tiles.length === 4) {
      if (idx === 0 && delta.south !== 0) {
        this.lhsplit =
          (Math.floor(area.height * this.lhsplit) + delta.south) / area.height;
      }
      if (idx === 3 && delta.north !== 0) {
        this.lhsplit =
          (Math.floor(area.height * this.lhsplit) - delta.north) / area.height;
      }
    }

    /* right-side horizontal split */
    if (tiles.length >= 3) {
      if (idx === 1 && delta.south !== 0) {
        this.rhsplit =
          (Math.floor(area.height * this.rhsplit) + delta.south) / area.height;
      }
      if (idx === 2 && delta.north !== 0) {
        this.rhsplit =
          (Math.floor(area.height * this.rhsplit) - delta.north) / area.height;
      }
    }

    /* clipping */
    this.vsplit = clip(
      this.vsplit,
      1 - QuarterLayout.MAX_PROPORTION,
      QuarterLayout.MAX_PROPORTION
    );
    this.lhsplit = clip(
      this.lhsplit,
      1 - QuarterLayout.MAX_PROPORTION,
      QuarterLayout.MAX_PROPORTION
    );
    this.rhsplit = clip(
      this.rhsplit,
      1 - QuarterLayout.MAX_PROPORTION,
      QuarterLayout.MAX_PROPORTION
    );
  }

  public clone(): WindowsLayout {
    const other = new QuarterLayout(this.config);
    other.lhsplit = this.lhsplit;
    other.rhsplit = this.rhsplit;
    other.vsplit = this.vsplit;
    return other;
  }

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void {
    for (let i = 0; i < 4 && i < tileables.length; i++) {
      tileables[i].state = WindowState.Tiled;
    }

    if (tileables.length > 4) {
      tileables
        .slice(4)
        .forEach((tile) => (tile.state = WindowState.TiledAfloat));
    }

    if (tileables.length === 1) {
      tileables[0].geometry = area;
      return;
    }

    const gap1 = Math.floor(this.config.tileLayoutGap / 2);
    const gap2 = this.config.tileLayoutGap - gap1;

    const leftWidth = Math.floor(area.width * this.vsplit);
    const rightWidth = area.width - leftWidth;
    const rightX = area.x + leftWidth;
    if (tileables.length === 2) {
      tileables[0].geometry = new Rect(
        area.x,
        area.y,
        leftWidth,
        area.height
      ).gap(0, gap1, 0, 0);
      tileables[1].geometry = new Rect(
        rightX,
        area.y,
        rightWidth,
        area.height
      ).gap(gap2, 0, 0, 0);
      return;
    }

    const rightTopHeight = Math.floor(area.height * this.rhsplit);
    const rightBottomHeight = area.height - rightTopHeight;
    const rightBottomY = area.y + rightTopHeight;
    if (tileables.length === 3) {
      tileables[0].geometry = new Rect(
        area.x,
        area.y,
        leftWidth,
        area.height
      ).gap(0, gap1, 0, 0);
      tileables[1].geometry = new Rect(
        rightX,
        area.y,
        rightWidth,
        rightTopHeight
      ).gap(gap2, 0, 0, gap1);
      tileables[2].geometry = new Rect(
        rightX,
        rightBottomY,
        rightWidth,
        rightBottomHeight
      ).gap(gap2, 0, gap2, 0);
      return;
    }

    const leftTopHeight = Math.floor(area.height * this.lhsplit);
    const leftBottomHeight = area.height - leftTopHeight;
    const leftBottomY = area.y + leftTopHeight;
    if (tileables.length >= 4) {
      tileables[0].geometry = new Rect(
        area.x,
        area.y,
        leftWidth,
        leftTopHeight
      ).gap(0, gap1, 0, gap1);
      tileables[1].geometry = new Rect(
        rightX,
        area.y,
        rightWidth,
        rightTopHeight
      ).gap(gap2, 0, 0, gap1);
      tileables[2].geometry = new Rect(
        rightX,
        rightBottomY,
        rightWidth,
        rightBottomHeight
      ).gap(gap2, 0, gap2, 0);
      tileables[3].geometry = new Rect(
        area.x,
        leftBottomY,
        leftWidth,
        leftBottomHeight
      ).gap(0, gap2, gap2, 0);
    }
  }

  public toString(): string {
    return "QuarterLayout()";
  }
}
