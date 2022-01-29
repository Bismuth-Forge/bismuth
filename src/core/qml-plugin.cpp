// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "qml-plugin.hpp"

void CorePlugin::registerTypes(const char *uri)
{
    Q_ASSERT(qstrcmp(uri, "org.kde.bismuth.core") == 0);
    qmlRegisterModule(uri, 1, 0);

    qmlRegisterType<Core>(uri, 1, 0, "Core");
}

Core::Core(QQuickItem *parent)
    : QQuickItem(parent)
    , m_kwinApi()
    , m_qmlElements()
    , m_config()
{
}

void Core::start()
{
}

QJSValue Core::kwinApi()
{
    return m_kwinApi;
};

void Core::setKwinApi(const QJSValue &kwinApi)
{
    m_kwinApi = kwinApi;
};

QJSValue Core::qmlElements()
{
    return m_kwinApi;
}

void Core::setQmlElements(const QJSValue &qmlElements)
{
    m_qmlElements = qmlElements;
};
