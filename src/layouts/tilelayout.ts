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

class TileLayout implements ILayout {
    public static readonly MIN_MASTER_RATIO = 0.2;
    public static readonly MAX_MASTER_RATIO = 0.8;

    public get enabled(): boolean {
        return CONFIG.enableTileLayout;
    }

    private numMaster: number;
    private masterRatio: number; /* in ratio */
    private weights: LayoutWeightMap;

    constructor() {
        this.numMaster = 1;
        this.masterRatio = 0.55;
        this.weights = new LayoutWeightMap();
    }

    public adjust(area: Rect, tiles: Window[], basis: Window) {
        if (tiles.length <= this.numMaster)
            return;

        const idx = tiles.indexOf(basis);
        if (idx < 0)
            return;

        const delta = new WindowResizeDelta(basis);
        if (idx < this.numMaster) { /* master tiles */
            if (delta.east !== 0) {
                const newMasterWidth = Math.floor(area.width * this.masterRatio) + delta.east;
                this.masterRatio = newMasterWidth / area.width;
            }
            if (idx < this.numMaster - 1 && Math.abs(delta.south) > 3)
                adjustStackWeights(tiles.slice(0, this.numMaster), basis, this.weights,
                    area.height, "forward", CONFIG.tileLayoutGap);
            if ((idx > 0 && delta.north !== 0))
                adjustStackWeights(tiles.slice(0, this.numMaster), basis, this.weights,
                    area.height, "backward", CONFIG.tileLayoutGap);
        } else { /* stack tiles */
            if (delta.west !== 0) {
                const newStackWidth = (area.width - Math.floor(area.width * this.masterRatio)) + delta.west;
                this.masterRatio = (area.width - newStackWidth) / area.width;
            }
            if (idx < tiles.length - 1 && Math.abs(delta.south) > 3)
                adjustStackWeights(tiles.slice(this.numMaster), basis, this.weights,
                    area.height, "forward", CONFIG.tileLayoutGap);
            if ((idx > this.numMaster && Math.abs(delta.north) > 3))
                adjustStackWeights(tiles.slice(this.numMaster), basis, this.weights,
                    area.height, "backward", CONFIG.tileLayoutGap);
        }
        this.masterRatio = clip(this.masterRatio, TileLayout.MIN_MASTER_RATIO, TileLayout.MAX_MASTER_RATIO);
    }

    public apply = (tiles: Window[], area: Rect): void => {
        const gap = CONFIG.tileLayoutGap;
        /* TODO: clean up cache / check invalidated(unmanage) entries */

        if (tiles.length <= this.numMaster) /* only master */
            stackTilesWithWeight(tiles, area, this.weights, gap);
        else if (this.numMaster === 0) /* only stack */
            stackTilesWithWeight(tiles, area, this.weights, gap);
        else { /* master & stack */
            const mgap = Math.ceil(gap / 2);
            const sgap = gap - mgap;

            const masterFullWidth = Math.floor(area.width * this.masterRatio);
            const masterWidth = masterFullWidth - mgap;
            const stackWidth = area.width - masterFullWidth - sgap;
            const stackX = area.x + masterFullWidth + sgap;

            stackTilesWithWeight(tiles.slice(0, this.numMaster),
                new Rect(area.x, area.y, masterWidth, area.height),
                this.weights, gap);
            stackTilesWithWeight(tiles.slice(this.numMaster),
                new Rect(stackX, area.y, stackWidth, area.height),
                this.weights, gap);
        }
    }

    public handleShortcut(input: Shortcut) {
        switch (input) {
            case Shortcut.Left:
                this.masterRatio = clip(
                    slide(this.masterRatio, -0.05),
                    TileLayout.MIN_MASTER_RATIO,
                    TileLayout.MAX_MASTER_RATIO);
                break;
            case Shortcut.Right:
                this.masterRatio = clip(
                    slide(this.masterRatio, +0.05),
                    TileLayout.MIN_MASTER_RATIO,
                    TileLayout.MAX_MASTER_RATIO);
                break;
            case Shortcut.Increase:
                // TODO: define arbitrary constant
                if (this.numMaster < 10)
                    this.numMaster += 1;
                break;
            case Shortcut.Decrease:
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
