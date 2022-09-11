// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QRectF>

#include <algorithm>
#include <cstdint>
#include <vector>

namespace Bismuth
{

struct WindowGroup;

/**
 * A line segment in 1D space, defined by its starting point and length.
 */
struct LineSegment {
    qreal begin; ///< Starting point of the segment in 1D space
    qreal length; ///< Length of the segment
};

/**
 * Helper class, that splits the areas in different fashion
 */
struct AreaSplitter {
    AreaSplitter(qreal gap = 0, Qt::Orientation splitDireciton = Qt::Vertical);

    /**
     * Split a line segment into weighted segments.
     * @param segment The segment to split
     * @param weights The weight of each segment
     * @returns An array of segments
     */
    std::vector<LineSegment> splitSegmentWeighted(const LineSegment &segment, const std::vector<qreal> &weights);

    /**
     * Split an area into multiple parts based on weights.
     * @param area The area to split
     * @param weights The weight of each area
     */
    std::vector<QRectF> splitAreaWeighted(const QRectF &area, const std::vector<qreal> &weights);

    /**
     * Split an area into two based on primary weight.
     * @param area The area to be split
     * @param weight The weight of the primary area.
     */
    std::pair<QRectF, QRectF> splitAreaHalfWeighted(const QRectF &area, qreal weight);

private:
    qreal m_gap; ///< Gaps between split areas
    Qt::Orientation m_splitDirection; ///< How to split the area
};

std::vector<qreal> groupsWeights(const std::vector<WindowGroup *> &);

/**
 * Return `value`, if it is in range of [`min`, `max`].
 * Otherwise return the closest range ends to it.
 */
template<typename T>
T &clip(const T &value, const T &min, const T &max)
{
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

template<typename T>
std::vector<T> slice(const std::vector<T> &vec, size_t begin, int16_t end = -1)
{
    auto result = std::vector<T>();
    result.reserve(vec.size());
    std::copy(vec.begin() + begin, vec.end() - end + 1, std::back_inserter(result));
    return result;
}

}
