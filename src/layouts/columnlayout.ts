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

// TODO: find a way to save column focus when focus is changed by mouse

/**
 * ColumnLayout is a dynamic column-based layout, somewhat similar to TileLayout.
 *
 * ColumnLayout has a vertical stack on the right side, and columns on the left side. There can be multiple columns,
 * where each column can also have multiple tiles.
 */
class ColumnLayout implements ILayout {
    public get enabled(): boolean {
        return CONFIG.enableColumnLayout;
    }

    private columnFocus: number[];
    private columnWeights: number[];
    private columnMasters: number[];
    /** The index of column to activate during the next "arrangement". `undefined` means no-op. */
    private nextColumn: number | undefined;
    /** Location of tiles. Each entry is a `column`-`index` pair. */
    private tileCache: {[key: string]: [number, number]};
    private tileWeights: LayoutWeightMap;

    constructor() {
        this.columnFocus = [0, 0];
        this.columnWeights = [1, 1];
        this.columnMasters = [1];
        this.nextColumn = undefined;
        this.tileCache = {};
        this.tileWeights = new LayoutWeightMap();
    }

    public adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void {
        const entry = this.tileCache[basis.id];
        if (!entry) return;

        const numColumns = this.columnMasters.length;
        const [basisColumn, basisIndex] = entry;

        /* adjust colums weights */
        const newColumnWeights = LayoutUtils.adjustAreaWeights(area, this.columnWeights, CONFIG.tileLayoutGap,
            basisColumn, delta, true);

        /* adjust tile weights */
        const tilesPerColumn = partitionArrayBySizes(tiles, this.columnMasters)
            .filter((arr) => arr.length > 0);
        const columnTiles = tilesPerColumn[basisColumn];
        const weights = columnTiles.map((tile) => this.tileWeights.get(tile));
        const newTileWeights = LayoutUtils.adjustAreaWeights(area, weights, CONFIG.tileLayoutGap,
            basisIndex, delta);

        /* update */
        this.columnWeights = newColumnWeights;
        newTileWeights.forEach((weight, index) => {
            const tile = columnTiles[index];
            this.tileWeights.set(tile, weight * columnTiles.length);
        });
    }

    public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
        this.tileCache = {};

        /* Tile all tileables */
        tileables.forEach((tileable) => tileable.state = WindowState.Tile);
        const tiles = tileables;

        const tilesPerColumn = partitionArrayBySizes(tiles, this.columnMasters)
            .filter((arr) => arr.length > 0);

        const columnWeights = this.columnWeights.slice(0, tilesPerColumn.length);
        const columnAreas = LayoutUtils.splitAreaWeighted(area, columnWeights, CONFIG.tileLayoutGap, true);

        // TODO: zipping columnAreas and columnTilesList?
        columnAreas.forEach((columnArea, column) => {
            const columnTiles = tilesPerColumn[column];
            const tileWeights = columnTiles.map((tile) => this.tileWeights.get(tile));

            const tileAreas = LayoutUtils.splitAreaWeighted(columnArea, tileWeights, CONFIG.tileLayoutGap);

            // TODO zipping tileAreas and columnTiles?
            tileAreas.forEach((tileArea, tileIndex) => {
                const tile = columnTiles[tileIndex];
                tile.geometry = tileArea;
                this.tileCache[tile.id] = [column, tileIndex];
            });
        });

        /* change column */
        if (this.nextColumn !== undefined) {
            const columnTiles = tilesPerColumn[this.nextColumn];
            if (columnTiles) {
                const focus = clip(this.columnFocus[this.nextColumn], 0, columnTiles.length - 1);
                ctx.currentWindow = columnTiles[focus];
            }
        }

        /* reset column changing */
        this.nextColumn = undefined;
    }

    public toString(): string {
        return "ColumnLayout()";
    }

    public handleShortcut?(ctx: EngineContext, input: Shortcut, data: any): boolean {
        switch (input) {
            case Shortcut.Left : this.focusSide(ctx, -1); return true;
            case Shortcut.Right: this.focusSide(ctx, +1); return true;
            case Shortcut.Increase: this.resizeColumn(ctx, +1); return true;
            case Shortcut.Decrease: this.resizeColumn(ctx, -1); return true;
            case Shortcut.ShiftIncrease: this.addColumn(); return true;
            case Shortcut.ShiftDecrease: this.removeColumn(); return true;
        }
        return false;
    }

    /** change the number of tiles in the current column */
    private resizeColumn(ctx: EngineContext, step: number) {
        if (ctx.currentWindow && this.tileCache[ctx.currentWindow.id]) {
            const [column, _] = this.tileCache[ctx.currentWindow.id];
            this.columnMasters[column] = clip(
                this.columnMasters[column] + step, 1, 10);
        }
    }

    /** focus a neighboring column */
    private focusSide(ctx: EngineContext, step: -1 | 1) {
        if (ctx.currentWindow && this.tileCache[ctx.currentWindow.id]) {
            const [column, index] = this.tileCache[ctx.currentWindow.id];

            /* save current focus */
            this.columnFocus[column] = index;

            const nextColumn = clip(column + step, 0, this.columnMasters.length);

            /* reserve column focus changing. (actual operation takes place in `apply`) */
            this.nextColumn = nextColumn;
        }
    }

    /** add a new column to the end */
    private addColumn() {
        this.columnFocus.push(0);
        this.columnMasters.push(1);
        this.columnWeights.push(1);
    }

    /** remove the last column */
    private removeColumn() {
        this.columnFocus.pop();
        this.columnMasters.pop();
        this.columnWeights.pop();
    }
}
