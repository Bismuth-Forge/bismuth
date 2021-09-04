// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import IDriverWindow from "../src/idriver_window";
import ISurface from "../src/isurface";
import Rect from "../src/util/rect";

import TestSurface from "./test_surface";

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
