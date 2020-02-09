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
    public index: number | null;
    public key: string;
    public layouts: {[key: string]: ILayout};

    public get currentLayout(): ILayout {
        return (this.index === null)
            ? this.layouts[this.key]
            : this.layouts[CONFIG.layouts[this.index].classID]
            ;
    }

    constructor() {
        this.index = 0;
        this.key = CONFIG.layouts[0].classID;
        this.layouts = {};

        CONFIG.layouts.forEach((layout: ILayout) => {
            this.layouts[layout.classID] = layout.clone();
        });

        [
            TileLayout,
            MonocleLayout,
            ThreeColumnLayout,
            SpreadLayout,
            StairLayout,
            QuarterLayout,
            FloatingLayout,
        ].forEach((layoutClass: ILayoutClass) => {
            if (!this.layouts[layoutClass.id])
                this.layouts[layoutClass.id] = new layoutClass();
        });
    }

    public cycleLayout(step: -1 | 1): ILayout {
        this.index = (this.index !== null)
            ? wrapIndex(this.index + step, CONFIG.layouts.length)
            : 0
            ;
        return this.currentLayout;
    }

    public setLayout(classID: string): ILayout {
        const layout = this.layouts[classID];
        if (!layout)
            return this.currentLayout;

        this.key = layout.classID;

        this.index = null;
        for (let i = 0; i < CONFIG.layouts.length; i ++) {
            if (CONFIG.layouts[i].classID === this.key) {
                this.index = i;
                break;
            }
        }
        return layout;
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

    public cycleLayout(srf: ISurface, step: 1 | -1): ILayout | null {
        if (srf.ignore)
            return null;
        return this.getEntry(srf.id).cycleLayout(step);
    }

    public setLayout(srf: ISurface, layoutClassID: string): ILayout | null {
        if (srf.ignore)
            return null;
        return this.getEntry(srf.id).setLayout(layoutClassID);
    }

    private getEntry(key: string): LayoutStoreEntry {
        if (!this.store[key])
            this.store[key] = new LayoutStoreEntry();
        return this.store[key];
    }
}
