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

export default class SpreadLayout implements WindowsLayout {
  public static readonly id = "SpreadLayout";
  public readonly classID = SpreadLayout.id;
  public readonly name = "Spread Layout";
  public readonly icon = "bismuth-spread";

  private space: number; /* in ratio */

  constructor() {
    this.space = 0.07;
  }

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void {
    /* Tile all tileables */
    tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
    const tiles = tileables;

    let numTiles = tiles.length;
    const spaceWidth = Math.floor(area.width * this.space);
    let cardWidth = area.width - spaceWidth * (numTiles - 1);

    // TODO: define arbitrary constants
    const miniumCardWidth = area.width * 0.4;
    while (cardWidth < miniumCardWidth) {
      cardWidth += spaceWidth;
      numTiles -= 1;
    }

    for (let i = 0; i < tiles.length; i++) {
      tiles[i].geometry = new Rect(
        area.x + (i < numTiles ? spaceWidth * (numTiles - i - 1) : 0),
        area.y,
        cardWidth,
        area.height
      );
    }
  }

  public clone(): WindowsLayout {
    const other = new SpreadLayout();
    other.space = this.space;
    return other;
  }

  public executeAction(_engine: Engine, action: Action): void {
    if (action instanceof DecreaseMasterAreaWindowCount) {
      // TODO: define arbitrary constants
      this.space = Math.max(0.04, this.space - 0.01);
    } else if (action instanceof IncreaseMasterAreaWindowCount) {
      // TODO: define arbitrary constants
      this.space = Math.min(0.1, this.space + 0.01);
    } else {
      action.executeWithoutLayoutOverride();
    }
  }

  public toString(): string {
    return `SpreadLayout(${this.space})`;
  }
}
