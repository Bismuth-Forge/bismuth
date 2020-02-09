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

class ThreeColumnLayout implements ILayout {
    public static readonly MIN_MASTER_RATIO = 0.2;
    public static readonly MAX_MASTER_RATIO = 0.75;
    public static readonly id = "ThreeColumnLayout";

    public readonly classID = ThreeColumnLayout.id;

    public get description(): string {
        return "Three-Column [" + (this.masterSize) + "]";
    }

    private masterRatio: number;
    private masterSize: number;
    private weights: LayoutWeightMap;

    constructor() {
        this.masterRatio = 0.6;
        this.masterSize = 1;
        this.weights = new LayoutWeightMap();
    }

    public adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void {
        const basisIndex = tiles.indexOf(basis);
        if (basisIndex < 0)
            return;

        if (tiles.length === this.masterSize + 1) {
            this.masterRatio = LayoutUtils.adjustAreaHalfWeights(
                area,
                this.masterRatio,
                CONFIG.tileLayoutGap,
                basisIndex,
                delta,
                true);
        } else if (tiles.length > this.masterSize + 1) {
            let basisGroup;
            if (basisIndex < this.masterSize)
                basisGroup = 1; /* master */
            else if (basisIndex < Math.floor((this.masterSize + tiles.length) / 2))
                basisGroup = 2; /* R-stack */
            else
                basisGroup = 0; /* L-stack */

            /* adjust master-stack ratio */
            const stackRatio = 1 - this.masterRatio;
            const [, newMasterRatio, newStackRatio] = LayoutUtils.adjustAreaWeights(
                area,
                [stackRatio, this.masterRatio, stackRatio],
                CONFIG.tileLayoutGap,
                basisGroup,
                delta,
                true);
            this.masterRatio = newMasterRatio / (newMasterRatio + newStackRatio);

            /* adjust tile weight */
            const rstackNumTile = Math.floor((tiles.length - this.masterSize) / 2);
            const [masterTiles, rstackTiles, lstackTiles] =
                partitionArrayBySizes<Window>(tiles, [this.masterSize, rstackNumTile])
            const groupTiles = [lstackTiles, masterTiles, rstackTiles][basisGroup];
            LayoutUtils.adjustAreaWeights(
                    area, /* we only need height */
                    groupTiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap,
                    groupTiles.indexOf(basis),
                    delta)
                .forEach((newWeight, i) =>
                    this.weights.set(groupTiles[i], newWeight * groupTiles.length));
        }
    }

    public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
        /* Tile all tileables */
        tileables.forEach((tileable) => tileable.state = WindowState.Tile);
        const tiles = tileables;

        if (tiles.length <= this.masterSize) {
            /* only master */
            LayoutUtils.splitAreaWeighted(
                    area,
                    tiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap)
                .forEach((tileArea, i) =>
                    tiles[i].geometry = tileArea);
        } else if (tiles.length === this.masterSize + 1) {
            /* master & R-stack (only 1 window in stack) */
            const [masterArea, stackArea] = LayoutUtils.splitAreaHalfWeighted(
                area, this.masterRatio, CONFIG.tileLayoutGap, true);

            const masterTiles = tiles.slice(0, this.masterSize);
            LayoutUtils.splitAreaWeighted(
                    masterArea,
                    masterTiles.map((tile) => this.weights.get(tile)),
                    CONFIG.tileLayoutGap)
                .forEach((tileArea, i) =>
                    masterTiles[i].geometry = tileArea);

            tiles[tiles.length - 1].geometry = stackArea;
        } else if (tiles.length > this.masterSize + 1) {
            /* L-stack & master & R-stack */
            const stackRatio = 1 - this.masterRatio;

            /** Areas allocated to L-stack, master, and R-stack */
            const groupAreas = LayoutUtils.splitAreaWeighted(
                area,
                [stackRatio, this.masterRatio, stackRatio],
                CONFIG.tileLayoutGap,
                true);

            const rstackSize = Math.floor((tiles.length - this.masterSize) / 2);
            const [masterTiles, rstackTiles, lstackTiles] =
                partitionArrayBySizes<Window>(tiles, [this.masterSize, rstackSize]);
            [lstackTiles, masterTiles, rstackTiles].forEach((groupTiles, group) => {
                LayoutUtils.splitAreaWeighted(
                        groupAreas[group],
                        groupTiles.map((tile) => this.weights.get(tile)),
                        CONFIG.tileLayoutGap)
                    .forEach((tileArea, i) =>
                        groupTiles[i].geometry = tileArea);
            });
        }
    }

    public clone(): ILayout {
        const other = new ThreeColumnLayout();
        other.masterRatio = this.masterRatio;
        other.masterSize = this.masterSize;
        return other;
    }

    public handleShortcut(ctx: EngineContext, input: Shortcut, data?: any): boolean {
        switch (input) {
            case Shortcut.Increase: this.resizeMaster(ctx, +1); return true;
            case Shortcut.Decrease: this.resizeMaster(ctx, -1); return true;
            case Shortcut.Left:
                this.masterRatio = clip(
                    slide(this.masterRatio, -0.05),
                    ThreeColumnLayout.MIN_MASTER_RATIO,
                    ThreeColumnLayout.MAX_MASTER_RATIO);
                return true;
            case Shortcut.Right:
                this.masterRatio = clip(
                    slide(this.masterRatio, +0.05),
                    ThreeColumnLayout.MIN_MASTER_RATIO,
                    ThreeColumnLayout.MAX_MASTER_RATIO);
                return true;
            default:
                return false;
        }
    }

    public toString(): string {
        return "ThreeColumnLayout(nmaster=" + this.masterSize + ")";
    }

    private resizeMaster(ctx: EngineContext, step: -1 | 1): void {
        this.masterSize = clip(this.masterSize + step,
            1, 10);
        ctx.showNotification(this.description);
    }
}
