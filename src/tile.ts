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
    private padHeight: number;
    private padWidth: number;

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
        this.padWidth = 0;
        this.padHeight = 0;
    }

    /*
     * Methods
     */

    public applyGap(left: number, right: number, top: number, bottom: number) {
        this._geometry = new Rect(
            this._geometry.x + left,
            this._geometry.y + top,
            this._geometry.width - (left + right),
            this._geometry.height - (top + bottom),
        );
    }

    public commit(reset?: boolean) {
        this.client.keepBelow = this.keepBelow;
        this.client.noBorder = (this.hideBorder) ? true : this.noBorder;

        /* do not commit geometry of non-tileable */
        if (!this.tileable)
            return;

        /* do not commit if not actually changed */
        if (!this.isGeometryChanged()) return;
        debugObj(() => ["commitGeometry", {client: this.client, from: this.client.geometry, to: this._geometry}]);
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

        /* respect resize increment */
        const unit = this.client.basicUnit;
        if (!(unit.width === 1 && unit.height === 1)) /* NOT free-size */ {
            const geom = this._geometry;
            const base = this.client.minSize;

            const nw = Math.floor((geom.width  - base.width  - this.padWidth ) / unit.width);
            const nh = Math.floor((geom.height - base.height - this.padHeight) / unit.height);
            width  = base.width  + unit.width  * nw;
            height = base.height + unit.height * nh;
            if (!this.noBorder) {
                this.adjustPadding();
                width += this.padWidth;
                height += this.padHeight;
            }

            const pw = this.padWidth;
            const ph = this.padHeight;
            debugObj(() => ["adjustGometry/unit", {geom, base, unit, pw, ph}]);
        }

        /* do not resize fixed-size windows */
        if (!this.client.resizeable) {
            width = this.client.geometry.width;
            height = this.client.geometry.height;
        }

        /* respect min/max size limit */
        width  = clip(width , this.client.minSize.width , this.client.maxSize.width );
        height = clip(height, this.client.minSize.height, this.client.maxSize.height);

        this._geometry = new Rect(
            this._geometry.x,
            this._geometry.y,
            width,
            height,
        );
    }

    private adjustPadding() {
        const size = this.client.clientSize;
        this.padWidth = this.client.geometry.width - size.width;
        this.padHeight = this.client.geometry.height - size.height;
        debugObj(() => ["adjustPadding", {size, w: this.padWidth, h: this.padHeight}]);
    }

}
