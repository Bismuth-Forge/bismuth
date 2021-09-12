// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

export enum Shortcut {
  Left,
  Right,
  Up,
  Down,

  /* Alternate HJKL bindings */
  FocusUp,
  FocusDown,
  FocusLeft,
  FocusRight,

  ShiftLeft,
  ShiftRight,
  ShiftUp,
  ShiftDown,

  SwapUp,
  SwapDown,
  SwapLeft,
  SwapRight,

  GrowWidth,
  GrowHeight,
  ShrinkWidth,
  ShrinkHeight,

  Increase,
  Decrease,
  ShiftIncrease,
  ShiftDecrease,

  ToggleFloat,
  ToggleFloatAll,
  SetMaster,
  NextLayout,
  PreviousLayout,
  SetLayout,

  Rotate,
  RotatePart,
}
