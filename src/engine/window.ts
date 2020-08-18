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

class Window {
    public static isTileableState(state: WindowState): boolean {
        return (
            (state === WindowState.Tiled)
            || (state === WindowState.Maximized)
            || (state === WindowState.TiledAfloat)
        );
    }

    public static isTiledState(state: WindowState): boolean {
        return (
            (state === WindowState.Tiled)
            || (state === WindowState.Maximized)
        );
    }

    public static isFloatingState(state: WindowState): boolean {
        return (
            (state === WindowState.Floating)
            || (state === WindowState.TiledAfloat)
        );
    }

    public readonly id: string;
    public readonly window: IDriverWindow;

    public get actualGeometry(): Readonly<Rect> { return this.window.geometry; }
    public get shouldFloat(): boolean { return this.window.shouldFloat; }
    public get shouldIgnore(): boolean { return this.window.shouldIgnore; }

    /** If this window ***can be*** tiled by layout. */
    public get tileable(): boolean { return Window.isTileableState(this.state); }
    /** If this window is ***already*** tiled, thus a part of the current layout. */
    public get tiled(): boolean { return Window.isTiledState(this.state); }
    /** If this window is floating, thus its geometry is not tightly managed. */
    public get floating(): boolean { return Window.isFloatingState(this.state); }

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
        if (this.window.fullScreen)
            return WindowState.NativeFullscreen;
        if (this.window.maximized)
            return WindowState.NativeMaximized;

        return this.internalState;
    }

    public set state(value: WindowState) {
        const state = this.state;

        /* cannot transit to the current state */
        if (state === value)
            return;

        if ((state === WindowState.Unmanaged || Window.isTileableState(state)) && Window.isFloatingState(value))
            this.shouldCommitFloat = true;
        else if (Window.isFloatingState(state) && Window.isTileableState(value))
            /* save the current geometry before leaving floating state */
            this.floatGeometry = this.actualGeometry;

        this.internalState = value;
    }

    public get surface(): ISurface {
        return this.window.surface;
    }

    public set surface(srf: ISurface) {
        this.window.surface = srf;
    }

    public get weight(): number {
        const srfID = this.window.surface.id;
        const weight: number | undefined = this.weightMap[srfID];
        if (weight === undefined) {
            this.weightMap[srfID] = 1.0;
            return 1.0;
        }
        return weight;
    }

    public set weight(value: number) {
        const srfID = this.window.surface.id;
        this.weightMap[srfID] = value;
    }

    private internalState: WindowState;
    private shouldCommitFloat: boolean;
    private weightMap: {[key: string]: number};

    constructor(window: IDriverWindow) {
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
        debugObj(() => ["Window#commit", {state: WindowState[state]}]);
        switch (state) {
            case WindowState.NativeMaximized:
                this.window.commit(undefined, undefined, undefined);
                break;

            case WindowState.NativeFullscreen:
                this.window.commit(undefined, undefined, undefined);
                break;

            case WindowState.Floating:
                if (!this.shouldCommitFloat) break;
                this.window.commit(this.floatGeometry, false, CONFIG.keepFloatAbove);
                this.shouldCommitFloat = false;
                break;

            case WindowState.Maximized:
                this.window.commit(this.geometry, true, false);
                break;

            case WindowState.Tiled:
                this.window.commit(this.geometry, CONFIG.noTileBorder, false);
                break;

            case WindowState.TiledAfloat:
                if (!this.shouldCommitFloat) break;
                this.window.commit(this.floatGeometry, false, CONFIG.keepFloatAbove);
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

    public visible(srf: ISurface): boolean {
        return this.window.visible(srf);
    }

    public toString(): string {
        return "Window(" + String(this.window) + ")";
    }
}
