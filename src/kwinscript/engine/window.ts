// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { DriverWindow } from "../driver/window";
import { DriverSurface } from "../driver/surface";

import { Config } from "../config";
import { Log } from "../util/log";
import { Rect, RectDelta } from "../util/rect";

export enum WindowState {
  /**
   * Initial value
   */
  Unmanaged,

  /**
   * Script-external state - overrides internal state
   */
  NativeFullscreen,
  NativeMaximized,

  /**
   * Script-internal state
   */
  Floating,
  Maximized,
  Tiled,
  TiledAfloat,
  Undecided,
}

/**
 * Window with the convenient for the Engine Interface
 */
export interface EngineWindow {
  /**
   * Window unique id
   */
  readonly id: string;

  /**
   * If this window ***can be*** tiled by layout.
   */
  readonly tileable: boolean;

  /**
   * If this window is ***already*** tiled, thus a part of the current layout.
   */
  readonly tiled: boolean;

  /**
   * If this window is floating, thus its geometry is not tightly managed.
   */
  readonly floating: boolean;

  /**
   * Whether the window is shaded (collapsed to the title bar)
   */
  readonly shaded: boolean;

  /**
   * Low-level implementation, usable for Driver
   */
  readonly window: DriverWindow;

  /**
   * Difference between geometry and actual geometry
   */
  readonly geometryDelta: RectDelta;

  /**
   * Actual geometry
   */
  readonly actualGeometry: Readonly<Rect>;

  /**
   * Whether the window is a dialog window
   */
  readonly isDialog: boolean;

  /**
   * Whether the window should be set to floating state
   */
  readonly shouldFloat: boolean;

  /**
   * Whether the window should be ignored by the script
   */
  readonly shouldIgnore: boolean;

  /**
   * State to which the window was asked to be changed
   * previously. This can be the same state, as the current
   * one.
   */
  readonly statePreviouslyAskedToChangeTo: WindowState;

  /**
   * Screen number, on which the window is present
   */
  readonly screen: number;

  /**
   * Whether the window is minimized
   */
  minimized: boolean;

  /**
   * Geometry of a window, while in floated state
   */
  floatGeometry: Rect;

  /**
   * Window geometry
   */
  geometry: Rect;

  /**
   * Surface, the window is currently on
   */
  surface: DriverSurface;

  /**
   * General state of the window: floating, maximized, tiled etc.
   */
  state: WindowState;

  /**
   * The timestamp when the last time Window was focused.
   */
  timestamp: number;

  /**
   * Window weight.
   * TODO: This needs a better explanation. This has something to do with ThreeColumnLayout.
   */
  weight: number;

  /**
   * Whether the window is visible on concrete surface
   * @param surface the surface visibility on which is checked
   */
  visibleOn(surface: DriverSurface): boolean;

  /**
   * Force apply the geometry *immediately*.
   *
   * This method is a quick hack created for engine#resizeFloat, thus should
   * not be used in other places.
   */
  forceSetGeometry(geometry: Rect): void;

  /**
   * Update changed window properties on the KWin side.
   * I.e. make the changes visible to the end user.
   */
  commit(): void;
}

export class EngineWindowImpl implements EngineWindow {
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

  public get screen(): number {
    return this.window.screen;
  }

  public get minimized(): boolean {
    return this.window.minimized;
  }

  public set minimized(min: boolean) {
    this.window.minimized = min;
  }

  public get tileable(): boolean {
    return EngineWindowImpl.isTileableState(this.state);
  }

  public get tiled(): boolean {
    return EngineWindowImpl.isTiledState(this.state);
  }

  public get floating(): boolean {
    return EngineWindowImpl.isFloatingState(this.state);
  }

  public get geometryDelta(): RectDelta {
    return RectDelta.fromRects(this.geometry, this.actualGeometry);
  }

  public get shaded(): boolean {
    return this.window.shaded;
  }

  public floatGeometry: Rect;
  public geometry: Rect;
  public timestamp: number;

  /**
   * The current state of the window.
   *
   * This value affects what and how properties gets committed to the backend.
   *
   * Avoid comparing this value directly, and use `tileable`, `tiled`,
   * `floating` as much as possible.
   */
  public get state(): WindowState {
    /* external states override the internal state. */
    if (this.window.fullScreen) {
      return WindowState.NativeFullscreen;
    }
    if (this.window.maximized) {
      return WindowState.NativeMaximized;
    }

    return this.internalState;
  }

  public set state(value: WindowState) {
    const winState = this.state;
    this.internalStatePreviouslyAskedToChangeTo = winState;

    /* cannot transit to the current state */
    if (winState === value) {
      return;
    }

    if (
      (winState === WindowState.Unmanaged ||
        EngineWindowImpl.isTileableState(winState)) &&
      EngineWindowImpl.isFloatingState(value)
    ) {
      this.shouldCommitFloat = true;
    } else if (
      EngineWindowImpl.isFloatingState(winState) &&
      EngineWindowImpl.isTileableState(value)
    ) {
      /* save the current geometry before leaving floating state */
      this.floatGeometry = this.actualGeometry;
    }

    this.internalState = value;
  }

  public get statePreviouslyAskedToChangeTo(): WindowState {
    return this.internalStatePreviouslyAskedToChangeTo;
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

  public get isDialog(): boolean {
    return this.window.isDialog;
  }

  private internalState: WindowState;
  private internalStatePreviouslyAskedToChangeTo: WindowState;
  private shouldCommitFloat: boolean;
  private weightMap: { [key: string]: number };

  private config: Config;

  constructor(window: DriverWindow, config: Config, private log: Log) {
    this.config = config;

    this.id = window.id;
    this.window = window;
    this.internalStatePreviouslyAskedToChangeTo = WindowState.Floating;

    this.floatGeometry = window.geometry;
    this.geometry = window.geometry;
    this.timestamp = 0;

    this.internalState = WindowState.Unmanaged;
    this.shouldCommitFloat = this.shouldFloat;
    this.weightMap = {};
  }

  public commit(): void {
    const state = this.state;
    // this.log.log(["Window#commit", { state: WindowState[state] }]);
    switch (state) {
      case WindowState.NativeMaximized:
        this.window.commit(
          this.window.surface.workingArea,
          undefined,
          undefined
        );
        break;

      case WindowState.NativeFullscreen:
        this.window.commit(undefined, undefined, undefined);
        break;

      case WindowState.Floating:
        if (!this.shouldCommitFloat) {
          break;
        }
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
        if (!this.shouldCommitFloat) {
          break;
        }
        this.window.commit(
          this.floatGeometry,
          false,
          this.config.keepFloatAbove
        );
        this.shouldCommitFloat = false;
        break;
    }
  }

  public forceSetGeometry(geometry: Rect): void {
    this.window.commit(geometry);
  }

  public visibleOn(srf: DriverSurface): boolean {
    return this.window.visibleOn(srf);
  }

  public toString(): string {
    return "Window(" + String(this.window) + ")";
  }
}
