// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

declare namespace Bismuth {
  export namespace Qml {
    export interface Main {
      scriptRoot: object;
      activityInfo: Plasma.TaskManager.ActivityInfo;
      mousePoller: Plasma.PlasmaCore.DataSource;
      popupDialog: PopupDialog;
    }

    export interface PopupDialog {
      show(text: string): void;
    }
  }
}

/* Common Javascript globals */
declare let console: any;
declare let setTimeout: any;
