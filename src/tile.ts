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
    /* read-only */
    public readonly  client: KWin.Client;

    public get actualGeometry(): Rect { return Rect.from(this.client.geometry); }
    public get class(): string { return String(this.client.resourceClass); }
    public get fullScreen(): boolean { return this.client.fullScreen; }
    public get modal(): boolean { return this.client.modal; }

    public get special(): boolean {
        return (
            this.client.specialWindow ||
            String(this.client.resourceClass) === "plasmashell"
        );
    }

    public get tileable(): boolean {
        return (
            (!this.client.fullScreen) &&
            (!this.float)
        );
    }

    public get utility(): boolean {
        return (this.client.dialog || this.client.splash || this.client.utility);
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
    private _geometry: Rect; // tslint:disable-line:variable-name
    private noBorder: boolean;

    constructor(client: KWin.Client) {
        this.client = client;

        this.error = false;
        this.float = false;
        this.floatGeometry = Rect.from(client.geometry);
        this.hideBorder = false;
        this.keepBelow = false;
        this.managed = false;

        this._geometry = Rect.from(client.geometry);
        this.noBorder = this.client.noBorder;
    }

    /*
     * Methods
     */

    public commit(reset?: boolean) {
        this.client.keepBelow = this.keepBelow;
        this.client.noBorder = (this.hideBorder) ? true : this.noBorder;

        /* do not commit geometry of non-tileable */
        if (!this.tileable) return;

        /* do not commit if not actually changed */
        if (!this.isGeometryChanged()) return;

        debugObj(() => ["commit", {tile: this, from: this.client.geometry, to: this._geometry}]);
        this.client.geometry = this._geometry.toQRect();
    }

    public isGeometryChanged(): boolean {
        return !this._geometry.equals(this.client.geometry);
    }

    public isVisible(screen: number): boolean {
        try {
            return (
                (!this.client.minimized) &&
                (this.client.desktop === workspace.currentDesktop
                    || this.client.desktop === -1 /* on all desktop */) &&
                (this.client.activities.length === 0 /* on all activities */
                    || this.client.activities.indexOf(workspace.currentActivity) !== -1) &&
                (this.client.screen === screen)
            );
        } catch (e) {
            this.error = true;
            return false;
        }
    }

    public toggleFloat() {
        this.float = !this.float;
        if (this.float === false)
            this.floatGeometry = Rect.from(this.client.geometry);
        else {
            this.client.noBorder = false;
            this.client.keepBelow = false;
            this.client.geometry = this.floatGeometry.toQRect();
        }
    }

    public toString(): string {
        return "Tile(id=" + this.client.windowId + ", class=" + this.class + ")";
    }

    /*
     * Private Methods
     */

    // TODO: move definition
    public adjustGeometry() {
        let width = this._geometry.width;
        let height = this._geometry.height;

        /* do not resize fixed-size windows */
        if (!this.client.resizeable) {
            width = this.client.geometry.width;
            height = this.client.geometry.height;
        } else {
            /* respect resize increment */
            if (!(this.client.basicUnit.width === 1 && this.client.basicUnit.height === 1)) /* NOT free-size */
                [width, height] = this.applyResizeIncrement();

            /* respect min/max size limit */
            width  = clip(width , this.client.minSize.width , this.client.maxSize.width );
            height = clip(height, this.client.minSize.height, this.client.maxSize.height);
        }

        this._geometry = new Rect(
            this._geometry.x,
            this._geometry.y,
            width,
            height,
        );
    }

    private applyResizeIncrement(): [number, number] {
        const unit = this.client.basicUnit;
        const base = this.client.minSize;
        const geom = this._geometry;

        const padWidth  = this.client.geometry.width  - this.client.clientSize.width;
        const padHeight = this.client.geometry.height - this.client.clientSize.height;

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
