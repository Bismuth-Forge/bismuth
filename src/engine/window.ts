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

class WindowResizeDelta {
    public readonly diff: Rect;
    public readonly east: number;
    public readonly west: number;
    public readonly south: number;
    public readonly north: number;

    public constructor(window: Window) {
        this.diff = window.actualGeometry.subtract(window.geometry);
        this.east = this.diff.width + this.diff.x;
        this.west = -this.diff.x;
        this.south = this.diff.height + this.diff.y;
        this.north = -this.diff.y;
    }

    public toString(): string {
        return "WindowResizeDelta(" + [
            "diff=" + this.diff,
            "east=" + this.east,
            "west=" + this.west,
            "north=" + this.north,
            "south=" + this.south,
        ].join(" ") + ")";
    }
}

class Window {
    /* read-only */
    public readonly id: string;
    public readonly window: IDriverWindow;

    public get actualGeometry(): Rect { return this.window.geometry; }
    public get context(): IDriverContext { return this.window.context; }
    public get shouldFloat(): boolean { return this.window.shouldFloat(); }
    public get shouldIgnore(): boolean { return this.window.shouldIgnore(); }

    /* read-write */
    public floatGeometry: Rect;
    public geometry: Rect;
    public noBorder: boolean;

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
        if (state === WindowState.FullScreen) {
            return;
        } else if (state === WindowState.Tile && value === WindowState.Float) {
            this.window.commit(this.floatGeometry, false, false);
        } else if (state === WindowState.Tile && value === WindowState.FreeTile) {
            this.window.commit(this.floatGeometry, false, false);
        } else if (state === WindowState.Float && value === WindowState.Tile) {
            this.floatGeometry = this.actualGeometry;
        } else if (state === WindowState.Float && value === WindowState.FreeTile) {
            /* do nothing */
        } else if (state === WindowState.FreeTile && value === WindowState.Tile) {
            this.floatGeometry = this.actualGeometry;
        } else if (state === WindowState.FreeTile && value === WindowState.Float) {
            return;
        }

        this._state = value;
    }

    /* private */
    private _state: WindowState;

    constructor(window: IDriverWindow) {
        this.id = window.id;

        this.floatGeometry = window.geometry;
        this.geometry = window.geometry;
        this.noBorder = false;

        this.window = window;
        this._state = WindowState.Unmanaged;
    }

    /*
     * Methods
     */

    public commit() {
        if (this.state === WindowState.Tile)
            this.window.commit(this.geometry, this.noBorder, true);
        else if (this.state === WindowState.FullScreen)
            this.window.commit(undefined, undefined, false);
    }

    public visible(ctx: IDriverContext): boolean {
        return this.window.visible(ctx);
    }

    public toString(): string {
        return "Window(" + String(this.window) + ")";
    }
}
