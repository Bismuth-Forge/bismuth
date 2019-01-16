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

class TilingEngine {
    public jiggle: boolean;

    private arranging: boolean;
    private driver: KWinDriver;
    private layouts: LayoutStorage;
    private numScreen: number;
    private tiles: Tile[];

    constructor(driver: KWinDriver) {
        this.jiggle = Config.jiggleTiles;

        this.arranging = false;
        this.driver = driver;
        this.layouts = new LayoutStorage();
        this.numScreen = 1;
        this.tiles = Array();
    }

    public arrange = () => {
        if (this.arranging) {
            debug(() => "arrange: ignored");
            return;
        }

        this.arranging = true;
        debug(() => "arrange: tiles=" + this.tiles.length);

        const activity = String(workspace.currentActivity);
        const desktop = workspace.currentDesktop;

        for (let screen = 0; screen < this.numScreen; screen++) {
            const area = this.driver.getWorkingArea(screen);
            area.x += Config.screenGapLeft;
            area.y += Config.screenGapTop;
            area.width -= Config.screenGapLeft + Config.screenGapRight;
            area.height -= Config.screenGapTop + Config.screenGapBottom;

            const visibles = this.getVisibleTiles(screen);
            const tileables = visibles.filter((tile) => (tile.isTileable === true));
            const layout = this.layouts.getCurrentLayout(screen, activity, desktop);
            debugObj(() => ["arrangeScreen", {
                layout,
                screen,
                tileables: tileables.length,
                visibles: visibles.length,
            }]);

            if (tileables.length > 0) {
                layout.apply(tileables, area);
                if (this.jiggle)
                    tileables.forEach((tile) => tile.jiggle());
                tileables.forEach((tile) => tile.commitGeometry(true));
            }

            visibles.forEach((tile) => {
                tile.keepBelow = tile.isTileable;
                if (Config.noTileBorder)
                    tile.noBorder = tile.isTileable;
            });
        }

        debug(() => "arrange: finished");
        this.arranging = false;
    }

    public enforceClientSize(client: KWin.Client) {
        const tile = this.getTileByClient(client);
        if (!tile) return;
        if (!tile.isTileable) return;

        if (tile.doesGeometryDiffer())
            this.driver.setTimeout(() => {
                if (!tile.isTileable) return;
                tile.commitGeometry();
            }, 10);
    }

    public manageClient(client: KWin.Client): boolean {
        const className = String(client.resourceClass);

        const ignore = (Config.ignoreClass.indexOf(className) >= 0);
        if (ignore)
            return false;

        const tile = new Tile(client);

        const floating = (
            (Config.floatingClass.indexOf(className) >= 0)
            || (Config.floatUtility && tile.isUtility)
            || client.modal
        );
        if (floating)
            tile.floating = true;

        this.tiles.push(tile);
        this.arrange();
        return true;
    }

    public unmanageClient(client: KWin.Client) {
        this.tiles = this.tiles.filter((t) =>
            t.client !== client && !t.isError);
        this.arrange();
    }

    public setNumberScreen(count: number) {
        this.numScreen = count;
    }

    public setClientFloat(client: KWin.Client): boolean {
        const tile = this.getTileByClient(client);
        if (!tile) return false;
        if (tile.floating) return false;

        tile.floating = true;
        tile.floatGeometry = Rect.from(tile.clientGeometry);
        return true;
    }

    /*
     * User Input Handling
     */

    public handleUserInput(input: UserInput, data?: any) {
        debug(() => "handleUserInput: input=" + UserInput[input] + " data=" + data);

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
        const client = this.driver.getActiveClient();
        if (!client)
            return 0;
        return client.screen;
    }

    private getActiveTile(): Tile | null {
        /* XXX: may return `null` if the active client is not being managed.
         * I'm just on a defensive manuever, and nothing has been broke actually. */
        return this.getTileByClient(this.driver.getActiveClient());
    }

    private getTileByClient(client: KWin.Client): Tile | null {
        for (let i = 0; i < this.tiles.length; i++)
            if (this.tiles[i].client === client)
                return this.tiles[i];
        return null;
    }

    private getVisibleTiles(screen: number): Tile[] {
        return this.tiles.filter((tile) => tile.isVisible(screen));
    }
}
