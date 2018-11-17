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

interface ILayout {
    apply(tiles: Tile[], area: Rect): void;

    handleUserInput(input: UserInput): boolean;
    /* if true, layout completely overrides the default behavior */

    isEnabled(): boolean;
}

class TileLayout implements ILayout {
    private numMaster: number;
    private masterRatio: number; /* in ratio */

    constructor() {
        this.numMaster = 1;
        this.masterRatio = 0.55;
    }

    public apply = (tiles: Tile[], area: Rect): void => {
        const masterCount = Math.min(tiles.length, this.numMaster);
        const stackCount = tiles.length - masterCount;

        let masterWidth;
        if (stackCount === 0)
            masterWidth = area.width;
        else if (masterCount === 0)
            masterWidth = 0;
        else
            masterWidth = Math.floor(area.width * this.masterRatio);
        const stackWidth = area.width - masterWidth;

        const masterHeight = (masterCount > 0) ? Math.floor(area.height / masterCount) : 0;
        const stackHeight = (stackCount > 0) ? Math.floor(area.height / stackCount) : 0;

        const stackX = (masterWidth > 0) ? masterWidth + 1 : 0;

        for (let i = 0; i < masterCount; i++) {
            tiles[i].geometry.x = area.x;
            tiles[i].geometry.y = area.y + masterHeight * i;
            tiles[i].geometry.width = masterWidth;
            tiles[i].geometry.height = masterHeight;
        }

        for (let i = 0; i < stackCount; i++) {
            const j = masterCount + i;
            tiles[j].geometry.x = area.x + stackX;
            tiles[j].geometry.y = area.y + stackHeight * i;
            tiles[j].geometry.width = stackWidth;
            tiles[j].geometry.height = stackHeight;
        }
    }

    public handleUserInput(input: UserInput) {
        switch (input) {
            case UserInput.Left:
                // TODO: define arbitrary constants
                if (this.masterRatio > 0.2)
                    this.masterRatio -= 0.05;
                break;
            case UserInput.Right:
                // TODO: define arbitrary constants
                if (this.masterRatio < 0.8)
                    this.masterRatio += 0.05;
                break;
            case UserInput.Increase:
                // TODO: define arbitrary constant
                if (this.numMaster < 10)
                    this.numMaster += 1;
                break;
            case UserInput.Decrease:
                if (this.numMaster > 0)
                    this.numMaster -= 1;
                break;
            default:
                return false;
        }
        return true;
    }

    public isEnabled(): boolean {
        return Config.enableTileLayout;
    }
}

class MonocleLayout implements ILayout {
    public apply = (tiles: Tile[], area: Rect): void => {
        tiles.forEach((tile) => tile.geometry.copyFrom(area));
    }

    public handleUserInput(input: UserInput) {
        return false;
    }

    public isEnabled(): boolean {
        return Config.enableMonocleLayout;
    }
}
// TODO: ColumnLayout

class SpreadLayout implements ILayout {
    private space: number; /* in ratio */

    constructor() {
        this.space = 0.07;
    }

    public apply = (tiles: Tile[], area: Rect): void => {
        let numTiles = tiles.length;
        const spaceWidth = Math.floor(area.width * this.space);
        let cardWidth = area.width - (spaceWidth * (numTiles - 1));

        // TODO: define arbitrary constants
        const miniumCardWidth = area.width * 0.40;
        while (cardWidth < miniumCardWidth) {
            cardWidth += spaceWidth;
            numTiles -= 1;
        }

        for (let i = 0; i < tiles.length; i++)
            tiles[i].geometry.set(
                area.x + ((i < numTiles) ? spaceWidth * (numTiles - i - 1) : 0),
                area.y,
                cardWidth,
                area.height,
            );
    }

    public handleUserInput(input: UserInput) {
        switch (input) {
            case UserInput.Decrease:
                // TODO: define arbitrary constants
                this.space = Math.max(0.04, this.space - 0.01);
                break;
            case UserInput.Increase:
                // TODO: define arbitrary constants
                this.space = Math.min(0.10, this.space + 0.01);
                break;
            default:
                return false;
        }
        return true;
    }

    public isEnabled(): boolean {
        return Config.enableSpreadLayout;
    }
}

class StairLayout implements ILayout {
    private space: number; /* in PIXELS */

    constructor() {
        this.space = 24;
    }

    public apply = (tiles: Tile[], area: Rect): void => {
        const len = tiles.length;
        const space = this.space;

        // TODO: limit the maximum number of staired windows.

        for (let i = 0; i < len; i++) {
            const dx = space * (len - i - 1);
            const dy = space * i;
            tiles[i].geometry.set(
                area.x + dx,
                area.y + dy,
                area.width - dx,
                area.height - dy,
            );
        }
    }

    public handleUserInput(input: UserInput) {
        switch (input) {
            case UserInput.Decrease:
                // TODO: define arbitrary constants
                this.space = Math.max(16, this.space - 8);
                break;
            case UserInput.Increase:
                // TODO: define arbitrary constants
                this.space = Math.min(160, this.space + 8);
                break;
            default:
                return false;
        }
        return true;
    }

    public isEnabled(): boolean {
        return Config.enableStairLayout;
    }
}
