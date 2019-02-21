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

class WindowResizeDelta {
    public readonly diff: Rect;
    public readonly east: number;
    public readonly west: number;
    public readonly south: number;
    public readonly north: number;

    public constructor(window: Window) {
        this.diff = window.actualGeometry.subtract(window.geometry);
        this.east = this.diff.width + this.diff.x;
        this.west = -this.diff.x;
        this.south = this.diff.height + this.diff.y;
        this.north = -this.diff.y;
    }

    public toString(): string {
        return "WindowResizeDelta(" + [
            "diff=" + this.diff,
            "east=" + this.east,
            "west=" + this.west,
            "north=" + this.north,
            "south=" + this.south,
        ].join(" ") + ")";
    }
}

class Window {
    public static clientToId(client: KWin.Client): string {
        return String(client);
    }

    /* read-only */
    public readonly id: string;

    public get actualGeometry(): Rect { return Rect.from(this._client.geometry); }
    public get screen(): number { return this._client.screen; }

    public get context(): KWinContext {
        let activity;
        if (this._client.activities.length === 0)
            activity = workspace.currentActivity;
        else if (this._client.activities.indexOf(workspace.currentActivity) >= 0)
            activity = workspace.currentActivity;
        else
            activity = this._client.activities[0];

        return new KWinContext(this._client.screen, activity, this._client.desktop);
    }

    public get ruleIgnored(): boolean {
        const resourceClass = String(this._client.resourceClass);
        return (
            this._client.specialWindow
            || resourceClass === "plasmashell"
            || (Config.ignoreClass.indexOf(resourceClass) >= 0)
            || (matchWords(this._client.caption, Config.ignoreTitle) >= 0)
        );
    }

    public get ruleFloat(): boolean {
        const resourceClass = String(this._client.resourceClass);
        return (
            this._client.modal
            || (Config.floatUtility
                && (this._client.dialog || this._client.splash || this._client.utility))
            || (Config.floatingClass.indexOf(resourceClass) >= 0)
            || (matchWords(this._client.caption, Config.floatingTitle) >= 0)
        );
    }

    public get tileable(): boolean {
        return (
            (!this._client.fullScreen) &&
            (!this.float)
        );
    }

    /* read-write */
    public floatGeometry: Rect;
    public hideBorder: boolean;
    public keepBelow: boolean;
    public managed: boolean;

    public get float(): boolean { return this._float; }
    public set float(value: boolean) {
        if (this._float === value)
            return;

        this._float = value;
        if (this._float === true) {
            /* HACK: necessary to prevent geometry reset bug in KWin */
            this._client.noBorder = false;

            this._client.geometry = this.floatGeometry.toQRect();
            this.keepBelow = false;
        } else
            this.floatGeometry = this.actualGeometry;
    }

    public get geometry(): Rect { return this._geometry; }
    public set geometry(value: Rect) {
        this._geometry = value;
        this.adjustGeometry();
    }

    /* private */
    private readonly _client: KWin.Client;
    private readonly _noBorder: boolean;
    private _float: boolean;
    private _geometry: Rect;

    constructor(client: KWin.Client) {
        this.id = Window.clientToId(client);

        this.floatGeometry = Rect.from(client.geometry);
        this.hideBorder = false;
        this.keepBelow = false;
        this.managed = false;

        this._client = client;
        this._noBorder = this._client.noBorder;
        this._float = false;
        this._geometry = Rect.from(client.geometry);
    }

    /*
     * Methods
     */

    public activate() {
        workspace.activeClient = this._client;
    }

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

    public commit(reset?: boolean) {
        this._client.keepBelow = this.keepBelow;
        this._client.noBorder = (this.hideBorder) ? true : this._noBorder;

        /* commit only if tiled window is changed in size */
        if (this.tileable && !this.actualGeometry.equals(this.geometry)) {
            debugObj(() => ["commit", {window: this, from: this._client.geometry, to: this._geometry}]);
            this._client.geometry = this._geometry.toQRect();
        }
    }

    public visible(ctx: KWinContext): boolean {
        return (
            (!this._client.minimized)
            && (ctx.includes(this._client))
        );
    }

    public toString(): string {
        return "Window(id=" + this._client.windowId + ", class=" + this._client.resourceClass + ")";
    }

    /*
     * Private Methods
     */

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
