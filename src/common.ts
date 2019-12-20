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

    ShiftLeft,
    ShiftRight,
    ShiftUp,
    ShiftDown,

    GrowWidth,
    GrowHeight,
    ShrinkWidth,
    ShrinkHeight,

    Increase,
    Decrease,

    ToggleFloat,
    FloatAll,
    SetMaster,
    CycleLayout,
    SetLayout,
}

enum WindowState {
    Tile,
    FreeTile,
    Float,
    FullScreen,
    Unmanaged,
}

//#region Driver

interface IConfig {
    //#region Layout
    enableMonocleLayout: boolean;
    enableQuarterLayout: boolean;
    enableSpreadLayout: boolean;
    enableStairLayout: boolean;
    enableTileLayout: boolean;
    enableFloatingLayout: boolean;
    monocleMaximize: boolean;
    maximizeSoleTile: boolean;
    //#endregion

    //#region Features
    adjustLayout: boolean;
    adjustLayoutLive: boolean;
    keepTileBelow: boolean;
    noTileBorder: boolean;
    //#endregion

    //#region Gap
    screenGapBottom: number;
    screenGapLeft: number;
    screenGapRight: number;
    screenGapTop: number;
    tileLayoutGap: number;
    //#endregion
}

interface IDriverWindow {
    readonly surface: ISurface;
    readonly fullScreen: boolean;
    readonly geometry: Rect;
    readonly id: string;
    readonly shouldIgnore: boolean;
    readonly shouldFloat: boolean;

    commit(geometry?: Rect, noBorder?: boolean, keepBelow?: boolean): void;
    visible(srf: ISurface): boolean;
}

interface ISurface {
    readonly id: string;
    readonly ignore: boolean;
}

interface IDriver {
    forEachScreen(func: (srf: ISurface) => void): void;
    getCurrentSurface(): ISurface;
    getCurrentWindow(): Window | null;
    getWorkingArea(srf: ISurface): Rect ;
    setCurrentWindow(window: Window): void;
    setTimeout(func: () => void, timeout: number): void;
}

//#endregion

interface IEngine {
    adjustLayout(basis: Window): void;
    arrangeScreen(srf: ISurface): void;

    /* window */
    enforceSize(window: Window): void;
    toggleFloat(window: Window): void;

    /* windows */
    manage(window: Window): void;
    unmanage(window: Window): void;
    moveFocus(window: Window, step: number): void;
    moveTile(window: Window, step: number): void;
    setMaster(window: Window): void;

    /* layout */
    handleLayoutShortcut(input: Shortcut, data?: any): boolean;

    /* layouts */
    cycleLayout(): void;
    setLayout(layout: any): void;
}

interface ILayout {
    /* read-only */
    readonly enabled: boolean;

    /* methods */
    adjust?(area: Rect, tiles: Window[], basis: Window): void;
    apply(tiles: Window[], area: Rect, workingArea?: Rect, driver?: IDriver): void;
    toString(): string;

    /* overriding */
    handleShortcut?(input: Shortcut, data?: any): boolean;
}

let CONFIG: IConfig;
