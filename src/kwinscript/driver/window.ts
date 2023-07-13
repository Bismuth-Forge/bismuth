// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { DriverSurface, DriverSurfaceImpl } from "./surface";

import { Rect } from "../util/rect";
import { clip, matchWords } from "../util/func";
import { Config } from "../config";
import { Log } from "../util/log";
import { TSProxy } from "../extern/proxy";

/**
 * KWin window representation.
 */
export interface DriverWindow {
  /**
   * Is the window is currently set to be fullscreen
   */
  readonly fullScreen: boolean;

  /**
   * Window geometry: its coordinates, width and height
   */
  readonly geometry: Readonly<Rect>;

  /**
   * Window unique id
   */
  readonly id: string;

  /**
   * Whether it window is in maximized state
   */
  readonly maximized: boolean;

  /**
   * Whether the window should be completely ignored by the script
   */
  readonly shouldIgnore: boolean;

  /**
   * Whether the window should float according to the some predefined rules
   */
  readonly shouldFloat: boolean;

  /**
   * The screen number the window is currently at
   */
  readonly screen: number;

  /**
   * Whether the window is focused right now
   */
  readonly active: boolean;

  /**
   * Whether the window is a dialog window
   */
  readonly isDialog: boolean;

  /**
   * Window's current surface
   */
  surface: DriverSurface;

  /**
   * Whether the window is minimized
   */
  minimized: boolean;

  /**
   * Whether the window is shaded
   */
  shaded: boolean;

  /**
   * Commit the window properties to the KWin, i.e. "show the results of our manipulations to the user"
   * @param geometry
   * @param noBorder
   * @param keepAbove
   */
  commit(geometry?: Rect, noBorder?: boolean, keepAbove?: boolean): void;

  /**
   * Whether the window is visible on the specified surface
   * @param surf the surface to check against
   */
  visibleOn(surf: DriverSurface): boolean;
}

export class DriverWindowImpl implements DriverWindow {
  public readonly id: string;

  public get fullScreen(): boolean {
    return this.client.fullScreen;
  }

  public get geometry(): Rect {
    return Rect.fromQRect(this.client.frameGeometry);
  }

  public get active(): boolean {
    return this.client.active;
  }

  public get shouldIgnore(): boolean {
    const resourceClass = String(this.client.resourceClass);
    const resourceName = String(this.client.resourceName);
    const windowRole = String(this.client.windowRole);
    return (
      this.client.specialWindow ||
      resourceClass === "plasmashell" ||
      resourceClass === "ksmserver" ||
      resourceClass === "org.kde.plasmashell" ||
      resourceClass === "krunner" ||
      resourceClass === "kded5" ||
      this.config.ignoreClass.indexOf(resourceClass) >= 0 ||
      this.config.ignoreClass.indexOf(resourceName) >= 0 ||
      matchWords(this.client.caption, this.config.ignoreTitle) >= 0 ||
      this.config.ignoreRole.indexOf(windowRole) >= 0
    );
  }

  public get shouldFloat(): boolean {
    const resourceClass = String(this.client.resourceClass);
    const resourceName = String(this.client.resourceName);
    return (
      this.client.modal ||
      !this.client.resizeable ||
      (this.config.floatUtility &&
        (this.client.dialog ||
          this.client.splash ||
          this.client.utility ||
          this.client.transient)) ||
      this.config.floatingClass.indexOf(resourceClass) >= 0 ||
      this.config.floatingClass.indexOf(resourceName) >= 0 ||
      matchWords(this.client.caption, this.config.floatingTitle) >= 0
    );
  }

  public get screen(): number {
    return this.client.screen;
  }

  public get minimized(): boolean {
    return this.client.minimized;
  }

  public set minimized(min: boolean) {
    this.client.minimized = min;
  }

  public get shaded(): boolean {
    return this.client.shade;
  }

  public maximized: boolean;

  public get surface(): DriverSurface {
    let activity;
    if (this.client.activities.length === 0) {
      activity = this.kwinApi.workspace.currentActivity;
    } else if (
      this.client.activities.indexOf(this.kwinApi.workspace.currentActivity) >=
      0
    ) {
      activity = this.kwinApi.workspace.currentActivity;
    } else {
      activity = this.client.activities[0];
    }

    const desktop =
      this.client.desktop >= 0
        ? this.client.desktop
        : this.kwinApi.workspace.currentDesktop;

    return new DriverSurfaceImpl(
      this.client.screen,
      activity,
      desktop,
      this.qml.activityInfo,
      this.config,
      this.kwinApi
    );
  }

  public set surface(surf: DriverSurface) {
    const surfImpl = surf as DriverSurfaceImpl;

    // TODO: setting activity?
    // TODO: setting screen = move to the screen
    if (this.client.desktop !== surfImpl.desktop) {
      this.client.desktop = surfImpl.desktop;
    }
  }

  private noBorderManaged: boolean;
  private noBorderOriginal: boolean;

  /**
   * Create a window from the KWin client object
   *
   * @param client the client the window represents
   * @param qml root qml object of the script
   * @param config
   * @param log
   */
  constructor(
    public readonly client: KWin.Client,
    private qml: Bismuth.Qml.Main,
    private config: Config,
    private kwinApi: KWin.Api
  ) {
    this.id = DriverWindowImpl.generateID(client);
    this.maximized = false;
    this.noBorderManaged = false;
    this.noBorderOriginal = client.noBorder;
  }

  public static generateID(client: KWin.Client): string {
    return `${String(client)}/${client.windowId}`;
  }

  public commit(
    geometry?: Rect,
    noBorder?: boolean,
    keepAbove?: boolean
  ): void {
    // TODO: Refactor this awful function
    // this.log.log(
    //   `[DriverWindow#commit] Called with params: {
    //      geometry: ${geometry},
    //      noBorder: ${noBorder},
    //      keepAbove: ${keepAbove}
    //     } for window ${this} on the screen ${this.screen}
    //   `
    // );

    if (this.client.move || this.client.resize) {
      return;
    }

    if (noBorder !== undefined) {
      if (!this.noBorderManaged && noBorder) {
        /* Backup border state when transitioning from unmanaged to managed */
        this.noBorderOriginal = this.client.noBorder;
      } else if (this.noBorderManaged && !this.client.noBorder) {
        /* If border is enabled while in managed mode, remember it.
         * Note that there's no way to know if border is re-disabled in managed mode. */
        this.noBorderOriginal = false;
      }

      if (noBorder) {
        /* (Re)entering managed mode: remove border. */
        this.client.noBorder = true;
      } else if (this.noBorderManaged) {
        /* Exiting managed mode: restore original value. */
        this.client.noBorder = this.noBorderOriginal;
      }

      /* update mode */
      this.noBorderManaged = noBorder;
    }

    if (keepAbove !== undefined) {
      this.client.keepAbove = keepAbove;
    }

    if (geometry !== undefined) {
      geometry = this.adjustGeometry(geometry);
      if (this.config.preventProtrusion) {
        const area = Rect.fromQRect(
          this.kwinApi.workspace.clientArea(
            0, // This is placement area
            this.client.screen,
            this.kwinApi.workspace.currentDesktop
          )
        );
        if (!area.includes(geometry)) {
          /* assume windows will extrude only through right and bottom edges */
          const x = geometry.x + Math.min(area.maxX - geometry.maxX, 0);
          const y = geometry.y + Math.min(area.maxY - geometry.maxY, 0);
          geometry = new Rect(x, y, geometry.width, geometry.height);
          geometry = this.adjustGeometry(geometry);
        }
      }
      this.client.frameGeometry = geometry.toQRect();
    }
  }

  public toString(): string {
    // Using a shorthand name to keep debug message tidy
    return `KWin(${this.client.windowId?.toString(16)}.${
      this.client.resourceClass
    })`;
  }

  public visibleOn(surf: DriverSurface): boolean {
    const surfImpl = surf as DriverSurfaceImpl;
    return (
      !this.client.minimized &&
      (this.client.desktop === surfImpl.desktop ||
        this.client.desktop === -1) /* on all desktop */ &&
      (this.client.activities.length === 0 /* on all activities */ ||
        this.client.activities.indexOf(surfImpl.activity) !== -1) &&
      this.client.screen === surfImpl.screen
    );
  }

  /**
   * Apply various resize hints to the given geometry
   * @param geometry
   * @returns
   */
  private adjustGeometry(geometry: Rect): Rect {
    let width = geometry.width;
    let height = geometry.height;

    /* do not resize fixed-size windows */
    if (!this.client.resizeable) {
      width = this.client.frameGeometry.width;
      height = this.client.frameGeometry.height;
    } else {
      /* respect min/max size limit */
      width = clip(width, this.client.minSize.width, this.client.maxSize.width);
      height = clip(
        height,
        this.client.minSize.height,
        this.client.maxSize.height
      );
    }

    return new Rect(geometry.x, geometry.y, width, height);
  }

  public get isDialog(): boolean {
    return this.client.dialog;
  }
}
