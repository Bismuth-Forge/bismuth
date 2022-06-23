<!--
  SPDX-FileCopyrightText: none
  SPDX-License-Identifier: MIT
-->

# Changelog

### [3.1.2](https://www.github.com/Bismuth-Forge/bismuth/compare/v3.1.1...v3.1.2) (2022-06-23)


### Bug Fixes

* don't crash on color config change ([#380](https://www.github.com/Bismuth-Forge/bismuth/issues/380)) ([8d3b5b1](https://www.github.com/Bismuth-Forge/bismuth/commit/8d3b5b1b100b8597432b7d32ef687451a87d0347))
* **kwinscript:** arrange after an activity/desktop change ([c702857](https://www.github.com/Bismuth-Forge/bismuth/commit/c70285705bf90757b839936211fea00afd788fee))

### [3.1.1](https://www.github.com/Bismuth-Forge/bismuth/compare/v3.1.0...v3.1.1) (2022-04-11)


### Bug Fixes

* **shortcuts_migration:** don't override the existing shortcuts ([d2d3cfd](https://www.github.com/Bismuth-Forge/bismuth/commit/d2d3cfd89b2a908bf3eab5ac95899d70520fe012))

## [3.1.0](https://www.github.com/Bismuth-Forge/bismuth/compare/v3.0.0...v3.1.0) (2022-04-09)


### Features

* add an option to disable "drag out to float" behavior ([bb68131](https://www.github.com/Bismuth-Forge/bismuth/commit/bb68131e1be31b4f920da8c4b7dcb2e42f85b461))


### Bug Fixes

* add zoom windows to the default ignore list ([d563c40](https://www.github.com/Bismuth-Forge/bismuth/commit/d563c4045eeb6e8cc30d2e2d29f635888cdbbd79))
* clientList vector reserve ([0601f99](https://www.github.com/Bismuth-Forge/bismuth/commit/0601f99c5c74a65d4196c7c5514c9d958b4c7418))
* ignore spaces in comma separated lists configs ([fb78513](https://www.github.com/Bismuth-Forge/bismuth/commit/fb7851386b91f3fb29c9c0f5da840c76cc43c3fd))
* **kdecoration:** prevent crash when changing color scheme ([3e872ee](https://www.github.com/Bismuth-Forge/bismuth/commit/3e872eed8dad95398f2ceb85272aebe33f689ce3))
* move old shortcuts to the new component correctly ([748d991](https://www.github.com/Bismuth-Forge/bismuth/commit/748d99174a1b0351966ab962035aad54fee4fb61))

## [3.0.0](https://www.github.com/Bismuth-Forge/bismuth/compare/v2.3.0...v3.0.0) (2022-03-20)


### ⚠ BREAKING CHANGES

* remove legacy tray applet
* remove debug option
* register shortcuts in the separate category in the System Settings
* force c++17 to the project
* remove KDECompilerSettings

### Features

* add window decoration that integrates with tiling ([517281e](https://www.github.com/Bismuth-Forge/bismuth/commit/517281e1587692d70cf0093c9901d192cd776f1d))
* register shortcuts in the separate category in the System Settings ([1a49257](https://www.github.com/Bismuth-Forge/bismuth/commit/1a4925718040b3d0f7bff96bfdae0f63041f1f12))
* remove legacy tray applet ([78eff10](https://www.github.com/Bismuth-Forge/bismuth/commit/78eff105122b968e298c918a79976a4d280104a8))


### Bug Fixes

* float some utility windows on wayland ([2030767](https://www.github.com/Bismuth-Forge/bismuth/commit/2030767dd03518a1296376890ad03bbb85d3ffdb))


### Miscellaneous Chores

* force c++17 to the project ([0d1796b](https://www.github.com/Bismuth-Forge/bismuth/commit/0d1796b1d836191e6b9f2df703b660c02f076a3c))
* remove debug option ([c30e837](https://www.github.com/Bismuth-Forge/bismuth/commit/c30e8377b9524e84347b2e1875f4b0fafb1fab0d))
* remove KDECompilerSettings ([9f3c341](https://www.github.com/Bismuth-Forge/bismuth/commit/9f3c341f2cbc090a6581f83553bc5f1f8934d679))

## [2.3.0](https://www.github.com/Bismuth-Forge/bismuth/compare/v2.2.0...v2.3.0) (2022-01-26)


### Features

* add keyboard shortcut entry for Spiral Layout ([dde0c49](https://www.github.com/Bismuth-Forge/bismuth/commit/dde0c499ab6d556ef1f68a8493bd5072392a1a68))


### Bug Fixes

* use correct min/max func and start val for finding closest window ([2548aa5](https://www.github.com/Bismuth-Forge/bismuth/commit/2548aa5dbd0ebc6bdc7118cc8b301dc0b8d13cb3))

## [2.2.0](https://www.github.com/Bismuth-Forge/bismuth/compare/v2.1.0...v2.2.0) (2021-12-02)


### Features

* display layout icons in the OSD popup ([b049197](https://www.github.com/Bismuth-Forge/bismuth/commit/b0491978fdd3bca83a8a7fe0f393965a76d378cc))
* new KCM icon ([c2bea95](https://www.github.com/Bismuth-Forge/bismuth/commit/c2bea9547e1bcb223efd48a581c6f257b98783eb))


### Bug Fixes

* behaviour tab is now first ([ae0a594](https://www.github.com/Bismuth-Forge/bismuth/commit/ae0a594bb89e3d253dbd3f6bf5be88c09167e689))
* focus lone window with move focus shortcut ([4c3b17d](https://www.github.com/Bismuth-Forge/bismuth/commit/4c3b17d492a787e84ec823fdd8d472c82536c641))
* hide the script entry in the system settings ([883d798](https://www.github.com/Bismuth-Forge/bismuth/commit/883d79858f44322ae52e8943fb369943772784b6))
* properly maximize windows via window decoration buttons ([3d9c874](https://www.github.com/Bismuth-Forge/bismuth/commit/3d9c874439fd0d28a63f71d5410a53547735840e))
* provide an "enable tiling" option ([c285446](https://www.github.com/Bismuth-Forge/bismuth/commit/c2854466cca76067c036dd523c327d254f801cc8))
* select last used window when moving focus up or to the left ([969cf96](https://www.github.com/Bismuth-Forge/bismuth/commit/969cf96e8da5828a2fd2789faec324271225da7e))

## [2.1.0](https://www.github.com/Bismuth-Forge/bismuth/compare/v2.0.1...v2.1.0) (2021-11-09)


### Features

* add a shortcut for the reverse rotation action ([a027e54](https://www.github.com/Bismuth-Forge/bismuth/commit/a027e5467f870e6f8b6b046d4d8e3477ea6dca8d))
* make script installation directory global ([b82e0b2](https://www.github.com/Bismuth-Forge/bismuth/commit/b82e0b270698539a510a617c3736d60d1450359f))

### [2.0.1](https://www.github.com/Bismuth-Forge/bismuth/compare/v2.0.0...v2.0.1) (2021-11-08)


### Bug Fixes

* do not ignore second windows when resize ([165008b](https://www.github.com/Bismuth-Forge/bismuth/commit/165008b9ac755bf312096ea45ac2ef303fb42e3a))
* prevent broken tiling, by not including empty stings into rules ([9a5cbe4](https://www.github.com/Bismuth-Forge/bismuth/commit/9a5cbe498cfc32e7ae1612cabce0e173e9e55c28))

## [2.0.0](https://www.github.com/Bismuth-Forge/bismuth/compare/v1.1.0...v2.0.0) (2021-11-03)


### ⚠ BREAKING CHANGES

* remove old config button from KWin scripts page. This is no longer needed, as the user should use KCM.
* removed adjust layout options. These options should be always enabled by default, because this is how all tiling window managers work: mouse resize always has feedback and resizing always affects the layout.

### Features

* add KCM for Bismuth configuration ([1c410cf](https://www.github.com/Bismuth-Forge/bismuth/commit/1c410cf1c759d707596a42214489dbe36bd52278))
* introduce tray item, that lets you toggle floating mode ([ba689c5](https://www.github.com/Bismuth-Forge/bismuth/commit/ba689c5ff099c3263384395cfaa737a14e158b90))
* make layouts togglable ([8ebffbe](https://www.github.com/Bismuth-Forge/bismuth/commit/8ebffbe639efcf1cfec5addad29e2777d1bbd5d2))
* reload script after applying configuraton ([e73cbce](https://www.github.com/Bismuth-Forge/bismuth/commit/e73cbce4c8af5ab308634972409b4f7f87e95085))

### Bug Fixes

* correctly destroy callbacks after script unload ([aad9860](https://www.github.com/Bismuth-Forge/bismuth/commit/aad986096273bc9d66ef7098c1c32b725a120902))

## [1.1.0](https://www.github.com/gikari/bismuth/compare/v1.0.2...v1.1.0) (2021-10-23)


### Features

* :lipstick: make the popup more consistent with the Plasma OSDs ([8d6a374](https://www.github.com/gikari/bismuth/commit/8d6a3747e640c4bd418e361b342f1cb0745a3ff0))
* use better layout notifications ([8c013ac](https://www.github.com/gikari/bismuth/commit/8c013ac7bc8d293c81c1f14f03c2147d47d43703))


### Bug Fixes

* :ambulance: add executable flag to installation script ([360588a](https://www.github.com/gikari/bismuth/commit/360588ad216d364a81d518e020e5fe37b6365ccc))
* improve popup geometry update ([1f02e47](https://www.github.com/gikari/bismuth/commit/1f02e47a37fa0771f10e31e6e7f2e5d2cb9419db))
* **popup:** fix errors in popup.qml ([2862e56](https://www.github.com/gikari/bismuth/commit/2862e56194fc37308224caf5fe826c76a59e088c))

### [1.0.2](https://www.github.com/gikari/bismuth/compare/v1.0.1...v1.0.2) (2021-10-22)


### Bug Fixes

* :bug: add Conky to default ignore list ([d989261](https://www.github.com/gikari/bismuth/commit/d989261d82ed75781b59322402beb6c3916d09ce))
* :bug: correctly import Tile Layout Krohnkite shortcut ([04f11f9](https://www.github.com/gikari/bismuth/commit/04f11f98c31ce63adb6c09a06da95377b01defba))
* :bug: do not tile utility windows on wayland ([935a338](https://www.github.com/gikari/bismuth/commit/935a33820b20ab4c4b68dd797b62a64947cb9e0c))
* :bug: prevent KWin freeze in various scenarious ([34d24a4](https://www.github.com/gikari/bismuth/commit/34d24a4cb6494ea5bf29305462a1243ab143dc0c))
* :bug: put shaded windows to float state to avoid layout breakage ([aa05369](https://www.github.com/gikari/bismuth/commit/aa053694aac927184ee17fdbe39b9f8a550b129c))
* ignore ksmserver (logoug screen) ([caf7d08](https://www.github.com/gikari/bismuth/commit/caf7d080d94776defbb4e2dfe9cf0e5ff7f00a31))
* no crashes in closing transients -- might fix others too; ref [#110](https://www.github.com/gikari/bismuth/issues/110), [#109](https://www.github.com/gikari/bismuth/issues/109) ([502f812](https://www.github.com/gikari/bismuth/commit/502f8120815ce4a6b1d40ac1e79e046b0fc59624))
* prevent crash with Monocle and monocleMinimizeRest when closing transient dialogs; ref [#110](https://www.github.com/gikari/bismuth/issues/110) ([49ac131](https://www.github.com/gikari/bismuth/commit/49ac131044f5202069f2202dea5ca0cd16a5257b))

### [1.0.1](https://www.github.com/gikari/bismuth/compare/v1.0.0...v1.0.1) (2021-10-02)


### Bug Fixes

* :ambulance: restore configuration dialog ([2be1673](https://www.github.com/gikari/bismuth/commit/2be1673c41eafef2666a6265335b39159f916903))
* :memo: provide more feedback after installation ([cf59968](https://www.github.com/gikari/bismuth/commit/cf59968dcaf3cf2df92541897824886b9d0fd4d5))

## [1.0.0](https://www.github.com/gikari/bismuth/compare/v1.0.0-beta...v1.0.0) (2021-10-02)

Initial release.
