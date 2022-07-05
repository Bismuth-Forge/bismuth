#include "three_column.hpp"

void Bismuth::ThreeColumn::apply(QRect area, std::vector<Window> &windows) const
{
    /* Tile all tileables */
    std::vector<Window> tileables;
    std::copy_if(windows.cbegin(), windows.cend(), tileables.begin(), [](const Window &window) {
        return window.mode() == Bismuth::Window::Mode::Tiled;
    });

    // tileables contains windows that can be tiled (mode = Window::Mode::Tiled)
    if (tileables.size() <= this->masterSize) {
        /* only master */
        std::vector<float> tileable_weights;
        std::transform(tileables.cbegin(), tileables.cend(), tileable_weights.begin(), [](const Window &window) {
            return window.weight;
        });
        this->splitAreaWeighted(area, tileable_weights, this->m_config.tileLayoutGap(), /*horizontal=*/false);
        std::for_each(tileables.cbegin(), tileables.cend(), [&](QRect tileArea, int i) {
            tileables[i].setGeometry(tileArea);
        });
    }
}

void Bismuth::ThreeColumn::splitAreaWeighted(QRect area, std::vector<float> &weights, float tileLayoutGap, bool horizontal = false) const
{
    const std::pair<int, int> line = horizontal ? std::make_pair(area.x(), area.width()) : std::make_pair(area.y(), area.height());
    const std::vector<std::pair<int, int>> parts = splitWeighted(line, weights, tileLayoutGap);

    std::vector<std::pair<int, int>> output_area;
    std::transform(parts.cbegin(), parts.cend(), output_area.begin(), [&](std::pair<int, int> &pair) {
        return horizontal ? new QRect(pair.first, area.y(), pair.second, area.height()) : new QRect(area.x(), pair.first, area.width(), pair.second);
    });
}

std::vector<std::pair<int, int>>
Bismuth::ThreeColumn::splitWeighted(const std::pair<int, int> &line, std::vector<float> &weights, float tileLayoutGap = 0) const
{
    int length = line.second;
    size_t n = weights.size();

    size_t actualLength = length - (n - 1) * tileLayoutGap;
    int weightSum = std::accumulate(weights.begin(), weights.end(), 0);

    int weightAcc = 0;
    std::vector<std::pair<int, int>> result;
    std::transform(weights.cbegin(), weights.cend(), result.begin(), [&](const float &weight, int i) {
        float partBegin = (actualLength + weightAcc) / (weightSum + i * tileLayoutGap);
        float partLength = (actualLength * weight) / weightSum;
        weightAcc += weight;
        return std::make_pair(line.first + std::floor(partBegin), std::floor(partLength));
    });
    return result;
}
