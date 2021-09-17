// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

// API Reference: https://develop.kde.org/docs/plasma/kwin/api/
// See also the KWin source code for the properties.

// TODO: Register the rest of the API and document it according to KWin documentation.
// Maybe it is even possible to generate this API. If so, this could be upstreamed.
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

  /**
   * See KWin docs for the explanation what Toplevel is. Basically it is a window. Represents KWin::Toplevel
   */
  interface Toplevel {
    /* read-only */

    /**
     * On which activities the toplevel is present
     */
    readonly activities: string[] /* Not exactly `Array` */;

    /**
     * Whether the window is a dialog window.
     */
    readonly dialog: boolean;

    /**
     * TODO: ???
     */
    readonly resourceClass: QByteArray;

    /**
     * TODO: ???
     */
    readonly resourceName: QByteArray;

    /**
     * On which screen toplevel is
     */
    readonly screen: number;

    /**
     * Whether the window is a splashscreen.
     */
    readonly splash: boolean;

    /**
     * Whether the window is a utility window, such as a tool window.
     */
    readonly utility: boolean;

    /**
     * Window id in KWin
     */
    readonly windowId: number;

    /**
     * Window role property
     */
    readonly windowRole: QByteArray;

    /**
     * Client position
     */
    readonly clientPos: QPoint;

    /**
     * Client size
     */
    readonly clientSize: QSize;

    /**
     * TODO: I could not find anything about signal in the KWin source.
     * Probably it does not exist here. It exists in KWin::AbstractClient though.
     */
    activitiesChanged: QSignal;

    /**
     * This signal is emitted when the Toplevel's frame geometry changes.
     * @deprecated since 5.19, use frameGeometryChanged instead
     */
    geometryChanged: QSignal;

    /**
     * Emitted whenever the Toplevel's screen changes. This can happen either in consequence to
     * a screen being removed/added or if the Toplevel's geometry changes.
     */
    screenChanged: QSignal;

    /**
     * Emitted when the toplevel is shown?
     */
    windowShown: QSignal;
  }

  /**
   * Client, also known as window. Represents KWin::AbstractClient.
   */
  interface Client extends Toplevel {
    /**
     * Whether the window is active.
     */
    readonly active: boolean;

    /**
     * Window caption (The text in the titlebar).
     */
    readonly caption: string;

    /**
     * Maximum allowed size for a window.
     */
    readonly maxSize: QSize;

    /**
     * Minimum allowed size for a window.
     */
    readonly minSize: QSize;

    /**
     * Whether the window is modal or not.
     */
    readonly modal: boolean;

    /**
     * Whether the window is currently being moved by the user.
     */
    readonly move: boolean;

    /**
     * Whether the window is currently being resized by the user.
     */
    readonly resize: boolean;

    /**
     * Whether the window is resizable
     */
    readonly resizeable: boolean;

    /**
     * Whether the window is any of special windows types (desktop, dock, splash, ...),
     * i.e. window types that usually don't have a window frame and the user does not use window
     * management (moving, raising,...) on them.
     */
    readonly specialWindow: boolean;

    /**
     * The desktop this window is on. If the window is on all desktops the property has value -1.
     */
    desktop: number;

    /**
     * Whether the window is fullscreen
     */
    fullScreen: boolean;

    /**
     * Window geometry
     */
    geometry: QRect;

    /**
     * Whether the window is set to be above all
     */
    keepAbove: boolean;

    /**
     * Whether the window is set to be below all
     */
    keepBelow: boolean;

    /**
     * Whether the window is minimized
     */
    minimized: boolean;

    /**
     * Whether the window has borders (window decorations)
     */
    noBorder: boolean;

    /**
     * Whether the window is set to be on all desktops
     */
    onAllDesktops: boolean;

    /**
     * By how much the window wishes to grow/shrink at least. Usually QSize(1,1).
     * MAY BE DISOBEYED BY THE WM! It's only for information, do NOT rely on it at all.
     * WARNING: X11 only. Needs to be replaced in Bismuth in order to support Wayland
     */
    basicUnit: QSize;

    /**
     * @see active
     */
    activeChanged: QSignal;

    /**
     * @see active
     */
    desktopChanged: QSignal;

    /**
     * @see move
     */
    moveResizedChanged: QSignal;
  }
}
