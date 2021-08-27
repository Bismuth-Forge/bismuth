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

/**
 * Describes geometric changes of a rectangle, in terms of changes per edge.
 * Outward changes are in positive, and inward changes are in negative.
 */
class RectDelta {
  /** Generate a delta that transforms basis to target. */
  public static fromRects(basis: Rect, target: Rect): RectDelta {
    const diff = target.subtract(basis);
    return new RectDelta(
      diff.width + diff.x,
      -diff.x,
      diff.height + diff.y,
      -diff.y
    );
  }

  constructor(
    public readonly east: number,
    public readonly west: number,
    public readonly south: number,
    public readonly north: number
  ) {}

  public toString(): string {
    return (
      "WindowResizeDelta(" +
      [
        "east=" + this.east,
        "west=" + this.west,
        "north=" + this.north,
        "south=" + this.south,
      ].join(" ") +
      ")"
    );
  }
}
