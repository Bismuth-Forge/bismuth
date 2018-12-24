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

        const gap = Config.tileLayoutGap;
        const halfgap = Math.ceil(gap / 2);

        let masterWidth;
        if (stackCount === 0)
            masterWidth = area.width;
        else if (masterCount === 0)
            masterWidth = 0;
        else
            masterWidth = Math.floor(area.width * this.masterRatio) - halfgap;
        const stackWidth = area.width - masterWidth - halfgap;

        const masterHeight = (masterCount === 0) ? 0 :
            Math.floor((area.height - (masterCount - 1) * gap) / masterCount);
        const stackHeight = (stackCount === 0) ? 0 :
            Math.floor((area.height - (stackCount - 1) * gap) / stackCount);

        const stackX = (masterWidth > 0) ? masterWidth + 1 + halfgap : 0;

        for (let i = 0; i < masterCount; i++)
            tiles[i].setGeometry(
                area.x,
                area.y + (masterHeight + gap) * i,
                masterWidth,
                masterHeight,
            );

        for (let i = 0; i < stackCount; i++)
            tiles[masterCount + i].setGeometry(
                area.x + stackX,
                area.y + (stackHeight + gap) * i,
                stackWidth,
                stackHeight,
            );
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

    public toString(): string {
        return "StairLayout(nmaster=" + this.numMaster + ", ratio=" + this.masterRatio + ")";
    }
}
