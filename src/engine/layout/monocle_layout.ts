// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import Window from "../window";
import { WindowState } from "../window";

import { KWinWindow } from "../../driver/window";

import {
  Action,
  FocusBottomWindow,
  FocusLeftWindow,
  FocusNextWindow,
  FocusPreviousWindow,
  FocusRightWindow,
  FocusUpperWindow,
} from "../../controller/action";

import Rect from "../../util/rect";
import Config from "../../config";
import qmlSetTimeout from "../../util/timer";
import { Controller } from "../../controller";
import { Engine } from "..";

export default class MonocleLayout implements WindowsLayout {
  public static readonly id = "MonocleLayout";
  public readonly description: string = "Monocle";

  public readonly classID = MonocleLayout.id;

  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  public apply(controller: Controller, tileables: Window[], area: Rect): void {
    /* Tile all tileables */
    tileables.forEach((tile) => {
      tile.state = this.config.monocleMaximize
        ? WindowState.Maximized
        : WindowState.Tiled;
      tile.geometry = area;
    });

    /* KWin-specific `monocleMinimizeRest` option */
    if (this.config.monocleMinimizeRest) {
      const tiles = [...tileables];
      qmlSetTimeout(() => {
        const current = controller.currentWindow;
        if (current && current.tiled) {
          tiles.forEach((window) => {
            if (window !== current) {
              (window.window as KWinWindow).client.minimized = true;
            }
          });
        }
      }, 50);
    }
  }

  public clone(): this {
    /* fake clone */
    return this;
  }

  public executeAction(engine: Engine, action: Action): void {
    if (
      action instanceof FocusUpperWindow ||
      action instanceof FocusLeftWindow ||
      action instanceof FocusPreviousWindow
    ) {
      engine.focusOrder(-1);
    } else if (
      action instanceof FocusBottomWindow ||
      action instanceof FocusRightWindow ||
      action instanceof FocusNextWindow
    ) {
      engine.focusOrder(1);
    } else {
      console.log("Executing from Monocle regular action!");
      action.executeWithoutLayoutOverride();
    }
  }

  public toString(): string {
    return "MonocleLayout()";
  }
}
