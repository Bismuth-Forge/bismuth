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

BismuthSettings::BismuthSettings(QObject *parent, const QVariantList &args)
    : KQuickAddons::ManagedConfigModule(parent, args)
    , m_config(new Bismuth::Config(this))
{
    KAboutData *aboutData = new KAboutData(QStringLiteral("kcm_bismuth"),
                                           i18nc("@title", "Window Tiling"),
                                           QStringLiteral("1.0"),
                                           QStringLiteral(""),
                                           KAboutLicense::LicenseKey::Custom,
                                           i18nc("@info:credit", "Copyright 2021 Mikhail Zolotukhin <mail@gikari.com>"));

    aboutData->addAuthor(i18nc("@info:credit", "Author"), i18nc("@info:credit", "Author"), QStringLiteral("author@domain.com"));

    setAboutData(aboutData);
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
