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

    public getCurrentLayout(screen: number, activity: string, desktop: number): ILayout {
        const key = this.keygen(screen, activity, desktop);

        if (!this.store[key])
            this.initEntry(key);

        // TODO: if no layout, return floating layout, which is a static object.
        return this.store[key][0];
    }

    public cycleLayout(screen: number, activity: string, desktop: number) {
        const key = this.keygen(screen, activity, desktop);

        const entry = this.store[key];
        if (!entry) {
            this.initEntry(key);
            return;
        }

        for (;;) {
            const layout = entry.shift();
            if (!layout)
                return;

            entry.push(layout);

            if (entry[0].isEnabled())
                break;
        }
    }

    private keygen(screen: number, activity: string, desktop: number): string {
        let key = String(screen);

        if (Config.layoutPerActivity)
            key += "@" + activity;
        if (Config.layoutPerDesktop)
            key += "#" + desktop;

        return key;
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
