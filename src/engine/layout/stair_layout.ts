// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import Window from "../window";
import { WindowState } from "../window";

import { Action } from "../../controller/action";

import Rect from "../../util/rect";
import { Controller } from "../../controller";
import { Engine } from "..";

export default class StairLayout implements WindowsLayout {
  public static readonly id = "StairLayout";

  public readonly classID = StairLayout.id;
  public readonly description = "Stair";

  private space: number; /* in PIXELS */

  constructor() {
    this.space = 24;
  }

  public apply(_controller: Controller, tileables: Window[], area: Rect): void {
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

  public handleShortcut(_engine: Engine, input: Action): boolean {
    switch (input) {
      case Action.Decrease:
        // TODO: define arbitrary constants
        this.space = Math.max(16, this.space - 8);
        break;
      case Action.Increase:
        // TODO: define arbitrary constants
        this.space = Math.min(160, this.space + 8);
        break;
      default:
        return false;
    }
    return true;
  }

  public toString(): string {
    return `StairLayout(${this.space})`;
  }
}
