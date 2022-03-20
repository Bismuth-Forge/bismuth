// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { TSProxy } from "../extern/proxy";

type LogType = string | Record<string, unknown> | LogType[];
export interface Log {
  log(str: LogType): void;
}

/**
 * Standard logger
 */
export class LogImpl implements Log {
  constructor(private proxy: TSProxy) {}

  public log(logObj: LogType): void {
    this.proxy.log(logObj);
  }
}
