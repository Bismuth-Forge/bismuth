// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

// API Reference: https://develop.kde.org/docs/plasma/kwin/api/
// TODO: Register the rest of the API
declare namespace KWin {
  interface Api {
    workspace: KWin.WorkspaceWrapper;
    options: KWin.Options;
    KWin: KWin.KWin;
  }

  interface KWin {
    readConfig(key: string, defaultValue?: any): any;
    registerShortcut(
      title: string,
      text: string,
      keySequence: string,
      callback: any
    ): boolean;
    PlacementArea: number;
  }

  interface WorkspaceWrapper {
    /* read-only */
    readonly activeScreen: number;
    readonly currentActivity: string;
    readonly numScreens: number;

    /* read-write */
    activeClient: KWin.Client;
    currentDesktop: number;
    desktops: number;

    /* signals */
    activitiesChanged: QSignal;
    activityAdded: QSignal;
    activityRemoved: QSignal;
    clientAdded: QSignal;
    clientFullScreenSet: QSignal;
    clientMaximizeSet: QSignal;
    clientMinimized: QSignal;
    clientRemoved: QSignal;
    clientUnminimized: QSignal;
    currentActivityChanged: QSignal;
    currentDesktopChanged: QSignal;
    numberDesktopsChanged: QSignal;
    numberScreensChanged: QSignal;
    screenResized: QSignal;

    /* functions */
    clientList(): Client[];
    clientArea(option: number, screen: number, desktop: number): QRect;
  }

  interface Options {
    /* signal */
    configChanged: QSignal;
  }

  interface Toplevel {
    /* read-only */
    readonly activities: string[] /* Not exactly `Array` */;
    readonly dialog: boolean;
    readonly resourceClass: QByteArray;
    readonly resourceName: QByteArray;
    readonly screen: number;
    readonly splash: boolean;
    readonly utility: boolean;
    readonly windowId: number;
    readonly windowRole: QByteArray;

    readonly clientPos: QPoint;
    readonly clientSize: QSize;

    /* signal */
    activitiesChanged: QSignal;
    geometryChanged: QSignal;
    screenChanged: QSignal;
    windowShown: QSignal;
  }

  interface Client extends Toplevel {
    /* read-only */
    readonly active: boolean;
    readonly caption: string;
    readonly maxSize: QSize;
    readonly minSize: QSize;
    readonly modal: boolean;
    readonly move: boolean;
    readonly resize: boolean;
    readonly resizeable: boolean;
    readonly specialWindow: boolean;

    /* read-write */
    desktop: number;
    fullScreen: boolean;
    geometry: QRect;
    keepAbove: boolean;
    keepBelow: boolean;
    minimized: boolean;
    noBorder: boolean;
    onAllDesktops: boolean;
    basicUnit: QSize;

    /* signals */
    activeChanged: QSignal;
    desktopChanged: QSignal;
    moveResizedChanged: QSignal;
  }
}
