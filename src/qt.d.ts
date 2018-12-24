// Copyright (c) 2018 Eon S. Jeon <esjeon@hyunmu.am>
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


interface QByteArray {
    /* keep it empty for now */
}

interface QRect extends IRect {
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

    function rect(x: number, y: number, width: number, height: number): QRect;
}

declare var jiggleTimer: QQmlTimer;
declare var scriptRoot: object;
