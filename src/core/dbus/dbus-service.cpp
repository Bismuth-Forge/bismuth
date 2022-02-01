// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "dbus-service.hpp"

#include <QDBusConnection>
#include <QDebug>
#include <QString>

DBusService::DBusService(QQuickItem *parent)
    : QQuickItem(parent)
{
    auto bus = QDBusConnection::sessionBus();
    auto result = bus.registerService(QStringLiteral("org.kde.bismuth.dbus"));
    if (!result) {
        qDebug() << "[Bismuth] [DBus Plugin] Cannot register DBus service with the name \"org.kde.bismuth.dbus\"";
    }

    result = bus.registerObject(QStringLiteral("/bismuth"), this, QDBusConnection::ExportScriptableSlots);
    if (!result) {
        qDebug() << "[Bismuth] [DBus Plugin] Cannot register DBus object with path \"/bismuth\"";
    }
}

DBusService::~DBusService()
{
    auto bus = QDBusConnection::sessionBus();
    bus.unregisterService(QStringLiteral("org.kde.bismuth.dbus"));
    bus.unregisterObject(QStringLiteral("/bismuth"));
}

EXTERNAL_REQUEST_MAPPER(bool, toggleLayoutOn, (const QString &layoutId, int screen, int desktop, const QString &activity), { //
    return QJSValueList{layoutId, screen, desktop, activity};
})

EXTERNAL_REQUEST_MAPPER(QStringList, enabledLayouts, (), { //
    return QJSValueList{};
})

EXTERNAL_REQUEST_MAPPER(QString, layoutOn, (int screen, int desktop, const QString &activity), { //
    return QJSValueList{screen, desktop, activity};
})
