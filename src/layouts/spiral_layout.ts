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
import { HalfSplitLayoutPart } from "./layout_part";
import { FillLayoutPart } from "./layout_part";
import { ILayout } from "../ilayout";
import Window from "../engine/window";
import { WindowState } from "../engine/window";
import Rect from "../util/rect";
import RectDelta from "../util/rectdelta";
import IConfig from "../config";

export type SpiralLayoutPart = HalfSplitLayoutPart<
  FillLayoutPart,
  SpiralLayoutPart | FillLayoutPart
>;

export default class SpiralLayout implements ILayout {
  public readonly description = "Spiral";

  private depth: number;
  private parts: SpiralLayoutPart;

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;

    this.depth = 1;
    this.parts = new HalfSplitLayoutPart(
      new FillLayoutPart(),
      new FillLayoutPart()
    );
    this.parts.angle = 0;
    this.parts.gap = this.config.tileLayoutGap;
  }

  public adjust(
    area: Rect,
    tiles: Window[],
    basis: Window,
    delta: RectDelta
  ): void {
    this.parts.adjust(area, tiles, basis, delta);
  }

  public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
    tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));

    this.bore(tileables.length);

    this.parts.apply(area, tileables).forEach((geometry, i) => {
      tileables[i].geometry = geometry;
    });
  }

  //handleShortcut?(ctx: EngineContext, input: Shortcut, data?: any): boolean;

  public toString(): string {
    return "Spiral()";
  }

  private bore(depth: number): void {
    if (this.depth >= depth) return;

    let hpart = this.parts;
    let i;
    for (i = 0; i < this.depth - 1; i++) {
      hpart = hpart.secondary as SpiralLayoutPart;
    }

    const lastFillPart = hpart.secondary as FillLayoutPart;
    let npart: SpiralLayoutPart;
    while (i < depth - 1) {
      npart = new HalfSplitLayoutPart(new FillLayoutPart(), lastFillPart);
      npart.gap = this.config.tileLayoutGap;
      switch ((i + 1) % 4) {
        case 0:
          npart.angle = 0;
          break;
        case 1:
          npart.angle = 90;
          break;
        case 2:
          npart.angle = 180;
          break;
        case 3:
          npart.angle = 270;
          break;
      }

      hpart.secondary = npart;
      hpart = npart;
      i++;
    }
    this.depth = depth;
  }
}
