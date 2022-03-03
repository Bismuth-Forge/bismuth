// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import { Engine } from "..";
import { WindowState, EngineWindow } from "../window";

import {
  Action,
  DecreaseMasterAreaWindowCount,
  IncreaseMasterAreaWindowCount,
} from "../../controller/action";
import { Controller } from "../../controller";

import { Rect } from "../../util/rect";

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
  public readonly classID = CascadeLayout.id;
  public readonly name = "Cascade Layout";
  public readonly icon = "bismuth-cascade";

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

  public get hint(): string {
    return String(CascadeDirection[this.dir]);
  }

  constructor(private dir: CascadeDirection = CascadeDirection.SouthEast) {
    /* nothing */
  }

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void {
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

  public executeAction(engine: Engine, action: Action): void {
    if (action instanceof IncreaseMasterAreaWindowCount) {
      this.dir = (this.dir + 1 + 8) % 8;
      engine.showLayoutNotification();
    } else if (action instanceof DecreaseMasterAreaWindowCount) {
      this.dir = (this.dir - 1 + 8) % 8;
      engine.showLayoutNotification();
    } else {
      action.executeWithoutLayoutOverride();
    }
  }
}
