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
    public static readonly id = "TileLayout";

    public readonly classID = TileLayout.id;

    public get description(): string {
        return "Tile [" + this.numMaster + "]";
    }

    private numMaster: number;
    private masterRatio: number; /* in ratio */
    private weights: LayoutWeightMap;

    constructor() {
        this.numMaster = 1;
        this.masterRatio = 0.55;
        this.weights = new LayoutWeightMap();
    }

    public adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta) {
        const basisIndex = tiles.indexOf(basis);
        if (basisIndex < 0)
            return;

        /* adjust master-stack ratio */
        this.masterRatio = LayoutUtils.adjustAreaHalfWeights(
            area,
            this.masterRatio,
            CONFIG.tileLayoutGap,
            (basisIndex < this.numMaster) ? 0 : 1,
            delta,
            true);
        this.masterRatio = clip(this.masterRatio, TileLayout.MIN_MASTER_RATIO, TileLayout.MAX_MASTER_RATIO);

        if (basisIndex < this.numMaster) { /* master tiles */
            const masterTiles = tiles.slice(0, this.numMaster);
            LayoutUtils.adjustAreaWeights(
                    area,
                    masterTiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap,
                    masterTiles.indexOf(basis),
                    delta)
                .forEach((weight, i) => {
                    this.weights.set(masterTiles[i], weight * masterTiles.length);
                });
        } else { /* stack tiles */
            const stackTiles = tiles.slice(this.numMaster);
            LayoutUtils.adjustAreaWeights(
                    area,
                    stackTiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap,
                    stackTiles.indexOf(basis),
                    delta)
                .forEach((weight, i) => {
                    this.weights.set(stackTiles[i], weight * stackTiles.length);
                });
        }
    }

    public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
        /* Tile all tileables */
        tileables.forEach((tileable) => tileable.state = WindowState.Tile);
        const tiles = tileables;

        if (tiles.length <= this.numMaster || this.numMaster === 0) /* only master OR only stack*/
            LayoutUtils.splitAreaWeighted(
                    area,
                    tiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap)
                .forEach((rect, i) => {
                    tiles[i].geometry = rect;
                });
        else { /* master & stack */
            const [masterArea, stackArea] =
                LayoutUtils.splitAreaHalfWeighted(area, this.masterRatio, CONFIG.tileLayoutGap, true);
            const masterTiles = tiles.slice(0, this.numMaster);
            const stackTiles = tiles.slice(this.numMaster);

            LayoutUtils.splitAreaWeighted(
                    masterArea,
                    masterTiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap)
                .forEach((rect, i) => {
                    masterTiles[i].geometry = rect;
                });

            LayoutUtils.splitAreaWeighted(
                    stackArea,
                    stackTiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap)
                .forEach((rect, i) => {
                    stackTiles[i].geometry = rect;
                });
        }
    }

    public clone(): ILayout {
        const other = new TileLayout();
        other.masterRatio = this.masterRatio;
        other.numMaster = this.numMaster;
        return other;
    }

    public handleShortcut(ctx: EngineContext, input: Shortcut) {
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
                ctx.showNotification(this.description);
                break;
            case Shortcut.Decrease:
                if (this.numMaster > 0)
                    this.numMaster -= 1;
                ctx.showNotification(this.description);
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
