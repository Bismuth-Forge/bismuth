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

    constructor(id: number) {
        this.id = id;
        this.layout = new TileLayout();
    }
}

class Tile {
    public arrangeCount: number;
    public client: KWin.Client;
    public floating: boolean;
    public geometry: Rect;
    public isError: boolean;
    public isNew: boolean;
    public oldGeometry: Rect;

    constructor(client: KWin.Client, geometry: Rect) {
        this.arrangeCount = 0;
        this.client = client;
        this.floating = false;
        this.geometry = geometry;
        this.isError = false;
        this.isNew = true;
        this.oldGeometry = geometry;
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
        this.screens.forEach((screen) => {
            if (screen.layout === null) return;

            const area = this.driver.getWorkingArea(screen.id);
            const visibles = this.tiles.filter((t) => {
                try {
                    return this.driver.isClientVisible(t.client, screen.id);
                } catch (e) {
                    t.isError = true;
                }
                return false;
            });

            const tileables = visibles.filter((t) => !t.floating);
            screen.layout.apply(tileables, area.width, area.height);
            tileables.forEach((tile) => {
                tile.arrangeCount = 0;
                this.driver.setClientGeometry(tile.client, tile.geometry);
                tile.client.keepBelow = true;
            });

            visibles.filter((t) => t.floating)
                    .map((t) => (t.client.keepAbove = true));
        });
    }

    public arrangeClient = (client: KWin.Client) => {
        this.tiles.forEach((tile) => {
            if (tile.client !== client) return;
            if (tile.floating) return;

            const geometry = this.driver.getClientGeometry(tile.client);
            if (geometry.x === tile.geometry.x)
            if (geometry.y === tile.geometry.y)
            if (geometry.width === tile.geometry.width)
            if (geometry.height === tile.geometry.height) {
                tile.arrangeCount = 0;
                return;
            }

            /* HACK: prevent infinite `geometryChanged`. */
            tile.arrangeCount += 1;
            if (tile.arrangeCount > 5) // TODO: define arbitrary constant
                return;

            this.driver.setClientGeometry(tile.client, tile.geometry);
        });
    }

    public manageClient = (client: KWin.Client) => {
        this.tiles.push(
            new Tile(client, this.driver.getClientGeometry(client)));
        this.arrange();
    }

    public unmanageClient = (client: KWin.Client) => {
        this.tiles = this.tiles.filter((t) => {
            return t.client !== client && !t.isError;
        });
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
        // TODO: move this to driver
        const screen = this.getCurrentScreen();

        const overriden = screen.layout.handleUserInput(input);
        if (overriden) {
            this.arrange();
            return;
        }

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
                this.setFloat(this.getCurrentTile(), "toggle");
                break;
        }
        this.arrange();
    }

    public moveFocus = (step: number) => {
        if (step === 0) return;

        const index = this.getCurrentTileIndex();
        let newIndex = index + step;
        if (newIndex < 0)
            newIndex = 0;
        if (newIndex >= this.tiles.length)
            newIndex = this.tiles.length - 1;

        // TODO: move this to driver
        workspace.activeClient = this.tiles[newIndex].client;
    }

    public moveTile = (step: number) => {
        if (step === 0) return;

        let i = this.getCurrentTileIndex();
        let tmp: Tile;
        while (step > 0 && i + 1 < this.tiles.length) {
            tmp = this.tiles[i];
            this.tiles[i] = this.tiles[i + 1];
            this.tiles[i + 1] = tmp;
            i++; step--;
        }
        while (step < 0 && i - 1 >= 0) {
            tmp = this.tiles[i];
            this.tiles[i] = this.tiles[i - 1];
            this.tiles[i - 1] = tmp;
            i--; step++;
        }
    }

    public setMaster = () => {
        const index = this.getCurrentTileIndex();
        const client = this.tiles[index];

        for (let i = index - 1; i >= 0; i--)
            this.tiles[i + 1] = this.tiles[i];
        this.tiles[0] = client;
    }

    public setFloat = (tile: Tile, value: boolean | string) => {
        if (typeof value === "string")
            tile.floating = !tile.floating;
        else {
            if (tile.floating === value)
                return;
            tile.floating = value;
        }

        if (tile.floating)
            tile.oldGeometry.copyTo(tile.geometry);
    }

    /*
     * Privates
     */

    private getCurrentScreen = (): Screen => {
        const screenId = workspace.activeClient.screen;
        for (let i = 0; i < this.screens.length; i++)
            if (this.screens[i].id === screenId)
                return this.screens[i];
    }

    private getCurrentTile = (): Tile => {
        return this.tiles[this.getCurrentTileIndex()];
    }

    private getTileIndexByClient = (client: KWin.Client): number => {
        for (let i = 0; i < this.tiles.length; i++)
            if (this.tiles[i].client === client)
                return i;
        return null;
    }

    private getCurrentTileIndex = (): number => {
        // TODO: don't access `workspace` directly
        return this.getTileIndexByClient(workspace.activeClient);
    }
}
