// SPDX-FileCopyrightText: 2022 Joe Dean <joe@joedean.dev>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import { WindowState, EngineWindow } from "../window";

import { Rect } from "../../util/rect";
import { Config } from "../../config";
import { Controller } from "../../controller";

/* "Slabs" stacks up to 5 windows bottom-to-top (ideal for vertically-rotated
monitors). It shares the available space equally between windows; if there are
more than 2 windows, the "first" window will be given 50% more than the others*/
export default class SlabsLayout implements WindowsLayout {
  public static readonly id = "SlabsLayout";
  public readonly classID = SlabsLayout.id;
  public readonly name = "Slabs Layout";
  public readonly icon = "bismuth-slabs";
  public readonly capacity = 3;

  private config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  public clone(): WindowsLayout {
    return new SlabsLayout(this.config);
  }

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void {
    if (tileables.length <= 0) {
      return;
    }

    const tileCount = Math.min(this.capacity, tileables.length);
    let tileSize =
      (area.height - Math.max(0, tileCount - 1) * this.config.tileLayoutGap) /
      tileCount;
    let firstTileSize = tileSize;
    if (tileCount > 2) {
      firstTileSize *= 1.5;
      tileSize =
        (area.height - firstTileSize - tileCount * this.config.tileLayoutGap) /
        (tileCount - 1);
    }

    let xPos = 0;
    for (let i = 0; i < tileCount; i++) {
      const currentTileSize = i == 0 ? firstTileSize : tileSize;
      tileables[i].geometry = new Rect(
        area.x,
        area.height - (xPos + currentTileSize),
        area.width,
        currentTileSize
      );
      xPos += this.config.tileLayoutGap + currentTileSize;
    }
    for (let i = 0; i < tileables.length; i++) {
      if (i < tileCount) {
        tileables[i].state = WindowState.Tiled;
      } else {
        tileables[i].state = WindowState.TiledAfloat;
        tileables[i].geometry = new Rect(
          area.x,
          area.y,
          area.width,
          area.height
        );
      }
    }
  }

  public toString(): string {
    return "SlabsLayout()";
  }
}
