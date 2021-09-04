// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

export default class Rect {
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
