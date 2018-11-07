
// API Reference:
//     https://techbase.kde.org/Development/Tutorials/KWin/Scripting/API_4.9

interface QRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface QSignal {
    connect(callback: any): void;
}

declare namespace KWin {
    /* enum ClientAreaOption */
    var PlacementArea: number;

    function registerShortcut(
        title: string,
        text: string,
        keySequence: string,
        callback: any
    ): boolean;

    interface WorkspaceWrapper {
        /* read-only */
        readonly numScreens: number;

        /* read-write */
        currentDesktop: number;

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
        clientArea(option: number, screen: number, desktop: number);
    }

    interface Toplevel {
        /* read-only */
        readonly screen: number;
        readonly resourceName: string;
        readonly resourceClass: string;
        readonly windowRole: string;

        /* signal */
        geometryChanged: QSignal;
    }

    interface Client extends Toplevel {
        /* read-only */
        readonly caption: string;
        readonly move: boolean;
        readonly resize: boolean;
        readonly specialWindow: boolean;

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
