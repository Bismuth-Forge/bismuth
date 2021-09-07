// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import EngineContext from "../engine/engine_context";
import KWinDriver from "../driver/kwin_driver";
import KWinWindow from "../driver/kwin_window";
import Window from "../engine/window";
import { ILayout } from "./ilayout";
import { Shortcut } from "../shortcut";
import { WindowState } from "../engine/window";
import Rect from "../util/rect";
import IConfig from "../config";

export default class MonocleLayout implements ILayout {
  public static readonly id = "MonocleLayout";
  public readonly description: string = "Monocle";

  public readonly classID = MonocleLayout.id;

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
    /* Tile all tileables */
    tileables.forEach((tile) => {
      tile.state = this.config.monocleMaximize
        ? WindowState.Maximized
        : WindowState.Tiled;
      tile.geometry = area;
    });

    /* KWin-specific `monocleMinimizeRest` option */
    if (
      ctx.backend === KWinDriver.backendName &&
      this.config.monocleMinimizeRest
    ) {
      const tiles = [...tileables];
      ctx.setTimeout(() => {
        const current = ctx.currentWindow;
        if (current && current.tiled) {
          tiles.forEach((window) => {
            if (window !== current)
              (window.window as KWinWindow).client.minimized = true;
          });
        }
      }, 50);
    }
  }

  public clone(): this {
    /* fake clone */
    return this;
  }

  public handleShortcut(
    ctx: EngineContext,
    input: Shortcut,
    data?: any
  ): boolean {
    switch (input) {
      case Shortcut.Up:
      case Shortcut.FocusUp:
      case Shortcut.Left:
      case Shortcut.FocusLeft:
        ctx.cycleFocus(-1);
        return true;
      case Shortcut.Down:
      case Shortcut.FocusDown:
      case Shortcut.Right:
      case Shortcut.FocusRight:
        ctx.cycleFocus(1);
        return true;
      default:
        return false;
    }
  }

  public toString(): string {
    return "MonocleLayout()";
  }
}
