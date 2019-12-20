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

/**
 * Abstracts KDE implementation specific details.
 *
 * Driver is responsible for initializing the tiling logic, connecting
 * signals(Qt/KDE term for binding events), and providing specific utility
 * functions.
 */
class KWinDriver implements IDriverContext {
    public static backendName: string = "kwin";

    // TODO: split context implementation
    //#region implement properties of IDriverContext (except `setTimeout`)
    public get backend(): string {
        return KWinDriver.backendName;
    }

    public get currentSurface(): ISurface {
        return new KWinSurface(
            (workspace.activeClient) ? workspace.activeClient.screen : 0,
            workspace.currentActivity,
            workspace.currentDesktop,
        );
    }

    public get currentWindow(): Window | null {
        const client = workspace.activeClient;
        return (client) ? this.queryWindow(client) : null;
    }

    public get screens(): ISurface[] {
        const screens = [];
        for (let screen = 0; screen < workspace.numScreens; screen++)
            screens.push(new KWinSurface(
                screen, workspace.currentActivity, workspace.currentDesktop));
        return screens;
    }

    //#endregion

    private engine: TilingEngine;
    private control: TilingController;
    private windowMap: {[key: string]: Window};
    private timerPool: QQmlTimer[];
    private entered: boolean;

    constructor() {
        this.engine = new TilingEngine();
        this.control = new TilingController(this.engine);
        this.windowMap = {};
        this.timerPool = Array();
        this.entered = false;
    }

    /*
     * Main
     */

    public main() {
        CONFIG = KWINCONFIG = new KWinConfig();
        debug(() => "Config: " + KWINCONFIG);

        this.bindEvents();
        this.bindShortcut();

        const clients = workspace.clientList();
        for (let i = 0; i < clients.length; i++) {
            const window = this.registerWindow(clients[i]);
            this.engine.manage(window);
            if (window.state !== WindowState.Unmanaged)
                this.bindWindowEvents(window, clients[i]);
            else
                this.unregisterWindow(window);
        }
        this.engine.arrange(this);
    }

    //#region implement `setTimeout` of IDriverContext`
    public setTimeout(func: () => void, timeout: number) {
        KWinSetTimeout(() => this.enter(func), timeout);
    }
    //#endregion

    /*
     * Shortcut
     */

    private bindShortcut() {
        /* check if method exists */
        if (!KWin.registerShortcut)
            return;

        const bind = (seq: string, title: string, input: Shortcut) => {
            title = "Krohnkite: " + title;
            seq = "Meta+" + seq;
            const cb = () => { this.control.onShortcut(this, input); };
            KWin.registerShortcut(title, "", seq, cb);
        };

        bind("J", "Down/Next", Shortcut.Down);
        bind("K", "Up/Prev"  , Shortcut.Up);
        bind("H", "Left"     , Shortcut.Left);
        bind("L", "Right"    , Shortcut.Right);

        bind("Shift+J", "Move Down/Next", Shortcut.ShiftDown);
        bind("Shift+K", "Move Up/Prev"  , Shortcut.ShiftUp);
        bind("Shift+H", "Move Left"     , Shortcut.ShiftLeft);
        bind("Shift+L", "Move Right"    , Shortcut.ShiftRight);

        bind("Ctrl+J", "Grow Height"    , Shortcut.GrowHeight);
        bind("Ctrl+K", "Shrink Height"  , Shortcut.ShrinkHeight);
        bind("Ctrl+H", "Shrink Width"   , Shortcut.ShrinkWidth);
        bind("Ctrl+L", "Grow Width"     , Shortcut.GrowWidth);

        bind("I", "Increase", Shortcut.Increase);
        bind("D", "Decrease", Shortcut.Decrease);

        bind("F", "Float", Shortcut.ToggleFloat);
        bind("Shift+F", "Float All", Shortcut.FloatAll);
        bind("\\", "Cycle Layout", Shortcut.CycleLayout);

        bind("Return", "Set master", Shortcut.SetMaster);

        KWin.registerShortcut("Krohnkite: Tile Layout", "", "Meta+T", () => {
            this.control.onShortcut(this, Shortcut.SetLayout, TileLayout); });

        KWin.registerShortcut("Krohnkite: Monocle Layout", "", "Meta+M", () => {
            this.control.onShortcut(this, Shortcut.SetLayout, MonocleLayout); });

        KWin.registerShortcut("Krohnkite: Spread Layout", "", "", () => {
            this.control.onShortcut(this, Shortcut.SetLayout, SpreadLayout); });

        KWin.registerShortcut("Krohnkite: Stair Layout", "", "", () => {
            this.control.onShortcut(this, Shortcut.SetLayout, StairLayout); });

        KWin.registerShortcut("Krohnkite: Floating Layout", "", "", () => {
            this.control.onShortcut(this, Shortcut.SetLayout, FloatingLayout); });
    }

    /*
     * Signal handlers
     */

    private connect(signal: QSignal, handler: (..._: any[]) => void): (() => void) {
        const wrapper = (...args: any[]) => {
            /* test if script is enabled.
             * XXX: `workspace` become undefined when the script is disabled. */
            let enabled = false;
            try { enabled = !!workspace; } catch (e) { /* ignore */ }

            if (enabled)
                this.enter(() => handler.apply(this, args));
            else
                signal.disconnect(wrapper);
        };
        signal.connect(wrapper);

        return wrapper;
    }

    private enter(callback: () => void) {
        if (this.entered) {
            debug(() => "re-entry refused");
            return;
        }

        this.entered = true;
        try {
            callback();
        } catch (e) {
            throw e;
        } finally {
            this.entered = false;
            debug(() => "--------------------")
        }
    }

    private registerWindow(client: KWin.Client): Window {
        const window = new Window(new KWinWindow(client));
        const key = window.id;
        debugObj(() => ["registerWindow", {key, client}]);
        return (this.windowMap[key] = window);
    }

    private queryWindow(client: KWin.Client): Window | null {
        const key = KWinWindow.generateID(client);
        return this.windowMap[key] || null;
    }

    private unregisterWindow(window: Window) {
        const key = window.id;
        debugObj(() => ["removeTile", {key}]);
        delete this.windowMap[key];
    }

    private bindEvents() {
        this.connect(workspace.numberScreensChanged, (count: number) =>
            this.control.onScreenCountChanged(this, count));

        this.connect(workspace.screenResized, (screen: number) =>
            this.control.onScreenResized(this, new KWinSurface(
                screen, workspace.currentActivity, workspace.currentDesktop)));

        this.connect(workspace.currentActivityChanged, (activity: string) =>
            this.control.onCurrentContextChanged(this));

        this.connect(workspace.currentDesktopChanged, (desktop: number, client: KWin.Client) =>
            this.control.onCurrentContextChanged(this));

        this.connect(workspace.clientAdded, (client: KWin.Client) => {
            let wrapper: (() => void);
            const handler = () => {
                const window = this.registerWindow(client);
                this.control.onWindowAdded(this, window);
                if (window.state !== WindowState.Unmanaged)
                    this.bindWindowEvents(window, client);
                else
                    this.unregisterWindow(window);

                client.windowShown.disconnect(wrapper);
            };

            wrapper = this.connect(client.windowShown, handler);
        });

        this.connect(workspace.clientRemoved, (client: KWin.Client) => {
            const window = this.queryWindow(client);
            if (window) {
                this.control.onWindowRemoved(this, window);
                this.unregisterWindow(window);
            }
        });

        this.connect(workspace.clientFullScreenSet, (client: KWin.Client, fullScreen: boolean, user: boolean) =>
            this.control.onWindowChanged(this, this.queryWindow(client), "fullscreen=" + fullScreen + " user=" + user));

        this.connect(workspace.clientMinimized, (client: KWin.Client) => {
            if (KWINCONFIG.preventMinimize) {
                client.minimized = false;
                workspace.activeClient = client;
            } else
                this.control.onWindowChanged(this, this.queryWindow(client), "minimized");
        });

        this.connect(workspace.clientUnminimized, (client: KWin.Client) =>
            this.control.onWindowChanged(this, this.queryWindow(client), "unminimized"));

        // TODO: options.configChanged.connect(this.onConfigChanged);
        /* NOTE: How disappointing. This doesn't work at all. Even an official kwin script tries this.
         *       https://github.com/KDE/kwin/blob/master/scripts/minimizeall/contents/code/main.js */
    }

    private bindWindowEvents(window: Window, client: KWin.Client) {
        let moving = false;
        let resizing = false;

        this.connect(client.moveResizedChanged, () => {
            debugObj(() => ["moveResizedChanged", {window, move: client.move, resize: client.resize}]);
            if (moving !== client.move) {
                moving = client.move;
                if (moving)
                    this.control.onWindowMoveStart(window);
                else
                    this.control.onWindowMoveOver(this, window);
            }
            if (resizing !== client.resize) {
                resizing = client.resize;
                if (resizing)
                    this.control.onWindowResizeStart(window);
                else
                    this.control.onWindowResizeOver(this, window);
            }
        });

        this.connect(client.geometryChanged, () => {
            if (moving)
                this.control.onWindowMove(window);
            else if (resizing)
                this.control.onWindowResize(this, window);
            else {
                if (!window.actualGeometry.equals(window.geometry))
                    this.control.onWindowGeometryChanged(this, window);
            }
        });

        this.connect(client.screenChanged, () =>
            this.control.onWindowChanged(this, window, "screen=" + client.screen));

        this.connect(client.activitiesChanged, () =>
            this.control.onWindowChanged(this, window, "activity=" + client.activities.join(",")));

        this.connect(client.desktopChanged, () =>
            this.control.onWindowChanged(this, window, "desktop=" + client.desktop));
    }

    // TODO: private onConfigChanged = () => {
    //     this.loadConfig();
    //     this.engine.arrange();
    // }
    /* NOTE: check `bindEvents` for details */
}
