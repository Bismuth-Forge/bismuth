// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Config from "../config";
import { DriverWindow } from "../driver/window";
import { DriverSurface } from "../driver/surface";
import Debug from "../util/debug";
import Rect from "../util/rect";
import RectDelta from "../util/rectdelta";

export enum WindowState {
  /* initial value */
  Unmanaged,

  /* script-external state - overrides internal state */
  NativeFullscreen,
  NativeMaximized,

  /* script-internal state */
  Floating,
  Maximized,
  Tiled,
  TiledAfloat,
  Undecided,
}

export default class Window {
  public static isTileableState(state: WindowState): boolean {
    return (
      state === WindowState.Tiled ||
      state === WindowState.Maximized ||
      state === WindowState.TiledAfloat
    );
  }

  public static isTiledState(state: WindowState): boolean {
    return state === WindowState.Tiled || state === WindowState.Maximized;
  }

  public static isFloatingState(state: WindowState): boolean {
    return state === WindowState.Floating || state === WindowState.TiledAfloat;
  }

  public readonly id: string;
  public readonly window: DriverWindow;

  public get actualGeometry(): Readonly<Rect> {
    return this.window.geometry;
  }
  public get shouldFloat(): boolean {
    return this.window.shouldFloat;
  }
  public get shouldIgnore(): boolean {
    return this.window.shouldIgnore;
  }

  /** If this window ***can be*** tiled by layout. */
  public get tileable(): boolean {
    return Window.isTileableState(this.state);
  }
  /** If this window is ***already*** tiled, thus a part of the current layout. */
  public get tiled(): boolean {
    return Window.isTiledState(this.state);
  }
  /** If this window is floating, thus its geometry is not tightly managed. */
  public get floating(): boolean {
    return Window.isFloatingState(this.state);
  }

  public get geometryDelta(): RectDelta {
    return RectDelta.fromRects(this.geometry, this.actualGeometry);
  }

  public floatGeometry: Rect;
  public geometry: Rect;
  public timestamp: number;

  /**
   * The current state of the window.
   *
   * This value affects what and how properties gets commited to the backend.
   *
   * Avoid comparing this value directly, and use `tileable`, `tiled`,
   * `floating` as much as possible.
   */
  public get state(): WindowState {
    /* external states override the internal state. */
    if (this.window.fullScreen) return WindowState.NativeFullscreen;
    if (this.window.maximized) return WindowState.NativeMaximized;

    return this.internalState;
  }

  public set state(value: WindowState) {
    const winState = this.state;

    /* cannot transit to the current state */
    if (winState === value) return;

    if (
      (winState === WindowState.Unmanaged ||
        Window.isTileableState(winState)) &&
      Window.isFloatingState(value)
    )
      this.shouldCommitFloat = true;
    else if (Window.isFloatingState(winState) && Window.isTileableState(value))
      /* save the current geometry before leaving floating state */
      this.floatGeometry = this.actualGeometry;

    this.internalState = value;
  }

  public get surface(): DriverSurface {
    return this.window.surface;
  }

  public set surface(srf: DriverSurface) {
    this.window.surface = srf;
  }

  public get weight(): number {
    const srfID = this.window.surface.id;
    const winWeight: number | undefined = this.weightMap[srfID];
    if (winWeight === undefined) {
      this.weightMap[srfID] = 1.0;
      return 1.0;
    }
    return winWeight;
  }

  public set weight(value: number) {
    const srfID = this.window.surface.id;
    this.weightMap[srfID] = value;
  }

  private internalState: WindowState;
  private shouldCommitFloat: boolean;
  private weightMap: { [key: string]: number };

  private config: Config;
  private debug: Debug;

  constructor(window: DriverWindow, config: Config, debug: Debug) {
    this.config = config;
    this.debug = debug;

    this.id = window.id;
    this.window = window;

    this.floatGeometry = window.geometry;
    this.geometry = window.geometry;
    this.timestamp = 0;

    this.internalState = WindowState.Unmanaged;
    this.shouldCommitFloat = this.shouldFloat;
    this.weightMap = {};
  }

  public commit() {
    const state = this.state;
    this.debug.debugObj(() => ["Window#commit", { state: WindowState[state] }]);
    switch (state) {
      case WindowState.NativeMaximized:
        this.window.commit(undefined, undefined, false);
        break;

      case WindowState.NativeFullscreen:
        this.window.commit(undefined, undefined, undefined);
        break;

      case WindowState.Floating:
        if (!this.shouldCommitFloat) break;
        this.window.commit(
          this.floatGeometry,
          false,
          this.config.keepFloatAbove
        );
        this.shouldCommitFloat = false;
        break;

      case WindowState.Maximized:
        this.window.commit(this.geometry, true, false);
        break;

      case WindowState.Tiled:
        this.window.commit(this.geometry, this.config.noTileBorder, false);
        break;

      case WindowState.TiledAfloat:
        if (!this.shouldCommitFloat) break;
        this.window.commit(
          this.floatGeometry,
          false,
          this.config.keepFloatAbove
        );
        this.shouldCommitFloat = false;
        break;
    }
  }

  /**
   * Force apply the geometry *immediately*.
   *
   * This method is a quick hack created for engine#resizeFloat, thus should
   * not be used in other places.
   */
  public forceSetGeometry(geometry: Rect) {
    this.window.commit(geometry);
  }

  public visible(srf: DriverSurface): boolean {
    return this.window.visible(srf);
  }

  public toString(): string {
    return "Window(" + String(this.window) + ")";
  }
}
