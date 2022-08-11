// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>

#include "utils.hpp"

namespace KWin
{
class Output;
}

namespace PlasmaApi
{

class Workspace;

class Output : public QObject
{
    Q_OBJECT

public:
    Output() = default;
    Output(QObject *kwinImpl);
    Output(const Output &);
    Output(Output &&);
    virtual ~Output() = default;

    Output &operator=(const Output &rhs);
    Output &operator=(Output &&rhs);

    bool operator==(const Output &rhs) const;
    bool operator<(const Output &rhs) const;

private:
    QObject *m_kwinImpl;

    friend class PlasmaApi::Workspace;
};
}
