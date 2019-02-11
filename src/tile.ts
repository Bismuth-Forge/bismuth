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

class TileResizeDelta {
    public readonly diff: Rect;
    public readonly east: number;
    public readonly west: number;
    public readonly south: number;
    public readonly north: number;

    public constructor(tile: Tile) {
        this.diff = tile.actualGeometry.subtract(tile.geometry);
        this.east = this.diff.width + this.diff.x;
        this.west = -this.diff.x;
        this.south = this.diff.height + this.diff.y;
        this.north = -this.diff.y;
    }

    public toString(): string {
        return "TileResizeDelta(" + [
            "diff=" + this.diff,
            "east=" + this.east,
            "west=" + this.west,
            "north=" + this.north,
            "south=" + this.south,
        ].join(" ") + ")";
    }
}

class Tile {
    public static clientToId(client: KWin.Client): string {
        return String(client);
    }

    /* read-only */
    public readonly id: string;

    public get actualGeometry(): Rect { return Rect.from(this._client.geometry); }
    public get className(): string { return String(this._client.resourceClass); }
    public get modal(): boolean { return this._client.modal; }
    public get screen(): number { return this._client.screen; }
    public get title(): string { return String(this._client.caption); }

    public get special(): boolean {
        return (
            this._client.specialWindow ||
            String(this._client.resourceClass) === "plasmashell"
        );
    }

    public get tileable(): boolean {
        return (
            (!this._client.fullScreen) &&
            (!this.float)
        );
    }

    public get utility(): boolean {
        return (this._client.dialog || this._client.splash || this._client.utility);
    }

    /* read-write */
    public error: boolean;
    public float: boolean;
    public floatGeometry: Rect;
    public hideBorder: boolean;
    public keepBelow: boolean;
    public managed: boolean;

    public get geometry(): Rect {
        return this._geometry;
    }

    public set geometry(value: Rect) {
        this._geometry = value;
        this.adjustGeometry();
    }

    /* private */
    private readonly _client: KWin.Client;
    private readonly _noBorder: boolean;
    private _geometry: Rect;

    constructor(client: KWin.Client) {
        this.id = Tile.clientToId(client);

        this.error = false;
        this.float = false;
        this.floatGeometry = Rect.from(client.geometry);
        this.hideBorder = false;
        this.keepBelow = false;
        this.managed = false;

        this._client = client;
        this._geometry = Rect.from(client.geometry);
        this._noBorder = this._client.noBorder;
    }

    /*
     * Methods
     */

    public commit(reset?: boolean) {
        this._client.keepBelow = this.keepBelow;
        this._client.noBorder = (this.hideBorder) ? true : this._noBorder;

        /* do not commit geometry of non-tileable */
        if (!this.tileable) return;

        /* do not commit if not actually changed */
        if (!this.isGeometryChanged()) return;

        debugObj(() => ["commit", {tile: this, from: this._client.geometry, to: this._geometry}]);
        this._client.geometry = this._geometry.toQRect();
    }

    public isGeometryChanged(): boolean {
        return !this._geometry.equals(this._client.geometry);
    }

    public isVisible(screen: number): boolean {
        try {
            return (
                (!this._client.minimized) &&
                (this._client.desktop === workspace.currentDesktop
                    || this._client.desktop === -1 /* on all desktop */) &&
                (this._client.activities.length === 0 /* on all activities */
                    || this._client.activities.indexOf(workspace.currentActivity) !== -1) &&
                (this._client.screen === screen)
            );
        } catch (e) {
            this.error = true;
            return false;
        }
    }

    public activate() {
        workspace.activeClient = this._client;
    }

    public toggleFloat() {
        this.float = !this.float;
        if (this.float === false)
            this.floatGeometry = Rect.from(this._client.geometry);
        else {
            /* HACK: necessary to prevent geometry reset bug in KWin */
            this._client.noBorder = false;
            this._client.geometry = this.floatGeometry.toQRect();
            this.keepBelow = false;
        }
    }

    public toString(): string {
        return "Tile(id=" + this._client.windowId + ", class=" + this.className + ")";
    }

    /*
     * Private Methods
     */

    // TODO: move definition
    public adjustGeometry() {
        let width = this._geometry.width;
        let height = this._geometry.height;

        /* do not resize fixed-size windows */
        if (!this._client.resizeable) {
            width = this._client.geometry.width;
            height = this._client.geometry.height;
        } else {
            /* respect resize increment */
            if (!(this._client.basicUnit.width === 1 && this._client.basicUnit.height === 1)) /* NOT free-size */
                [width, height] = this.applyResizeIncrement();

            /* respect min/max size limit */
            width  = clip(width , this._client.minSize.width , this._client.maxSize.width );
            height = clip(height, this._client.minSize.height, this._client.maxSize.height);
        }

        this._geometry = new Rect(
            this._geometry.x,
            this._geometry.y,
            width,
            height,
        );
    }

    private applyResizeIncrement(): [number, number] {
        const unit = this._client.basicUnit;
        const base = this._client.minSize;
        const geom = this._geometry;

        const padWidth  = this._client.geometry.width  - this._client.clientSize.width;
        const padHeight = this._client.geometry.height - this._client.clientSize.height;

        const quotWidth  = Math.floor((geom.width  - base.width  - padWidth ) / unit.width);
        const quotHeight = Math.floor((geom.height - base.height - padHeight) / unit.height);

        const newWidth  = base.width  + unit.width  * quotWidth  + padWidth ;
        const newHeight = base.height + unit.height * quotHeight + padHeight;

        debugObj(() => ["applyResizeIncrement", {
            // tslint:disable-next-line:object-literal-sort-keys
            unit, base, geom,
            pad: [padWidth, padHeight].join("x"),
            size: [newWidth, newHeight].join("x"),
        }]);

        return [newWidth, newHeight];
    }

}
