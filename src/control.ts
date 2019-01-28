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

/**
 * A thin layer which translates window(`Tile`) events to tiling actions.
 */
class TilingController implements ITileEventHandler {
    private engine: TilingEngine;

    public constructor(engine: TilingEngine) {
        this.engine = engine;
    }

    public onScreenCountChanged(count: number): void {
        debugObj(() => ["onScreenCountChanged", {count}]);
        this.engine.updateScreenCount(count);
        this.engine.arrange();
    }

    public onScreenResized(screen: number): void {
        debugObj(() => ["onScreenResized", {screen}]);
        this.engine.arrangeScreen(screen);
    }

    public onCurrentActivityChanged(activity: string): void {
        debugObj(() => ["onCurrentActivityChanged", {activity}]);
        this.engine.arrange();
    }

    public onCurrentDesktopChanged(desktop: number): void {
        debugObj(() => ["onCurrentDesktopChanged", {desktop}]);
        this.engine.arrange();
    }

    public onTileAdded(tile: Tile): void {
        debugObj(() => ["onTileAdded", {tile}]);
        this.engine.manageClient(tile);
        this.engine.arrange();
    }

    public onTileRemoved(tile: Tile): void {
        debugObj(() => ["onTileRemoved", {tile}]);
        this.engine.unmanageClient(tile);
        this.engine.arrange();
    }

    public onTileMoveStart(tile: Tile): void {
        /* do nothing */
    }

    public onTileMove(tile: Tile): void {
        /* do nothing */
    }

    public onTileMoveOver(tile: Tile): void {
        if (tile.tileable) {
            const diff = tile.actualGeometry.subtract(tile.geometry);
            const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
            /* TODO: arbitrary constant */
            if (distance > 30) {
                tile.floatGeometry.copyFrom(tile.actualGeometry);
                this.engine.setTileFloat(tile);
                this.engine.arrange();
            } else
                tile.commit();
        }
    }

    public onTileResizeStart(tile: Tile): void {
        /* do nothing */
    }

    public onTileResize(tile: Tile): void {
        /* do nothing */
    }

    public onTileResizeOver(tile: Tile): void {
        debugObj(() => ["onTileResizeOver", {tile}]);
        if (Config.mouseAdjustLayout && tile.tileable) {
            this.engine.adjustLayout(tile);
            this.engine.arrangeScreen(tile.client.screen);
        } else if (!Config.mouseAdjustLayout)
            this.engine.enforceClientSize(tile);
    }

    public onTileGeometryChanged(tile: Tile): void {
        debugObj(() => ["onTileGeometryChanged", {tile}]);
        this.engine.enforceClientSize(tile);
    }

    // NOTE: accepts `null` to simplify caller. This event is a catch-all hack
    // by itself anyway.
    public onTileChanged(tile: Tile | null, comment?: string): void {
        if (!tile) return;
        debugObj(() => ["onTileChanged", {tile, comment}]);
        /* TODO: maybe a less brutal solution? */
        this.engine.arrange();
    }
}
