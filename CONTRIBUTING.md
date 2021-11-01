<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
  SPDX-License-Identifier: MIT
-->

# 🤝 Contributing

We glad, that you want to contribute to the project. To make things easier
please read the following.

## 🏗️ Development packages

To make sure you can develop the script install all the tools you need:

- [REUSE tool](https://git.fsfe.org/reuse/tool#install)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [CMake](https://cmake.org/)
- [Clang-format](https://clang.llvm.org/docs/ClangFormat.html)

## 👷 Prepare environment

To prepare environment, clone the project and execute the following:

```sh
npm install # Install development dependencies
```

This will install all the things you need, including TypeScript compiler, Unit
Testing framework and so fore so on.

## 🔨 Compile Bismuth

To compile Bismuth execute the following:

```sh
npm run build
```

This will compile the script via TypeScript and produce the JS output adapted to
[QML Javascript Environment](https://doc.qt.io/qt-5/qtqml-javascript-hostenvironment.html).

## 📦 Installation

To install compiled package, execute:

```sh
npm run bi-install
```

Note however, that if you have the script already installed and enabled, you need to
restart KWin, so that it can apply the changes you've made. To do so you have a
convenient script too:

```sh
npm run install-and-restart-kwin-x11
```

This will run the previous steps for you and restart KWin, if you're using X11 session.
After you quit the restarted KWin, it will automatically restart in the background, so
that you working session remains in tact.

## 🧪 Unit testing

Bismuth comes with unit tests. To run them execute the standard npm command:

```sh
npm test
```

There is an important note, regarding the unit testing. All the tests are run
on the Node.js environment. Basically, it means that the global environment you
see in unit-tests and the global environment you see in the script, while it is
running in KWin scripting environment, are not the same. Because of this we
minimize the usage of global object in the code, and you should do the same.

## 📑 API Documentation generation

To generate API docs, run the following:

```sh
npm run docs
```

This will generate the documentation via TypeDoc in the build directory.

## 😥 This seems complicated

Don't worry. The npm commands from the above depend on each other. That means
that in a typical development workflow you will need only to run of them.
For example, if I want to manually test the script after some changes, I run:

```sh
npm run install-and-restart-kwin-x11
```

This commands will automatically build the script, package it, install it and
restart the KWin, so that I can see the changes. No need to worry about the
steps.

## ❓ FAQ

### I am not a developer

Do not worry, you can still contribute fixing the documentation or just opening
the issues and reporting bugs! Do not underestimate your impact, as the job of
tester and bug triager is one of the most valuable in any software project.
What the use of being a developer if you don't know what to fix or implement?

### What skills do I need to contribute as a developer?

Bismuth is written in TypeScript, so you'll have to know some. To learn it,
check out the [Handbook](https://www.typescriptlang.org/docs/handbook/). If you
know JavaScript and have an experience in some strongly typed language, it will
be easy, and even if it not, you're still doing a great job - you can do it!

You'll also need to know something about KWin scripting and Qt JavaScript
Environment. For KWin scripting there is [a tutorial on the KDE developer
portal](https://develop.kde.org/docs/plasma/kwin/). And for Qt JavaScript
things you can check out [the official
documentation](https://doc.qt.io/qt-5/qtqml-javascript-hostenvironment.html).
