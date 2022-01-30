// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { EngineWindow } from "../window";
import { Engine } from "..";

import { Controller } from "../../controller";
import { Action } from "../../controller/action";

import { Rect, RectDelta } from "../../util/rect";

export abstract class WindowsLayout {
  /* read-only */

  static readonly id: string;

  /**
   * Human-readable name of the layout.
   */
  abstract readonly name: string;

  /**
   * The icon name of the layout.
   */
  abstract readonly icon: string;

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

  abstract apply(
    controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void;

  executeAction?(engine: Engine, action: Action): void;

  abstract toString(): string;
}
