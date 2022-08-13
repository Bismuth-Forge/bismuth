// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "view.hpp"
#include "logger.hpp"

#include <QQmlComponent>

namespace Bismuth
{
View::View(QQmlEngine *qmlEng, QQmlContext *qmlCont)
    : m_qmlEngine(qmlEng)
    , m_qmlContext(qmlCont)
    , m_osd()
{
    createQmlComponent(":/ui/Osd.qml", &m_osd);
}

void View::showOSD(const QString &text, const QString &icon, const QString &hint)
{
    if (m_osd == nullptr) {
        return;
    }

    QMetaObject::invokeMethod(m_osd, "show", Q_ARG(QString, text), Q_ARG(QString, icon), Q_ARG(QString, hint));
}

void View::createQmlComponent(const QString &qmlFile, QObject **where)
{
    if (where == nullptr) {
        qWarning(Bi) << "Failed to create a QML component" << qmlFile << ". Not specified where to store the result";
        return;
    }

    // Unfortunately, we don't have a good API, so here is a spaghetti bowl 🍝
    auto component = new QQmlComponent(m_qmlEngine, qmlFile, this);

    auto createLoadedComponent = [=]() {
        if (component->isError()) {
            qWarning(Bi) << "Failed to create a QML component" << qmlFile << ". Error message:" << component->errorString();
            return;
        }

        // Don't forget to pass context
        *where = component->create(m_qmlContext);
    };

    if (component->isLoading()) {
        connect(component, &QQmlComponent::statusChanged, this, createLoadedComponent);
    } else {
        createLoadedComponent();
    }
}
}
