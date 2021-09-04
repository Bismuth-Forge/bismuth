// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import ISurface from "../../isurface";
import Rect from "../../util/rect";
import TestDriver from "./test_driver";

export default class TestSurface implements ISurface {
  public readonly screen: number;

  public get id(): string {
    return String(this.screen);
  }

  public get ignore(): boolean {
    // TODO: optionally ignore some surface to test LayoutStore
    return false;
  }

  public get workingArea(): Rect {
    return this.driver.screenSize;
  }

  constructor(private driver: TestDriver, screen: number) {
    this.screen = screen;
  }

  public next(): ISurface {
    return new TestSurface(this.driver, this.screen + 1);
  }
}
