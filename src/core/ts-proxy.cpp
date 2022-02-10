// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "ts-proxy.hpp"

#include <KGlobalAccel>
#include <KLocalizedString>
#include <QAction>
#include <QKeySequence>

#include "controller.hpp"
#include "logger.hpp"

TSProxy::TSProxy(QQmlEngine *engine, Bismuth::Controller &controller, Bismuth::Config &config)
    : QObject()
    , m_engine(engine)
    , m_config(config)
    , m_controller(controller)
{
}

QJSValue TSProxy::jsConfig()
{
    auto configJSObject = m_engine->newObject();

    auto setProp = [&configJSObject](const char *propName, const QJSValue &value) {
        configJSObject.setProperty(QString::fromUtf8(propName), value);
    };

    setProp("layoutOrder", m_engine->newArray());
    auto layoutOrderProp = configJSObject.property(QStringLiteral("layoutOrder"));

    auto arrayIndexCounter = 0;
    auto addLayout = [&arrayIndexCounter, &layoutOrderProp, this](const char *configKey, const char *layoutId) {
        auto layoutEnabled = m_config.property(configKey).toBool();
        if (layoutEnabled) {
            layoutOrderProp.setProperty(arrayIndexCounter, QString::fromUtf8(layoutId));
            arrayIndexCounter++;
        }
    };

    // HACK: We have to hardcode layoutIds here for now
    addLayout("enableTileLayout", "TileLayout");
    addLayout("enableMonocleLayout", "MonocleLayout");
    addLayout("enableThreeColumnLayout", "ThreeColumnLayout");
    addLayout("enableSpreadLayout", "SpreadLayout");
    addLayout("enableStairLayout", "StairLayout");
    addLayout("enableSpiralLayout", "SpiralLayout");
    addLayout("enableQuarterLayout", "QuarterLayout");
    addLayout("enableFloatingLayout", "FloatingLayout");
    addLayout("enableCascadeLayout", "CascadeLayout");

    setProp("monocleMaximize", m_config.monocleMaximize());
    setProp("maximizeSoleTile", m_config.maximizeSoleTile());
    setProp("monocleMinimizeRest", m_config.monocleMinimizeRest());

    setProp("keepFloatAbove", m_config.keepFloatAbove());
    setProp("noTileBorder", m_config.noTileBorder());

    if (m_config.limitTileWidth()) {
        setProp("limitTileWidthRatio", m_config.limitTileWidthRatio());
    } else {
        setProp("limitTileWidthRatio", 0);
    }

    setProp("screenGapBottom", m_config.screenGapBottom());
    setProp("screenGapLeft", m_config.screenGapLeft());
    setProp("screenGapRight", m_config.screenGapRight());
    setProp("screenGapTop", m_config.screenGapTop());
    setProp("tileLayoutGap", m_config.tileLayoutGap());

    setProp("newWindowAsMaster", m_config.newWindowAsMaster());
    setProp("layoutPerActivity", m_config.layoutPerActivity());
    setProp("layoutPerDesktop", m_config.layoutPerDesktop());

    setProp("preventMinimize", m_config.preventMinimize());
    setProp("preventProtrusion", m_config.preventProtrusion());

    setProp("floatUtility", m_config.floatUtility());

    auto setStrArrayProp = [&configJSObject, this, &setProp](const char *propName, const QString &commaSeparatedString, bool asNumbers = false) {
        auto strList = commaSeparatedString.split(QLatin1Char(','), Qt::SkipEmptyParts);

        setProp(propName, m_engine->newArray());
        auto arrayProperty = configJSObject.property(QString::fromUtf8(propName));

        for (auto i = 0; i < strList.size(); ++i) {
            auto value = strList.at(i);
            if (asNumbers) {
                arrayProperty.setProperty(i, value.toInt());
            } else {
                arrayProperty.setProperty(i, value);
            }
        }
    };

    setStrArrayProp("floatingClass", m_config.floatingClass());
    setStrArrayProp("floatingTitle", m_config.floatingTitle());
    setStrArrayProp("ignoreClass", m_config.ignoreClass());
    setStrArrayProp("ignoreTitle", m_config.ignoreTitle());
    setStrArrayProp("ignoreRole", m_config.ignoreRole());

    setStrArrayProp("ignoreActivity", m_config.ignoreActivity());
    setStrArrayProp("ignoreScreen", m_config.ignoreScreen(), true);

    setProp("debugEnabled", m_config.debug());

    return configJSObject;
}

void TSProxy::registerShortcut(const QJSValue &tsAction)
{
    auto id = tsAction.property("key").toString();
    auto desk = tsAction.property("description").toString();
    auto keybinding = tsAction.property("defaultKeybinding").toString();

    // NOTE: Lambda MUST capture by copy, otherwise it is an undefined behavior
    m_controller.registerAction({id, desk, keybinding, [=]() {
                                     auto callback = tsAction.property("execute");
                                     qDebug(Bi) << "Shortcut triggered! Id:" << id;
                                     callback.callWithInstance(tsAction);
                                 }});
}

Q_INVOKABLE void TSProxy::log(const QJSValue &value)
{
    auto valAsString = value.toString();
    qDebug(Bi).noquote() << valAsString;
};
