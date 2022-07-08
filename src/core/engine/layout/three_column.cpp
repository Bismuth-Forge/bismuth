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
        std::for_each(tileables.cbegin(), tileables.cend(), [&, idx = 0](QRect tileArea) mutable {
            tileables[idx].setGeometry(tileArea);
            idx++;
        });
    } else if (tileables.size() == this->masterSize + 1) {
        /* master + R-stack */
        std::vector<QRect> output_area = this->splitAreaHalfWeighted(area, this->masterRatio, this->m_config.tileLayoutGap(), /*horizontal=*/true);
        QRect masterArea = output_area[0];
        QRect stackArea = output_area[1];

        std::vector<float> master_weights;
        std::transform(tileables.cbegin(), tileables.cend(), master_weights.begin(), [](const Bismuth::Window &tile) {
            return tile.weight;
        });

        auto output_master = splitAreaWeighted(masterArea, master_weights, this->m_config.tileLayoutGap(), /*horizontal=*/false);
        std::for_each(output_master.cbegin(), output_master.cend(), [&, idx = 0](const QRect &tileArea) mutable {
            tileables[idx].setGeometry(tileArea);
            idx++;
        });

        tileables[tileables.size() - 1].setGeometry(stackArea);
    } else if (tileables.size() > this->masterSize + 1) {
        /* L-stack & master & R-stack*/
        const float stackRatio = 1 - this->masterRatio;
        std::vector<float> ratios = {stackRatio, this->masterRatio, stackRatio};
        const std::vector<QRect> groupAreas = this->splitAreaWeighted(area,
                                                                      ratios,
                                                                      this->m_config.tileLayoutGap(),
                                                                      /*horizontal=*/true);
        const int rstacksize = std::floor((tileables.size() - this->masterSize) / 2);
        auto tiles = partitionAreaBySizes(tileables, {this->masterSize, rstacksize});
        int idx = 0;
        for (auto &tile_ : tiles) {
            std::vector<float> tile_weights;
            std::transform(tile_.cbegin(), tile_.cend(), tile_weights.begin(), [](auto single_tile) {
                return single_tile.weight;
            });

            auto split = this->splitAreaWeighted(groupAreas[idx], tile_weights, this->m_config.tileLayoutGap(), /*horizontal=*/false);
            int idx = 0;
            std::for_each(split.cbegin(), split.cend(), [&, idx = 0](const QRect &splitArea) mutable {
                tile_[idx].setGeometry(splitArea);
                idx++;
            });
        }
    }
}

template<typename T>
std::vector<std::vector<T>> partitionAreaBySizes(std::vector<T> array, std::vector<int> sizes)
{
    int base = 0;
    std::vector<std::vector<T>> chunks;
    for (const auto &size : sizes) {
        std::vector<T> chunk(array.begin() + base, array.begin() + base + size);
        base += size;
        chunks.push_back(chunk);
    }
    chunks.push_back(std::vector<T>(array.begin() + base, array.end()));
    return chunks;
}

std::vector<QRect> Bismuth::ThreeColumn::splitAreaHalfWeighted(QRect area, float weight, int gap, bool horizontal = false) const
{
    std::vector<float> weights = {weight, 1 - weight};
    return splitAreaWeighted(area, weights, gap, horizontal);
}

std::vector<QRect> Bismuth::ThreeColumn::splitAreaWeighted(QRect area, std::vector<float> &weights, float tileLayoutGap, bool horizontal = false) const
{
    const std::pair<int, int> line = horizontal ? std::make_pair(area.x(), area.width()) : std::make_pair(area.y(), area.height());
    const std::vector<std::pair<int, int>> parts = splitWeighted(line, weights, tileLayoutGap);

    std::vector<QRect> output_area;
    std::transform(parts.cbegin(), parts.cend(), output_area.begin(), [&](std::pair<int, int> &pair) {
        return horizontal ? new QRect(pair.first, area.y(), pair.second, area.height()) : new QRect(area.x(), pair.first, area.width(), pair.second);
    });
    return output_area;
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
