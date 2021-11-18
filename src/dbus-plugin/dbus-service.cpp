// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "dbus-service.h"

#include <QDBusConnection>
#include <QDebug>

DBusService::DBusService(QQuickItem *parent)
    : QQuickItem(parent)
{
    auto bus = QDBusConnection::sessionBus();
    auto result = bus.registerService("org.kde.bismuth.dbus");
    if (!result) {
        qDebug() << "[Bismuth] [DBus Plugin] Cannot register DBus service with the name \"org.kde.bismuth.dbus\"";
    }

    result = bus.registerObject("/bismuth", this, QDBusConnection::ExportScriptableSlots);
    if (!result) {
        qDebug() << "[Bismuth] [DBus Plugin] Cannot register DBus object with path \"/bismuth\"";
    }
}

DBusService::~DBusService()
{
    auto bus = QDBusConnection::sessionBus();
    bus.unregisterService("org.kde.bismuth.dbus");
    bus.unregisterObject("/bismuth");
}

EXTERNAL_REQUEST_MAPPER(QStringList, enabledLayouts, (), { //
    return QJSValueList{};
})

// EXTERNAL_REQUEST_MAPPER(QString, activeLayout, (), { //
//     return QJSValueList{};
// })
