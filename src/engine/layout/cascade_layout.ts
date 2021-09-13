// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import { Engine } from "..";
import Window from "../window";
import { WindowState } from "../window";

import { Shortcut } from "../../controller/shortcut";
import { Controller } from "../../controller";

import Rect from "../../util/rect";

export enum CascadeDirection {
  NorthWest = 0,
  North = 1,
  NorthEast = 2,
  East = 3,
  SouthEast = 4,
  South = 5,
  SouthWest = 6,
  West = 7,
}

export default class CascadeLayout implements WindowsLayout {
  public static readonly id = "CascadeLayout";

  /** Decompose direction into vertical and horizontal steps */
  public static decomposeDirection(
    dir: CascadeDirection
  ): [-1 | 0 | 1, -1 | 0 | 1] {
    switch (dir) {
      case CascadeDirection.NorthWest:
        return [-1, -1];
      case CascadeDirection.North:
        return [-1, 0];
      case CascadeDirection.NorthEast:
        return [-1, 1];
      case CascadeDirection.East:
        return [0, 1];
      case CascadeDirection.SouthEast:
        return [1, 1];
      case CascadeDirection.South:
        return [1, 0];
      case CascadeDirection.SouthWest:
        return [1, -1];
      case CascadeDirection.West:
        return [0, -1];
    }
  }

  public readonly classID = CascadeLayout.id;

  public get description() {
    return "Cascade [" + CascadeDirection[this.dir] + "]";
  }

  constructor(private dir: CascadeDirection = CascadeDirection.SouthEast) {
    /* nothing */
  }

  public apply(_controller: Controller, tileables: Window[], area: Rect): void {
    const [vertStep, horzStep] = CascadeLayout.decomposeDirection(this.dir);

    // TODO: adjustable step size
    const stepSize = 25;

    const windowWidth =
      horzStep !== 0
        ? area.width - stepSize * (tileables.length - 1)
        : area.width;
    const windowHeight =
      vertStep !== 0
        ? area.height - stepSize * (tileables.length - 1)
        : area.height;

    const baseX = horzStep >= 0 ? area.x : area.maxX - windowWidth;
    const baseY = vertStep >= 0 ? area.y : area.maxY - windowHeight;

    let x = baseX,
      y = baseY;
    tileables.forEach((tile) => {
      tile.state = WindowState.Tiled;
      tile.geometry = new Rect(x, y, windowWidth, windowHeight);

      x += horzStep * stepSize;
      y += vertStep * stepSize;
    });
  }

  public clone(): CascadeLayout {
    return new CascadeLayout(this.dir);
  }

  public handleShortcut(engine: Engine, input: Shortcut, _data?: any): boolean {
    switch (input) {
      case Shortcut.Increase:
        this.dir = (this.dir + 1 + 8) % 8;
        engine.showNotification(this.description);
        break;
      case Shortcut.Decrease:
        this.dir = (this.dir - 1 + 8) % 8;
        engine.showNotification(this.description);
        break;
      default:
        return false;
    }
    return true;
  }
}
