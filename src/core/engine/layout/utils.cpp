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

AreaSplitter::AreaSplitter(qreal gap, Qt::Orientation splitDireciton)
    : m_gap(gap)
    , m_splitDirection(splitDireciton)
{
}

std::vector<LineSegment> AreaSplitter::splitSegmentWeighted(const LineSegment &segment, const std::vector<qreal> &weights)
{
    auto segmentLengthWithoutGaps = segment.length - (weights.size() - 1) * m_gap;
    auto weightsSum = std::accumulate(weights.begin(), weights.end(), 0);

    auto result = std::vector<LineSegment>();
    result.reserve(weights.size());

    for (auto i = 0, weightAcc = 0; i < weights.size(); i++, weightAcc += weights[i]) {
        auto partBegin = (segmentLengthWithoutGaps * weightAcc) / weightsSum + i * m_gap;
        auto partLength = (segmentLengthWithoutGaps * weights[i]) / weightsSum;

        result.push_back({segment.begin + std::floor(partBegin), std::floor(partLength)});
    }

    return result;
}

std::vector<QRectF> AreaSplitter::splitAreaWeighted(const QRectF &area, const std::vector<qreal> &weights)
{
    auto areaLineSegment = m_splitDirection == Qt::Horizontal ? LineSegment{area.x(), area.width()} : LineSegment{area.y(), area.height()};
    auto parts = splitSegmentWeighted(areaLineSegment, weights);

    qDebug(Bi) << "Split into parts:";
    for (auto part : parts) {
        qDebug(Bi) << "Line. Begin:" << part.begin << "Length" << part.length;
    }

    auto result = std::vector<QRectF>();
    result.reserve(parts.size());
    std::transform(parts.begin(), parts.end(), std::back_inserter(result), [&](const LineSegment &segment) {
        return m_splitDirection == Qt::Horizontal ? QRectF(segment.begin, area.y(), segment.length, area.height())
                                                  : QRectF(area.x(), segment.begin, area.width(), segment.length);
    });
    return result;
}

std::pair<QRectF, QRectF> AreaSplitter::splitAreaHalfWeighted(const QRectF &area, qreal weight)
{
    qDebug(Bi) << "Splitting in half. Area" << area;
    auto weights = std::vector<qreal>{weight, 1 - weight};
    qDebug(Bi) << "Left weight:" << weights[0] << "Right weight:" << weights[1];
    auto result = splitAreaWeighted(area, weights);

    for (auto resElement : result) {
        qDebug(Bi) << "Res element:" << resElement;
    }

    return {result[0], result[1]};
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
