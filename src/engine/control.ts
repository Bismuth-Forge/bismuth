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

/**
 * TilingController translates events to actions, implementing high-level
 * window management logic.
 */
class TilingController {
    private engine: TilingEngine;

    public constructor(engine: TilingEngine) {
        this.engine = engine;
    }

    public onScreenCountChanged(ctx: IDriverContext, count: number): void {
        debugObj(() => ["onScreenCountChanged", {count}]);
        this.engine.arrange(ctx);
    }

    public onScreenResized(ctx: IDriverContext, srf: ISurface): void {
        debugObj(() => ["onScreenResized", {srf}]);
        this.engine.arrangeScreen(ctx, srf);
    }

    public onCurrentContextChanged(ctx: IDriverContext): void {
        debugObj(() => ["onCurrentContextChanged", {srf: ctx.currentSurface}]);
        this.engine.arrange(ctx);
    }

    public onWindowAdded(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowAdded", {window}]);
        this.engine.manage(window);
        this.engine.arrange(ctx);
    }

    public onWindowRemoved(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowRemoved", {window}]);
        this.engine.unmanage(window);
        this.engine.arrange(ctx);
    }

    public onWindowMoveStart(window: Window): void {
        /* do nothing */
    }

    public onWindowMove(window: Window): void {
        /* do nothing */
    }

    public onWindowMoveOver(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowMoveOver", {window}]);
        if (window.state === WindowState.Tile) {
            // TODO: refactor this block;
            const diff = window.actualGeometry.subtract(window.geometry);
            const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
            // TODO: arbitrary constant
            if (distance > 30) {
                window.floatGeometry = window.actualGeometry;
                window.state = WindowState.Float;
                this.engine.arrange(ctx);
            } else
                window.commit();
        }
    }

    public onWindowResizeStart(window: Window): void {
        /* do nothing */
    }

    public onWindowResize(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowResizeOver", {window}]);
        if (CONFIG.adjustLayout && CONFIG.adjustLayoutLive) {
            if (window.state === WindowState.Tile) {
                this.engine.adjustLayout(window);
                this.engine.arrange(ctx);
            }
        }
    }

    public onWindowResizeOver(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowResizeOver", {window}]);
        if (CONFIG.adjustLayout && window.state === WindowState.Tile) {
            this.engine.adjustLayout(window);
            this.engine.arrange(ctx);
        } else if (!CONFIG.adjustLayout)
            this.engine.enforceSize(ctx, window);
    }

    public onWindowGeometryChanged(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowGeometryChanged", {window}]);
        this.engine.enforceSize(ctx, window);
    }

    // NOTE: accepts `null` to simplify caller. This event is a catch-all hack
    // by itself anyway.
    public onWindowChanged(ctx: IDriverContext, window: Window | null, comment?: string): void {
        if (window) {
            debugObj(() => ["onWindowChanged", {window, comment}]);

            if (comment === "unminimized")
                window.focus();

            this.engine.arrange(ctx);
        }
    }

    public onShortcut(ctx: IDriverContext, input: Shortcut, data?: any) {
        if (this.engine.handleLayoutShortcut(ctx, input, data)) {
            this.engine.arrange(ctx);
            return;
        }

        const window = ctx.currentWindow;
        switch (input) {
            case Shortcut.Up  : if (window) this.engine.moveFocus(ctx, window, -1); break;
            case Shortcut.Down: if (window) this.engine.moveFocus(ctx, window, +1); break;

            case Shortcut.GrowWidth   : if (window) this.engine.adjustWindowSize(window, "east" ,  1); break;
            case Shortcut.ShrinkWidth : if (window) this.engine.adjustWindowSize(window, "east" , -1); break;
            case Shortcut.GrowHeight  : if (window) this.engine.adjustWindowSize(window, "south",  1); break;
            case Shortcut.ShrinkHeight: if (window) this.engine.adjustWindowSize(window, "south", -1); break;

            case Shortcut.ShiftUp  : if (window) this.engine.moveTile(window, -1); break;
            case Shortcut.ShiftDown: if (window) this.engine.moveTile(window, +1); break;

            case Shortcut.SetMaster  : if (window) this.engine.setMaster(window); break;
            case Shortcut.ToggleFloat: if (window) this.engine.toggleFloat(window); break;
            case Shortcut.ToggleFloatAll: this.engine.floatAll(ctx.currentSurface); break;

            case Shortcut.CycleLayout: this.engine.cycleLayout(ctx);
            case Shortcut.SetLayout: this.engine.setLayout(ctx, data); break;
        }

        this.engine.arrange(ctx);
    }
}

try {
    exports.TilingController = TilingController;
} catch (e) { /* ignore */ }
