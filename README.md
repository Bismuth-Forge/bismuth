<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
  SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
  SPDX-License-Identifier: MIT
-->

# 🌈 Bismuth

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-red?style=flat-square&logo=Git)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/Code_Style-Prettier-yellow?style=flat-square&logo=Prettier)](https://github.com/prettier/prettier)
[![wayland: supported](https://img.shields.io/badge/Wayland-Ready-blue?style=flat-square&logo=kde)](https://community.kde.org/KWin/Wayland)
[![AUR version](https://img.shields.io/aur/version/kwin-bismuth)](https://aur.archlinux.org/packages/kwin-bismuth)
[![Opensuse Openbuild](https://img.shields.io/badge/Openbuild-kwin--bismuth-blue)](https://build.opensuse.org/package/show/home:wstephenson:kwin/kwin-script-tiling-bismuth)

Arrange your windows automatically and switch between them using keyboard
shortcuts. All of that with different layouts and without a complicated setup
of classic tiling window managers (i3, dwm or XMonad). Just install Bismuth
on any KDE Plasma powered Linux distribution and you are ready to go! 🦾

![script demo](img/demo.gif)

This is a fork of [Krohnkite](https://github.com/esjeon/krohnkite). The fork
was made, because the old project seems to be unmaintained. If you want to
import your old shortcuts from it, use the `contrib/import_krohnkite.sh`
script.

## 🌟 Features

- Full KDE Plasma integration
  - Multiple Screens, Activities and Virtual desktops
  - Built-in KWin features (minimize, full-screen and rules)
  - Floating Dialog windows
- Multiple Layouts
  - Classic Tiling layout
  - Monocle layout for focusing on one application
  - Three-Column for wide monitors
  - Floating layout for traditional experience
- Works on Wayland Plasma session

## 🔧 Installation

### From Source

Install script from source:

    npm install # Installs dependencies for building
    npm run sysdep-install # Install system dependencies for building
    npm run bi-install # Installs all Bismuth components

To uninstall:

    npm run bi-uninstall
    
### Arch-based distros

Bismuth is available on AUR. Install the [`kwin-bismuth` package](https://aur.archlinux.org/packages/kwin-bismuth) with your favorite AUR helper.

### Other Distros

Bismuth is available on opensuse's openbuild service. Install the [`kwin-bismuth` package](https://build.opensuse.org/package/show/home:wstephenson:kwin/kwin-script-tiling-bismuth).

### When downloading from distribution packages

- If the user is encountering a problem with the installation process when using the distribution packages, they should contact the package maintainer directly first.
- Download the packages at your own risk, they are not distributed by the bismuth team and are entirely a community effort to simplify the installation process.

### Tweaks

You may want to make a couple of manual fixes and tweaks, to improve your
experience. See [Tweaks section](TWEAKS.md).

## ⚙️ Configuration

You can configure Bismuth in the System Settings > Window Management > Window Tiling.

![Bismuth Configuration Module](img/config.png)

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
| Increase Master Area Window Count | Meta + ]         |
| Decrease Master Area Window Count | Meta + [         |
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
