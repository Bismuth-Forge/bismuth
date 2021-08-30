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

import Window from "../../engine/window";
import ISurface from "../../isurface";
import Rect from "../../util/rect";
import TestSurface from "./test_surface";
// import { CONFIG } from "../../config";

export default class TestDriver {
  public currentScreen: number;
  public currentWindow: number;
  public numScreen: number;
  public screenSize: Rect;
  public windows: Window[];

  constructor() {
    this.currentScreen = 0;
    this.currentWindow = 0;
    this.numScreen = 1;
    this.screenSize = new Rect(0, 0, 10000, 10000);
    this.windows = [];
  }

  public forEachScreen(func: (srf: ISurface) => void) {
    for (let screen = 0; screen < this.numScreen; screen++)
      func(new TestSurface(this, screen));
  }

  public getCurrentContext(): ISurface {
    const window = this.getCurrentWindow();
    if (window) return window.surface;
    return new TestSurface(this, 0);
  }

  public getCurrentWindow(): Window | null {
    return this.windows.length !== 0 ? this.windows[this.currentWindow] : null;
  }

  public getWorkingArea(srf: ISurface): Rect {
    return this.screenSize;
  }

  public setCurrentWindow(window: Window) {
    const idx = this.windows.indexOf(window);
    if (idx !== -1) this.currentWindow = idx;
  }

  public setTimeout(func: () => void, timeout: number) {
    setTimeout(func, timeout);
  }
}

function setTestConfig(name: string, value: any) {
  if (!CONFIG) CONFIG = {} as any;
  (CONFIG as any)[name] = value;
}
