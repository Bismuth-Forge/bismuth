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

class StairLayout implements ILayout {
    public get enabled(): boolean {
        return CONFIG.enableStairLayout;
    }

    private space: number; /* in PIXELS */

    constructor() {
        this.space = 24;
    }

    public apply = (tiles: Window[], area: Rect): void => {
        const len = tiles.length;
        const space = this.space;

        // TODO: limit the maximum number of staired windows.

        for (let i = 0; i < len; i++) {
            const dx = space * (len - i - 1);
            const dy = space * i;
            tiles[i].geometry = new Rect(
                area.x + dx,
                area.y + dy,
                area.width - dx,
                area.height - dy,
            );
        }
    }

    public handleUserInput(input: UserInput) {
        switch (input) {
            case UserInput.Decrease:
                // TODO: define arbitrary constants
                this.space = Math.max(16, this.space - 8);
                break;
            case UserInput.Increase:
                // TODO: define arbitrary constants
                this.space = Math.min(160, this.space + 8);
                break;
            default:
                return false;
        }
        return true;
    }

    public toString(): string {
        return "StairLayout(" + this.space + ")";
    }
}
