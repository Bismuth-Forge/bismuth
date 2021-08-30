// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
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

import IDriverWindow from "../../idriver_window";
import TestSurface from "./test_surface";
import ISurface from "../../isurface";
import Rect from "../../util/rect";

export default class TestWindow implements IDriverWindow {
  private static windowCount: number = 0;

  public readonly id: string;
  public readonly shouldFloat: boolean;
  public readonly shouldIgnore: boolean;

  public surface: TestSurface;
  public fullScreen: boolean;
  public geometry: Rect;
  public keepAbove: boolean;
  public maximized: boolean;
  public noBorder: boolean;

  constructor(
    srf: TestSurface,
    geometry?: Rect,
    ignore?: boolean,
    float?: boolean
  ) {
    this.id = String(TestWindow.windowCount);
    TestWindow.windowCount += 1;

    this.shouldFloat = float !== undefined ? float : false;
    this.shouldIgnore = ignore !== undefined ? ignore : false;

    this.surface = srf;
    this.fullScreen = false;
    this.geometry = geometry || new Rect(0, 0, 100, 100);
    this.keepAbove = false;
    this.maximized = false;
    this.noBorder = false;
  }

  public commit(geometry?: Rect, noBorder?: boolean, keepAbove?: boolean) {
    if (geometry) this.geometry = geometry;
    if (noBorder !== undefined) this.noBorder = noBorder;
    if (keepAbove !== undefined) this.keepAbove = keepAbove;
  }

  public focus() {
    // TODO: track focus
  }

  public visible(srf: ISurface): boolean {
    const tctx = srf as TestSurface;
    return this.surface.screen === tctx.screen;
  }
}
