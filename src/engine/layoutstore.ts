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
            new ThreeColumnLayout(),
            new SpreadLayout(),
            new StairLayout(),
            new QuarterLayout(),
            new FloatingLayout(CONFIG.enableFloatingLayout),
        ];
    }

    public cycleLayout(): ILayout | null {
        const start = this.layouts[0];
        for (;;) {
            this.layouts.push(this.layouts.shift() as ILayout);
            if (this.layouts[0].enabled)
                return this.layouts[0];
            if (this.layouts[0] === start)
                return null;
        }
    }

    public setLayout(cls: any): ILayout | null {
        const result = this.layouts.filter((lo) =>
            lo.enabled && (lo instanceof cls));
        if (result.length === 0)
            return null;
        const layout = result[0];

        while (this.layouts[0] !== layout)
            this.layouts.push(this.layouts.shift() as ILayout);
        return this.layouts[0];
    }
}

class LayoutStore {
    private store: { [key: string]: LayoutStoreEntry  };

    constructor() {
        this.store = {};
    }

    public getCurrentLayout(srf: ISurface): ILayout {
        return (srf.ignore)
            ? FloatingLayout.instance
            : this.getEntry(srf.id).currentLayout;
    }

    public cycleLayout(srf: ISurface): ILayout | null {
        if (srf.ignore)
            return null;
        return this.getEntry(srf.id).cycleLayout();
    }

    public setLayout(srf: ISurface, cls: any): ILayout | null {
        if (srf.ignore)
            return null;
        return this.getEntry(srf.id).setLayout(cls);
    }

    private getEntry(key: string): LayoutStoreEntry {
        if (!this.store[key])
            this.store[key] = new LayoutStoreEntry();
        return this.store[key];
    }
}
