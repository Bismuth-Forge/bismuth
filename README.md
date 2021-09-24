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

This is a fork of [Krohnkite](https://github.com/esjeon/krohnkite). The fork
was made, because the old project seems to be unmaintained. If you want to
import your old shortcuts from it, use the `contrib/import_krohnkite.sh`
script.

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

Install script from source:

    npm install # Installs dependencies for building
    npm run script-install

To uninstall:

    npm run script-uninstall

### Tweaks

Note, that if you've installed the script from the KWin scripts installation
dialog, you need to make a couple of manual fixes and tweaks. See [Tweaks
section](TWEAKS.md).

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
| Increase Master Area Window Count | Meta + I         |
| Decrease Master Area Window Count | Meta + D         |
| Increase Master Area Size         | _None_           |
| Decrease Master Area Size         | _None_           |
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
| Set Floating Layout               | Meta + Shift + F |
| Set Quarter Layout                | _None_           |
|                                   |                  |
| Rotate                            | Meta + R         |
| Rotate Part                       | Meta + Shift + R |
