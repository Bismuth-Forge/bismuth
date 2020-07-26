// Copyright (c) 2018-2020 Eon S. Jeon <esjeon@hyunmu.am>
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


interface ILayoutPart {
    adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void;
    apply(area: Rect, tiles: Window[]): Rect[];
}

class FillLayoutPart implements ILayoutPart {
    public adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void {
        /* do nothing */
    }

    public apply(area: Rect, tiles: Window[]): Rect[] {
        return tiles.map((tile) => {
            return area;
        });
    }
}

class HalfSplitLayoutPart<L extends ILayoutPart, R extends ILayoutPart> implements ILayoutPart {
    /** the rotation angle for this part.
     *
     *    | angle | direction  | primary |
     *    | ----- | ---------- | ------- |
     *    |     0 | horizontal | left    |
     *    |    90 | vertical   | top     |
     *    |   180 | horizontal | right   |
     *    |   270 | vertical   | bottom  |
     */
    public angle: 0 | 90 | 180 | 270;

    public gap: number;
    public primarySize: number;
    public ratio: number;

    private get horizontal(): boolean {
        return this.angle === 0 || this.angle === 180;
    }

    private get reversed(): boolean {
        return this.angle === 180 || this.angle === 270;
    }

    constructor(
        public primary: L,
        public secondary: R,
    ) {
        this.angle = 0;
        this.gap = 0;
        this.primarySize = 1;
        this.ratio = 0.5;
    }

    public adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void {
        const basisIndex = tiles.indexOf(basis);
        if (basisIndex < 0)
            return;

        if (tiles.length <= this.primarySize) {
            /* primary only */
            this.primary.adjust(area, tiles, basis, delta);
        } else if (this.primarySize === 0) {
            /* secondary only */
            this.secondary.adjust(area, tiles, basis, delta);
        } else {
            /* both parts */

            /** which part to adjust. 0 = primary, 1 = secondary */
            const targetIndex = (basisIndex < this.primarySize) ? 0 : 1;

            this.ratio = LayoutUtils.adjustAreaHalfWeights(
                area,
                (this.reversed) ? 1 - this.ratio: this.ratio,
                this.gap,
                targetIndex,
                delta,
                this.horizontal,
            );
            if (this.reversed)
                this.ratio = 1 - this.ratio;

            if (targetIndex === /* primary */ 0) {
               this.primary.adjust(area, tiles.slice(0, this.primarySize), basis, delta);
            } else {
               this.secondary.adjust(area, tiles.slice(this.primarySize), basis, delta);
            }
        }
    }

    public apply(area: Rect, tiles: Window[]): Rect[] {
        if (tiles.length <= this.primarySize) {
            /* primary only */
            return this.primary.apply(area, tiles);
        } else if (this.primarySize === 0) {
            /* secondary only */
            return this.secondary.apply(area, tiles);
        } else {
            /* both parts */
            const ratio = (this.reversed) ? 1 - this.ratio: this.ratio;
            const [primaryArea, secondaryArea] = LayoutUtils.splitAreaHalfWeighted(area, ratio, this.gap, this.horizontal);
            const primaryResult = this.primary.apply(primaryArea, tiles.slice(0, this.primarySize));
            const secondaryResult = this.secondary.apply(secondaryArea, tiles.slice(this.primarySize));
            return primaryResult.concat(secondaryResult);
        }
    }
}

class StackLayoutPart implements ILayoutPart {
    public gap: number;

    constructor() {
        this.gap = 0;
    }

    public adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void {
        const weights = LayoutUtils.adjustAreaWeights(
            area,
            tiles.map((tile) => tile.weight),
            CONFIG.tileLayoutGap,
            tiles.indexOf(basis),
            delta
        );

        weights.forEach((weight, i) => {
            tiles[i].weight = weight * tiles.length;
        });
    }
 
    public apply(area: Rect, tiles: Window[]): Rect[] {
        const weights = tiles.map((tile) => tile.weight);
        return LayoutUtils.splitAreaWeighted(area, weights, this.gap);
    }
}

class RotateLayoutPart<T extends ILayoutPart> implements ILayoutPart {
    constructor(
        public inner: T,
        public angle: 0 | 90 | 180 | 270 = 0,
    ) {
    }

    public adjust(area: Rect, tiles: Window[], basis: Window, delta: RectDelta): void {
        switch (this.angle) {
            case 0  : break;
            case 90 :
                area = new Rect(area.y, area.x, area.height, area.width);
                delta = new RectDelta(delta.south, delta.north, delta.east, delta.west); break;
            case 180:
                delta = new RectDelta(delta.west, delta.east, delta.south, delta.north); break;
            case 270:
                area = new Rect(area.y, area.x, area.height, area.width);
                delta = new RectDelta(delta.north, delta.south, delta.east, delta.west); break;
        }

        this.inner.adjust(area, tiles, basis, delta);
    }

    public apply(area: Rect, tiles: Window[]): Rect[] {
        switch (this.angle) {
            case 0  : break;
            case 90 : area = new Rect(area.y, area.x, area.height, area.width); break;
            case 180: break;
            case 270: area = new Rect(area.y, area.x, area.height, area.width); break;
        }

        const innerResult = this.inner.apply(area, tiles);

        switch (this.angle) {
            case 0:
                return innerResult;
            case 90:
                return innerResult.map((g) =>
                    new Rect(g.y, g.x, g.height, g.width));
            case 180:
                return innerResult.map((g) => {
                    const rx = g.x - area.x;
                    const newX = area.x + area.width - (rx + g.width);
                    return new Rect(newX, g.y, g.width, g.height)
                });
            case 270:
                return innerResult.map((g) => {
                    const rx = g.x - area.x;
                    const newY = area.x + area.width - (rx + g.width);
                    return new Rect(g.y, newY, g.height, g.width)
                });
        }
    }

    public rotate(amount: -90 | 90): void {
        // -90 | 0 | 90 | 180 | 270 | 360
        let angle = this.angle + amount;
        if (angle < 0)
            angle = 270;
        else if (angle >= 360)
            angle = 0;

        this.angle = angle as (0 | 90 | 180 | 270);
    }
}
