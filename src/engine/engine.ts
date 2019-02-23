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
    private driver: IDriver;
    private layouts: LayoutStore;
    private screenCount: number;
    private windows: Window[];

    constructor(driver: IDriver) {
        this.driver = driver;
        this.layouts = new LayoutStore();
        this.screenCount = 1;
        this.windows = Array();
    }

    public adjustLayout(basis: Window) {
        const ctx = basis.context as KWinContext;
        const layout = this.layouts.getCurrentLayout(ctx);
        if (layout && layout.adjust) {
            const area = this.driver.getWorkingArea(ctx);
            const tiles = this.windows.filter((win) =>
                (win.state === WindowState.Tile) && win.visible(ctx));
            layout.adjust(area, tiles, basis);
        }
    }

    public arrange() {
        debugObj(() => ["arrange", {screenCount: this.screenCount}]);
        this.driver.forEachScreen((ctx: IDriverContext) => {
            this.arrangeScreen(ctx);
        });
    }

    public arrangeScreen(ctx: IDriverContext) {
        const layout = this.layouts.getCurrentLayout(ctx);
        if (!layout) {
            debug(() => "ignoring screen: " + ctx);
            return;
        }

        const workingArea = this.driver.getWorkingArea(ctx);
        const area = new Rect(
            workingArea.x + CONFIG.screenGapLeft,
            workingArea.y + CONFIG.screenGapTop,
            workingArea.width - (CONFIG.screenGapLeft + CONFIG.screenGapRight),
            workingArea.height - (CONFIG.screenGapTop + CONFIG.screenGapBottom),
        );

        const visibles = this.windows.filter((win) => win.visible(ctx));
        const tiles = visibles.filter((win) =>
            (win.state === WindowState.Tile) || (win.state === WindowState.FreeTile));
        debugObj(() => ["arrangeScreen", {
            ctx, layout,
            tiles: tiles.length,
            visibles: visibles.length,
        }]);

        /* reset all properties of windows */
        visibles.forEach((window) => {
            if (window.state === WindowState.FreeTile)
                window.state = WindowState.Tile;

            if (window.state === WindowState.Tile)
                window.noBorder = CONFIG.noTileBorder;
        });

        if (CONFIG.maximizeSoleTile && tiles.length === 1) {
            tiles[0].noBorder = true;
            tiles[0].geometry = this.driver.getWorkingArea(ctx);
        } else if (tiles.length > 0)
            layout.apply(tiles, area, workingArea);

        visibles.forEach((window) => window.commit());
    }

    public enforceClientSize(window: Window) {
        if (window.state !== WindowState.Tile) return;

        if (!window.actualGeometry.equals(window.geometry))
            KWinSetTimeout(() => {
                if (window.state !== WindowState.Tile)
                    window.commit();
            }, 10);
    }

    public manageClient(window: Window) {
        if (window.shouldIgnore)
            return;

        window.state = (window.shouldFloat) ? WindowState.Float : WindowState.Tile;

        this.windows.push(window);
    }

    public unmanageClient(window: Window) {
        const idx = this.windows.indexOf(window);
        if (idx >= 0)
            this.windows.splice(idx, 1);
    }

    public updateScreenCount(count: number) {
        this.screenCount = count;
    }

    /*
     * User Input Handling
     */

    public handleUserInput(input: UserInput, data?: any) {
        debugObj(() => ["handleUserInput", {input: UserInput[input], data}]);

        const ctx = this.driver.getCurrentContext();

        const layout = this.layouts.getCurrentLayout(ctx);
        if (layout && layout.handleUserInput) {
            const overriden = layout.handleUserInput(input, data);
            if (overriden) {
                this.arrange();
                return;
            }
        }

        let window;
        switch (input) {
            case UserInput.Up:
                this.moveFocus(-1);
                break;
            case UserInput.Down:
                this.moveFocus(+1);
                break;
            case UserInput.ShiftUp:
                this.moveTile(-1);
                break;
            case UserInput.ShiftDown:
                this.moveTile(+1);
                break;
            case UserInput.SetMaster:
                if ((window = this.getActiveWindow()))
                    this.setMaster(window);
                break;
            case UserInput.Float:
                if ((window = this.getActiveWindow()))
                    window.state = (window.state === WindowState.Float) ? WindowState.Tile : WindowState.Float;
                break;
            case UserInput.CycleLayout:
                this.nextLayout();
                break;
            case UserInput.SetLayout:
                this.layouts.setLayout(this.driver.getCurrentContext(), data);
                break;
        }
        this.arrange();
    }

    public moveFocus(step: number) {
        if (step === 0) return;

        const ctx = this.driver.getCurrentContext();
        const visibles = this.windows.filter((win) => win.visible(ctx));
        if (visibles.length === 0)
            return;

        const window = this.getActiveWindow();
        const index = (window) ? visibles.indexOf(window) : 0;

        let newIndex = index + step;
        while (newIndex < 0)
            newIndex += visibles.length;
        newIndex = newIndex % visibles.length;

        this.driver.setCurrentWindow(visibles[newIndex]);
    }

    public moveTile(step: number) {
        if (step === 0) return;

        const window = this.getActiveWindow();
        if (!window) return;

        const ctx = window.context;
        let tileIdx = this.windows.indexOf(window);
        const dir = (step > 0) ? 1 : -1;
        for (let i = tileIdx + dir; 0 <= i && i < this.windows.length; i += dir) {
            if (this.windows[i].visible(ctx)) {
                this.windows[tileIdx] = this.windows[i];
                this.windows[i] = window;
                tileIdx = i;

                step -= dir;
                if (step === 0)
                    break;
            }
        }
    }

    public setMaster(window: Window) {
        if (this.windows[0] === window) return;

        const index = this.windows.indexOf(window);
        for (let i = index - 1; i >= 0; i--)
            this.windows[i + 1] = this.windows[i];
        this.windows[0] = window;
    }

    public nextLayout() {
        this.layouts.cycleLayout(this.driver.getCurrentContext());
    }

    /*
     * Privates
     */

    private getActiveWindow(): Window | null {
        /* XXX: may return `null` if the active client is not being managed.
         * I'm just on a defensive manuever, and nothing has been broke actually. */
        return this.driver.getCurrentWindow();
    }
}
