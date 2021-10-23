// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { Config } from "../config";
import { Rect } from "../util/rect";

/**
 * Surface provided by KWin. Surface is essentially a screen space, but
 * it can represent a surface, that is not currently displayed, e.g. a
 * virtual desktop.
 */
export interface DriverSurface {
  /**
   * Surface unique id
   */
  readonly id: string;

  /**
   * Should the surface be completely ignored by the script.
   */
  readonly ignore: boolean;

  /**
   * The area in which windows are placed.
   */
  readonly workingArea: Readonly<Rect>;

  /**
   * The next surface. The next surface is a virtual desktop, that comes after current one.
   */
  next(): DriverSurface | null;
}

export class DriverSurfaceImpl implements DriverSurface {
  public readonly id: string;
  public readonly ignore: boolean;
  public readonly workingArea: Rect;

  constructor(
    public readonly screen: number,
    public readonly activity: string,
    public readonly desktop: number,
    private activityInfo: Plasma.TaskManager.ActivityInfo,
    private kwinApi: KWin.Api,
    private config: Config
  ) {
    this.id = this.generateId();

    const activityName = activityInfo.activityName(activity);
    this.ignore =
      this.config.ignoreActivity.indexOf(activityName) >= 0 ||
      this.config.ignoreScreen.indexOf(screen) >= 0;

    this.workingArea = Rect.fromQRect(
      this.kwinApi.workspace.clientArea(
        this.kwinApi.KWin.PlacementArea,
        screen,
        desktop
      )
    );
  }

  public next(): DriverSurface | null {
    // This is the last virtual desktop
    if (this.desktop === this.kwinApi.workspace.desktops) {
      return null;
    }

    return new DriverSurfaceImpl(
      this.screen,
      this.activity,
      this.desktop + 1,
      this.activityInfo,
      this.kwinApi,
      this.config
    );
  }

  public toString(): string {
    const activityName = this.activityInfo.activityName(this.activity);
    return `DriverSurface(${this.screen}, ${activityName}, ${this.desktop})`;
  }

  private generateId(): string {
    let path = String(this.screen);
    if (this.config.layoutPerActivity) {
      path += `@${this.activity}`;
    }
    if (this.config.layoutPerDesktop) {
      path += `"#${this.desktop}`;
    }
    return path;
  }
}
