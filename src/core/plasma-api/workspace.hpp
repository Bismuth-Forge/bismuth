// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>
#include <QQmlEngine>

#include "plasma-api/client.hpp"

#include "utils.hpp"

// Forward declare KWin Classes
namespace KWin
{
class AbstractClient;
}

namespace PlasmaApi
{
class Workspace : public QObject
{
    Q_OBJECT
public:
    enum ClientAreaOption {
        PlacementArea, // Geometry where a window will be initially placed after being mapped
        MovementArea, // Window movement snapping area? Ignore struts
        MaximizeArea, // Geometry to which a window will be maximized
        MaximizeFullArea, // Like MaximizeArea, but ignore struts
        FullScreenArea, // Area for fullscreen windows
        WorkArea, // Whole workarea (all screens together)
        FullArea, // Whole area (all screens together), ignore struts
        ScreenArea, // One whole screen, ignore struts
    };
    Q_ENUM(ClientAreaOption)

    Workspace(QQmlEngine *engine);
    Workspace(const Workspace &);

    BI_PROPERTY(int, currentDesktop, setCurrentDesktop);
    BI_PROPERTY(QString, currentActivity, setCurrentActivity);
    BI_PROPERTY(int, desktops, setDesktops);

    /**
     * Returns the geometry a Client can use with the specified option.
     * This method should be preferred over other methods providing screen sizes as the
     * various options take constraints such as struts set on panels into account.
     * This method is also multi screen aware, but there are also options to get full areas.
     * @param option The type of area which should be considered
     * @param screen The screen for which the area should be considered
     * @param desktop The desktop for which the area should be considered, in general there should not be a difference
     * @returns The specified screen geometry
     */
    Q_INVOKABLE QRect clientArea(ClientAreaOption, int screen, int desktop);

private Q_SLOTS:
    void currentDesktopChangedTransformer(int desktop, KWin::AbstractClient *kwinClient);

Q_SIGNALS:
    void currentDesktopChanged(int desktop, PlasmaApi::Client kwinClient);

    /**
     * Signal emitted whenever the current activity changed.
     * @param id id of the new activity
     */
    void currentActivityChanged(const QString &id);

private:
    void wrapSignals();

    QQmlEngine *m_engine;
    QObject *m_kwinImpl;
};

}
