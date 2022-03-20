// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

/**
 * Return `value`, if it is in range of [`min`, `max`]. Otherwise return
 * the the closest range ends to it.
 */
export function clip(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/**
 * Modify the value gradually, multiplying it by (step / (1 + step))
 */
export function slide(value: number, step: number): number {
  if (step === 0) {
    return value;
  }
  return Math.floor(value / step + 1.000001) * step;
}

/**
 * Find the words in the string.
 * @param str the string to search words in
 * @param words the words to be searched
 * @returns index of a word, that was found in the string first. -1 if none of the words were found.
 */
export function matchWords(str: string, words: string[]): number {
  for (let i = 0; i < words.length; i++) {
    if (str.indexOf(words[i]) >= 0) {
      return i;
    }
  }
  return -1;
}

export function wrapIndex(index: number, length: number): number {
  if (index < 0) {
    return index + length;
  }
  if (index >= length) {
    return index - length;
  }
  return index;
}

/**
 * Partition the given array into two parts, based on the value of the predicate
 *
 * @param array
 * @param predicate A function which accepts an item and returns a boolean value.
 * @return A tuple containing an array of true(matched) items, and an array of false(unmatched) items.
 */
export function partitionArray<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): [T[], T[]] {
  return array.reduce(
    (parts: [T[], T[]], item: T, index: number) => {
      parts[predicate(item, index) ? 0 : 1].push(item);
      return parts;
    },
    [[], []]
  );
}

/**
 * Partition the array into chunks of designated sizes.
 *
 * This function splits the given array into N+1 chunks, where N chunks are
 * specified by `sizes`, and the additional chunk is for remaining items. When
 * the array runs out of items first, any remaining chunks will be empty.
 * @param array
 * @param sizes     A list of chunk sizes
 * @returns An array of (N+1) chunks, where the last chunk contains remaining
 * items.
 */
export function partitionArrayBySizes<T>(array: T[], sizes: number[]): T[][] {
  let base = 0;
  const chunks = sizes.map((size): T[] => {
    const chunk = array.slice(base, base + size);
    base += size;
    return chunk;
  });
  chunks.push(array.slice(base));

  return chunks;
}

/**
 * Tests if two ranges are overlapping
 * @param min1 Range 1, begin
 * @param max1 Range 1, end
 * @param min2 Range 2, begin
 * @param max2 Range 2, end
 */
export function overlap(
  min1: number,
  max1: number,
  min2: number,
  max2: number
): boolean {
  const min = Math.min;
  const max = Math.max;
  const dx = max(0, min(max1, max2) - max(min1, min2));
  return dx > 0;
}
