// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>

#include "utils.hpp"

namespace PlasmaApi
{

class TopLevel : public QObject
{
    Q_OBJECT
public:
    TopLevel() = default;
    virtual ~TopLevel() = default;
    explicit TopLevel(QObject *kwinImplPtr);
    TopLevel(const TopLevel &);
    TopLevel(TopLevel &&);
    TopLevel &operator=(const TopLevel &);
    TopLevel &operator=(TopLevel &&);

    /**
     * Whether the window is a dialog window.
     */
    BI_READONLY_PROPERTY(bool, dialog)

    // /**
    //  * Frame geometry
    //  */
    // // Q_PROPERTY(QRect frameGeometry READ frameGeometry WRITE set_frameGeometry)
    // // QRECT_

    /**
     * Window class name
     */
    BI_READONLY_PROPERTY(QByteArray, resourceClass)

    // /**
    //  * Window title
    //  */
    // Q_PROPERTY(QByteArray resourceName READ resourceName)
    // QBYTEARRAY_PRIMITIVE_GET(resourceName)

    /**
     * On which screen toplevel is
     */
    BI_READONLY_PROPERTY(int, screen)

    // /**
    //  * Whether the window is a splashscreen.
    //  */
    // Q_PROPERTY(bool splash READ splash)
    // BOOL_PRIMITIVE_GET(splash)
    //
    // /**
    //  * Whether the window is a utility window, such as a tool window.
    //  */
    // Q_PROPERTY(bool utility READ utility)
    // BOOL_PRIMITIVE_GET(utility)
    //
    // /**
    //  * Window id in KWin
    //  */
    // Q_PROPERTY(int windowId READ windowId)
    // INT_PRIMITIVE_GET(windowId)
    //
    // /**
    //  * Window role property
    //  */
    // Q_PROPERTY(QByteArray windowRole READ windowRole)
    // QBYTEARRAY_PRIMITIVE_GET(windowRole)
    //
    // /**
    //  * Client position
    //  */
    // Q_PROPERTY(QPoint clientPos READ clientPos)
    // QPOINT_PRIMITIVE_GET(clientPos)
    //
    // /**
    //  * Client size
    //  */
    // Q_PROPERTY(QSize clientSize READ clientSize)
    // QSIZE_PRIMITIVE_GET(clientSize)

protected:
    QObject *m_kwinImpl;
};

}

Q_DECLARE_METATYPE(PlasmaApi::TopLevel);
