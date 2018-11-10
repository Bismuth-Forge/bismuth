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
    apply(tiles: Tile[], areaWidth: number, areaHeight: number);

    handleUserInput(input: UserInput): boolean;
    /* if true, layout completely overrides the default behavior */
}

class TileLayout implements ILayout {
    private numMaster: number;
    private masterRatio: number; /* in ratio */

    constructor() {
        this.numMaster = 1;
        this.masterRatio = 0.55;
    }

    public apply = (tiles: Tile[], areaWidth: number, areaHeight: number) => {
        if (!this.masterRatio) this.masterRatio = 0.45;
        if (!this.numMaster) this.numMaster = 1;

        let masterCount, masterWidth, masterHeight;
        let stackCount, stackWidth, stackHeight, stackX;

        if (tiles.length <= this.numMaster) {
            masterCount = tiles.length;
            masterWidth = areaWidth;
            masterHeight = Math.floor(areaHeight / masterCount);

            stackCount = stackWidth = stackHeight = stackX = 0;
        } else {
            masterCount = this.numMaster;
            masterWidth = Math.floor(areaWidth * this.masterRatio);
            masterHeight = Math.floor(areaHeight / masterCount);

            stackCount = tiles.length - masterCount;
            stackWidth = areaWidth - masterWidth;
            stackHeight = Math.floor(areaHeight / stackCount);
            stackX = masterWidth + 1;
        }

        for (let i = 0; i < masterCount; i++) {
            tiles[i].geometry.x = 0;
            tiles[i].geometry.y = masterHeight * i;
            tiles[i].geometry.width = masterWidth;
            tiles[i].geometry.height = masterHeight;
        }

        for (let i = 0; i < stackCount; i++) {
            const j = masterCount + i;
            tiles[j].geometry.x = stackX;
            tiles[j].geometry.y = stackHeight * i;
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
}

// TODO: MonocleLayout
// TODO: ColumnLayout
