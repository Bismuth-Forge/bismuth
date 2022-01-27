// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { Engine } from "../engine";
import { Log } from "../util/log";

export type ResponseType = string | string[] | boolean;
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
  execute(...args: DBusArg[]): ResponseType;
}

abstract class RequestImpl implements Request {
  constructor(
    public dbusName: string,
    protected engine: Engine,
    protected log: Log
  ) {}

  abstract execute(...args: DBusArg[]): ResponseType;
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

export class LayoutOn extends RequestImpl {
  constructor(engine: Engine, log: Log) {
    super("layoutOn", engine, log);
  }

  public execute(...args: DBusArg[]): string {
    const screen = args[0] as number;
    const desktop = args[1] as number;
    const activity = args[2] as string;
    return this.engine.layoutOn(screen, desktop, activity);
  }
}

export class ToggleTilingOn extends RequestImpl {
  constructor(engine: Engine, log: Log) {
    super("toggleLayoutOn", engine, log);
  }

  public execute(...args: DBusArg[]): boolean {
    const layoutId = args[0] as string;
    const screen = args[1] as number;
    const desktop = args[2] as number;
    const activity = args[3] as string;
    return this.engine.toggleLayoutOn(layoutId, screen, desktop, activity);
  }
}
