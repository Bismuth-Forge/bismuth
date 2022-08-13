// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>
#include <QQmlEngine>

namespace Bismuth
{
class View : public QObject
{
    Q_OBJECT
public:
    View(QQmlEngine *, QQmlContext *);

    void showOSD(const QString &text, const QString &icon = {}, const QString &hint = {});

private:
    void createQmlComponent(const QString &qmlFile, QObject **where = nullptr);

    QQmlEngine *m_qmlEngine;
    QQmlContext *m_qmlContext;
    QObject *m_osd{};
};
}
