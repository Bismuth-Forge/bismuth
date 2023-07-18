/**
 * SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
 *
 * SPDX-License-Identifier: MIT
 */

#include "bismuth.h"
#include "bismuth_config.h"
#include "kwin_interface.h"

#include <QDBusInterface>
#include <QDebug>

#include <KAboutData>
#include <KLocalizedString>
#include <KPluginFactory>
#include <qstringliteral.h>

K_PLUGIN_CLASS_WITH_JSON(BismuthSettings, "metadata.json")

BismuthSettings::BismuthSettings(QObject *parent, const KPluginMetaData &data, const QVariantList &args)
    : KQuickAddons::ManagedConfigModule(parent, data, args)
    , m_config(new Bismuth::Config(this))
{
    setButtons(Help | Apply | Default);
    qmlRegisterAnonymousType<Bismuth::Config>("org.kde.bismuth.private", 1);
}

Bismuth::Config *BismuthSettings::config() const
{
    return m_config;
}

void BismuthSettings::save()
{
    KQuickAddons::ManagedConfigModule::save();
    reloadKWinScript();
}

void BismuthSettings::reloadKWinScript() const
{
    OrgKdeKwinScriptingInterface kwinInterface(QStringLiteral("org.kde.KWin"), QStringLiteral("/Scripting"), QDBusConnection::sessionBus());

    // Unload Bismuth, so that it can reload its configuration
    kwinInterface.unloadScript(QStringLiteral("bismuth")).waitForFinished(); // Sync call
    // Load unloaded scripts
    kwinInterface.start(); // Async call
}

#include "bismuth.moc"
