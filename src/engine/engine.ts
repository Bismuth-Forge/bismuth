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
 * Maintains tiling context and performs various tiling actions.
 */
class TilingEngine {
    public layouts: LayoutStore;
    public windows: WindowStore;

    constructor() {
        this.layouts = new LayoutStore();
        this.windows = new WindowStore();
    }

    /**
     * Adjust layout based on the change in size of a tile.
     *
     * This operation is completely layout-dependent, and no general implementation is
     * provided.
     *
     * Used when tile is resized using mouse.
     */
    public adjustLayout(basis: Window) {
        const srf = basis.surface;
        const layout = this.layouts.getCurrentLayout(srf);
        if (layout.adjust) {
            const area = srf.workingArea.gap(CONFIG.screenGapLeft, CONFIG.screenGapRight,
                CONFIG.screenGapTop, CONFIG.screenGapBottom);
            const tiles = this.windows.getVisibleTiles(srf);
            layout.adjust(area, tiles, basis, basis.geometryDelta);
        }
    }

    /**
     * Resize tile by adjusting layout.
     *
     * Used by grow/shrink shortcuts.
     */
    public adjustWindowSize(basis: Window, dir: "east" | "west" | "south" | "north", step: -1 | 1) {
        const srf = basis.surface;

        // TODO: configurable step size?
        const hStepSize = srf.workingArea.width  * 0.03;
        const vStepSize = srf.workingArea.height * 0.03;
        let delta: RectDelta;
        switch (dir) {
            case "east" : delta = new RectDelta(hStepSize * step, 0, 0, 0); break;
            case "west" : delta = new RectDelta(0, hStepSize * step, 0, 0); break;
            case "south": delta = new RectDelta(0, 0, vStepSize * step, 0); break;
            case "north": delta = new RectDelta(0, 0, 0, vStepSize * step); break;
        }

        const layout = this.layouts.getCurrentLayout(srf);
        if (layout.adjust) {
            const area = srf.workingArea.gap(CONFIG.screenGapLeft, CONFIG.screenGapRight,
                CONFIG.screenGapTop, CONFIG.screenGapBottom);
            layout.adjust(area, this.windows.getVisibleTileables(srf), basis, delta);
        }
    }

    /**
     * Arrange tiles on all screens.
     */
    public arrange(ctx: IDriverContext) {
        debug(() => "arrange");
        ctx.screens.forEach((srf: ISurface) => {
            this.arrangeScreen(ctx, srf);
        });
    }

    /**
     * Arrange tiles on a screen.
     */
    public arrangeScreen(ctx: IDriverContext, srf: ISurface) {
        const layout = this.layouts.getCurrentLayout(srf);

        const workingArea = srf.workingArea;

        let tilingArea;
        if (CONFIG.monocleMaximize && layout instanceof MonocleLayout)
            tilingArea = workingArea;
        else
            tilingArea = workingArea.gap(CONFIG.screenGapLeft, CONFIG.screenGapRight,
                CONFIG.screenGapTop, CONFIG.screenGapBottom);

        const visibles = this.windows.getVisibleWindows(srf);
        debugObj(() => ["arrangeScreen", {
            layout, srf,
            visibles: visibles.length,
        }]);

        const tileables = this.windows.getVisibleTileables(srf);
        if (CONFIG.maximizeSoleTile && tileables.length === 1) {
            tileables[0].state = WindowState.FullTile;
            tileables[0].geometry = workingArea;
        } else if (tileables.length > 0)
            layout.apply(new EngineContext(ctx, this), tileables, tilingArea);

        visibles.forEach((window) => window.commit());
        debugObj(() => ["arrangeScreen/finished", { srf }]);
    }

    /**
     * Re-apply window geometry, computed by layout algorithm.
     *
     * Sometimes applications move or resize windows without user intervention,
     * which is straigh against the purpose of tiling WM. This operation
     * move/resize such windows back to where/how they should be.
     */
    public enforceSize(ctx: IDriverContext, window: Window) {
        if (window.tiled && !window.actualGeometry.equals(window.geometry))
            ctx.setTimeout(() => {
                if (window.tiled)
                    window.commit();
            }, 10);
    }

    /**
     * Register the given window to WM.
     */
    public manage(window: Window) {
        if (!window.shouldIgnore) {
            window.state = (window.shouldFloat) ? WindowState.Float : WindowState.Tile;
            this.windows.push(window);
        }
    }

    /**
     * Unregister the given window from WM.
     */
    public unmanage(window: Window) {
        this.windows.remove(window);
    }

    /**
     * Move focus to next/previous window.
     */
    public moveFocus(ctx: IDriverContext, window: Window, step: -1 | 1) {
        const srf = (window) ? window.surface : ctx.currentSurface;

        const visibles = this.windows.getVisibleWindows(srf);
        if (visibles.length === 0) /* nothing to focus */
            return;

        const idx = (window) ? visibles.indexOf(window) : -1;
        if (!window || idx < 0) { /* unmanaged window -> focus master */
            ctx.currentWindow = visibles[0];
            return;
        }

        const num = visibles.length;
        const newIndex = (idx + (step % num) + num) % num;

        ctx.currentWindow = visibles[newIndex];
    }

    public focusDirection(ctx: IDriverContext, window: Window, dir: "up" | "down" | "left" | "right") {
        const vertical = (dir === "up" || dir === "down");
        const step = (dir === "up" || dir === "left") ? -1 : 1;

        const candidates = this.windows.getVisibleTiles(ctx.currentSurface)
            .filter((vertical)
                ? ((tile) => tile.geometry.y * step > window.geometry.y * step)
                : ((tile) => tile.geometry.x * step > window.geometry.x * step))
            .filter((vertical)
                ? ((tile) => overlap(window.geometry.x, window.geometry.maxX, tile.geometry.x, tile.geometry.maxX))
                : ((tile) => overlap(window.geometry.y, window.geometry.maxY, tile.geometry.y, tile.geometry.maxY)));

        if (candidates.length > 0) {
            let min = candidates.reduce(
                (vertical)
                    ? ((prevMin, tile): number => Math.min(tile.geometry.y * step, prevMin))
                    : ((prevMin, tile): number => Math.min(tile.geometry.x * step, prevMin)),
                Infinity);
            min *= step;

            const closest = candidates.filter( (vertical)
                ? (tile) => tile.geometry.y === min
                : (tile) => tile.geometry.x === min);
            if (closest.length === 1) {
                ctx.currentWindow = closest[0];
            } else {
                // TODO: focus the most recent among the candidates
                ctx.currentWindow = closest[0];
            }
        } else {
            // TODO: focus wrapping
        }
    }

    /**
     * Reorder windows by moving the current window next to next/previous window.
     */
    public moveTile(window: Window, step: -1 | 1) {
        const srf = window.surface;
        const visibles = this.windows.getVisibleWindows(srf);
        if (visibles.length < 2)
            return;

        const vsrc = visibles.indexOf(window);
        const vdst = wrapIndex(vsrc + step, visibles.length);
        const dstWin = visibles[vdst];

        this.windows.move(window, dstWin);
    }

    /**
     * Toggle float mode of window.
     */
    public toggleFloat(window: Window) {
        window.state = (!window.tileable)
            ? WindowState.Tile
            : WindowState.Float;
    }

    /**
     * Toggle float on all windows on the given surface.
     *
     * The behaviours of this operation depends on the number of floating
     * windows: windows will be tiled if more than half are floating, and will
     * be floated otherwise.
     */
    public floatAll(srf: ISurface) {
        const windows = this.windows.getVisibleWindows(srf);
        const numFloats = windows.reduce<number>((count, window) => {
            return (window.state === WindowState.Float) ? count + 1 : count;
        }, 0);

        if (numFloats < windows.length / 2)
            windows.forEach((window) => {
                /* TODO: do not use arbitrary constants */
                window.floatGeometry = window.actualGeometry.gap(4, 4, 4, 4);
                window.state = WindowState.Float;
            });
        else
            windows.forEach((window) => {
                window.state = WindowState.Tile;
            });
    }

    /**
     * Set the current window as the "master".
     *
     * The "master" window is simply the first window in the window list.
     * Some layouts depend on this assumption, and will make such windows more
     * visible than others.
     */
    public setMaster(window: Window) {
        this.windows.setMaster(window);
    }

    /**
     * Change the layout of the current surface to the next.
     */
    public cycleLayout(ctx: IDriverContext) {
        this.layouts.cycleLayout(ctx.currentSurface);
    }

    /**
     * Set the layout of the current surface to the specified layout.
     */
    public setLayout(ctx: IDriverContext, layout: any) {
        if (layout)
            this.layouts.setLayout(ctx.currentSurface, layout);
    }

    /**
     * Let the current layout override shortcut.
     *
     * @returns True if the layout overrides the shortcut. False, otherwise.
     */
    public handleLayoutShortcut(ctx: IDriverContext, input: Shortcut, data?: any): boolean {
        const layout = this.layouts.getCurrentLayout(ctx.currentSurface);
        if (layout.handleShortcut)
            return layout.handleShortcut(new EngineContext(ctx, this), input, data);
        return false;
    }
}
