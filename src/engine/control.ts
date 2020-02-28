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
 *
 * In short, this class is just a bunch of event handling methods.
 */
class TilingController {
    private engine: TilingEngine;

    public constructor(engine: TilingEngine) {
        this.engine = engine;
    }

    public onSurfaceUpdate(ctx: IDriverContext, comment: string): void {
        debugObj(() => ["onSurfaceUpdate", {comment}]);
        this.engine.arrange(ctx);
    }

    public onCurrentSurfaceChanged(ctx: IDriverContext): void {
        debugObj(() => ["onCurrentSurfaceChanged", {srf: ctx.currentSurface}]);
        this.engine.arrange(ctx);
    }

    public onWindowAdded(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowAdded", {window}]);
        this.engine.manage(window);

        /* move window to next surface if the current surface is "full" */
        if (window.tileable) {
            const srf = ctx.currentSurface;
            const tiles = this.engine.windows.getVisibleTiles(srf);
            const layoutCapcity = this.engine.layouts.getCurrentLayout(srf).capacity;
            if (layoutCapcity !== undefined && tiles.length > layoutCapcity) {
                const nsrf = ctx.currentSurface.next();
                if (nsrf) {
                    // (window.window as KWinWindow).client.desktop = (nsrf as KWinSurface).desktop;
                    window.surface = nsrf;
                    ctx.currentSurface = nsrf;
                }
            }
        }

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

        /* swap window by dragging */
        if (window.state === WindowState.Tile) {
            const tiles = this.engine.windows.getVisibleTiles(ctx.currentSurface);
            const cursorPos = ctx.cursorPosition || window.actualGeometry.center;

            const targets = tiles.filter((tile) =>
                tile !== window && tile.actualGeometry.includesPoint(cursorPos));

            if (targets.length === 1) {
                this.engine.windows.swap(window, targets[0]);
                this.engine.arrange(ctx);
                return;
            }
        }

        /* ... or float window by dragging */
        if (window.state === WindowState.Tile) {
            const diff = window.actualGeometry.subtract(window.geometry);
            const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
            // TODO: arbitrary constant
            if (distance > 30) {
                window.floatGeometry = window.actualGeometry;
                window.state = WindowState.Float;
                this.engine.arrange(ctx);
                return;
            }
        }

        /* ... or return to the previous position */
        window.commit();
    }

    public onWindowResizeStart(window: Window): void {
        /* do nothing */
    }

    public onWindowResize(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowResize", {window}]);
        if (CONFIG.adjustLayout && CONFIG.adjustLayoutLive) {
            if (window.state === WindowState.Tile) {
                this.engine.adjustLayout(window);
                this.engine.arrange(ctx);
            }
        }
    }

    public onWindowResizeOver(ctx: IDriverContext, window: Window): void {
        debugObj(() => ["onWindowResizeOver", {window}]);
        if (CONFIG.adjustLayout && window.tiled) {
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
                ctx.currentWindow = window;

            this.engine.arrange(ctx);
        }
    }

    public onWindowFocused(ctx: IDriverContext, window: Window) {
        window.timestamp = new Date().getTime();
    }

    public onShortcut(ctx: IDriverContext, input: Shortcut, data?: any) {
        if (CONFIG.directionalKeyMode === "focus") {
            switch (input) {
                case Shortcut.Up   : input = Shortcut.FocusUp; break;
                case Shortcut.Down : input = Shortcut.FocusDown; break;
                case Shortcut.Left : input = Shortcut.FocusLeft; break;
                case Shortcut.Right: input = Shortcut.FocusRight; break;

                case Shortcut.ShiftUp   : input = Shortcut.SwapUp; break;
                case Shortcut.ShiftDown : input = Shortcut.SwapDown; break;
                case Shortcut.ShiftLeft : input = Shortcut.SwapLeft; break;
                case Shortcut.ShiftRight: input = Shortcut.SwapRight; break;
            }
        }

        if (this.engine.handleLayoutShortcut(ctx, input, data)) {
            this.engine.arrange(ctx);
            return;
        }

        const window = ctx.currentWindow;
        switch (input) {
            case Shortcut.Up  : this.engine.cycleFocus(ctx, -1); break;
            case Shortcut.Down: this.engine.cycleFocus(ctx, +1); break;

            case Shortcut.FocusUp   : this.engine.moveFocus(ctx, "up"   ); break;
            case Shortcut.FocusDown : this.engine.moveFocus(ctx, "down" ); break;
            case Shortcut.FocusLeft : this.engine.moveFocus(ctx, "left" ); break;
            case Shortcut.FocusRight: this.engine.moveFocus(ctx, "right"); break;

            case Shortcut.GrowWidth   : if (window) this.engine.adjustWindowSize(window, "east" ,  1); break;
            case Shortcut.ShrinkWidth : if (window) this.engine.adjustWindowSize(window, "east" , -1); break;
            case Shortcut.GrowHeight  : if (window) this.engine.adjustWindowSize(window, "south",  1); break;
            case Shortcut.ShrinkHeight: if (window) this.engine.adjustWindowSize(window, "south", -1); break;

            case Shortcut.ShiftUp  : if (window) this.engine.moveTile(window, -1); break;
            case Shortcut.ShiftDown: if (window) this.engine.moveTile(window, +1); break;

            case Shortcut.SwapUp   : this.engine.moveTileDirection(ctx, "up"); break;
            case Shortcut.SwapDown : this.engine.moveTileDirection(ctx, "down"); break;
            case Shortcut.SwapLeft : this.engine.moveTileDirection(ctx, "left"); break;
            case Shortcut.SwapRight: this.engine.moveTileDirection(ctx, "right"); break;

            case Shortcut.SetMaster  : if (window) this.engine.setMaster(window); break;
            case Shortcut.ToggleFloat: if (window) this.engine.toggleFloat(window); break;
            case Shortcut.ToggleFloatAll: this.engine.floatAll(ctx, ctx.currentSurface); break;

            case Shortcut.NextLayout: this.engine.cycleLayout(ctx, 1); break;
            case Shortcut.PreviousLayout: this.engine.cycleLayout(ctx, -1); break;
            case Shortcut.SetLayout: if (typeof data === "string") this.engine.setLayout(ctx, data); break;
        }

        this.engine.arrange(ctx);
    }
}
