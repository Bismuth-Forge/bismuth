// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QAction>
#include <QKeySequence>
#include <QList>

#include <functional>
#include <memory>
#include <vector>

#include "plasma-api/api.hpp"

class TSProxy;

namespace Bismuth
{

struct Action {
    Action(const QString &id, const QString &description, const QString &defaultKeybinding, std::function<void()> callback);

    QString id;
    QString description;
    QList<QKeySequence> defaultKeybinding;
    std::function<void()> callback;
};

class Controller : public QObject
{
    Q_OBJECT
public:
    Controller(PlasmaApi::Api &);

    void bindEvents();
    void registerAction(const Action &);

    void setProxy(TSProxy *);

public Q_SLOTS:
    void onCurrentSurfaceChanged();

private:
    std::vector<QAction *> m_registeredShortcuts{};

    PlasmaApi::Api &m_plasmaApi;
    TSProxy *m_proxy;
};

}
