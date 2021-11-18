// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "dbus-plugin.h"

#include "dbus-service.h"

void DBusPlugin::registerTypes(const char *uri)
{
    Q_ASSERT(uri == QLatin1String("org.kde.bismuth.dbus"));
    qmlRegisterModule(uri, 1, 0);

    qmlRegisterType<DBusService>(uri, 1, 0, "DBusService");
}
