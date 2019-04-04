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

function stackTiles(tiles: Window[], area: Rect, gap = 0) {
    if (tiles.length === 1) {
        tiles[0].geometry = area;
        return;
    }

    const count = tiles.length;
    const tileHeight = (area.height + gap) / count - gap;
    tiles.forEach((window: Window, i: number) => {
        window.geometry = new Rect(
            area.x,
            area.y + Math.floor(i * (tileHeight + gap)),
            area.width,
            Math.floor(tileHeight),
        );
    });
}

function stackTilesWithWeight(tiles: Window[], area: Rect, weights: number[], gap = 0) {
    let wsum = 0;
    tiles.forEach((tile, i) => {
        wsum += (weights[i] !== undefined) ? weights[i] : 1;
    });

    let wacc = 0;
    tiles.forEach((tile, i) => {
        const winy = area.y + area.height * wacc / wsum;
        const winh = area.height * weights[i] / wsum;

        tile.geometry = new Rect(area.x, winy, area.width, winh);
        wacc += weights[i];
    });
}
