<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
  SPDX-License-Identifier: MIT
-->

# 🤝 Contributing

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-red?style=flat-square&logo=Git)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/Code_Style-Prettier-yellow?style=flat-square&logo=Prettier)](https://github.com/prettier/prettier)

We glad, that you want to contribute to the project. To make things easier
please read the following.

## 🏗️ Development packages

To make sure you can develop the script install all the tools you need:

- [REUSE tool](https://git.fsfe.org/reuse/tool#install)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [CMake](https://cmake.org/)
- [Clang-format](https://clang.llvm.org/docs/ClangFormat.html)
- [Pre Commit](https://pre-commit.com/)

## 👷 Prepare environment

To prepare environment, clone the project and execute the following:

```sh
make setup-dev-env
```

This will install and set up all the things you need (Git Hooks, Dependencies).

## 🔨 Compile Bismuth

To compile Bismuth execute the following:

```sh
make build
```

This will compile the script via TypeScript and produce the JS output adapted to
[QML JavaScript Environment](https://doc.qt.io/qt-5/qtqml-javascript-hostenvironment.html).

## 📦 Installation

To install compiled package, execute:

```sh
make install
```

Note however, that if you have the script already installed and enabled, you need to
restart KWin, so that it can apply the changes you've made. To do so do:

```sh
make restart-kwin-x11
```

You can uninstall the package using the following command:

```sh
make uninstall
```

## 🧪 Unit testing

Bismuth comes with unit tests. To run them execute the following:

```sh
make tests
```

## 📑 API Documentation

> ☝️ To view the current API documentation please go
> [here](https://bismuth-forge.github.io/bismuth/).

To generate API docs, run the following:

```sh
make docs
```

This will generate the documentation in the build directory.

## ❓ FAQ

### I am not a developer

Do not worry, you can still contribute fixing the documentation or just opening
the issues and reporting bugs! Do not underestimate your impact, as the job of
tester and bug triager is one of the most valuable in any software project.
What the use of being a developer if you don't know what to fix or implement?

### What skills do I need to contribute as a developer?

Bismuth is written in TypeScript and C++, so you'll have to know some. To learn
TypeScript, check out the
[Handbook](https://www.typescriptlang.org/docs/handbook/). If you know
JavaScript and have an experience in some strongly typed language, it will be
easy, and even if it not, you're still doing a great job - you can do it!

You'll also need to know something about KWin scripting and Qt JavaScript
Environment. For KWin scripting there is [a tutorial on the KDE developer
portal](https://develop.kde.org/docs/plasma/kwin/). And for Qt JavaScript
things you can check out [the official
documentation](https://doc.qt.io/qt-5/qtqml-javascript-hostenvironment.html).
