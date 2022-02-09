// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#pragma once

#include <QAction>
#include <QKeySequence>
#include <QList>

#include <functional>
#include <memory>
#include <vector>

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
    void registerAction(const Action &);

private:
    std::vector<QAction *> m_registeredShortcuts{};
};

}
