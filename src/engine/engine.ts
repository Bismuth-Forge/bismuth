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

    public adjustLayout(basis: Window) {
        const srf = basis.surface;
        const layout = this.layouts.getCurrentLayout(srf);
        if (layout.adjust) {
            const fullArea = srf.workingArea;
            const area = new Rect(
                fullArea.x + CONFIG.screenGapLeft,
                fullArea.y + CONFIG.screenGapTop,
                fullArea.width - (CONFIG.screenGapLeft + CONFIG.screenGapRight),
                fullArea.height - (CONFIG.screenGapTop + CONFIG.screenGapBottom),
            );
            const tiles = this.windows.visibleTiles(srf);
            layout.adjust(area, tiles, basis);
        }
    }

    public arrange(ctx: IDriverContext) {
        debug(() => "arrange");
        ctx.screens.forEach((srf: ISurface) => {
            this.arrangeScreen(ctx, srf);
        });
    }

    public arrangeScreen(ctx: IDriverContext, srf: ISurface) {
        const layout = this.layouts.getCurrentLayout(srf);

        const workingArea = srf.workingArea;

        let tilingArea;
        if (CONFIG.monocleMaximize && layout instanceof MonocleLayout)
            tilingArea = workingArea;
        else
            tilingArea = workingArea.gap(CONFIG.screenGapLeft, CONFIG.screenGapRight,
                CONFIG.screenGapTop, CONFIG.screenGapBottom);

        const visibles = this.windows.visibles(srf);
        debugObj(() => ["arrangeScreen", {
            layout, srf,
            visibles: visibles.length,
        }]);

        /* reset all properties of windows */
        visibles.forEach((window) => {
            if (window.state === WindowState.FreeTile)
                window.state = WindowState.Tile;

            if (window.state === WindowState.Tile)
                window.noBorder = CONFIG.noTileBorder;
        });

        const tiles = this.windows.visibleTiles(srf);
        if (CONFIG.maximizeSoleTile && tiles.length === 1) {
            tiles[0].noBorder = true;
            tiles[0].geometry = workingArea;
        } else if (tiles.length > 0)
            layout.apply(new EngineContext(ctx, this), tiles, tilingArea);

        visibles.forEach((window) => window.commit());
        debugObj(() => ["arrangeScreen/finished", { srf }]);
    }

    public enforceSize(ctx: IDriverContext, window: Window) {
        if (window.state === WindowState.Tile && !window.actualGeometry.equals(window.geometry))
            ctx.setTimeout(() => {
                if (window.state === WindowState.Tile)
                    window.commit();
            }, 10);
    }

    public manage(window: Window) {
        if (!window.shouldIgnore) {
            window.state = (window.shouldFloat) ? WindowState.Float : WindowState.Tile;
            this.windows.push(window);
        }
    }

    public unmanage(window: Window) {
        this.windows.remove(window);
    }

    public moveFocus(ctx: IDriverContext, window: Window, step: number) {
        if (step === 0)
            return;

        const srf = (window) ? window.surface : ctx.currentSurface;

        const visibles = this.windows.visibles(srf);
        if (visibles.length === 0) /* nothing to focus */
            return;

        const idx = (window) ? visibles.indexOf(window) : -1;
        if (!window || idx < 0) { /* unmanaged window -> focus master */
            visibles[0].focus();
            return;
        }

        const num = visibles.length;
        const newIndex = (idx + (step % num) + num) % num;

        debugObj(() => ["moveFocus", {from: window, to: visibles[newIndex]}]);
        visibles[newIndex].focus();
    }

    public moveTile(window: Window, step: number) {
        if (step === 0)
            return;

        const srf = window.surface;
        const visibles = this.windows.visibles(srf);
        if (visibles.length < 2)
            return;

        const vsrc = visibles.indexOf(window);
        const vdst = wrapIndex(vsrc + step, visibles.length);
        const dstWin = visibles[vdst];

        this.windows.move(window, dstWin);
    }

    public toggleFloat(window: Window) {
        window.state = (window.state === WindowState.Float)
            ? WindowState.Tile
            : WindowState.Float;
    }

    public floatAll(srf: ISurface) {
        const tiles = this.windows.visibles(srf);
        const numFloats = tiles.reduce<number>((count, window) => {
            return (window.state === WindowState.Float) ? count + 1 : count;
        }, 0);

        if (numFloats < tiles.length / 2)
            tiles.forEach((window) => {
                /* TODO: do not use arbitrary constants */
                window.floatGeometry = window.actualGeometry.gap(4, 4, 4, 4);
                window.state = WindowState.Float;
            });
        else
            tiles.forEach((window) => {
                window.state = WindowState.Tile;
            });
    }

    public setMaster(window: Window) {
        this.windows.setMaster(window);
    }

    public cycleLayout(ctx: IDriverContext) {
        this.layouts.cycleLayout(ctx.currentSurface);
    }

    public setLayout(ctx: IDriverContext, layout: any) {
        if (layout)
            this.layouts.setLayout(ctx.currentSurface, layout);
    }

    public handleLayoutShortcut(ctx: IDriverContext, input: Shortcut, data?: any): boolean {
        const layout = this.layouts.getCurrentLayout(ctx.currentSurface);
        if (layout.handleShortcut)
            return layout.handleShortcut(new EngineContext(ctx, this), input, data);
        return false;
    }
}

try {
    exports.TilingEngine = TilingEngine;
} catch (e) { /* ignore */ }
