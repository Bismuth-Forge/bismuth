// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>
#include <QQmlEngine>

#include <optional>

#include "plasma-api/window.hpp"

#include "utils.hpp"

// Forward declare KWin Classes
namespace KWin
{
class Window;
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

    Workspace(QObject *implPtr);
    Workspace(const Workspace &);

    BI_READONLY_PROPERTY(int, numScreens);
    BI_READONLY_PROPERTY(int, activeScreen);
    BI_READONLY_PROPERTY(QStringList, activities);

    BI_PROPERTY(int, currentDesktop, setCurrentDesktop);
    BI_PROPERTY(QString, currentActivity, setCurrentActivity);
    BI_PROPERTY(int, desktops, setDesktops);

    Q_PROPERTY(std::optional<PlasmaApi::Window> activeClient READ activeClient WRITE setActiveClient);

    std::optional<PlasmaApi::Window> activeClient() const;
    void setActiveClient(std::optional<PlasmaApi::Window> client);

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

    Q_INVOKABLE std::vector<PlasmaApi::Window> clientList() const;

private Q_SLOTS:
    void currentDesktopChangedTransformer(int desktop, KWin::Window *kwinClient);
    void clientAddedTransformer(KWin::Window *);
    void clientRemovedTransformer(KWin::Window *);
    void clientMinimizedTransformer(KWin::Window *);
    void clientUnminimizedTransformer(KWin::Window *);
    void clientMaximizeSetTransformer(KWin::Window *, bool h, bool v);

Q_SIGNALS:
    void currentDesktopChanged(int desktop, PlasmaApi::Window kwinClient);

    /**
     * Signal emitted when the number of screens changes.
     * @param count The new number of screens
     */
    void numberScreensChanged(int count);

    /**
     * This signal is emitted when the size of @p screen changes.
     * Don't forget to fetch an updated client area.
     *
     * @deprecated Use QScreen::geometryChanged signal instead.
     */
    void screenResized(int screen);

    /**
     * Signal emitted whenever the current activity changed.
     * @param id id of the new activity
     */
    void currentActivityChanged(const QString &id);

    void clientAdded(PlasmaApi::Window client);

    void clientRemoved(PlasmaApi::Window client);

    void clientMinimized(PlasmaApi::Window client);

    void clientUnminimized(PlasmaApi::Window client);

    void clientMaximizeSet(PlasmaApi::Window client, bool h, bool v);

private:
    void wrapSignals();

    QObject *m_kwinImpl;
};

}
