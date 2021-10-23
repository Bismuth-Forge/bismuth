// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { Config } from "../config";

type LogType = string | Record<string, unknown> | LogType[];
export interface Log {
  log(str: LogType): void;
}

/**
 * Standard logger
 */
export class LogImpl implements Log {
  private enabled: boolean;
  private started: number;

  constructor(config: Config) {
    this.enabled = config.debugEnabled;
    this.started = new Date().getTime();
  }

  public log(logObj: LogType): void {
    if (this.enabled) {
      this.doLog(logObj);
    }
  }

  private doLog(logObj: LogType): void {
    if (Object.prototype.toString.call(logObj) === "[object Array]") {
      // If log object is an array
      this.logArray(logObj as LogType[]);
    } else if (typeof logObj == "string") {
      this.logString(logObj);
    } else if (typeof logObj == "object") {
      this.logObject(logObj as Record<string, unknown>);
    }
  }

  /**
   * Logs object (without deep inspection)
   * @param obj object to log
   */
  private logObject(obj: Record<string, unknown>): void {
    // NOTE: be aware, that constructor name could change if minification is used
    const objectName = obj.constructor.name;
    const logQueue = [];
    for (const i in obj) {
      logQueue.push(`${i}: ${obj[i]}`);
    }

    this.logString(`${objectName}: ${logQueue.join(", ")}`);
  }

  /**
   * Logs string
   * @param str string to log
   */
  private logString(str: string): void {
    console.log(`[Bismuth] [${this.now()}] ${str}`);
  }

  /**
   * Sequentially logs the contents of the array
   * @param arr array to log
   */
  private logArray(arr: LogType[]): void {
    for (const element of arr) {
      this.doLog(element);
    }
  }

  private now(): number {
    return (new Date().getTime() - this.started) / 1000;
  }
}

/**
 * Null log, that does not output anything
 */
export class NullLog implements Log {
  public log(_str: LogType): void {
    // NOP
  }
}
