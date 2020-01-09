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

function clip(value: number, min: number, max: number): number {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}

function slide(value: number, step: number): number {
    if (step === 0)
        return value;
    return Math.floor(value / step + 1.000001) * step;
}

function matchWords(str: string, words: string[]): number {
    for (let i = 0; i < words.length; i++) {
        if (str.indexOf(words[i]) >= 0)
            return i;
    }
    return -1;
}

function wrapIndex(index: number, length: number): number {
    if (index < 0)
        return index + length;
    if (index >= length)
        return index - length;
    return index;
}

/**
 * Partition the given array into two parts, based on the value of the predicate
 *
 * @param array
 * @param predicate A function which accepts an item and returns a boolean value.
 * @return A tuple containing an array of true(matched) items, and an array of false(unmatched) items.
 */
function partitionArray<T>(array: T[], predicate: (item: T, index: number) => boolean): [T[], T[]] {
    return array.reduce((parts: [T[], T[]], item: T, index: number) => {
        parts[predicate(item, index) ? 0 : 1].push(item);
        return parts;
    }, [[], []]);
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
function partitionArrayBySizes<T>(array: T[], sizes: number[]): T[][] {
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
function overlap(min1: number, max1: number, min2: number, max2: number): boolean {
    const min = Math.min;
    const max = Math.max;
    const dx = max(0, min(max1, max2) - max(min1, min2));
    return (dx > 0);
}
