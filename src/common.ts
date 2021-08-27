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

enum Shortcut {
  Left,
  Right,
  Up,
  Down,

  /* Alternate HJKL bindings */
  FocusUp,
  FocusDown,
  FocusLeft,
  FocusRight,

  ShiftLeft,
  ShiftRight,
  ShiftUp,
  ShiftDown,

  SwapUp,
  SwapDown,
  SwapLeft,
  SwapRight,

  GrowWidth,
  GrowHeight,
  ShrinkWidth,
  ShrinkHeight,

  Increase,
  Decrease,
  ShiftIncrease,
  ShiftDecrease,

  ToggleFloat,
  ToggleFloatAll,
  SetMaster,
  NextLayout,
  PreviousLayout,
  SetLayout,

  Rotate,
  RotatePart,
}

//#region Driver

interface IConfig {
  //#region Layout
  layoutOrder: string[];
  layoutFactories: { [key: string]: () => ILayout };
  monocleMaximize: boolean;
  maximizeSoleTile: boolean;
  //#endregion

  //#region Features
  adjustLayout: boolean;
  adjustLayoutLive: boolean;
  keepFloatAbove: boolean;
  noTileBorder: boolean;
  limitTileWidthRatio: number;
  //#endregion

  //#region Gap
  screenGapBottom: number;
  screenGapLeft: number;
  screenGapRight: number;
  screenGapTop: number;
  tileLayoutGap: number;
  //#endregion

  //#region Behavior
  directionalKeyMode: "dwm" | "focus";
  newWindowAsMaster: boolean;
  //#endregion
}

interface IDriverWindow {
  readonly fullScreen: boolean;
  readonly geometry: Readonly<Rect>;
  readonly id: string;
  readonly maximized: boolean;
  readonly shouldIgnore: boolean;
  readonly shouldFloat: boolean;

  surface: ISurface;

  commit(geometry?: Rect, noBorder?: boolean, keepAbove?: boolean): void;
  visible(srf: ISurface): boolean;
}

interface ISurface {
  readonly id: string;
  readonly ignore: boolean;
  readonly workingArea: Readonly<Rect>;

  next(): ISurface | null;
}

interface IDriverContext {
  readonly backend: string;
  readonly screens: ISurface[];
  readonly cursorPosition: [number, number] | null;

  currentSurface: ISurface;
  currentWindow: Window | null;

  setTimeout(func: () => void, timeout: number): void;
  showNotification(text: string): void;
}

//#endregion

interface ILayoutClass {
  readonly id: string;
  new (): ILayout;
}

interface ILayout {
  /* read-only */
  readonly capacity?: number;
  readonly description: string;

  /* methods */
  adjust?(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void;
  apply(ctx: EngineContext, tileables: Window[], area: Rect): void;
  handleShortcut?(ctx: EngineContext, input: Shortcut, data?: any): boolean;

  toString(): string;
}

let CONFIG: IConfig;
