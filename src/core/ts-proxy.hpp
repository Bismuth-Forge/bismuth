// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#pragma once

#include <QJSValue>
#include <QObject>
#include <QQmlEngine>

#include "config.hpp"

/**
 * Proxy object for the legacy TS backend.
 */
class TSProxy : public QObject
{
    Q_OBJECT
public:
    explicit TSProxy(QQmlEngine *, Bismuth::Config &);

    /**
     * Returns the config usable in the legacy TypeScript logic
     */
    Q_INVOKABLE QJSValue jsConfig();

private:
    QQmlEngine *m_engine;
    Bismuth::Config &m_config;
};
