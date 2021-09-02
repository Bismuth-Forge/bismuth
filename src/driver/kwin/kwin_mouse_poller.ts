// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
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

import IConfig from "../../config";
import { KWinSetTimeout } from "./kwin_set_timeout";

export default class KWinMousePoller {
  public static readonly COMMAND = "xdotool getmouselocation";
  public static readonly INTERVAL = 50; /* ms */

  public get started(): boolean {
    return this.startCount > 0;
  }

  public get mousePosition(): [number, number] | null {
    return this.parseResult();
  }

  /** poller activates only when count > 0 */
  private startCount: number;
  private cmdResult: string | null;
  private qml: Bismuth.Qml.Main;
  private config: IConfig;

  constructor(qml: Bismuth.Qml.Main, config: IConfig) {
    this.startCount = 0;
    this.cmdResult = null;
    this.qml = qml;
    this.config = config;

    /* we will poll manually, because this interval value will be
     * aligned to intervalAlignment, which probably is 1000. */
    this.qml.mousePoller.interval = 0;

    this.qml.mousePoller.onNewData.connect((sourceName: string, data: any) => {
      // tslint:disable-next-line:no-string-literal
      this.cmdResult = data["exit code"] === 0 ? data["stdout"] : null;
      this.qml.mousePoller.disconnectSource(KWinMousePoller.COMMAND);

      KWinSetTimeout(() => {
        if (this.started) qml.mousePoller.connectSource(KWinMousePoller.COMMAND);
      }, KWinMousePoller.INTERVAL, this.qml.scriptRoot);
    });
  }

  public start() {
    this.startCount += 1;
    if (this.config.pollMouseXdotool)
      this.qml.mousePoller.connectSource(KWinMousePoller.COMMAND);
  }

  public stop() {
    this.startCount = Math.max(this.startCount - 1, 0);
  }

  private parseResult(): [number, number] | null {
    // output example: x:1031 y:515 screen:0 window:90177537
    if (!this.cmdResult) return null;

    let x: number | null = null;
    let y: number | null = null;
    this.cmdResult
      .split(" ")
      .slice(0, 2)
      .forEach((part) => {
        const [key, value, _] = part.split(":");
        if (key === "x") x = parseInt(value, 10);
        if (key === "y") y = parseInt(value, 10);
      });

    if (x === null || y === null) return null;
    return [x, y];
  }
}
