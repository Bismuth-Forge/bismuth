// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import TilingEngine from ".";
import Window from "./window";
import { DriverContext } from "../driver";
import TilingController from "../controller";

/**
 * Provides contextual information and operations to Layout layer.
 *
 * Its purpose is to limit the visibility of information and operation. It's
 * not really a find-grained control mechanism, but is simple and concise.
 */
export default class EngineContext {
  public get currentWindow(): Window | null {
    return this.controller.currentWindow;
  }

  public set currentWindow(window: Window | null) {
    this.controller.currentWindow = window;
  }

  constructor(
    private drvctx: DriverContext,
    private controller: TilingController,
    private engine: TilingEngine
  ) {}

  public cycleFocus(step: -1 | 1) {
    this.engine.focusOrder(this.drvctx, step);
  }

  public moveWindow(window: Window, target: Window, after?: boolean) {
    this.engine.windows.move(window, target, after);
  }

  public showNotification(text: string) {
    this.controller.showNotification(text);
  }
}
