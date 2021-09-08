// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import ISurface from "./isurface";
import Window from "../engine/window";

export default interface IDriverContext {
  readonly screens: ISurface[];
  readonly cursorPosition: [number, number] | null;

  currentSurface: ISurface;
  currentWindow: Window | null;

  setTimeout(func: () => void, timeout: number): void;
  showNotification(text: string): void;
}
