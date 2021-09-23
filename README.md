<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
  SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
  SPDX-License-Identifier: MIT
-->

# 🌈 Bismuth

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-red?style=flat-square&logo=Git)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/Code_Style-Prettier-yellow?style=flat-square&logo=Prettier)](https://github.com/prettier/prettier)
[![wayland: supported](https://img.shields.io/badge/Wayland-Ready-blue?style=flat-square&logo=kde)](https://community.kde.org/KWin/Wayland)

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

## ⌨️ Actions and Default Keyboard Shortcuts

| Action                            | Key              |
| --------------------------------- | ---------------- |
| Focus Next Window                 | _None_           |
| Focus Previous Window             | _None_           |
| Focus Upper Window                | Meta + J         |
| Focus Bottom Window               | Meta + K         |
| Focus Left Window                 | Meta + H         |
| Focus Right Window                | Meta + L         |
|                                   |                  |
| Move Window To Next Position      | _None_           |
| Move Window To Previous Position  | _None_           |
| Move Window Up                    | Meta + Shift + J |
| Move Window Down                  | Meta + Shift + K |
| Move Window Left                  | Meta + Shift + H |
| Move Window Right                 | Meta + Shift + L |
|                                   |                  |
| Increase Window Width             | Meta + Ctrl + L  |
| Increase Window Height            | Meta + Ctrl + J  |
| Decrease Window Width             | Meta + Ctrl + H  |
| Decrease Window Height            | Meta + Ctrl + K  |
|                                   |                  |
| Increase Master Area Window Count | _None_           |
| Decrease Master Area Window Count | _None_           |
| Increase Master Area Size         | Meta + I         |
| Decrease Master Area Size         | Meta + D         |
| Push Window Into Master Area      | Meta + Return    |
|                                   |                  |
| Toggle Active Window Floating     | Meta + F         |
|                                   |                  |
| Switch To Next Layout             | Meta + \         |
| Switch To Previous Layout         | Meta + \|        |
|                                   |                  |
| Set Tile Layout                   | Meta + T         |
| Set Monocle Layout                | Meta + M         |
| Set Three Column Layout           | _None_           |
| Set Spread Layout                 | _None_           |
| Set Stair Layout                  | _None_           |
| Set Floating Layout               | _None_           |
| Set Quarter Layout                | _None_           |
|                                   |                  |
| Rotate                            | Meta + R         |
| Rotate Part                       | Meta + Shift + R |
