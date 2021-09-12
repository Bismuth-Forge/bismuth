// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import EngineContext from "../engine_context";
import { ILayout } from "./ilayout";
import Window from "../window";
import { WindowState } from "../window";
import Rect from "../../util/rect";

export default class FloatingLayout implements ILayout {
  public static readonly id = "FloatingLayout ";
  public static instance = new FloatingLayout();

  public readonly classID = FloatingLayout.id;
  public readonly description: string = "Floating";

  public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
    tileables.forEach(
      (tileable: Window) => (tileable.state = WindowState.TiledAfloat)
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
