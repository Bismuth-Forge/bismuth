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

    public get actualGeometry(): Rect { return Rect.from(this.window.geometry); }
    public get context(): IDriverContext { return this.window.context; }
    public get shouldFloat(): boolean { return this.window.shouldFloat(); }
    public get shouldIgnore(): boolean { return this.window.shouldIgnore(); }

    public get tileable(): boolean {
        return (
            (!this.window.fullScreen) &&
            (!this.float)
        );
    }

    /* read-write */
    public floatGeometry: Rect;
    public geometry: Rect;
    public noBorder: boolean;
    public keepBelow: boolean;
    public managed: boolean;

    public get float(): boolean { return this._float; }
    public set float(value: boolean) {
        if (this._float === value)
            return;

        this._float = value;
        if (this._float === true) {
            /* HACK: necessary to prevent geometry reset bug in KWin */
            this.window.commit(this.floatGeometry, false, false);
            this.keepBelow = false;
        } else
            this.floatGeometry = this.actualGeometry;
    }

    /* private */
    private _float: boolean;

    constructor(window: IDriverWindow) {
        this.id = window.id;

        this.floatGeometry = Rect.from(window.geometry);
        this.geometry = Rect.from(window.geometry);
        this.noBorder = false;
        this.keepBelow = false;
        this.managed = false;

        this.window = window;
        this._float = false;
    }

    /*
     * Methods
     */

    /* TODO: remove this method */
    public activate() {
        const window = this.window as KWinWindow;
        workspace.activeClient = window.client;
    }

    public commit() {
        const geometry = (this.tileable) ? this.geometry : null;
        this.window.commit(geometry, this.noBorder, this.keepBelow);
    }

    public visible(ctx: IDriverContext): boolean {
        return this.window.visible(ctx);
    }

    public toString(): string {
        return "Window(" + String(this.window) + ")";
    }
}
