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

enum WindowState {
    Tile,
    FullTile,
    FloatTile,
    Float,
    FullScreen,
    Unmanaged,
}

class Window {
    public static isTileableState(state: WindowState): boolean {
        return (
            (state === WindowState.Tile)
            || (state === WindowState.FullTile)
            || (state === WindowState.FloatTile)
        );
    }

    public static isFloatingState(state: WindowState): boolean {
        return (
            (state === WindowState.Float)
            || (state === WindowState.FloatTile)
        );
    }

    public readonly id: string;
    public readonly window: IDriverWindow;

    public get actualGeometry(): Rect { return this.window.geometry; }
    public get surface(): ISurface { return this.window.surface; }
    public get shouldFloat(): boolean { return this.window.shouldFloat; }
    public get shouldIgnore(): boolean { return this.window.shouldIgnore; }

    public get tileable(): boolean { return Window.isTileableState(this.state); }
    public get floating(): boolean { return Window.isFloatingState(this.state); }

    public get geometryDelta(): RectDelta {
        return RectDelta.fromRects(this.geometry, this.actualGeometry);
    }

    public floatGeometry: Rect;
    public geometry: Rect;

    public get state(): WindowState {
        if (this.window.fullScreen)
            return WindowState.FullScreen;
        return this._state;
    }

    /* TODO: maybe, try splitting this into multiple methods, like setTile, setFloat, setFreeTile */
    public set state(value: WindowState) {
        if (value === WindowState.FullScreen)
            return;

        const state = this.state;
        if (state === value)
            return;

        if (Window.isTileableState(state) && Window.isFloatingState(value))
            this.window.commit(this.floatGeometry, false, false);
        else if (Window.isFloatingState(state) && Window.isTileableState(value))
            this.floatGeometry = this.actualGeometry;

        this._state = value;
    }


    private _state: WindowState;

    constructor(window: IDriverWindow) {
        this.id = window.id;

        this.floatGeometry = window.geometry;
        this.geometry = window.geometry;

        this.window = window;
        this._state = WindowState.Unmanaged;
    }

    public commit() {
        if (this.state === WindowState.Tile)
            this.window.commit(this.geometry, CONFIG.noTileBorder, CONFIG.keepTileBelow);
        else if (this.state === WindowState.FullTile)
            this.window.commit(this.geometry, true, CONFIG.keepTileBelow);
        else if (this.state === WindowState.FullScreen)
            this.window.commit(undefined, undefined, false);
    }

    public visible(srf: ISurface): boolean {
        return this.window.visible(srf);
    }

    public toString(): string {
        return "Window(" + String(this.window) + ")";
    }
}
