// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/ban-types */

declare namespace Bismuth {
  export namespace Qml {
    export interface Main {
      scriptRoot: object;
      activityInfo: Plasma.TaskManager.ActivityInfo;
      popupDialog: PopupDialog;
    }

    export interface PopupDialog {
      show(text: string): void;
    }
  }
}

// NOTICE: We can not declare the globals, since we use
// Node.js when building tests. However, the globals we use
// in production come from Qt JavaScript Environment and
// not from Node.js and therefore they could mismatch.
// Let's hope we will not run into one of these situations...
//
// declare let console: any;
// declare let setTimeout: any;
