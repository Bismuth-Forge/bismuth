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

interface ITile {
    /* read-only */
    readonly fullScreen: boolean;
    readonly managed: boolean;
    readonly modal: boolean;
    readonly tileable: boolean;
    readonly utility: boolean;
    readonly windowClass: boolean;

    /* read-write */
    float: boolean;
    floatGeometry: boolean;
    geometry: Rect;
    keepAbove: boolean;
    keepBelow: boolean;
    drawBorder: boolean;

    /* methods */
    commit(): void;
    setManaged(): void;
}

interface ITileEventHandler {
    onScreenCountChanged(count: number): void;
    onScreenResized(screen: number): void;

    onCurrentActivityChanged(activity: string): void;
    onCurrentDesktopChanged(desktop: number, tile: Tile): void;

    onTileAdded(tile: Tile): void;
    onTileRemoved(tile: Tile): void;
    onTileMoveStart(tile: Tile): void;
    onTileMove(tile: Tile): void;
    onTileMoveOver(tile: Tile): void;
    onTileResizeStart(tile: Tile): void;
    onTileResize(tile: Tile): void;
    onTileResizeOver(tile: Tile): void;
    onTileGeometryChanged(tile: Tile): void;
    onTileChanged(tile: Tile, comment?: string): void;
}

interface ITileMutator {
    setTileGeometry(tile: Tile, geometry: Rect): void;
}
