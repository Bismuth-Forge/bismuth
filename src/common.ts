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

class Config {
    public static enableMonocleLayout: boolean;
    public static enableSpreadLayout: boolean;
    public static enableStairLayout: boolean;
    public static enableTileLayout: boolean;
    public static floatingClass: string[];
    public static ignoreClass: string[];
}

enum UserInput {
    Left,
    Right,
    Up,
    Down,

    ShiftLeft,
    ShiftRight,
    ShiftUp,
    ShiftDown,

    Increase,
    Decrease,

    Float,
    SetMaster,
    CycleLayout,
}

class Rect {
    public static zero(): Rect {
        return new Rect(0, 0, 0, 0);
    }

    public static from(rect: Rect | QRect) {
        return new Rect(rect.x, rect.y, rect.width, rect.height);
    }

    public height: number;
    public width: number;
    public x: number;
    public y: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.height = h;
        this.width = w;
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number, w: number, h: number) {
        this.height = h;
        this.width = w;
        this.x = x;
        this.y = y;
    }

    public clone(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    public copyTo(other: Rect) {
        other.height = this.height;
        other.width = this.width;
        other.x = this.x;
        other.y = this.y;
    }

    public copyFrom(other: Rect | QRect) {
        this.height = other.height;
        this.width = other.width;
        this.x = other.x;
        this.y = other.y;
    }
}

/*
 * Debuging facility
 */

declare var console: any;

const DEBUG = false;
function debug(f: () => any) {
    if (!DEBUG) return;
    const ret = f();

    // tslint:disable-next-line
    console.log(ret);
}
