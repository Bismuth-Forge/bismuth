// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Config from "../config";

export default class Debug {
  private enabled: boolean;
  private started: number;

  constructor(config: Config) {
    this.enabled = config.debugEnabled;
    this.started = new Date().getTime();
  }

  public debug(f: () => any): void {
    if (this.enabled) {
      const timestamp = (new Date().getTime() - this.started) / 1000;
      console.log(`[${timestamp}]`, f());
    }
  }

  public debugObj(f: () => [string, any]): void {
    if (this.enabled) {
      const timestamp = (new Date().getTime() - this.started) / 1000;
      const [name, obj] = f();
      const buf = [];
      for (const i in obj) {
        buf.push(`${i}=${obj[i]}`);
      }

      console.log(`[${timestamp}]`, `${name}: ${buf.join(" ")}`);
    }
  }
}
