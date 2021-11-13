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
  /* read-only */

  /**
   * Human-readable name of the layout.
   */
  readonly name: string;

  /**
   * The icon name of the layout.
   */
  readonly icon: string;

  /**
   * A string that can be used to show layout specific properties in the pop-up,
   * e.g. the number of master windows.
   */
  readonly hint?: string;

  /**
   * The maximum number of windows, that the layout can contain.
   */
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
