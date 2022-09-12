// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "helpers.hpp"

std::ostream &operator<<(std::ostream &os, const QRectF &value)
{
    qreal x1, y1, x2, y2;
    value.getCoords(&x1, &y1, &x2, &y2);
    os << "QRect(" << x1 << ", " << y1 << ", " << x2 << ", " << y2 << ")";
    return os;
}

std::ostream &operator<<(std::ostream &os, const QRect &value)
{
    int x1, y1, x2, y2;
    value.getCoords(&x1, &y1, &x2, &y2);
    os << "QRect(" << x1 << ", " << y1 << ", " << x2 << ", " << y2 << ")";
    return os;
}
