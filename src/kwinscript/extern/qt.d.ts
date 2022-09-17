// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/ban-types */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface QByteArray {
  /* keep it empty for now */
}

interface QRectF {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface QPoint {
  x: number;
  y: number;
}

interface QSize {
  width: number;
  height: number;
}

interface QSignal {
  connect(callback: any): void;
  disconnect(callback: any): void;
}

/* Reference: http://doc.qt.io/qt-5/qml-qtqml-timer.html */
interface QQmlTimer {
  interval: number;
  repeat: boolean;
  running: boolean;
  triggeredOnStart: boolean;

  triggered: QSignal;

  restart(): void;
  start(): void;
  stop(): void;
}

declare namespace Qt {
  function createQmlObject(qml: string, parent: object, filepath?: string): any;

  function rect(x: number, y: number, width: number, height: number): QRectF;
}
