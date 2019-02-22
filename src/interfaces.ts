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

enum UserInput {
    Left,
    Right,
    Up,
    Down,

    ShiftLeft,
    ShiftRight,
    ShiftUp,
    ShiftDown,

    Increase,
    Decrease,

    Float,
    SetMaster,
    CycleLayout,
    SetLayout,
}

//#region Driver

interface IConfig {
}

interface IDriverWindow {
    readonly context: IDriverContext;
    readonly fullScreen: boolean;
    readonly geometry: Rect;
    readonly id: string;

    commit(geometry: Rect | null, noBorder: boolean, keepBelow: boolean): void;
    shouldIgnore(): boolean;
    shouldFloat(): boolean;
    visible(ctx: IDriverContext): boolean;
}

interface IDriverContext {
    readonly id: string;
    readonly ignore: boolean;
}

interface IDriver {
    forEachScreen(func: (ctx: IDriverContext) => void): void;
    getCurrentContext(): IDriverContext;
    getCurrentWindow(): Window | null;
    getWorkingArea(dctx: IDriverContext): Rect ;
    setCurrentWindow(window: Window): void;
}

//#endregion

interface ILayout {
    /* read-only */
    readonly enabled: boolean;

    /* methods */
    adjust?(area: Rect, tiles: Window[], basis: Window): void;
    apply(tiles: Window[], area: Rect, workingArea?: Rect): void;
    toString(): string;

    /* overriding */
    handleUserInput?(input: UserInput, data?: any): boolean;
}
