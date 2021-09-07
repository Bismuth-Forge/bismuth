// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import IConfig from "../config";
import ISurface from "./isurface";
import { toRect } from "../util/kwinutil";
import Rect from "../util/rect";

export default class KWinSurface implements ISurface {
  public static generateId(
    screen: number,
    activity: string,
    desktop: number,
    config: IConfig
  ) {
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
  constructor(
    screen: number,
    activity: string,
    desktop: number,
    activityInfo: Plasma.TaskManager.ActivityInfo,
    kwinApi: KWin.Api,
    config: IConfig
  ) {
    const activityName = activityInfo.activityName(activity);

    this.activityInfo = activityInfo;
    this.kwinApi = kwinApi;
    this.config = config;

    this.id = KWinSurface.generateId(screen, activity, desktop, this.config);
    this.ignore =
      this.config.ignoreActivity.indexOf(activityName) >= 0 ||
      this.config.ignoreScreen.indexOf(screen) >= 0;
    this.workingArea = toRect(
      this.kwinApi.workspace.clientArea(
        this.kwinApi.KWin.PlacementArea,
        screen,
        desktop
      )
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

    return new KWinSurface(
      this.screen,
      this.activity,
      this.desktop + 1,
      this.activityInfo,
      this.kwinApi,
      this.config
    );
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
