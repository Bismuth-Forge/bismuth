// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import TilingEngine from "./tiling_engine";
import Window from "./window";
import IDriverContext from "../driver/idriver_context";

/**
 * Provides contextual information and operations to Layout layer.
 *
 * Its purpose is to limit the visibility of information and operation. It's
 * not really a find-grained control mechanism, but is simple and concise.
 */
export default class EngineContext {
  public get currentWindow(): Window | null {
    return this.drvctx.currentWindow;
  }

  public set currentWindow(window: Window | null) {
    this.drvctx.currentWindow = window;
  }

  constructor(private drvctx: IDriverContext, private engine: TilingEngine) {}

  public cycleFocus(step: -1 | 1) {
    this.engine.focusOrder(this.drvctx, step);
  }

  public moveWindow(window: Window, target: Window, after?: boolean) {
    this.engine.windows.move(window, target, after);
  }

  public showNotification(text: string) {
    this.drvctx.showNotification(text);
  }
}
