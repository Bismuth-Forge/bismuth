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
    private driver: KWinDriver;
    private layouts: LayoutStore;
    private screenCount: number;
    private tiles: Tile[];

    constructor(driver: KWinDriver) {
        this.driver = driver;
        this.layouts = new LayoutStore();
        this.screenCount = 1;
        this.tiles = Array();
    }

    public adjustLayout(basis: Tile) {
        const activity = String(workspace.currentActivity);
        const desktop = workspace.currentDesktop;
        const screen = basis.client.screen;
        const layout = this.layouts.getCurrentLayout(screen, activity, desktop);
        if (layout.adjust) {
            const area = this.driver.getWorkingArea(basis.client.screen);
            const tileables = this.tiles.filter((t) => t.isVisible(screen) && t.tileable);
            layout.adjust(area, tileables, basis);
        }
    }

    public arrange() {
        debugObj(() => ["arrange", {screenCount: this.screenCount}]);
        for (let screen = 0; screen < this.screenCount; screen++)
            this.arrangeScreen(screen);
    }

    public arrangeScreen(screen: number) {
        const activity = String(workspace.currentActivity);
        const desktop = workspace.currentDesktop;

        const workingArea = this.driver.getWorkingArea(screen);
        const area = new Rect(
            workingArea.x + Config.screenGapLeft,
            workingArea.y + Config.screenGapTop,
            workingArea.width - (Config.screenGapLeft + Config.screenGapRight),
            workingArea.height - (Config.screenGapTop + Config.screenGapBottom),
        );

        const visibles = this.getVisibleTiles(screen);
        const tileables = visibles.filter((tile) => (tile.tileable === true));
        const layout = this.layouts.getCurrentLayout(screen, activity, desktop);
        debugObj(() => ["arrangeScreen", {
            layout,
            screen,
            tileables: tileables.length,
            visibles: visibles.length,
        }]);

        visibles.forEach((tile) => {
            tile.keepBelow = tile.tileable;
            if (Config.noTileBorder)
                tile.hideBorder = tile.tileable;
            else
                tile.hideBorder = false;
        });

        if (Config.maximizeSoleTile && tileables.length === 1) {
            tileables[0].hideBorder = true;
            tileables[0].geometry = this.driver.getWorkingArea(screen);
        } else if (tileables.length > 0)
            layout.apply(tileables, area);

        visibles.forEach((tile) => tile.commit(true));
    }

    public enforceClientSize(tile: Tile) {
        if (!tile.tileable) return;

        if (tile.isGeometryChanged())
            this.driver.setTimeout(() => {
                if (!tile.tileable) return;
                tile.adjustGeometry();
                tile.commit();
            }, 10);
    }

    public manageClient(tile: Tile) {
        if (tile.special)
            return;

        const className = tile.class;
        const ignore = (Config.ignoreClass.indexOf(className) >= 0);
        if (ignore) return;

        tile.managed = true;

        const floating = (
            (Config.floatingClass.indexOf(className) >= 0)
            || (Config.floatUtility && tile.utility)
            || tile.modal
        );
        if (floating)
            tile.float = true;

        this.tiles.push(tile);
    }

    public unmanageClient(tile: Tile) {
        this.tiles = this.tiles.filter((t) =>
            t !== tile && !t.error);
    }

    public updateScreenCount(count: number) {
        this.screenCount = count;
    }

    public setTileFloat(tile: Tile): boolean {
        if (tile.float)
            return false;
        tile.toggleFloat();
        return true;
    }

    /*
     * User Input Handling
     */

    public handleUserInput(input: UserInput, data?: any) {
        debugObj(() => ["handleUserInput", {input: UserInput[input], data}]);

        const screen = this.getActiveScreen();
        const activity = String(workspace.currentActivity);
        const desktop = workspace.currentDesktop;

        const layout = this.layouts.getCurrentLayout(screen, activity, desktop);
        const overriden = layout.handleUserInput(input, data);
        if (overriden) {
            this.arrange();
            return;
        }

        let tile;
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
                if ((tile = this.getActiveTile()))
                    this.setMaster(tile);
                break;
            case UserInput.Float:
                if ((tile = this.getActiveTile()))
                    tile.toggleFloat();
                break;
            case UserInput.CycleLayout:
                this.nextLayout();
                break;
            case UserInput.SetLayout:
                this.setLayout(data);
                break;
        }
        this.arrange();
    }

    public moveFocus(step: number) {
        if (step === 0) return;

        const visibles = this.getVisibleTiles(this.getActiveScreen());
        if (visibles.length === 0)
            return;

        const tile = this.getActiveTile();
        const index = (tile) ? visibles.indexOf(tile) : 0;

        let newIndex = index + step;
        while (newIndex < 0)
            newIndex += visibles.length;
        newIndex = newIndex % visibles.length;

        this.driver.setActiveClient(visibles[newIndex].client);
    }

    public moveTile(step: number) {
        if (step === 0) return;

        const tile = this.getActiveTile();
        if (!tile) return;

        const screen = this.getActiveScreen();
        let tileIdx = this.tiles.indexOf(tile);
        const dir = (step > 0) ? 1 : -1;
        for (let i = tileIdx + dir; 0 <= i && i < this.tiles.length; i += dir) {
            if (this.tiles[i].isVisible(screen)) {
                this.tiles[tileIdx] = this.tiles[i];
                this.tiles[i] = tile;
                tileIdx = i;

                step -= dir;
                if (step === 0)
                    break;
            }
        }
    }

    public setMaster(tile: Tile) {
        if (this.tiles[0] === tile) return;

        const index = this.tiles.indexOf(tile);
        for (let i = index - 1; i >= 0; i--)
            this.tiles[i + 1] = this.tiles[i];
        this.tiles[0] = tile;
    }

    public nextLayout() {
        const screen = this.getActiveScreen();
        const activity = String(workspace.currentActivity);
        const desktop = workspace.currentDesktop;

        this.layouts.cycleLayout(screen, activity, desktop);
    }

    public setLayout(cls: any) {
        const screen = this.getActiveScreen();
        const activity = String(workspace.currentActivity);
        const desktop = workspace.currentDesktop;

        const lastLayout = this.layouts.getCurrentLayout(screen, activity, desktop);
        for (;;) {
            this.layouts.cycleLayout(screen, activity, desktop);

            const layout = this.layouts.getCurrentLayout(screen, activity, desktop);
            if (layout instanceof cls)
                break;
            if (layout === lastLayout)
                break;
        }
    }

    /*
     * Privates
     */

    private getActiveScreen(): number {
        const client = workspace.activeClient;
        if (!client)
            return 0;
        return client.screen;
    }

    private getActiveTile(): Tile | null {
        /* XXX: may return `null` if the active client is not being managed.
         * I'm just on a defensive manuever, and nothing has been broke actually. */
        return this.driver.getActiveTile();
    }

    private getVisibleTiles(screen: number): Tile[] {
        return this.tiles.filter((tile) => tile.isVisible(screen));
    }
}
