// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window.hpp"
#include "logger.hpp"
#include "plasma-api/virtual-desktop.hpp"

namespace PlasmaApi
{

Window::Window(QObject *kwinImpl)
    : m_kwinImpl(kwinImpl)
{
    wrapSignals();
};

Window::Window(const Window &rhs)
    : m_kwinImpl(rhs.m_kwinImpl)
{
    wrapSignals();
};

Window::Window(Window &&rhs)
    : m_kwinImpl(std::move(rhs.m_kwinImpl))
{
    wrapSignals();
};

Window &Window::operator=(const Window &rhs)
{
    if (&rhs != this) {
        m_kwinImpl = rhs.m_kwinImpl;
    }

    wrapSignals();

    return *this;
}

Window &Window::operator=(Window &&rhs)
{
    if (&rhs != this) {
        m_kwinImpl = std::move(rhs.m_kwinImpl);
    }

    wrapSignals();

    return *this;
}

bool Window::operator==(const Window &rhs) const
{
    return m_kwinImpl == rhs.m_kwinImpl;
}

bool Window::operator<(const Window &rhs) const
{
    return m_kwinImpl < rhs.m_kwinImpl;
}

QVector<PlasmaApi::VirtualDesktop> Window::desktops() const
{
    auto desktops = m_kwinImpl->property("desktops").value<QVector<KWin::VirtualDesktop *>>();

    auto result = QVector<PlasmaApi::VirtualDesktop>();
    result.reserve(desktops.size());

    for (auto vd : desktops) {
        result.push_back(PlasmaApi::VirtualDesktop(reinterpret_cast<QObject *>(vd)));
    }

    return result;
}

void Window::setDesktops(const QVector<PlasmaApi::VirtualDesktop> &desktops)
{
    auto arrayToSet = QVector<QObject *>();
    arrayToSet.reserve(desktops.size());

    for (auto desktop : desktops) {
        arrayToSet.push_back(desktop.m_kwinImpl);
    }

    m_kwinImpl->setProperty("desktops", QVariant::fromValue(arrayToSet));
}

void Window::mapper_windowShown(KWin::Window *window)
{
    Q_EMIT windowShown(Window(reinterpret_cast<QObject *>(window)));
};

void Window::mapper_frameGeometryChanged(KWin::Window *window, const QRect &oldGeometry)
{
    Q_EMIT frameGeometryChanged(Window(reinterpret_cast<QObject *>(window)), oldGeometry);
}

void Window::wrapSignals()
{
    WRAP_SIGNAL_WITH_KWIN_TYPE(windowShown(KWin::Window *));
    WRAP_SIGNAL_WITH_KWIN_TYPE(frameGeometryChanged(KWin::Window *, const QRect &));
};

}
