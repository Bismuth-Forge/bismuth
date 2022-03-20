// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import { WindowState, EngineWindow } from "../window";

import {
  Action,
  DecreaseMasterAreaWindowCount,
  IncreaseMasterAreaWindowCount,
} from "../../controller/action";

import { Rect } from "../../util/rect";
import { Controller } from "../../controller";
import { Engine } from "..";

export default class StairLayout implements WindowsLayout {
  public static readonly id = "StairLayout";
  public readonly classID = StairLayout.id;
  public readonly name = "Stair Layout";
  public readonly icon = "bismuth-stair";

  private space: number; /* in PIXELS */

  constructor() {
    this.space = 24;
  }

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void {
    /* Tile all tileables */
    tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
    const tiles = tileables;

    const len = tiles.length;
    const space = this.space;

    // TODO: limit the maximum number of staired windows.

    for (let i = 0; i < len; i++) {
      const dx = space * (len - i - 1);
      const dy = space * i;
      tiles[i].geometry = new Rect(
        area.x + dx,
        area.y + dy,
        area.width - dx,
        area.height - dy
      );
    }
  }

  public clone(): WindowsLayout {
    const other = new StairLayout();
    other.space = this.space;
    return other;
  }

  public executeAction(_engine: Engine, action: Action): void {
    if (action instanceof DecreaseMasterAreaWindowCount) {
      // TODO: define arbitrary constants
      this.space = Math.max(16, this.space - 8);
    } else if (action instanceof IncreaseMasterAreaWindowCount) {
      // TODO: define arbitrary constants
      this.space = Math.min(160, this.space + 8);
    } else {
      action.executeWithoutLayoutOverride();
    }
  }

  public toString(): string {
    return `StairLayout(${this.space})`;
  }
}
