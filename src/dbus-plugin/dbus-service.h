// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include <QQmlEngine>
#include <QQuickItem>
#include <QString>

#include "macro.h"

class DBusService : public QQuickItem
{
    Q_OBJECT
    Q_CLASSINFO("D-Bus Interface", "org.kde.bismuth.dbus")
    QML_ELEMENT

    EXTERNAL_REQUEST(QStringList, enabledLayouts, ())
    EXTERNAL_REQUEST(QString, layoutOn, (int screen, int desktop, const QString &activity))

public:
    DBusService(QQuickItem *parent = nullptr);
    ~DBusService();

Q_SIGNALS:
    void layoutChangeRequested(const QString &layoutId);
};
