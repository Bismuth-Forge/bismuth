// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

/**
 * @module
 * This module basically reimplements standard JS setTimeout function
 * in Qt QML environment. The setTimeout function is not availible in Qt
 * JavaScript environment.
 */

import Debug from "./debug";

/**
 * Timer pool. Manages all dynamically created QML timers. Used as singleton to preserve
 * standard JS setTimeout api.
 */
export class TimersPool {
  private static _instance: TimersPool;

  /**
   * Get an instance of timer pool.
   * @param scriptRoot where to create QML Timers. Cannot be ommited in the first call.
   */
  public static instance(scriptRoot?: object, debug?: Debug): TimersPool {
    if (scriptRoot && debug) {
      if (TimersPool._instance) {
        return TimersPool._instance;
      } else {
        return new TimersPool(scriptRoot, debug);
      }
    } else {
      if (TimersPool._instance) {
        throw "Cannot create TimerPool instance first time, when there is not enough arguments!";
      } else {
        return TimersPool._instance;
      }
    }
  }

  /**
   * All the timers, that have been created
   */
  public timers: QQmlTimer[];

  /**
   * Number of the created timers
   */
  public numTimers: number;

  /**
   * Where to create QML timers
   */
  private scriptRoot: object;

  private debug: Debug;

  constructor(scriptRoot: object, debug: Debug) {
    this.scriptRoot = scriptRoot;
    this.debug = debug;

    this.timers = [];
    this.numTimers = 0;
  }

  public setTimeout(func: () => void, timeout: number): void {
    if (this.timers.length === 0) {
      this.numTimers++;
      this.debug.debugObj(() => [
        "setTimeout/newTimer",
        { numTimers: this.numTimers },
      ]);
    }

    const timer: QQmlTimer =
      this.timers.pop() ||
      Qt.createQmlObject("import QtQuick 2.0; Timer {}", this.scriptRoot);

    const callback = (): void => {
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

/**
 * setTimeout from standard JS, but for Qt JS Runtime
 */
export default function qmlSetTimeout(func: () => void, timeout: number): void {
  TimersPool.instance().setTimeout(func, timeout);
}
