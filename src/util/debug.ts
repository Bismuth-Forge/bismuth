// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// Copyright (c) 2021 Mikhail Zolotukhin <mail@genda.life>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import IConfig from "../config";

export default class Debug {
  private enabled: boolean;
  private started: number;

  constructor(config: IConfig) {
    this.enabled = config.debugEnabled;
    this.started = new Date().getTime();
  }

  public debug(f: () => any): void {
    if (this.enabled) {
      const timestamp = (new Date().getTime() - this.started) / 1000;
      console.log("[" + timestamp + "]", f()); // tslint:disable-line:no-console
    }
  }

  public debugObj(f: () => [string, any]): void {
    if (this.enabled) {
      const timestamp = (new Date().getTime() - this.started) / 1000;
      const [name, obj] = f();
      const buf = [];
      for (const i in obj) buf.push(i + "=" + obj[i]);

      console.log("[" + timestamp + "]", name + ": " + buf.join(" ")); // tslint:disable-line:no-console
    }
  }
}
