// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { clip } from "../../util/func";
import { Rect, RectDelta } from "../../util/rect";

export default class LayoutUtils {
  /**
   * Split a (virtual) line into weighted lines w/ gaps.
   * @param length    The length of the line to be splitted
   * @param weights   The weight of each part
   * @param gap       The size of gap b/w parts
   * @returns An array of parts: [begin, length]
   */
  public static splitWeighted(
    [begin, length]: [number, number],
    weights: number[],
    gap: number
  ): Array<[number, number]> {
    gap = gap !== undefined ? gap : 0;

    const n = weights.length;
    const actualLength = length - (n - 1) * gap;
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

    let weightAcc = 0;
    return weights.map((weight, i) => {
      const partBegin = (actualLength * weightAcc) / weightSum + i * gap;
      const partLength = (actualLength * weight) / weightSum;
      weightAcc += weight;
      return [begin + Math.floor(partBegin), Math.floor(partLength)];
    });
  }

  /**
   * Split an area into multiple parts based on weight.
   * @param area          The area to be splitted
   * @param weights       The weight of each part
   * @param gap           The size of gaps b/w parts
   * @param horizontal    If true, split horizontally. Otherwise, vertically.
   */
  public static splitAreaWeighted(
    area: Rect,
    weights: number[],
    gap?: number,
    horizontal?: boolean
  ): Rect[] {
    gap = gap !== undefined ? gap : 0;
    horizontal = horizontal !== undefined ? horizontal : false;

    const line: [number, number] = horizontal
      ? [area.x, area.width]
      : [area.y, area.height];
    const parts = LayoutUtils.splitWeighted(line, weights, gap);

    return parts.map(([begin, length]) =>
      horizontal
        ? new Rect(begin, area.y, length, area.height)
        : new Rect(area.x, begin, area.width, length)
    );
  }

  /**
   * Split an area into two based on weight.
   * @param area          The area to be splitted
   * @param weight        The weight of the left/upper part.
   * @param gap           The size of gaps b/w parts
   * @param horizontal    If true, split horizontally. Otherwise, vertically.
   */
  public static splitAreaHalfWeighted(
    area: Rect,
    weight: number,
    gap?: number,
    horizontal?: boolean
  ): Rect[] {
    return LayoutUtils.splitAreaWeighted(
      area,
      [weight, 1 - weight],
      gap,
      horizontal
    );
  }

  /**
   * Recalculate the weights of subareas of the line, based on size change.
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
    deltaBw: number
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
      const delta = clip(
        deltaBw,
        minLength - targetLength,
        neighborLength - minLength
      );

      parts[target] = [targetBase - delta, targetLength + delta];
      parts[neighbor] = [neighborBase, neighborLength - delta];
    }

    /* apply forward delta */
    if (target < parts.length - 1 && deltaFw !== 0) {
      const neighbor = target + 1;
      const [neighborBase, neighborLength] = parts[neighbor];

      /* limit delta to prevent squeezing windows */
      const delta = clip(
        deltaFw,
        minLength - targetLength,
        neighborLength - minLength
      );

      parts[target] = [targetBase, targetLength + delta];
      parts[neighbor] = [neighborBase + delta, neighborLength - delta];
    }

    return LayoutUtils.calculateWeights(parts);
  }

  /**
   * Recalculate weights of subareas splitting the given area, based on size change.
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
    horizontal?: boolean
  ): number[] {
    const line: [number, number] = horizontal
      ? [area.x, area.width]
      : [area.y, area.height];
    const [deltaFw, deltaBw] = horizontal
      ? [delta.east, delta.west]
      : [delta.south, delta.north];
    return LayoutUtils.adjustWeights(
      line,
      weights,
      gap,
      target,
      deltaFw,
      deltaBw
    );
  }

  /**
   * Recalculate weights of two areas splitting the given area, based on size change.
   * @param area          The area being splitted
   * @param weight        The weight of the left/upper part
   * @param gap           The gap size b/w parts
   * @param target        The index of the part being changed.
   * @param delta         The changes in dimension of the target
   * @param horizontal    If true, calculate horizontal weights, instead of vertical.
   */
  public static adjustAreaHalfWeights(
    area: Rect,
    weight: number,
    gap: number,
    target: number,
    delta: RectDelta,
    horizontal?: boolean
  ): number {
    const weights = [weight, 1 - weight];
    const newWeights = LayoutUtils.adjustAreaWeights(
      area,
      weights,
      gap,
      target,
      delta,
      horizontal
    );
    return newWeights[0];
  }

  /**
   * Calculates the weights of all parts, splitting a line.
   */
  public static calculateWeights(parts: Array<[number, number]>): number[] {
    const totalLength = parts.reduce((acc, [_base, length]) => acc + length, 0);
    return parts.map(([_base, length]) => length / totalLength);
  }

  /**
   * Calculates the weights of all parts, splitting an area.
   */
  public static calculateAreaWeights(
    _area: Rect,
    geometries: Rect[],
    gap?: number,
    horizontal?: boolean
  ): number[] {
    gap = gap !== undefined ? gap : 0;
    horizontal = horizontal !== undefined ? horizontal : false;

    // const line = horizontal ? area.width : area.height;
    const parts: Array<[number, number]> = horizontal
      ? geometries.map((geometry) => [geometry.x, geometry.width])
      : geometries.map((geometry) => [geometry.y, geometry.height]);
    return LayoutUtils.calculateWeights(parts);
  }
}
