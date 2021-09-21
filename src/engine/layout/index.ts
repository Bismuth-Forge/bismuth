// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Window from "../window";
import { Engine } from "..";

import { Controller } from "../../controller";
import { Action } from "../../controller/action";

import Rect from "../../util/rect";
import RectDelta from "../../util/rectdelta";
import Config from "../../config";

export interface WindowsLayoutClass {
  readonly id: string;
  new (config: Config): WindowsLayout;
}

export interface WindowsLayout {
  readonly capacity?: number;
  readonly description: string;

  adjust?(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void;
  apply(controller: Controller, tileables: Window[], area: Rect): void;
  executeAction?(engine: Engine, action: Action): void;

  toString(): string;
}
