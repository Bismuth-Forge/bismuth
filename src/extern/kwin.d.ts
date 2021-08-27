// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

// API Reference:
//     https://techbase.kde.org/Development/Tutorials/KWin/Scripting/API_4.9

declare namespace KWin {
  /* enum ClientAreaOption */
  var PlacementArea: number;

  function readConfig(key: string, defaultValue?: any): any;

  function registerShortcut(
    title: string,
    text: string,
    keySequence: string,
    callback: any
  ): boolean;

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
