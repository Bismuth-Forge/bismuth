// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { KWinDriver } from "./driver";

/**
 * Script entry-point from QML side.
 * @param qmlObjects objects from QML gui. Required for the interaction with QML, as we cannot access globals.
 * @param kwinApi KWin scripting API. Required for interaction with KWin, as we cannot access globals.
 */
export function init(qmlObjects: Bismuth.Qml.Main, kwinScriptingApi: KWin.Api) {
  const driver = new KWinDriver(qmlObjects, kwinScriptingApi);
  driver.main();
}
