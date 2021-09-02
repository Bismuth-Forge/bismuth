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
import ISurface from "../../isurface";
import { toRect } from "../../util/kwinutil";
import Rect from "../../util/rect";

export default class KWinSurface implements ISurface {
  public static generateId(screen: number, activity: string, desktop: number, config: IConfig) {
    let path = String(screen);
    if (config.layoutPerActivity) path += "@" + activity;
    if (config.layoutPerDesktop) path += "#" + desktop;
    return path;
  }

  public readonly id: string;
  public readonly ignore: boolean;
  public readonly workingArea: Rect;

  public readonly screen: number;
  public readonly activity: string;
  public readonly desktop: number;

  private activityInfo: Plasma.TaskManager.ActivityInfo;
  private kwinApi: KWin.Api;
  private config: IConfig;

  constructor(screen: number, activity: string, desktop: number, activityInfo: Plasma.TaskManager.ActivityInfo, kwinApi: KWin.Api, config: IConfig) {
    const activityName = activityInfo.activityName(activity);

    this.activityInfo = activityInfo;
    this.kwinApi = kwinApi;
    this.config = config;

    this.id = KWinSurface.generateId(screen, activity, desktop, this.config);
    this.ignore =
      this.config.ignoreActivity.indexOf(activityName) >= 0 ||
      this.config.ignoreScreen.indexOf(screen) >= 0;
    this.workingArea = toRect(
      this.kwinApi.workspace.clientArea(KWin.PlacementArea, screen, desktop)
    );

    this.screen = screen;
    this.activity = activity;
    this.desktop = desktop;
  }

  public next(): ISurface | null {
    if (this.desktop === this.kwinApi.workspace.desktops)
      /* this is the last virtual desktop */
      /* TODO: option to create additional desktop */
      return null;

    return new KWinSurface(this.screen, this.activity, this.desktop + 1, this.activityInfo, this.kwinApi, this.config);
  }

  public toString(): string {
    return (
      "KWinSurface(" +
      [
        this.screen,
        this.activityInfo.activityName(this.activity),
        this.desktop,
      ].join(", ") +
      ")"
    );
  }
}
