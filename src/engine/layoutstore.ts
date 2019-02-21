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

class LayoutStore {
    private store: { [key: string]: ILayout[] };

    constructor() {
        this.store = {};
    }

    public getCurrentLayout(ctx: KWinContext): ILayout | null {
        if (ctx.ignore)
            return null;

        const entry = this.getEntry(ctx.id);

        // TODO: if no layout, return floating layout, which is a static object.
        return entry[0];
    }

    public cycleLayout(ctx: KWinContext) {
        if (ctx.ignore)
            return null;

        const entry = this.getEntry(ctx.id);
        for (;;) {
            const layout = entry.shift();
            if (!layout)
                return;

            entry.push(layout);

            if (entry[0].enabled)
                break;
        }
    }

    public setLayout(ctx: KWinContext, cls: any) {
        if (ctx.ignore)
            return;

        const entry = this.getEntry(ctx.id);
        const result = entry.filter((l) => l instanceof cls);
        if (result.length === 0)
            return;

        const layout = result[0];
        if (!layout.enabled)
            return;

        const idx = entry.indexOf(layout);
        entry.push(...entry.splice(0, idx));
    }

    private getEntry(key: string): ILayout[] {
        if (!this.store[key])
            this.initEntry(key);
        return this.store[key];
    }

    private initEntry(key: string) {
        const entry = [];
        // TODO: user config
        entry.push(new TileLayout());
        entry.push(new MonocleLayout());
        entry.push(new SpreadLayout());
        entry.push(new StairLayout());
        entry.push(new QuarterLayout());

        this.store[key] = entry;
    }
}
