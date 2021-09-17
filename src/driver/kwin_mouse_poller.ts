// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Config from "../config";
import Debug from "../util/debug";
import qmlSetTimeout from "../util/timer";

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
  private config: Config;

  constructor(qml: Bismuth.Qml.Main, config: Config, _debug: Debug) {
    this.startCount = 0;
    this.cmdResult = null;
    this.qml = qml;
    this.config = config;

    /* we will poll manually, because this interval value will be
     * aligned to intervalAlignment, which probably is 1000. */
    this.qml.mousePoller.interval = 0;

    this.qml.mousePoller.onNewData.connect((sourceName: string, data: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      this.cmdResult = data["exit code"] === 0 ? data["stdout"] : null;
      this.qml.mousePoller.disconnectSource(KWinMousePoller.COMMAND);

      qmlSetTimeout(() => {
        if (this.started) {
          qml.mousePoller.connectSource(KWinMousePoller.COMMAND);
        }
      }, KWinMousePoller.INTERVAL);
    });
  }

  public start(): void {
    this.startCount += 1;
    if (this.config.pollMouseXdotool) {
      this.qml.mousePoller.connectSource(KWinMousePoller.COMMAND);
    }
  }

  public stop(): void {
    this.startCount = Math.max(this.startCount - 1, 0);
  }

  private parseResult(): [number, number] | null {
    // output example: x:1031 y:515 screen:0 window:90177537
    if (!this.cmdResult) {
      return null;
    }

    let x: number | null = null;
    let y: number | null = null;
    this.cmdResult
      .split(" ")
      .slice(0, 2)
      .forEach((part) => {
        const [key, value, _] = part.split(":");
        if (key === "x") {
          x = parseInt(value, 10);
        }
        if (key === "y") {
          y = parseInt(value, 10);
        }
      });

    if (x === null || y === null) {
      return null;
    }
    return [x, y];
  }
}
