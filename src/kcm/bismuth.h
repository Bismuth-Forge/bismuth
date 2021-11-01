/**
 * SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
 *
 * SPDX-License-Identifier: MIT
 */
#pragma once

#include <KQuickAddons/ManagedConfigModule>

#include "bismuth_config.h"

class BismuthSettings : public KQuickAddons::ManagedConfigModule
{
    Q_OBJECT

    Q_PROPERTY(Bismuth::Config *config READ config CONSTANT)

public:
    BismuthSettings(QObject *parent, const QVariantList &args);
    virtual ~BismuthSettings() override = default;

    Bismuth::Config *config() const;

private:
    Bismuth::Config *m_config;
};
