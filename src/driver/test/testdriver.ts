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

class TestDriver {
    public currentScreen: number;
    public currentWindow: number;
    public numScreen: number;
    public screenSize: Rect;
    public windows: Window[];

    constructor() {
        this.currentScreen = 0;
        this.currentWindow = 0;
        this.numScreen = 1;
        this.screenSize = new Rect(0, 0, 10000, 10000);
        this.windows = [];
    }

    public forEachScreen(func: (srf: ISurface) => void) {
        for (let screen = 0; screen < this.numScreen; screen ++)
            func(new TestSurface(this, screen));
    }

    public getCurrentContext(): ISurface {
        const window = this.getCurrentWindow();
        if (window)
            return window.surface;
        return new TestSurface(this, 0);
    }

    public getCurrentWindow(): Window | null {
        return (this.windows.length !== 0)
            ? this.windows[this.currentWindow]
            : null;
    }

    public getWorkingArea(srf: ISurface): Rect {
        return this.screenSize;
    }

    public setCurrentWindow(window: Window) {
        const idx = this.windows.indexOf(window);
        if (idx !== -1)
            this.currentWindow = idx;
    }

    public setTimeout(func: () => void, timeout: number) {
        setTimeout(func, timeout);
    }
}

class TestSurface implements ISurface {
    public readonly screen: number;

    public get id(): string {
        return String(this.screen);
    }

    public get ignore(): boolean {
        // TODO: optionally ignore some surface to test LayoutStore
        return false;
    }

    public get workingArea(): Rect {
        return this.driver.screenSize;
    }

    constructor(private driver: TestDriver, screen: number) {
        this.screen = screen;
    }

    public next(): ISurface {
        return new TestSurface(this.driver, this.screen + 1);
    }
}

class TestWindow implements IDriverWindow {
    private static windowCount: number = 0;

    public readonly id: string;
    public readonly shouldFloat: boolean;
    public readonly shouldIgnore: boolean;

    public surface: TestSurface;
    public fullScreen: boolean;
    public geometry: Rect;
    public keepBelow: boolean;
    public noBorder: boolean;

    constructor(srf: TestSurface, geometry?: Rect, ignore?: boolean, float?: boolean) {
        this.id = String(TestWindow.windowCount);
        TestWindow.windowCount += 1;

        this.shouldFloat = (float !== undefined) ? float : false;
        this.shouldIgnore = (ignore !== undefined) ? ignore : false;

        this.surface = srf;
        this.fullScreen = false;
        this.geometry = geometry || new Rect(0, 0, 100, 100);
        this.keepBelow = false;
        this.noBorder = false;
    }

    public commit(geometry?: Rect, noBorder?: boolean, keepBelow?: boolean) {
        if (geometry)
            this.geometry = geometry;
        if (noBorder !== undefined)
            this.noBorder = noBorder;
        if (keepBelow !== undefined)
            this.keepBelow = keepBelow;
    }

    public focus() {
        // TODO: track focus
    }

    public visible(srf: ISurface): boolean {
        const tctx = srf as TestSurface;
        return this.surface.screen === tctx.screen;
    }
}

function setTestConfig(name: string, value: any) {
    if (!CONFIG)
        CONFIG = {} as any;
    (CONFIG as any)[name] = value;
}
