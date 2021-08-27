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

class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public get maxX(): number {
    return this.x + this.width;
  }
  public get maxY(): number {
    return this.y + this.height;
  }

  public get center(): [number, number] {
    return [
      this.x + Math.floor(this.width / 2),
      this.y + Math.floor(this.height / 2),
    ];
  }

  public clone(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  public equals(other: Rect): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height
    );
  }

  public gap(left: number, right: number, top: number, bottom: number): Rect {
    return new Rect(
      this.x + left,
      this.y + top,
      this.width - (left + right),
      this.height - (top + bottom)
    );
  }

  public gap_mut(
    left: number,
    right: number,
    top: number,
    bottom: number
  ): this {
    this.x += left;
    this.y += top;
    this.width -= left + right;
    this.height -= top + bottom;
    return this;
  }

  public includes(other: Rect): boolean {
    return (
      this.x <= other.x &&
      this.y <= other.y &&
      other.maxX < this.maxX &&
      other.maxY < this.maxY
    );
  }

  public includesPoint([x, y]: [number, number]): boolean {
    return this.x <= x && x <= this.maxX && this.y <= y && y <= this.maxY;
  }

  public subtract(other: Rect): Rect {
    return new Rect(
      this.x - other.x,
      this.y - other.y,
      this.width - other.width,
      this.height - other.height
    );
  }

  public toString(): string {
    return "Rect(" + [this.x, this.y, this.width, this.height].join(", ") + ")";
  }
}
