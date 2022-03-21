// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import { Config } from "../config";
import { Action } from "../controller/action";

export interface TSProxy {
  workspace(): KWin.WorkspaceWrapper;
  jsConfig(): Config;
  registerShortcut(data: Action): void;
  log(value: any): void;
}
