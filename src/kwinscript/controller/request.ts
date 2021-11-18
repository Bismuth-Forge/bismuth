// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { Engine } from "../engine";
import { Log } from "../util/log";

export type ResponseType = string | string[];
export type DBusArg = boolean | number | string | string[];

/**
 * DBus request from the external source
 */
export interface Request {
  /*
   * DBus method name.
   *
   * This must be the name of the request method in the DBus service.
   * (Can be found in src/dbus-plugin/dbus-plugin.h)
   */
  readonly dbusName: string;

  /**
   * Executes the request and returns the appropriate response.
   */
  execute(args: DBusArg[]): ResponseType;
}

abstract class RequestImpl implements Request {
  constructor(
    public dbusName: string,
    protected engine: Engine,
    protected log: Log
  ) {}

  abstract execute(args: DBusArg[]): ResponseType;
}

export class EnabledLayouts extends RequestImpl {
  constructor(engine: Engine, log: Log) {
    super("enabledLayouts", engine, log);
  }

  public execute(): string[] {
    const enabledLayouts = this.engine.enabledLayouts();
    return enabledLayouts;
  }
}
