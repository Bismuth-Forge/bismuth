// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "config.hpp"
#include "layout.hpp"

#include <math.h>

namespace Bismuth
{
struct ThreeColumn : Layout {
    using Layout::Layout;

private:
    // TODO: needs to be static?
    const float MIN_MASTER_RATIO = 0.2;
    const float MAX_MASTER_RATIO = 0.75;
    const std::string id = "ThreeColumnLayout";
    const std::string classID = id;
    const std::string name = "Three-Column Layout";
    const std::string icon = "bismuth-column";

    float masterRatio;
    int masterSize; // TODO: int/float?

public:
    ThreeColumn(const Bismuth::Config &config)
        : Layout(config)
        , masterRatio(0.6)
        , masterSize(1)
    {
    }
    virtual void apply(QRect area, std::vector<Window> &windows) const override;
    virtual std::vector<QRect> splitAreaWeighted(QRect area, std::vector<float> &weights, float tileLayoutGap, bool horizontal) const;
    /* tileLayoutGap by default is 0 and horizontal is false */
    virtual std::vector<std::pair<int, int>> splitWeighted(const std::pair<int, int> &line, std::vector<float> &weights, float tileLayoutGap) const;
    virtual std::vector<QRect> splitAreaHalfWeighted(QRect, float, int, bool) const;

    // temporarily here
    template<typename T>
    std::vector<std::vector<T>> partitionAreaBySizes(std::vector<T> array, std::vector<int> sizes) const;
};
}
