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

class SpreadLayout implements ILayout {
    public get enabled(): boolean {
        return CONFIG.enableSpreadLayout;
    }

    private space: number; /* in ratio */

    constructor() {
        this.space = 0.07;
    }

    public apply = (tiles: Window[], area: Rect): void => {
        let numTiles = tiles.length;
        const spaceWidth = Math.floor(area.width * this.space);
        let cardWidth = area.width - (spaceWidth * (numTiles - 1));

        // TODO: define arbitrary constants
        const miniumCardWidth = area.width * 0.40;
        while (cardWidth < miniumCardWidth) {
            cardWidth += spaceWidth;
            numTiles -= 1;
        }

        for (let i = 0; i < tiles.length; i++)
            tiles[i].geometry = new Rect(
                area.x + ((i < numTiles) ? spaceWidth * (numTiles - i - 1) : 0),
                area.y,
                cardWidth,
                area.height,
            );
    }

    public handleUserInput(input: UserInput) {
        switch (input) {
            case UserInput.Decrease:
                // TODO: define arbitrary constants
                this.space = Math.max(0.04, this.space - 0.01);
                break;
            case UserInput.Increase:
                // TODO: define arbitrary constants
                this.space = Math.min(0.10, this.space + 0.01);
                break;
            default:
                return false;
        }
        return true;
    }

    public toString(): string {
        return "SpreadLayout(" + this.space + ")";
    }
}

try {
    exports.SpreadLayout = SpreadLayout;
} catch (e) { /* ignore */ }
