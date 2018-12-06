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

// API Reference:
//     https://techbase.kde.org/Development/Tutorials/KWin/Scripting/API_4.9

interface QRect extends IRect {
}

interface QSize {
    width: number;
    height: number;
}

interface QSignal {
    connect(callback: any): void;
}

declare var console: any;

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
        readonly numScreens: number;
        readonly currentActivity: string;

        /* read-write */
        currentDesktop: number;
        activeClient: KWin.Client;
            /* NOTE: if no window is present, this points to desktop. */

        /* signals */
        clientAdded: QSignal;
        clientRemoved: QSignal;
        numberScreensChanged: QSignal;
        clientMinimized: QSignal;
        clientUnminimized: QSignal;
        currentDesktopChanged: QSignal;
        screenResized: QSignal;
        clientMaximizeSet: QSignal;
        clientFullScreenSet: QSignal;
        currentActivityChanged: QSignal;
        activitiesChanged: QSignal;
        activityAdded: QSignal;
        activityRemoved: QSignal;
        numberDesktopsChanged: QSignal;

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
        readonly screen: number;
        readonly resourceName: string;
        readonly resourceClass: string;
        readonly windowRole: string;
        readonly activities: string[];
            /* Not exactly an `Array`, but still quite compatible. */
        readonly dialog: boolean;
        readonly splash: boolean;
        readonly utility: boolean;

        /* signal */
        geometryChanged: QSignal;
        activitiesChanged: QSignal;
    }

    interface Client extends Toplevel {
        /* read-only */
        readonly caption: string;
        readonly move: boolean;
        readonly resize: boolean;
        readonly specialWindow: boolean;
        readonly modal: boolean;
        readonly resizeable: boolean;
        readonly minSize: QSize;
        readonly maxSize: QSize;

        /* read-write */
        desktop: number;
        onAllDesktops: boolean;
        fullScreen: boolean;
        geometry: QRect;
        keepAbove: boolean;
        keepBelow: boolean;
        minimized: boolean;
        noBorder: boolean;

        /* signals */
        desktopChanged: QSignal;
        moveResizedChanged: QSignal;
    }
}

declare var workspace: KWin.WorkspaceWrapper;
declare var options: KWin.Options;
