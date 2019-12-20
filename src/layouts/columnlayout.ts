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

class ColumnLayout implements ILayout {
    public get enabled(): boolean {
        return true;
    }

    private columnWeights: number[];
    private columnMasters: number[];
    private stackRatio: number;
    private tileWeights: LayoutWeightMap;

    constructor() {
        this.columnWeights = [1];
        this.columnMasters = [1];
        this.stackRatio = 0.25;
        this.tileWeights = new LayoutWeightMap();
    }

    // public adjust(area: Rect, tiles: Window[], basis: Window): void {
    // }

    public apply(ctx: EngineContext, tiles: Window[], area: Rect): void {
        const numColumns = this.columnMasters.length;
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
            const columnAreas =
                LayoutUtils.splitAreaWeighted(columnsArea, this.columnWeights, 20, true);
            const columnTilesList =
                partitionArrayBySizes(columnsTiles, this.columnMasters);

            // TODO: zipping columnAreas and columnTilesList?
            columnAreas.forEach((columnArea, column) => {
                const columnTiles = columnTilesList[column];
                const tileWeights = columnTiles.map((tile) => this.tileWeights.get(tile));

                // TODO: independently configurable tile gap
                const tileAreas = LayoutUtils.splitAreaWeighted(columnArea, tileWeights, CONFIG.tileLayoutGap);

                // TODO zipping tileAreas and columnTiles?
                tileAreas.forEach((tileArea, tileIndex) => {
                    columnTiles[tileIndex].geometry = tileArea;
                });
            });
        }

        /* tile stack */
        if (stackArea) {
            const tileWeights = stackTiles.map((tile) => this.tileWeights.get(tile));
            // TODO: independently configurable tile gap
            const tileAreas = LayoutUtils.splitAreaWeighted(stackArea, tileWeights, CONFIG.tileLayoutGap);

            // TODO zipping tileAreas and stackTiles?
            tileAreas.forEach((tileArea, tileIndex) => {
                stackTiles[tileIndex].geometry = tileArea;
            });
        }
    }

    public toString(): string {
        return "ColumnLayout()";
    }

    public handleShortcut?(ctx: EngineContext, input: Shortcut, data: any): boolean {
        switch(input) {
            case Shortcut.Increase: break;
            case Shortcut.Decrease: break;
            case Shortcut.ShiftIncrease: this.addColumn(); return true;
            case Shortcut.ShiftDecrease: this.removeColumn(); return true;
        }
        return false;
    }

    private addColumn() {
        this.columnMasters.push(1);
        this.columnWeights.push(1);
    }

    private removeColumn() {
        this.columnMasters.pop();
        this.columnWeights.pop();
    }
}
