// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "utils.hpp"

#include <algorithm>
#include <cmath>
#include <numeric>

#include "engine/window-group.hpp"
#include "logger.hpp"

namespace Bismuth
{

bool LineSegment::operator==(const LineSegment &rhs) const
{
    return begin == rhs.begin && length == rhs.length;
};

std::ostream &operator<<(std::ostream &os, const LineSegment &value)
{
    os << "LineSegment(Begin: " << value.begin << ", Length: " << value.length << ")";
    return os;
}

AreaSplitter::AreaSplitter(qreal gap, Qt::Orientation splitDirection)
    : m_gap(gap)
    , m_splitDirection(splitDirection)
{
}

std::vector<LineSegment> AreaSplitter::splitSegmentWeighted(const LineSegment &segment, const std::vector<qreal> &weights)
{
    auto segmentLengthWithoutGaps = segment.length - (weights.size() - 1) * m_gap;
    auto weightsSum = std::accumulate(weights.begin(), weights.end(), qreal(0));

    auto result = std::vector<LineSegment>();
    result.reserve(weights.size());

    qreal weightAcc = 0;
    for (auto i = 0; i < weights.size(); i++) {
        auto partBegin = (segmentLengthWithoutGaps * weightAcc) / weightsSum + i * m_gap;
        auto partLength = (segmentLengthWithoutGaps * weights[i]) / weightsSum;

        result.push_back({segment.begin + std::floor(partBegin), std::floor(partLength)});

        weightAcc += weights[i];
    }

    return result;
}

std::vector<QRectF> AreaSplitter::splitAreaWeighted(const QRectF &area, const std::vector<qreal> &weights)
{
    auto areaLineSegment = m_splitDirection == Qt::Horizontal ? LineSegment{area.x(), area.width()} : LineSegment{area.y(), area.height()};
    auto parts = splitSegmentWeighted(areaLineSegment, weights);

    auto result = std::vector<QRectF>();
    result.reserve(parts.size());
    std::transform(parts.begin(), parts.end(), std::back_inserter(result), [&](const LineSegment &segment) {
        if (m_splitDirection == Qt::Horizontal) {
            return QRectF(segment.begin, area.y(), segment.length, area.height());
        } else {
            return QRectF(area.x(), segment.begin, area.width(), segment.length);
        }
    });
    return result;
}

std::pair<QRectF, QRectF> AreaSplitter::splitAreaInTwoWithPrimaryWeight(const QRectF &area, qreal primaryWeight)
{
    auto weights = std::vector<qreal>{primaryWeight, 1 - primaryWeight};
    auto result = splitAreaWeighted(area, weights);

    return {result.front(), result.back()};
}

std::vector<qreal> groupsWeights(const std::vector<WindowGroup *> &groups)
{
    auto result = std::vector<qreal>();
    result.reserve(groups.size());
    for (auto group : groups) {
        result.push_back(group->weight());
    }
    return result;
}
}
