// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import ISurface from "./isurface";
import Rect from "../util/rect";

export default interface IDriverWindow {
  readonly fullScreen: boolean;
  readonly geometry: Readonly<Rect>;
  readonly id: string;
  readonly maximized: boolean;
  readonly shouldIgnore: boolean;
  readonly shouldFloat: boolean;

  surface: ISurface;

  commit(geometry?: Rect, noBorder?: boolean, keepAbove?: boolean): void;
  visible(srf: ISurface): boolean;
}
