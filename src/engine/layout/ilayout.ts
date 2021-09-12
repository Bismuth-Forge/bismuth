// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import EngineContext from "../engine_context";
import { Shortcut } from "../../controller/shortcut";
import Window from "../window";
import Rect from "../../util/rect";
import RectDelta from "../../util/rectdelta";
import Config from "../../config";

export interface ILayoutClass {
  readonly id: string;
  new (config: Config): ILayout;
}

export interface ILayout {
  /* read-only */
  readonly capacity?: number;
  readonly description: string;

  /* methods */
  adjust?(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void;
  apply(ctx: EngineContext, tileables: Window[], area: Rect): void;
  handleShortcut?(ctx: EngineContext, input: Shortcut, data?: any): boolean;

  toString(): string;
}
