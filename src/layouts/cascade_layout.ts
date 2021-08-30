// Copyright (c) 2018-2020 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import EngineContext from "../engine/engine_context";
import { ILayout } from "../ilayout";
import Window from "../engine/window";
import { WindowState } from "../engine/window";
import { Shortcut } from "../shortcut";
import Rect from "../util/rect";

export enum CascadeDirection {
  NorthWest = 0,
  North = 1,
  NorthEast = 2,
  East = 3,
  SouthEast = 4,
  South = 5,
  SouthWest = 6,
  West = 7,
}

export default class CascadeLayout implements ILayout {
  public static readonly id = "CascadeLayout";

  /** Decompose direction into vertical and horizontal steps */
  public static decomposeDirection(
    dir: CascadeDirection
  ): [-1 | 0 | 1, -1 | 0 | 1] {
    switch (dir) {
      case CascadeDirection.NorthWest:
        return [-1, -1];
      case CascadeDirection.North:
        return [-1, 0];
      case CascadeDirection.NorthEast:
        return [-1, 1];
      case CascadeDirection.East:
        return [0, 1];
      case CascadeDirection.SouthEast:
        return [1, 1];
      case CascadeDirection.South:
        return [1, 0];
      case CascadeDirection.SouthWest:
        return [1, -1];
      case CascadeDirection.West:
        return [0, -1];
    }
  }

  public readonly classID = CascadeLayout.id;

  public get description() {
    return "Cascade [" + CascadeDirection[this.dir] + "]";
  }

  constructor(private dir: CascadeDirection = CascadeDirection.SouthEast) {
    /* nothing */
  }

  public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
    const [vertStep, horzStep] = CascadeLayout.decomposeDirection(this.dir);

    // TODO: adjustable step size
    const stepSize = 25;

    const windowWidth =
      horzStep !== 0
        ? area.width - stepSize * (tileables.length - 1)
        : area.width;
    const windowHeight =
      vertStep !== 0
        ? area.height - stepSize * (tileables.length - 1)
        : area.height;

    const baseX = horzStep >= 0 ? area.x : area.maxX - windowWidth;
    const baseY = vertStep >= 0 ? area.y : area.maxY - windowHeight;

    let x = baseX,
      y = baseY;
    tileables.forEach((tile) => {
      tile.state = WindowState.Tiled;
      tile.geometry = new Rect(x, y, windowWidth, windowHeight);

      x += horzStep * stepSize;
      y += vertStep * stepSize;
    });
  }

  public clone(): CascadeLayout {
    return new CascadeLayout(this.dir);
  }

  public handleShortcut(
    ctx: EngineContext,
    input: Shortcut,
    data?: any
  ): boolean {
    switch (input) {
      case Shortcut.Increase:
        this.dir = (this.dir + 1 + 8) % 8;
        ctx.showNotification(this.description);
        break;
      case Shortcut.Decrease:
        this.dir = (this.dir - 1 + 8) % 8;
        ctx.showNotification(this.description);
        break;
      default:
        return false;
    }
    return true;
  }
}
