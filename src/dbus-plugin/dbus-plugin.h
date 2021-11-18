// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include <QObject>
#include <QQmlEngine>
#include <QQmlExtensionPlugin>

class DBusPlugin : public QQmlExtensionPlugin
{
    Q_OBJECT
    Q_PLUGIN_METADATA(IID QQmlEngineExtensionInterface_iid)

public:
    void registerTypes(const char *uri) override;
};
