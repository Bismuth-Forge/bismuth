// Copyright (c) 2018 Eon S. Jeon <esjeon@hyunmu.am>
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
    public arrangeCount: number;
    public client: KWin.Client;
    public floatGeometry: Rect;
    public floating: boolean;
    public geometry: Rect;
    public isError: boolean;

    constructor(client: KWin.Client) {
        this.arrangeCount = 0;
        this.client = client;
        this.floatGeometry = Rect.from(client.geometry);
        this.floating = false;
        this.geometry = Rect.from(client.geometry);
        this.isError = false;
    }

    /*
     * Attributes
     */

    public get isFullScreen(): boolean {
        return this.client.fullScreen;
    }

    public get isTileable(): boolean {
        return (
            (!this.client.fullScreen) &&
            (!this.floating)
        );
    }

    public get isUtility(): boolean {
        return (this.client.dialog || this.client.splash || this.client.utility);
    }

    public get clientGeometry(): IRect {
        return this.client.geometry;
    }

    public set keepAbove(value: boolean) {
        this.client.keepAbove = value;
    }

    public set keepBelow(value: boolean) {
        this.client.keepBelow = value;
    }

    public set noBorder(value: boolean) {
        this.client.noBorder = value;
    }

    /*
     * Methods
     */

    public commitGeometry(reset?: boolean) {
        if (this.floating) {
            this.floatGeometry.copyTo(this.client.geometry);
            return;
        }

        /* HACK: prevent infinite `geometryChanged`. */
        this.arrangeCount = (!!reset) ? 0 : this.arrangeCount + 1;
        if (this.arrangeCount > 5) // TODO: define arbitrary constant
            return;

        /* do not commit if not changed */
        if (this.clientGeometry.x === this.geometry.x)
        if (this.clientGeometry.y === this.geometry.y)
        if (this.clientGeometry.width === this.geometry.width)
        if (this.clientGeometry.height === this.geometry.height) {
            this.arrangeCount = 0;
            return;
        }

        /* do not resize fixed-size windows */
        if (!this.client.resizeable) {
            this.geometry.width = this.clientGeometry.width;
            this.geometry.height = this.clientGeometry.height;
        }

        /* respect min/max size limit */
        this.geometry.width  = clip(this.client.minSize.width , this.geometry.width , this.client.maxSize.width );
        this.geometry.height = clip(this.client.minSize.height, this.geometry.height, this.client.maxSize.height);

        this.geometry.copyTo(this.client.geometry);
    }

    public isVisible(screenId: number): boolean {
        return (
            (!this.client.minimized) &&
            (this.client.desktop === workspace.currentDesktop
                || this.client.desktop === -1 /* on all desktop */) &&
            (this.client.activities.length === 0 /* on all activities */
                || this.client.activities.indexOf(workspace.currentActivity) !== -1) &&
            (this.client.screen === screenId)
        );
    }

    public toggleFloat() {
        this.floating = !this.floating;
        if (this.floating === false)
            this.floatGeometry.copyFrom(this.client.geometry);
    }
}
