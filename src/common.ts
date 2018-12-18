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
    SetLayout,
}

interface IRect {
    height: number;
    width: number;
    x: number;
    y: number;
}

class Rect implements IRect {
    public static from(rect: IRect) {
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

    public copyTo(other: IRect) {
        other.height = this.height;
        other.width = this.width;
        other.x = this.x;
        other.y = this.y;
    }

    public copyFrom(other: IRect) {
        this.set(other.x, other.y, other.width, other.height);
    }

    public equals(other: IRect) {
        return (
            this.x === other.x &&
            this.y === other.y &&
            this.width === other.width &&
            this.height === other.height
        );
    }

    public toQRect(): QRect {
        return Qt.rect(this.x, this.y, this.width, this.height);
    }

    public toString(): string {
        return "Rect(" + [this.x, this.y, this.width, this.height].join(", ") + ")";
    }
}

function clip(min: number, value: number, max: number): number {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
