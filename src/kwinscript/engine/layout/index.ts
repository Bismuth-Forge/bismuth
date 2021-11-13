// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { EngineWindow } from "../window";
import { Engine } from "..";

import { Controller } from "../../controller";
import { Action } from "../../controller/action";

import { Rect, RectDelta } from "../../util/rect";
import { Config } from "../../config";

export interface WindowsLayoutClass {
  readonly id: string;
  new (config: Config): WindowsLayout;
}

export interface WindowsLayout {
  /**
   * Windows layout
   * @param name human readable name of the layout.
   * @param icon the name of the icon of the layout.
   * @param hint an optional string that can be used to indicate the number of master windows in the layout.
   * @param capacity an optional maximum number of windows that the layout can contain.
   */
  readonly name: string;
  readonly icon: string;
  readonly hint?: string;
  readonly capacity?: number;

  adjust?(
    area: Rect,
    tiles: EngineWindow[],
    basis: EngineWindow,
    delta: RectDelta
  ): void;
  apply(controller: Controller, tileables: EngineWindow[], area: Rect): void;
  executeAction?(engine: Engine, action: Action): void;

  toString(): string;
}
