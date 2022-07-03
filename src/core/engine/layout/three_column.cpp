#include "three_column.hpp"

void Bismuth::ThreeColumn::apply(QRect area, std::vector<Window> &windows) const override
{
    /* Tile all tileables */
    std::vector<Window> tileables;
    std::copy_if(windows.cbegin(), windows.cend(), tileables.begin(), [&](window) {
        return window.mode == Bismuth::Window::Mode::Tiled);
    });

    // tileables contains windows that can be tiled (mode = Window::Mode::Tiled)
    if (tileables.size() <= this.masterSize) {
        /* only master */
        continue;
    }
}
