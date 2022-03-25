// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

#include "controller.hpp"

#include <KGlobalAccel>
#include <KLocalizedString>

#include <QAction>
#include <QDebug>
#include <QObject>

#include <memory>

#include "logger.hpp"
#include "plasma-api/client.hpp"
#include "plasma-api/workspace.hpp"
#include "ts-proxy.hpp"

namespace Bismuth
{
Controller::Controller(PlasmaApi::Api &api)
    : m_plasmaApi(api)
    , m_proxy()
{
    bindEvents();
}

void Controller::bindEvents()
{
    auto &workspace = m_plasmaApi.workspace();
    connect(&workspace, &PlasmaApi::Workspace::currentDesktopChanged, this, &Controller::onCurrentSurfaceChanged);
}

void Controller::registerAction(const Action &data)
{
    auto action = new QAction(this);
    action->setProperty("componentName", QStringLiteral("bismuth"));
    action->setProperty("componentDisplayName", i18n("Window Tiling"));
    action->setObjectName(data.id);
    action->setText(data.description);

    // Register the keybinding as the default. This is needed for KCM to
    // recognize it as such, so that it can properly show whether it is changed
    // from the default.
    KGlobalAccel::self()->setDefaultShortcut(action, data.defaultKeybinding);

    // How this function works:
    // Set the shortcut from the global shortcuts configuration, or set it to
    // the provided value if it is not found in the config
    KGlobalAccel::self()->setShortcut(action, data.defaultKeybinding);

    QObject::connect(action, &QAction::triggered, data.callback);

    m_registeredShortcuts.push_back(action);
};

void Controller::onCurrentSurfaceChanged()
{
    if (m_proxy) {
        auto ctl = m_proxy->jsController();
        auto func = ctl.property("onCurrentSurfaceChanged");
        func.callWithInstance(ctl);
    }
}

void Controller::setProxy(TSProxy *proxy)
{
    m_proxy = proxy;
}

Action::Action(const QString &id, const QString &description, const QString &defaultKeybinding, std::function<void()> callback)
{
    this->id = id;
    this->description = description;
    this->defaultKeybinding = {QKeySequence(defaultKeybinding)};
    this->callback = callback;
};

}
