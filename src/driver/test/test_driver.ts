// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Window from "../../engine/window";
import ISurface from "../../isurface";
import Rect from "../../util/rect";
import TestSurface from "./test_surface";

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
