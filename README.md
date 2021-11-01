<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
  SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
  SPDX-License-Identifier: MIT
-->

# 🌈 Bismuth

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-red?style=flat-square&logo=Git)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/Code_Style-Prettier-yellow?style=flat-square&logo=Prettier)](https://github.com/prettier/prettier)
[![wayland: supported](https://img.shields.io/badge/Wayland-Ready-blue?style=flat-square&logo=kde)](https://community.kde.org/KWin/Wayland)

Arrange your windows automatically and switch between them using keyboard
shortcuts. All of that with different layouts and without a complicated setup
of classic tiling window managers (i3, dwm or XMonad). Just install the script
on any KDE Plasma powered Linux distribution and enjoy your computing! 🦾

![script demo](img/demo.gif)

This is a fork of [Krohnkite](https://github.com/esjeon/krohnkite). The fork
was made, because the old project seems to be unmaintained. If you want to
import your old shortcuts from it, use the `contrib/import_krohnkite.sh`
script.

## 🌟 Features and Goals

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
    npm run bi-install # Installs all Bismuth components

To uninstall:

    npm run bi-uninstall

### I want a simple installation!

Understandable. Bismuth is a complex extension to KDE Plasma and therefore it
requires complex packaging for different Linux distributions, at least for main
ones: Ubuntu-based, Fedora-based and Arch-based. This is a complex task, so if
you're skillful, you're welcome to create a package for your distribution and
share it with others via PR to Bismuth.

### Tweaks

You may want to make a couple of manual fixes and tweaks, to improve your
experience. See [Tweaks section](TWEAKS.md).

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
