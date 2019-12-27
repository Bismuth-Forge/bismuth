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
    /** The index of column to activate during the next "arrangement". * `undefined` means no-op, `null` means stack. */
    private nextColumn: number | null | undefined;
    private stackFocus: number;
    private stackRatio: number;
    /** Location of tiles. Each entry is a `column`-`index` pair. `null` value for `column` means stack column. */
    private tileCache: {[key: string]: [number | null, number]};
    private tileWeights: LayoutWeightMap;

    constructor() {
        this.columnFocus = [0];
        this.columnWeights = [1];
        this.columnMasters = [1];
        this.nextColumn = undefined;
        this.stackFocus = 0;
        this.stackRatio = 0.25;
        this.tileCache = {};
        this.tileWeights = new LayoutWeightMap();
    }

    public adjust(area: Rect, tiles: Window[], basis: Window): void {
        /* TODO: make this function simpler by spliting layout-building logic into a new method */

        const entry = this.tileCache[basis.id];
        if (!entry) return;

        const numColumns = this.columnMasters.length;
        const [basisColumn, basisIndex] = entry;
        const delta = basis.geometryDelta;

        /* horizontal adjustment */
        if (basisColumn === null) {
            /* the stack is resized. */
            /* adjust colums-stack ratio. */
            this.stackRatio = 1 - LayoutUtils.adjustAreaHalfWeights(area, 1 - this.stackRatio, 20,
                1, delta, true);
        } else if (basisColumn === numColumns - 1) {
            /* the last column is resized */
            /* adjust columns-stack ratio */
            if (delta.east !== 0) {
                const columnsDelta = new RectDelta(delta.east, 0, 0, 0);
                this.stackRatio = 1 - LayoutUtils.adjustAreaHalfWeights(area, 1 - this.stackRatio, 20,
                    0, columnsDelta, true);
            }

            /* adjust colums ratio */
            if (delta.west !== 0) {
                const columnDelta = new RectDelta(0, delta.west, 0, 0);
                const newWeights = LayoutUtils.adjustAreaWeights(area, this.columnWeights, 20,
                    basisColumn, columnDelta, true);
                this.columnWeights = newWeights;
            }
        } else {
            /* any other columns */
            /* adjust colums weights */
            const newWeights = LayoutUtils.adjustAreaWeights(area, this.columnWeights, 20,
                basisColumn, delta, true);
            this.columnWeights = newWeights;
        }

        const numColumnTiles = this.columnMasters.reduce((sum, numMaster) => sum + numMaster, 0);
        const [columnsTiles, stackTiles] = partitionArray(tiles, (tile, idx) => idx < numColumnTiles);

        /* vertical adjustment */
        if (basisColumn === null) {
            /* stack */
            if (stackTiles.length > 0) {
                const stackTileWeights = stackTiles.map((tile) => this.tileWeights.get(tile));
                const newWeights = LayoutUtils.adjustAreaWeights(area, stackTileWeights, CONFIG.tileLayoutGap,
                    basisIndex, delta);
                newWeights.forEach((weight, index) => {
                    const tile = stackTiles[index];
                    this.tileWeights.set(tile, weight * stackTiles.length);
                });
            }
        } else {
            /* column */
            if (columnsTiles.length > 0) {
                const columnTilesList = partitionArrayBySizes(columnsTiles, this.columnMasters)
                    .filter((arr) => arr.length > 0);
                const columnTiles = columnTilesList[basisColumn];
                const weights = columnTiles.map((tile) => this.tileWeights.get(tile));
                const newWeights = LayoutUtils.adjustAreaWeights(area, weights, CONFIG.tileLayoutGap,
                    basisIndex, delta);
                newWeights.forEach((weight, index) => {
                    const tile = columnTiles[index];
                    this.tileWeights.set(tile, weight * columnTiles.length);
                });
            }
        }
    }

    public apply(ctx: EngineContext, tileables: Window[], area: Rect): void {
        this.tileCache = {};

        /* Tile all tileables */
        tileables.forEach((tileable) => tileable.state = WindowState.Tile);
        const tiles = tileables;

        /** the total number of tiles in all columns */
        const numColumnTiles = this.columnMasters.reduce((sum, numMaster) => sum + numMaster, 0);

        const [columnsTiles, stackTiles] = partitionArray(tiles, (tile, idx) => idx < numColumnTiles);

        /* split the working area into columns & stack, ONLY WHEN REQUIRED */
        let columnsArea: Rect | null = null;
        let stackArea: Rect | null = null;
        if (stackTiles.length > 0 && columnsTiles.length > 0)
            [columnsArea, stackArea] = LayoutUtils.splitAreaHalfWeighted(area, 1 - this.stackRatio, 20, true);
        else if (columnsTiles.length > 0) /* no stack */
            columnsArea = area;
        else /* no columns */
            stackArea = area;

        /* tile columns */
        if (columnsArea) {
            // TODO: configurable column gap
            /** Lists of tiles in each columns */
            const columnTilesList = partitionArrayBySizes(columnsTiles, this.columnMasters)
                .filter((arr) => arr.length > 0);

            const columnWeights = this.columnWeights.slice(0, columnTilesList.length);
            const columnAreas = LayoutUtils.splitAreaWeighted(columnsArea, columnWeights, 20, true);

            // TODO: zipping columnAreas and columnTilesList?
            columnAreas.forEach((columnArea, column) => {
                const columnTiles = columnTilesList[column];
                const tileWeights = columnTiles.map((tile) => this.tileWeights.get(tile));

                // TODO: independently configurable tile gap
                const tileAreas = LayoutUtils.splitAreaWeighted(columnArea, tileWeights, CONFIG.tileLayoutGap);

                // TODO zipping tileAreas and columnTiles?
                tileAreas.forEach((tileArea, tileIndex) => {
                    const tile = columnTiles[tileIndex];
                    tile.geometry = tileArea;
                    this.tileCache[tile.id] = [column, tileIndex];
                });
            });

            /* change column */
            if (this.nextColumn !== undefined && this.nextColumn !== null) {
                const columnTiles = columnTilesList[this.nextColumn];
                if (columnsTiles) {
                    const focus = clip(this.columnFocus[this.nextColumn], 0, columnTiles.length - 1);
                    columnTiles[focus].focus();
                }
            }
        }

        /* tile stack */
        if (stackArea) {
            const tileWeights = stackTiles.map((tile) => this.tileWeights.get(tile));
            // TODO: independently configurable tile gap
            const tileAreas = LayoutUtils.splitAreaWeighted(stackArea, tileWeights, CONFIG.tileLayoutGap);

            // TODO zipping tileAreas and stackTiles?
            tileAreas.forEach((tileArea, tileIndex) => {
                const tile = stackTiles[tileIndex];
                stackTiles[tileIndex].geometry = tileArea;
                this.tileCache[tile.id] = [null, tileIndex];
            });

            /* change column */
            if (this.nextColumn === null) {
                const focus = clip(this.stackFocus, 0, stackTiles.length - 1);
                stackTiles[focus].focus();
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
            if (column !== null) {
                this.columnMasters[column] = clip(
                    this.columnMasters[column] + step, 1, 10);
            }
        }
    }

    /** focus a neighboring column */
    private focusSide(ctx: EngineContext, step: number) {
        if (ctx.currentWindow && this.tileCache[ctx.currentWindow.id]) {
            const [column, index] = this.tileCache[ctx.currentWindow.id];

            /* save current focus */
            if (column !== null)
                this.columnFocus[column] = index;
            else
                this.stackFocus = index;

            const numColumns = this.columnMasters.length;
            const nextColumn = clip(step + ((column === null) ? numColumns : column),
                0, numColumns);

            /* reserve column focus changing. (actual operation takes place in `apply`) */
            this.nextColumn = (nextColumn === numColumns) ? null : nextColumn;
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
