// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "master-stack.hpp"

#include "engine/layout/piece/half-split.hpp"
#include "engine/layout/piece/stack.hpp"
#include "engine/window-group.hpp"
#include "logger.hpp"

namespace Bismuth
{
MasterStackLayout::MasterStackLayout(const Bismuth::Config &config)
    : m_basePiece(std::make_unique<RotatablePiece>( //
        std::make_unique<HalfSplitPiece>( //
            std::make_unique<StackPiece>(config),
            std::make_unique<StackPiece>(config))))
{
}

QString MasterStackLayout::id() const
{
    return QStringLiteral("master-stack");
}

QString MasterStackLayout::name() const
{
    return QStringLiteral("Master-Stack");
}

void MasterStackLayout::placeGroup(WindowGroup &group)
{
    if (m_basePiece == nullptr) {
        qWarning(Bi) << "Master Stack Layout does not have a base!";
        return;
    }

    auto groupGeometryMap = m_basePiece->apply(group.geometry(), group.children());
    for (auto &[subgroup, geometry] : groupGeometryMap) {
        subgroup->setGeometry(geometry);
    }
};

}
