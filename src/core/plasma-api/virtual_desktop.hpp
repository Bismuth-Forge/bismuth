// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>

#include "utils.hpp"

#include "plasma-api/window.hpp"

namespace KWin
{
class VirtualDesktop;
}

namespace PlasmaApi
{

class VirtualDesktop : public QObject
{
    Q_OBJECT

public:
    VirtualDesktop() = default;
    VirtualDesktop(QObject *kwinImpl);
    VirtualDesktop(const VirtualDesktop &);
    VirtualDesktop(VirtualDesktop &&);
    virtual ~VirtualDesktop() = default;

    VirtualDesktop &operator=(const VirtualDesktop &rhs);
    VirtualDesktop &operator=(VirtualDesktop &&rhs);

    bool operator==(const VirtualDesktop &rhs) const;
    bool operator<(const VirtualDesktop &rhs) const;

    BI_READONLY_PROPERTY(QString, id)
    // Q_PROPERTY(QString id READ id CONSTANT)

    BI_PROPERTY(QString, name, setName)
    // Q_PROPERTY(QString name READ name WRITE setName NOTIFY nameChanged)

private:
    QObject *m_kwinImpl;

    friend class PlasmaApi::Window;
    friend class PlasmaApi::Workspace;
};

}

Q_DECLARE_METATYPE(PlasmaApi::VirtualDesktop);
Q_DECLARE_OPAQUE_POINTER(KWin::VirtualDesktop *);
Q_DECLARE_METATYPE(KWin::VirtualDesktop *);
Q_DECLARE_METATYPE(QVector<KWin::VirtualDesktop *>);
