// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { ConfigImpl } from "./config";
import TilingController from "./controller";
import { KWinDriver } from "./driver";
import TilingEngine from "./engine";
import Debug from "./util/debug";

/**
 * Script entry-point from QML side.
 * @param qmlObjects objects from QML gui. Required for the interaction with QML, as we cannot access globals.
 * @param kwinApi KWin scripting API. Required for interaction with KWin, as we cannot access globals.
 */
export function init(qmlObjects: Bismuth.Qml.Main, kwinScriptingApi: KWin.Api) {
  const config = new ConfigImpl(kwinScriptingApi);
  const debug = new Debug(config);

  const engine = new TilingEngine(config, debug);
  // TODO: remove driver and controller dependencies and use callbacks for conjunctions
  // The order will be:
  // Driver (no other dependencies. Evens are bind via callbacks)
  // Controller (driver), callbacks are used for tiling engine
  // Engine (controller)
  const controller = new TilingController(engine, config, debug);
  const driver = new KWinDriver(
    qmlObjects,
    kwinScriptingApi,
    engine,
    controller,
    config,
    debug
  );

  driver.main();
}
