// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import { WindowState, EngineWindow } from "../window";

import { Rect } from "../../util/rect";
import { Controller } from "../../controller";

export default class FloatingLayout implements WindowsLayout {
  public static readonly id = "FloatingLayout";
  public static instance = new FloatingLayout();
  public readonly classID = FloatingLayout.id;
  public readonly name = "Floating Layout";
  public readonly icon = "bismuth-floating";

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    _area: Rect
  ): void {
    tileables.forEach(
      (tileable: EngineWindow) => (tileable.state = WindowState.TiledAfloat)
    );
  }

  public clone(): this {
    /* fake clone */
    return this;
  }

  public toString(): string {
    return "FloatingLayout()";
  }
}
