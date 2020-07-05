
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

class HalfSplitLayoutPart implements ILayoutPart {
    public gap: number;
    public primarySize: number;
    public ratio: number;

    constructor(
        public primary: ILayoutPart,
        public secondary: ILayoutPart,
    ) {
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
                this.ratio,
                this.gap,
                targetIndex,
                delta,
                true,
            );

            ((targetIndex === /* primary */ 0)? this.primary : this.secondary)
                .adjust(area, tiles, basis, delta);
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
            const [primaryArea, secondaryArea] = LayoutUtils.splitAreaHalfWeighted(area, this.ratio, this.gap, true);
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
