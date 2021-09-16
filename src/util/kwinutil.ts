// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Rect from "./rect";

export function toQRect(rect: Rect): QRect {
  return Qt.rect(rect.x, rect.y, rect.width, rect.height);
}

export function toRect(qrect: QRect): Rect {
  return new Rect(qrect.x, qrect.y, qrect.width, qrect.height);
}
