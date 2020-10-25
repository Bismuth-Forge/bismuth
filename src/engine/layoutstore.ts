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
    public get currentLayout(): ILayout {
        return this.loadLayout(this.currentID);
    }

    private currentIndex: number | null;
    private currentID: string;
    private layouts: {[key: string]: ILayout};
    private previousID: string;
  
    constructor() {
        this.currentIndex = 0;
        this.currentID = CONFIG.layoutOrder[0];
        this.layouts = {};
        this.previousID = this.currentID;

        this.loadLayout(this.currentID);
    }

    public cycleLayout(step: -1 | 1): ILayout {
        this.previousID = this.currentID;
        this.currentIndex = (this.currentIndex !== null)
            ? wrapIndex(this.currentIndex + step, CONFIG.layoutOrder.length)
            : 0
            ;
        this.currentID = CONFIG.layoutOrder[this.currentIndex];
        return this.loadLayout(this.currentID);
    }

    public setLayout(targetID: string): ILayout {
        const targetLayout = this.loadLayout(targetID);
        if (targetLayout instanceof MonocleLayout
            && this.currentLayout instanceof MonocleLayout) {
            /* toggle Monocle "OFF" */
            this.currentID = this.previousID;
            this.previousID = targetID;
        } else if (this.currentID !== targetID) {
            this.previousID = this.currentID;
            this.currentID = targetID;
        }

        this.updateCurrentIndex();
        return targetLayout;
    }

    private updateCurrentIndex(): void {
        const idx = CONFIG.layoutOrder.indexOf(this.currentID);
        this.currentIndex = (idx === -1) ? null : idx;
    }

    private loadLayout(ID: string): ILayout {
        let layout = this.layouts[ID];
        if (!layout)
            layout = this.layouts[ID] = CONFIG.layoutFactories[ID]();
        return layout
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
