<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
  SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
  SPDX-License-Identifier: MIT
-->

# 🌈 Bismuth

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Arrange your windows automatically and switch between them using keyboard shortcuts. All of that with different layouts and
without a complicated setup of classic tiling window managers (i3, dwm or XMonad). Just install the script on any
KDE Plasma powered Linux distribution and enjoy your computing! 🦾

![script demo](img/demo.gif)

This is a fork of [Krohnkite](https://github.com/esjeon/krohnkite). The fork was made, because the old project seems to be unmaintained.

## 🗺️ Goals

Project goals are the following:

1. Provide full-fledged tiling window manager experience in KDE Plasma with minimal effort on user side
2. Wayland support

## 🌟 Features

- Automatic window tiling
  - Dynamically tile windows, rather than manually placing each.
  - Floating windows
- Fully integrates into KWin features, including:
  - Multi-screen
  - Activities & Virtual desktop
  - Basic window management (minimize, fullscreen, switching, etc)
- Multiple Layout Support
  - Tiling layout
  - Monocle layout
  - Desktop-friendly layouts (Spread, Stair)

## 🔧 Installation

Install script via script:

    npm install # Installs dependencies for building
    npm run script-install

To uninstall:

    npm run script-uninstall

### Enabling User-Configuration

<!-- TODO: This section should not exist in ideal world. -->

[It is reported][kwinconf] that a manual step is required to enable user
configuration of KWin scripts. This is a limitation of KWin scripting.

To enable configuration, you must perform the following in command-line:

    mkdir -p ~/.local/share/kservices5/
    ln -s ~/.local/share/kwin/scripts/bismuth/metadata.desktop ~/.local/share/kservices5/bismuth.desktop

A configuration button will appear in `KWin Scripts` in `System Settings`.

![config button shown](img/scripts_kcm_item.png)

To make changes effective, **the script must be reactivated**:

1. On `KWin Scripts` dialog, untick Bismuth
2. `Apply`
3. tick Bismuth
4. `Apply`

[kwinconf]: https://github.com/faho/kwin-tiling/issues/79#issuecomment-311465357

### Tweaks

Proceed to the [TWEAKS section](TWEAKS.md).

## ⌨️ Default Key Bindings

| Key              | Action             |
| ---------------- | ------------------ |
| Meta + J         | Focus Down/Next    |
| Meta + K         | Focus Up/Previous  |
| Meta + H         | Left               |
| Meta + L         | Right              |
|                  |                    |
| Meta + Shift + J | Move Down/Next     |
| Meta + Shift + K | Move Up/Previous   |
| Meta + Shift + H | Move Left          |
| Meta + Shift + L | Move Right         |
|                  |                    |
| Meta + I         | Increase           |
| Meta + D         | Decrease           |
| Meta + F         | Toggle Floating    |
| Meta + \         | Cycle Layout       |
|                  |                    |
| Meta + Return    | Set as Master      |
|                  |                    |
| Meta + T         | Use Tile Layout    |
| Meta + M         | Use Monocle Layout |
| _unbound_        | Use Spread Layout  |
| _unbound_        | Use Stair Layout   |
