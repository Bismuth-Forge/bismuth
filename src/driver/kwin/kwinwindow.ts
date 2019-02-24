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

class KWinWindow implements IDriverWindow {
    public static generateID(client: KWin.Client) {
        return String(client) + "/" + client.windowId;
    }

    public readonly client: KWin.Client;
    public readonly id: string;

    public get context(): IDriverContext {
        let activity;
        if (this.client.activities.length === 0)
            activity = workspace.currentActivity;
        else if (this.client.activities.indexOf(workspace.currentActivity) >= 0)
            activity = workspace.currentActivity;
        else
            activity = this.client.activities[0];

        return new KWinContext(this.client.screen, activity, this.client.desktop);
    }

    public get fullScreen(): boolean {
        return this.client.fullScreen;
    }

    public get geometry(): Rect {
        return toRect(this.client.geometry);
    }

    private readonly _bakNoBorder: boolean;

    constructor(client: KWin.Client) {
        this.client = client;
        this.id = KWinWindow.generateID(client);
        this._bakNoBorder = client.noBorder;
    }

    public commit(geometry?: Rect, noBorder?: boolean, keepBelow?: boolean) {
        if (noBorder !== undefined)
            this.client.noBorder = noBorder || this._bakNoBorder;

        if (keepBelow !== undefined)
            this.client.keepBelow = keepBelow;

        if (geometry !== undefined)
            this.client.geometry = toQRect(this.adjustGeometry(geometry));
    }

    public shouldIgnore(): boolean {
        const resourceClass = String(this.client.resourceClass);
        return (
            this.client.specialWindow
            || resourceClass === "plasmashell"
            || (KWINCONFIG.ignoreClass.indexOf(resourceClass) >= 0)
            || (matchWords(this.client.caption, KWINCONFIG.ignoreTitle) >= 0)
        );
    }

    public shouldFloat(): boolean {
        const resourceClass = String(this.client.resourceClass);
        return (
            this.client.modal
            || (KWINCONFIG.floatUtility
                && (this.client.dialog || this.client.splash || this.client.utility))
            || (KWINCONFIG.floatingClass.indexOf(resourceClass) >= 0)
            || (matchWords(this.client.caption, KWINCONFIG.floatingTitle) >= 0)
        );
    }

    public toString(): string {
        /* using a shorthand name to keep debug message tidy */
        return "KWin(" + this.client.windowId.toString(16) + "." + this.client.resourceClass + ")";
    }

    public visible(dctx: IDriverContext): boolean {
        const ctx = dctx as KWinContext;
        return (
            (!this.client.minimized)
            && (this.client.desktop === ctx.desktop
                || this.client.desktop === -1 /* on all desktop */)
            && (this.client.activities.length === 0 /* on all activities */
                || this.client.activities.indexOf(ctx.activity) !== -1)
            && (this.client.screen === ctx.screen)
        );
    }

    //#region Private Methods

    private adjustGeometry(geometry: Rect): Rect {
        let width = geometry.width;
        let height = geometry.height;

        /* do not resize fixed-size windows */
        if (!this.client.resizeable) {
            width = this.client.geometry.width;
            height = this.client.geometry.height;
        } else {
            /* respect resize increment */
            if (!(this.client.basicUnit.width === 1 && this.client.basicUnit.height === 1)) /* NOT free-size */
                [width, height] = this.applyResizeIncrement(geometry);

            /* respect min/max size limit */
            width  = clip(width , this.client.minSize.width , this.client.maxSize.width );
            height = clip(height, this.client.minSize.height, this.client.maxSize.height);
        }

        return new Rect(geometry.x, geometry.y, width, height);
    }

    private applyResizeIncrement(geom: Rect): [number, number] {
        const unit = this.client.basicUnit;
        const base = this.client.minSize;

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

    //#endregion
}
