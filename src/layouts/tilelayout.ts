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

function stackTiles(tiles: Window[], x: number, y: number, width: number, height: number, gap = 0) {
    if (tiles.length === 1) {
        tiles[0].geometry = new Rect(x, y, width, height);
        return;
    }

    const count = tiles.length;
    const tileHeight = (height + gap) / count - gap;
    tiles.forEach((window: Window, i: number) => {
        window.geometry = new Rect(
            x,
            y + Math.floor(i * (tileHeight + gap)),
            width,
            Math.floor(tileHeight),
        );
    });
}

class TileLayout implements ILayout {
    public static readonly MIN_MASTER_RATIO = 0.2;
    public static readonly MAX_MASTER_RATIO = 0.8;

    public get enabled(): boolean {
        return CONFIG.enableTileLayout;
    }

    private numMaster: number;
    private masterRatio: number; /* in ratio */

    constructor() {
        this.numMaster = 1;
        this.masterRatio = 0.55;
    }

    public adjust(area: Rect, tiles: Window[], basis: Window) {
        if (tiles.length <= this.numMaster)
            return;

        const idx = tiles.indexOf(basis);
        if (idx < 0)
            return;

        const diff = basis.actualGeometry.subtract(basis.geometry);
        if (idx < this.numMaster) { /* master tiles */
            if (diff.x === 0) { /* east-side resizing */
                const newMasterWidth = Math.floor(area.width * this.masterRatio) + diff.width;
                this.masterRatio = newMasterWidth / area.width;
            }
        } else { /* stack tiles */
            if (diff.x !== 0) { /* west-size resizing */
                const newStackWidth = (area.width - Math.floor(area.width * this.masterRatio)) + diff.width;
                this.masterRatio = (area.width - newStackWidth) / area.width;
            }
        }
        this.masterRatio = clip(this.masterRatio, TileLayout.MIN_MASTER_RATIO, TileLayout.MAX_MASTER_RATIO);
    }

    public apply = (tiles: Window[], area: Rect): void => {
        const gap = CONFIG.tileLayoutGap;

        if (tiles.length <= this.numMaster) /* only master */
            stackTiles(tiles, area.x, area.y, area.width, area.height, gap);
        else if (this.numMaster === 0) /* only stack */
            stackTiles(tiles, area.x, area.y, area.width, area.height, gap);
        else { /* master & stack */
            const mgap = Math.ceil(gap / 2);
            const sgap = gap - mgap;

            const masterFullWidth = Math.floor(area.width * this.masterRatio);
            const masterWidth = masterFullWidth - mgap;
            const stackWidth = area.width - masterFullWidth - sgap;
            const stackX = area.x + masterFullWidth + sgap;

            stackTiles(tiles.slice(0, this.numMaster), area.x, area.y, masterWidth, area.height, gap);
            stackTiles(tiles.slice(this.numMaster), stackX, area.y, stackWidth, area.height, gap);
        }
    }

    public handleUserInput(input: UserInput) {
        switch (input) {
            case UserInput.Left:
                this.masterRatio = clip(
                    slide(this.masterRatio, -0.05),
                    TileLayout.MIN_MASTER_RATIO,
                    TileLayout.MAX_MASTER_RATIO);
                break;
            case UserInput.Right:
                this.masterRatio = clip(
                    slide(this.masterRatio, +0.05),
                    TileLayout.MIN_MASTER_RATIO,
                    TileLayout.MAX_MASTER_RATIO);
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

    public toString(): string {
        return "TileLayout(nmaster=" + this.numMaster + ", ratio=" + this.masterRatio + ")";
    }
}

try {
    exports.TileLayout = TileLayout;
} catch (e) { /* ignore */ }
