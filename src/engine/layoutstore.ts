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

class LayoutStoreEntry {
    public layouts: ILayout[];

    public get currentLayout(): ILayout {
        if (this.layouts[0].enabled)
            return this.layouts[0];

        this.cycleLayout();
        if (this.layouts[0].enabled)
            return this.layouts[0];
        return FloatingLayout.instance;
    }

    constructor() {
        this.layouts = [
            new TileLayout(),
            new MonocleLayout(),
            new SpreadLayout(),
            new StairLayout(),
            new QuarterLayout(),
        ];
    }

    public cycleLayout() {
        const start = this.layouts[0];
        for (;;) {
            this.layouts.push(this.layouts.shift() as ILayout);
            if (this.layouts[0].enabled)
                break;
            if (this.layouts[0] === start)
                break;
        }
    }

    public setLayout(cls: any) {
        const result = this.layouts.filter((lo) =>
            lo.enabled && (lo instanceof cls));
        if (result.length === 0)
            return;
        const layout = result[0];

        while (this.layouts[0] !== layout)
            this.layouts.push(this.layouts.shift() as ILayout);
    }
}

class LayoutStore {
    private store: { [key: string]: LayoutStoreEntry  };

    constructor() {
        this.store = {};
    }

    public getCurrentLayout(ctx: IDriverContext): ILayout {
        return (ctx.ignore)
            ? FloatingLayout.instance
            : this.getEntry(ctx.id).currentLayout;
    }

    public cycleLayout(ctx: IDriverContext) {
        if (ctx.ignore)
            return;
        this.getEntry(ctx.id).cycleLayout();
    }

    public setLayout(ctx: IDriverContext, cls: any) {
        if (ctx.ignore)
            return;
        this.getEntry(ctx.id).setLayout(cls);
    }

    private getEntry(key: string): LayoutStoreEntry {
        if (!this.store[key])
            this.store[key] = new LayoutStoreEntry();
        return this.store[key];
    }
}

try {
    exports.LayoutStore = LayoutStore;
    exports.LayoutStoreEntry = LayoutStoreEntry;
} catch (e) { /* ignore */ }
