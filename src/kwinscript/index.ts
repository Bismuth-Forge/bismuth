// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { Controller, ControllerImpl } from "./controller";
import { TSProxy } from "./extern/proxy";
import { LogImpl } from "./util/log";

/**
 * Script entry-point from QML side.
 * @param qmlObjects objects from QML gui. Required for the interaction with QML, as we cannot access globals.
 * @param kwinApi KWin scripting API. Required for interaction with KWin, as we cannot access globals.
 */
export function init(
  qmlObjects: Bismuth.Qml.Main,
  kwinScriptingApi: KWin.Api,
  proxy: TSProxy
): Controller | null {
  const config = proxy.jsConfig();

  if (config.experimentalBackend) {
    return null;
  }

  const logger = new LogImpl(proxy);

  const controller = new ControllerImpl(
    qmlObjects,
    kwinScriptingApi,
    config,
    logger,
    proxy
  );

  controller.start();

  return controller;
}
