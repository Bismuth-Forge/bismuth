// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import LayoutUtils from "./layout_utils";

import { EngineWindow } from "../window";

import { Config } from "../../config";
import { Rect, RectDelta } from "../../util/rect";

export interface ILayoutPart {
  adjust(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): RectDelta;
  apply(area: Rect, tiles: EngineWindow[]): Rect[];
}

export class FillLayoutPart implements ILayoutPart {
  public adjust(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): RectDelta {
    /* do nothing */
    return delta;
  }

  public apply(area: Rect, tiles: EngineWindow[]): Rect[] {
    return tiles.map((_tile) => {
      return area;
    });
  }
}

export class HalfSplitLayoutPart<L extends ILayoutPart, R extends ILayoutPart>
  implements ILayoutPart
{
  /** the rotation angle for this part.
   *
   *    | angle | direction  | primary |
   *    | ----- | ---------- | ------- |
   *    |     0 | horizontal | left    |
   *    |    90 | vertical   | top     |
   *    |   180 | horizontal | right   |
   *    |   270 | vertical   | bottom  |
   */
  public angle: 0 | 90 | 180 | 270;

  public gap: number;
  public primarySize: number;
  public ratio: number;

  private get horizontal(): boolean {
    return this.angle === 0 || this.angle === 180;
  }

  private get reversed(): boolean {
    return this.angle === 180 || this.angle === 270;
  }

  constructor(public primary: L, public secondary: R) {
    this.angle = 0;
    this.gap = 0;
    this.primarySize = 1;
    this.ratio = 0.5;
  }

  public adjust(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): RectDelta {
    const basisIndex = tiles.indexOf(basis);
    if (basisIndex < 0) {
      return delta;
    }

    if (tiles.length <= this.primarySize) {
      /* primary only */
      return this.primary.adjust(area, tiles, basis, delta);
    } else if (this.primarySize === 0) {
      /* secondary only */
      return this.secondary.adjust(area, tiles, basis, delta);
    } else {
      /* both parts */

      /** which part to adjust. 0 = primary, 1 = secondary */
      const targetIndex = basisIndex < this.primarySize ? 0 : 1;

      if (targetIndex === /* primary */ 0) {
        delta = this.primary.adjust(
          area,
          tiles.slice(0, this.primarySize),
          basis,
          delta
        );
      } else {
        delta = this.secondary.adjust(
          area,
          tiles.slice(this.primarySize),
          basis,
          delta
        );
      }

      this.ratio = LayoutUtils.adjustAreaHalfWeights(
        area,
        this.reversed ? 1 - this.ratio : this.ratio,
        this.gap,
        this.reversed ? 1 - targetIndex : targetIndex,
        delta,
        this.horizontal
      );
      if (this.reversed) {
        this.ratio = 1 - this.ratio;
      }

      switch (this.angle * 10 + targetIndex + 1) {
        case 1: /*   0, Primary */
        case 1802 /* 180, Secondary */:
          return new RectDelta(0, delta.west, delta.south, delta.north);
        case 2:
        case 1801:
          return new RectDelta(delta.east, 0, delta.south, delta.north);
        case 901:
        case 2702:
          return new RectDelta(delta.east, delta.west, 0, delta.north);
        case 902:
        case 2701:
          return new RectDelta(delta.east, delta.west, delta.south, 0);
      }
      return delta;
    }
  }

  public apply(area: Rect, tiles: EngineWindow[]): Rect[] {
    if (tiles.length <= this.primarySize) {
      /* primary only */
      return this.primary.apply(area, tiles);
    } else if (this.primarySize === 0) {
      /* secondary only */
      return this.secondary.apply(area, tiles);
    } else {
      /* both parts */
      const reversed = this.reversed;
      const ratio = reversed ? 1 - this.ratio : this.ratio;
      const [area1, area2] = LayoutUtils.splitAreaHalfWeighted(
        area,
        ratio,
        this.gap,
        this.horizontal
      );
      const result1 = this.primary.apply(
        reversed ? area2 : area1,
        tiles.slice(0, this.primarySize)
      );
      const result2 = this.secondary.apply(
        reversed ? area1 : area2,
        tiles.slice(this.primarySize)
      );
      return result1.concat(result2);
    }
  }
}

export class StackLayoutPart implements ILayoutPart {
  public gap: number;

  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.gap = 0;
  }

  public adjust(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): RectDelta {
    const weights = LayoutUtils.adjustAreaWeights(
      area,
      tiles.map((tile) => tile.weight),
      this.config.tileLayoutGap,
      tiles.indexOf(basis),
      delta,
      false
    );

    weights.forEach((weight, i) => {
      tiles[i].weight = weight * tiles.length;
    });

    const idx = tiles.indexOf(basis);
    return new RectDelta(
      delta.east,
      delta.west,
      idx === tiles.length - 1 ? delta.south : 0,
      idx === 0 ? delta.north : 0
    );
  }

  public apply(area: Rect, tiles: EngineWindow[]): Rect[] {
    const weights = tiles.map((tile) => tile.weight);
    return LayoutUtils.splitAreaWeighted(area, weights, this.gap);
  }
}

export class RotateLayoutPart<T extends ILayoutPart> implements ILayoutPart {
  constructor(public inner: T, public angle: 0 | 90 | 180 | 270 = 0) {}

  public adjust(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): RectDelta {
    // let area = area, delta = delta;
    switch (this.angle) {
      case 0:
        break;
      case 90:
        area = new Rect(area.y, area.x, area.height, area.width);
        delta = new RectDelta(delta.south, delta.north, delta.east, delta.west);
        break;
      case 180:
        delta = new RectDelta(delta.west, delta.east, delta.south, delta.north);
        break;
      case 270:
        area = new Rect(area.y, area.x, area.height, area.width);
        delta = new RectDelta(delta.north, delta.south, delta.east, delta.west);
        break;
    }

    delta = this.inner.adjust(area, tiles, basis, delta);

    switch (this.angle) {
      case 0:
        // No adjustment needed
        break;
      case 90:
        delta = new RectDelta(delta.south, delta.north, delta.east, delta.west);
        break;
      case 180:
        delta = new RectDelta(delta.west, delta.east, delta.south, delta.north);
        break;
      case 270:
        delta = new RectDelta(delta.north, delta.south, delta.east, delta.west);
        break;
    }
    return delta;
  }

  public apply(area: Rect, tiles: EngineWindow[]): Rect[] {
    switch (this.angle) {
      case 0:
        break;
      case 90:
        area = new Rect(area.y, area.x, area.height, area.width);
        break;
      case 180:
        break;
      case 270:
        area = new Rect(area.y, area.x, area.height, area.width);
        break;
    }

    const innerResult = this.inner.apply(area, tiles);

    switch (this.angle) {
      case 0:
        return innerResult;
      case 90:
        return innerResult.map((g) => new Rect(g.y, g.x, g.height, g.width));
      case 180:
        return innerResult.map((g) => {
          const rx = g.x - area.x;
          const newX = area.x + area.width - (rx + g.width);
          return new Rect(newX, g.y, g.width, g.height);
        });
      case 270:
        return innerResult.map((g) => {
          const rx = g.x - area.x;
          const newY = area.x + area.width - (rx + g.width);
          return new Rect(g.y, newY, g.height, g.width);
        });
    }
  }

  public rotate(amount: -90 | 90): void {
    // -90 | 0 | 90 | 180 | 270 | 360
    let angle = this.angle + amount;
    if (angle < 0) {
      angle = 270;
    } else if (angle >= 360) {
      angle = 0;
    }

    this.angle = angle as 0 | 90 | 180 | 270;
  }
}
