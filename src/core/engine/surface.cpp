// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "surface.hpp"

#include "logger.hpp"
#include "plasma-api/api.hpp"
#include "plasma-api/virtual-desktop.hpp"

#include "config.hpp"

namespace Bismuth
{
Surface::Surface(const PlasmaApi::VirtualDesktop &virtualDesktop, int screen, const QRectF &geometry, const Config &config)
    : m_virtualDesktop(virtualDesktop)
    , m_screen(screen)
    , m_windows({geometry, config})
    , m_config(config)
{
    adjustWorkingArea(geometry);
    // m_windows->setLayout("master-stack");
}

bool Surface::operator==(const Surface &rhs)
{
    return m_virtualDesktop == rhs.m_virtualDesktop && m_screen == rhs.m_screen;
}

QString Surface::key()
{
    return key(m_virtualDesktop.id(), m_screen);
}

QString Surface::key(const QString &virtualDesktopId, int screen)
{
    return QStringLiteral("%1_%2").arg(virtualDesktopId).arg(screen);
}

QString Surface::virtualDesktopId() const
{
    return m_virtualDesktop.id();
}

int Surface::x11DesktopNumber() const
{
    return m_virtualDesktop.x11DesktopNumber();
};

int Surface::screen() const
{
    return m_screen;
}

void Surface::addWindow(const PlasmaApi::Window &window)
{
    if (m_windows.has_value()) {
        m_windows->addWindow(window);
    }
}

void Surface::removeWindow(const PlasmaApi::Window &window)
{
    if (!m_windows.has_value()) {
        return;
    }

    m_windows->removeWindow(window);
}

void Surface::arrangeWindows()
{
    if (m_windows.has_value()) {
        m_windows->arrange();
    }
}

void Surface::setMainLayout(std::string_view id)
{
    m_windows->setLayout(id);
    arrangeWindows();
}

Layout *Surface::mainLayout()
{
    if (!m_windows.has_value()) {
        return nullptr;
    }

    return m_windows->layout();
}

void Surface::adjustWorkingArea(const QRectF &newAreaWithoutGaps)
{
    if (m_windows.has_value()) {
        auto leftGap = m_config.screenGapLeft();
        auto topGap = m_config.screenGapTop();
        auto rightGap = m_config.screenGapRight();
        auto bottomGap = m_config.screenGapBottom();
        m_windows->setGeometry(newAreaWithoutGaps.adjusted(leftGap, topGap, -rightGap, -bottomGap));
    }
};

QRectF Surface::workingArea() const
{
    return m_windows->geometry();
};
}
