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

class KWinSurface implements ISurface {
    public readonly screen: number;
    public readonly activity: string;
    public readonly desktop: number;

    private _path: string | null;

    public get id(): string {
        if (!this._path) {
            this._path = String(this.screen);
            if (KWINCONFIG.layoutPerActivity)
                this._path += "@" + this.activity;
            if (KWINCONFIG.layoutPerDesktop)
                this._path += "#" + this.desktop;
        }
        return this._path;
    }

    public get ignore(): boolean {
        const activityName = activityInfo.activityName(this.activity);
        return (
            (KWINCONFIG.ignoreActivity.indexOf(activityName) >= 0)
            || (KWINCONFIG.ignoreScreen.indexOf(this.screen) >= 0)
        );
    }

    constructor(screen: number, activity: string, desktop: number) {
        this.screen = screen;
        this.activity = activity;
        this.desktop = desktop;

        this._path = null;
    }

    public toString(): string {
        return "KWinCtx(" + [this.screen, activityInfo.activityName(this.activity), this.desktop].join(", ") + ")";
    }
}
