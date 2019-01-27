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

class QuarterLayout implements ILayout {
    private lhsplit: number;
    private rhsplit: number;
    private vsplit: number;

    public constructor() {
        this.lhsplit = 0.5;
        this.rhsplit = 0.5;
        this.vsplit = 0.5;
    }

    public apply(tiles: Tile[], area: Rect): void {
        if (tiles.length === 1) {
            tiles[0].geometry = area;
            return;
        }

        /* TODO: gap */
        const leftWidth = Math.floor(area.width * this.vsplit);
        const rightWidth = area.width - leftWidth;
        const rightX = leftWidth;
        if (tiles.length === 2) {
            tiles[0].geometry = new Rect(area.x, area.y, leftWidth , area.height);
            tiles[1].geometry = new Rect(rightX, area.y, rightWidth, area.height);
            return;
        }

        const rightTopHeight = Math.floor(area.height * this.rhsplit);
        const rightBottomHeight = area.height - rightTopHeight;
        const rightBottomY = rightTopHeight;
        if (tiles.length === 3) {
            tiles[0].geometry = new Rect(area.x, area.y      , leftWidth , area.height      );
            tiles[1].geometry = new Rect(rightX, area.y      , rightWidth, rightTopHeight   );
            tiles[2].geometry = new Rect(rightX, rightBottomY, rightWidth, rightBottomHeight);
            return;
        }

        const leftTopHeight = Math.floor(area.height * this.lhsplit);
        const leftBottomHeight = area.height - leftTopHeight;
        const leftBottomY = leftTopHeight;
        if (tiles.length === 4) {
            tiles[0].geometry = new Rect(area.x, area.y      , leftWidth , leftTopHeight    );
            tiles[1].geometry = new Rect(rightX, area.y      , rightWidth, rightTopHeight   );
            tiles[2].geometry = new Rect(rightX, rightBottomY, rightWidth, rightBottomHeight);
            tiles[3].geometry = new Rect(area.x, leftBottomY , leftWidth , leftBottomHeight );
            return;
        }
    }

    /* if true, layout completely overrides the default behavior */
    public handleUserInput(input: UserInput, data?: any): boolean {
        return false;
    }

    public isEnabled(): boolean {
        // TODO: config
        return true;
    }

    public toString(): string {
        return "QuarterLayout()";
    }
}
