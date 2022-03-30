// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QList>
#include <QObject>
#include <QRect>
#include <QString>

#include "toplevel.hpp"
#include "utils.hpp"

namespace PlasmaApi
{
class Workspace;

class Client : public TopLevel
{
    Q_OBJECT

public:
    Client() = default;
    Client(QObject *kwinImpl);
    Client(const Client &);
    virtual ~Client() = default;

    bool operator==(const Client &rhs) const;
    bool operator<(const Client &rhs) const;

    /**
     * The activities this client is on. If it's on all activities the property is empty.
     */
    BI_READONLY_PROPERTY(QStringList, activities)

    /**
     * Window caption (The text in the titlebar).
     */
    BI_READONLY_PROPERTY(QString, caption)

    /**
     * The geometry of this Client. Be aware that depending on resize mode the frameGeometryChanged
     * signal might be emitted at each resize step or only at the end of the resize operation.
     */
    BI_PROPERTY(QRect, frameGeometry, setFrameGeometry)

    // /**
    //  * Whether the window is active.
    //  */
    // Q_PROPERTY(bool active READ active)

    // /**
    //  * Maximum allowed size for a window.
    //  */
    // Q_PROPERTY(QSize maxSize READ maxSize)

    // /**
    //  * Minimum allowed size for a window.
    //  */
    // Q_PROPERTY(QSize minSize READ minSize)

    // /**
    //  * Whether the window is modal or not.
    //  */
    // Q_PROPERTY(bool modal READ modal)

    // /**
    //  * Whether the window is currently being moved by the user.
    //  */
    // Q_PROPERTY(bool move READ move)

    // /**
    //  * Whether the window is currently being resized by the user.
    //  */
    // Q_PROPERTY(bool resize READ resize)

    // /**
    //  * Whether the window is resizable
    //  */
    // Q_PROPERTY(bool resizable READ resizable)

    /**
     * Whether the window is any of special windows types (desktop, dock, splash, ...),
     * i.e. window types that usually don't have a window frame and the user does not use window
     * management (moving, raising,...) on them.
     */
    BI_READONLY_PROPERTY(bool, specialWindow)

    /**
     * The desktop this window is on. If the window is on all desktops the property has value -1.
     */
    BI_PROPERTY(int, desktop, setDesktop)

    // /**
    //  * Whether the window is fullscreen
    //  */
    // Q_PROPERTY(bool fullScreen READ fullScreen WRITE set_fullScreen)

    /**
     * Whether the window is set to be above all
     */
    BI_PROPERTY(bool, keepAbove, setKeepAbove)

    // /**
    //  * Whether the window is set to be below all
    //  */
    // Q_PROPERTY(bool keepBelow READ keepBelow WRITE set_keepBelow)

    /**
     * Whether the window is minimized
     */
    BI_PROPERTY(bool, minimized, setMinimized);

    // /**
    //  * Whether the window has borders (window decorations)
    //  */
    // Q_PROPERTY(bool noBorder READ noBorder WRITE set_noBorder)

    /**
     * Whether the window is set to be on all desktops
     */
    BI_PROPERTY(bool, onAllDesktops, setOnAllDesktops)

    // /**
    //  * Whether the Client is shaded.
    //  */
    // Q_PROPERTY(bool shade READ shade WRITE set_shade)

    friend class PlasmaApi::Workspace;
};

}

Q_DECLARE_METATYPE(PlasmaApi::Client);
