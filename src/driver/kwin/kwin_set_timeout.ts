// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Debug from "../../util/debug";

export default class KWinTimerPool {
  public static readonly instance = new KWinTimerPool();

  public timers: QQmlTimer[];
  public numTimers: number;

  constructor() {
    this.timers = [];
    this.numTimers = 0;
  }

  public setTimeout(
    func: () => void,
    timeout: number,
    scriptRoot: object,
    debug: Debug
  ) {
    if (this.timers.length === 0) {
      this.numTimers++;
      debug.debugObj(() => [
        "setTimeout/newTimer",
        { numTimers: this.numTimers },
      ]);
    }

    const timer: QQmlTimer =
      this.timers.pop() ||
      Qt.createQmlObject("import QtQuick 2.0; Timer {}", scriptRoot);

    const callback = () => {
      try {
        timer.triggered.disconnect(callback);
      } catch (e) {
        /* ignore */
      }
      try {
        func();
      } catch (e) {
        /* ignore */
      }
      this.timers.push(timer);
    };

    timer.interval = timeout;
    timer.repeat = false;
    timer.triggered.connect(callback);
    timer.start();
  }
}

export function KWinSetTimeout(
  func: () => void,
  timeout: number,
  scriptRoot: object,
  debug: Debug
) {
  KWinTimerPool.instance.setTimeout(func, timeout, scriptRoot, debug);
}
