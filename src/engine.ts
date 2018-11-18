// Copyright (c) 2018 Eon S. Jeon <esjeon@hyunmu.am>
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

class Screen {
    public id: number;
    public layout: ILayout;
    public layouts: ILayout[];

    constructor(id: number) {
        this.id = id;
        this.layouts = [
            new TileLayout(),
            new MonocleLayout(),
            new SpreadLayout(),
            new StairLayout(),
        ];
        this.layout = this.layouts[0];
    }
}

class Tile {
    public arrangeCount: number;
    public client: KWin.Client;
    public floating: boolean;
    public geometry: Rect;
    public isError: boolean;
    public floatGeometry: Rect;

    constructor(client: KWin.Client, geometry: Rect) {
        this.arrangeCount = 0;
        this.client = client;
        this.floating = false;
        this.geometry = Rect.from(geometry);
        this.isError = false;
        this.floatGeometry = Rect.from(geometry);
    }
}

class TilingEngine {
    public screens: Screen[];
    private driver: KWinDriver;
    private tiles: Tile[];

    constructor(driver: KWinDriver) {
        this.driver = driver;
        this.tiles = Array();
        this.screens = Array();
    }

    public arrange = () => {
        debug(() => "arrange: tiles=" + this.tiles.length);
        this.screens.forEach((screen) => {
            if (screen.layout === null) return;

            const area = this.driver.getWorkingArea(screen.id);
            const visibles = this.getVisibleTiles(screen);

            const tileables = visibles.filter((tile) =>
                !this.driver.isClientFullScreen(tile.client) &&
                !tile.floating);
            screen.layout.apply(tileables, area);

            visibles.forEach((tile) => {
                if (this.driver.isClientFullScreen(tile.client)) {
                    tile.client.keepAbove = false;
                    tile.client.keepBelow = false;
                } else if (tile.floating) {
                    tile.client.keepAbove = false;
                    tile.client.keepBelow = false;
                } else /* tileable */ {
                    tile.client.keepAbove = false;
                    tile.client.keepBelow = true;
                }
            });

            tileables.forEach((tile) => this.applyTileGeometry(tile, true));
        });
    }

    public arrangeClient = (client: KWin.Client) => {
        const tile = this.getTileByClient(client);
        if (!tile) return;

        if (tile.floating) return;
        if (this.driver.isClientFullScreen(tile.client)) return;

        this.applyTileGeometry(tile, false);
    }

    public manageClient = (client: KWin.Client): boolean => {
        const className = this.driver.getClientClassName(client);

        const ignore = (Config.ignoreClass.indexOf(className) >= 0);
        if (ignore)
            return false;

        const tile = new Tile(client, this.driver.getClientGeometry(client));

        const floating = (Config.floatingClass.indexOf(className) >= 0);
        if (floating)
            this.setFloat(tile, true);

        this.tiles.push(tile);
        this.arrange();
        return true;
    }

    public unmanageClient = (client: KWin.Client) => {
        this.tiles = this.tiles.filter((t) =>
            t.client !== client && !t.isError);
        this.arrange();
    }

    public addScreen = (screenId: number) => {
        this.screens.push(new Screen(screenId));
    }

    public removeScreen = (screenId: number) => {
        this.screens = this.screens.filter((screen) => {
            return screen.id !== screenId;
        });
    }

    /*
     * User Input Handling
     */

    public handleUserInput = (input: UserInput) => {
        const screen = this.getActiveScreen();
        if (!screen) return;

        debug(() => "handleUserInput: input=" + UserInput[input]);

        const overriden = screen.layout.handleUserInput(input);
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
                this.setMaster();
                break;
            case UserInput.Float:
                if ((tile = this.getActiveTile()))
                    this.setFloat(tile, "toggle");
                break;
            case UserInput.CycleLayout:
                this.nextLayout();
                break;
        }
        this.arrange();
    }

    public moveFocus = (step: number) => {
        if (step === 0) return;

        const tile = this.getActiveTile();
        if (!tile) return;

        const visibles = this.getVisibleTiles(this.getActiveScreen());
        const index = visibles.indexOf(tile);

        let newIndex = index + step;
        while (newIndex < 0)
            newIndex += visibles.length;
        newIndex = newIndex % visibles.length;

        this.driver.setActiveClient(visibles[newIndex].client);
    }

    public moveTile = (step: number) => {
        if (step === 0) return;

        const tile = this.getActiveTile();
        if (!tile) return;

        const screen = this.getActiveScreen();
        let tileIdx = this.tiles.indexOf(tile);
        const dir = (step > 0) ? 1 : -1;
        for (let i = tileIdx + dir; 0 <= i && i < this.tiles.length; i += dir) {
            if (this.isTileVisible(this.tiles[i], screen)) {
                this.tiles[tileIdx] = this.tiles[i];
                this.tiles[i] = tile;
                tileIdx = i;

                step -= dir;
                if (step === 0)
                    break;
            }
        }
    }

    public setMaster = () => {
        const tile = this.getActiveTile();
        if (!tile) return;
        if (this.tiles[0] === tile) return;

        const index = this.tiles.indexOf(tile);
        for (let i = index - 1; i >= 0; i--)
            this.tiles[i + 1] = this.tiles[i];
        this.tiles[0] = tile;
    }

    public setClientFloat = (client: KWin.Client, value: boolean | string, geometry: IRect) => {
        const tile = this.getTileByClient(client);
        if (!tile) return;

        this.setFloat(tile, value, Rect.from(geometry));
    }

    public setFloat = (tile: Tile, value: boolean | string, geometry?: Rect) => {
        if (typeof value === "string")
            tile.floating = !tile.floating;
        else {
            if (tile.floating === value)
                return;
            tile.floating = value;
        }

        if (tile.floating) {
            this.driver.setClientGeometry(
                tile.client, (geometry) ? geometry : tile.floatGeometry);
        } else
            tile.floatGeometry.copyFrom((geometry) ? geometry : tile.client.geometry);
    }

    public nextLayout() {
        const screen = this.getActiveScreen();
        const lastLayout = screen.layout;
        let index = screen.layouts.indexOf(screen.layout);

        for (;;) {
            index = (index + 1) % screen.layouts.length;
            debug(() => index);
            if (screen.layouts[index] === lastLayout) break;
            if (screen.layouts[index].isEnabled()) break;
        }
        screen.layout = screen.layouts[index];
        debug(() => screen.layout);
    }

    /*
     * Privates
     */

    private getActiveScreen = (): Screen => {
        const screenId = workspace.activeClient.screen;
        for (let i = 0; i < this.screens.length; i++)
            if (this.screens[i].id === screenId)
                return this.screens[i];

        /* XXX: suppressing strict type-checker */
        return this.screens[0];
    }

    private getActiveTile = (): Tile | null => {
        /* XXX: may return `null` if the active client is not being managed.
         * I'm just on a defensive manuever, and nothing has been broke actually. */
        return this.getTileByClient(this.driver.getActiveClient());
    }

    private getTileByClient = (client: KWin.Client): Tile | null => {
        for (let i = 0; i < this.tiles.length; i++)
            if (this.tiles[i].client === client)
                return this.tiles[i];
        return null;
    }

    private getVisibleTiles = (screen: Screen): Tile[] => {
        return this.tiles.filter((tile) => this.isTileVisible(tile, screen));
    }

    private isTileVisible = (tile: Tile, screen: Screen): boolean => {
        // TODO: `engine` should define what "visible" means, not `driver`.
        try {
            return this.driver.isClientVisible(tile.client, screen.id);
        } catch (e) {
            tile.isError = true;
            return false;
        }
    }

    private applyTileGeometry = (tile: Tile, isUpdated: boolean) => {
        const geometry = this.driver.getClientGeometry(tile.client);
        if (geometry.x === tile.geometry.x)
        if (geometry.y === tile.geometry.y)
        if (geometry.width === tile.geometry.width)
        if (geometry.height === tile.geometry.height) {
            tile.arrangeCount = 0;
            return;
        }

        /* HACK: prevent infinite `geometryChanged`. */
        tile.arrangeCount = (isUpdated) ? 0 : tile.arrangeCount + 1;
        if (tile.arrangeCount > 5) // TODO: define arbitrary constant
            return;

        this.driver.setClientGeometry(tile.client, tile.geometry);
    }
}
