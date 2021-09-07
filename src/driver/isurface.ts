// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import Rect from "../util/rect";

export default interface ISurface {
  readonly id: string;
  readonly ignore: boolean;
  readonly workingArea: Readonly<Rect>;

  next(): ISurface | null;
}
