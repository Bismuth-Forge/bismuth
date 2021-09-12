// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import EngineContext from "../engine_context";
import { ILayout } from "./ilayout";
import Window from "../window";
import { WindowState } from "../window";
import { Shortcut } from "../../controller/shortcut";
import Rect from "../../util/rect";

export default class SpreadLayout implements ILayout {
  public static readonly id = "SpreadLayout";

  public readonly classID = SpreadLayout.id;
  public readonly description = "Spread";

  private space: number; /* in ratio */

  constructor() {
    this.space = 0.07;
  }

  public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
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

    for (let i = 0; i < tiles.length; i++)
      tiles[i].geometry = new Rect(
        area.x + (i < numTiles ? spaceWidth * (numTiles - i - 1) : 0),
        area.y,
        cardWidth,
        area.height
      );
  }

  public clone(): ILayout {
    const other = new SpreadLayout();
    other.space = this.space;
    return other;
  }

  public handleShortcut(ctx: EngineContext, input: Shortcut) {
    switch (input) {
      case Shortcut.Decrease:
        // TODO: define arbitrary constants
        this.space = Math.max(0.04, this.space - 0.01);
        break;
      case Shortcut.Increase:
        // TODO: define arbitrary constants
        this.space = Math.min(0.1, this.space + 0.01);
        break;
      default:
        return false;
    }
    return true;
  }

  public toString(): string {
    return "SpreadLayout(" + this.space + ")";
  }
}
