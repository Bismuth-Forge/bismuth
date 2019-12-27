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

class LayoutUtils {
    /**
     * Splits a (virtual) line into weighted lines w/ gaps.
     * @param length    The length of the line to be splitted
     * @param weights   The weight of each part
     * @param gap       The size of gap b/w parts
     * @returns An array of extends of each parts: [begin, length]
     */
    public static splitWeighted(
        [begin, length]: [number, number],
        weights: number[],
        gap: number,
    ): Array<[number, number]> {
        gap = (gap !== undefined) ? gap : 0;

        const n = weights.length;
        const actualLength = length - (n - 1) * gap;
        const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

        let weightAcc = 0;
        return weights.map((weight, i) => {
            const partBegin = actualLength * weightAcc / weightSum + (i * gap);
            const partLength = actualLength * weight / weightSum;
            weightAcc += weight;
            return [begin + Math.floor(partBegin), Math.floor(partLength)];
        });
    }

    /**
     * Splits an area into multiple areas based on their weights.
     * @param area          The area to be splitted
     * @param weights       The weight of each parts
     * @param gap           The size of gaps b/w parts
     * @param horizontal    If true, split horizontally instead of vertically
     */
    public static splitAreaWeighted(area: Rect, weights: number[], gap?: number, horizontal?: boolean): Rect[] {
        gap = (gap !== undefined) ? gap : 0;
        horizontal = (horizontal !== undefined) ? horizontal : false;

        const line: [number, number] = (horizontal) ? [area.x, area.width] : [area.y, area.height];
        const parts = LayoutUtils.splitWeighted(line, weights, gap);

        return parts.map(([begin, length]) =>
            (horizontal)
                ? new Rect(begin, area.y, length, area.height)
                : new Rect(area.x, begin, area.width, length),
        );
    }

    public static splitAreaHalfWeighted(area: Rect, weight: number, gap?: number, horizontal?: boolean): Rect[] {
        return LayoutUtils.splitAreaWeighted(area, [weight, 1 - weight], gap, horizontal);
    }

    /**
     * adjustWeights recalculates the weights of subareas of the line, based on size change.
     * @param line      The line being aplitted
     * @param weights   The weight of each part
     * @param gap       The gap size b/w parts
     * @param target    The index of the part being changed.
     * @param deltaFw   The amount of growth towards the origin.
     * @param deltaBw   The amount of growth towards the infinity.
     */
    public static adjustWeights(
        [begin, length]: [number, number],
        weights: number[],
        gap: number,
        target: number,
        deltaFw: number,
        deltaBw: number,
    ): number[] {
        // TODO: configurable min length?
        const minLength = 1;

        const parts = this.splitWeighted([begin, length], weights, gap);
        const [targetBase, targetLength] = parts[target];

        /* apply backward delta */
        if (target > 0 && deltaBw !== 0) {
            const neighbor = target - 1;
            const [neighborBase, neighborLength] = parts[neighbor];

            /* limit delta to prevent squeezing windows */
            const delta = clip(deltaBw,
                minLength - targetLength,
                neighborLength - minLength,
            );

            parts[target] = [(targetBase - delta), (targetLength + delta)];
            parts[neighbor] = [neighborBase, (neighborLength - delta)];
        }

        /* apply forward delta */
        if (target < parts.length - 1 && deltaFw !== 0) {
            const neighbor = target + 1;
            const [neighborBase, neighborLength] = parts[neighbor];

            /* limit delta to prevent squeezing windows */
            const delta = clip(deltaFw,
                minLength - targetLength,
                neighborLength - minLength,
            );

            parts[target] = [targetBase, targetLength + delta];
            parts[neighbor] = [neighborBase + delta, neighborLength - delta];
        }

        return LayoutUtils.calculateWeights(parts);
    }

    /**
     * adjustAreaWeights recalculates weights of subareas splitting the given area, based on size change.
     * @param area          The area being splitted
     * @param weights       The weight of each part
     * @param gap           The gap size b/w parts
     * @param target        The index of the part being changed.
     * @param delta         The changes in dimension of the target
     * @param horizontal    If true, calculate horizontal weights, instead of vertical.
     */
    public static adjustAreaWeights(
        area: Rect,
        weights: number[],
        gap: number,
        target: number,
        delta: RectDelta,
        horizontal?: boolean,
    ): number[] {
        const line: [number, number] = (horizontal) ? [area.x, area.width] : [area.y, area.height];
        const [deltaFw, deltaBw] = (horizontal)
            ? [delta.east, delta.west]
            : [delta.south, delta.north]
            ;
        return LayoutUtils.adjustWeights(line, weights, gap, target, deltaFw, deltaBw);
    }

    public static adjustAreaHalfWeights(
        area: Rect,
        weight: number,
        gap: number,
        target: number,
        delta: RectDelta,
        horizontal?: boolean,
    ): number {
        const weights = [weight, 1 - weight];
        const newWeights = LayoutUtils.adjustAreaWeights(area, weights, gap, target, delta, horizontal);
        return newWeights[0];
    }

    public static calculateWeights(parts: Array<[number, number]>): number[] {
        const totalLength = parts.reduce((acc, [base, length]) => acc + length, 0);
        return parts.map(([base, length]) => length / totalLength);
    }

    public static calculateAreaWeights(area: Rect, geometries: Rect[], gap?: number, horizontal?: boolean): number[] {
        gap = (gap !== undefined) ? gap : 0;
        horizontal = (horizontal !== undefined) ? horizontal : false;

        const line = (horizontal) ? area.width : area.height;
        const parts: Array<[number, number]> = (horizontal)
            ? geometries.map((geometry) => [geometry.x, geometry.width])
            : geometries.map((geometry) => [geometry.y, geometry.height])
            ;
        return LayoutUtils.calculateWeights(parts);
    }
}

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

class LayoutWeightMap {
    private map: {[key: string]: [Window, number]};
    constructor() {
        this.map = {};
    }

    public get(window: Window) {
        return this.getEntry(window)[1];
    }

    public set(window: Window, weight: number) {
        this.getEntry(window)[1] = weight;
    }

    public multiply(window: Window, ratio: number) {
        this.getEntry(window)[1] *= ratio;
    }

    public clean() {
        for (const key in this.map) {
            if (!this.map[key][0].window)
                delete this.map[key];
        }
    }

    private getEntry(window: Window): [Window, number] {
        const entry = this.map[window.id];
        return (entry) ? entry : (this.map[window.id] = [window, 1]);
    }
}

function stackTilesWithWeight(tiles: Window[], area: Rect, weights: LayoutWeightMap, gap = 0) {
    const wsum = tiles.reduce((acc, tile) => acc + weights.get(tile), 0);

    const n = tiles.length;
    const hsum = area.height - (n - 1) * gap;

    let wacc = 0;
    tiles.forEach((tile, i) => {
        const weight = weights.get(tile);
        const winy = area.y + (hsum * wacc) / wsum + i * gap;
        const winh = hsum * weight / wsum;

        tile.geometry = new Rect(area.x, Math.floor(winy), area.width, Math.floor(winh));
        wacc += weight;
    });
}

function adjustStackWeights(
    stack: Window[], basis: Window, basisHeight: number, weights: LayoutWeightMap,
    stackHeight: number, direction: "forward" | "backward", gap = 0,
) {
    const idx = stack.indexOf(basis);

    const H = stackHeight - (stack.length - 1) * gap;
    const W = stack.reduce((acc, tile) => acc + weights.get(tile), 0);

    const rest = (direction === "forward")
        ? stack.slice(idx + 1)
        : stack.slice(0, idx);
    const restW = rest.reduce((acc, tile) => acc + weights.get(tile), 0);

    const w = basisHeight * W / H;
    const dw = w - weights.get(basis);
    const restScale = (restW - dw) / restW;

    weights.set(basis, w);
    rest.forEach((tile) => weights.multiply(tile, restScale));
}
