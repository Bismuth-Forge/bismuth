/**
 * SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
 *
 * SPDX-License-Identifier: MIT
 */

#include "bismuth.h"
#include "bismuth_config.h"

#include <KAboutData>
#include <KLocalizedString>
#include <KPluginFactory>

K_PLUGIN_CLASS_WITH_JSON(BismuthSettings, "metadata.json")

BismuthSettings::BismuthSettings(QObject *parent, const QVariantList &args)
    : KQuickAddons::ManagedConfigModule(parent, args)
    , m_config(new Bismuth::Config(this))
{
    KAboutData *aboutData =
        new KAboutData(QStringLiteral("kcm_bismuth"),
                       i18nc("@title", "Window Tiling"),
                       QStringLiteral("1.0"),
                       QStringLiteral(""),
                       KAboutLicense::LicenseKey::Custom,
                       i18nc("@info:credit", "Copyright 2021 Mikhail Zolotukhin <mail@genda.life>"));

    aboutData->addAuthor(
        i18nc("@info:credit", "Author"), i18nc("@info:credit", "Author"), QStringLiteral("author@domain.com"));

    setAboutData(aboutData);
    setButtons(Help | Apply | Default);

    qmlRegisterAnonymousType<Bismuth::Config>("org.kde.bismuth.private", 1);
}

Bismuth::Config *BismuthSettings::config() const
{
    return m_config;
}

#include "bismuth.moc"
