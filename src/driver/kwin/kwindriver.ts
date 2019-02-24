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
class KWinDriver implements IDriver {
    private engine: TilingEngine;
    private control: TilingController;
    private windowMap: {[key: string]: Window};
    private timerPool: QQmlTimer[];

    constructor() {
        this.engine = new TilingEngine(this);
        this.control = new TilingController(this.engine);
        this.windowMap = {};
        this.timerPool = Array();
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
            this.engine.manageClient(window);
            if (window.state !== WindowState.Unmanaged)
                this.bindWindowEvents(window, clients[i]);
            else
                this.unregisterWindow(window);
        }
        this.engine.arrange();
    }

    /*
     * Utils
     */

    public forEachScreen(func: (ctx: IDriverContext) => void) {
        for (let screen = 0; screen < workspace.numScreens; screen ++)
            func(new KWinContext(screen, workspace.currentActivity, workspace.currentDesktop));
    }

    public getCurrentContext(): IDriverContext {
        return new KWinContext(
            (workspace.activeClient) ? workspace.activeClient.screen : 0,
            workspace.currentActivity,
            workspace.currentDesktop,
        );
    }

    public getCurrentWindow(): Window | null {
        const client = workspace.activeClient;
        if (!client)
            return null;
        return this.queryWindow(client);
    }

    public getWorkingArea(ctx: IDriverContext): Rect {
        const kctx = ctx as KWinContext;
        return toRect(
            workspace.clientArea(KWin.PlacementArea, kctx.screen, workspace.currentDesktop),
        );
    }

    public setCurrentWindow(window: Window) {
        const kwindow = window.window as KWinWindow;
        workspace.activeClient = kwindow.client;
    }

    /*
     * Shortcut
     */

    private bindShortcut() {
        /* check if method exists */
        if (!KWin.registerShortcut)
            return;

        const bind = (seq: string, title: string, input: UserInput) => {
            title = "Krohnkite: " + title;
            seq = "Meta+" + seq;
            const cb = () => { this.engine.handleUserInput(input); };
            KWin.registerShortcut(title, "", seq, cb);
        };

        bind("J", "Down/Next", UserInput.Down);
        bind("K", "Up/Prev"  , UserInput.Up);
        bind("H", "Left"     , UserInput.Left);
        bind("L", "Right"    , UserInput.Right);

        bind("Shift+J", "Move Down/Next", UserInput.ShiftDown);
        bind("Shift+K", "Move Up/Prev"  , UserInput.ShiftUp);
        bind("Shift+H", "Move Left"     , UserInput.ShiftLeft);
        bind("Shift+L", "Move Right"    , UserInput.ShiftRight);

        bind("I", "Increase", UserInput.Increase);
        bind("D", "Decrease", UserInput.Decrease);
        bind("F", "Float", UserInput.Float);
        bind("\\", "Cycle Layout", UserInput.CycleLayout);

        bind("Return", "Set master", UserInput.SetMaster);

        KWin.registerShortcut("Krohnkite: Tile Layout", "", "Meta+T", () => {
            this.engine.handleUserInput(UserInput.SetLayout, TileLayout); });

        KWin.registerShortcut("Krohnkite: Monocle Layout", "", "Meta+M", () => {
            this.engine.handleUserInput(UserInput.SetLayout, MonocleLayout); });

        KWin.registerShortcut("Krohnkite: Spread Layout", "", "", () => {
            this.engine.handleUserInput(UserInput.SetLayout, SpreadLayout); });

        KWin.registerShortcut("Krohnkite: Stair Layout", "", "", () => {
            this.engine.handleUserInput(UserInput.SetLayout, StairLayout); });
    }

    /*
     * Signal handlers
     */

    private connect(signal: QSignal, handler: (..._: any[]) => void) {
        const wrapper = (...args: any[]) => {
            /* test if script is enabled.
             * XXX: `workspace` become undefined when the script is disabled. */
            let enabled = false;
            try { enabled = !!workspace; } catch (e) { /* ignore */ }

            if (enabled)
                handler.apply(this, args);
            else
                signal.disconnect(wrapper);
        };
        signal.connect(wrapper);
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
            this.control.onScreenCountChanged(count));

        this.connect(workspace.screenResized, (screen: number) =>
            this.control.onScreenResized(new KWinContext(
                screen, workspace.currentActivity, workspace.currentDesktop)));

        this.connect(workspace.currentActivityChanged, (activity: string) =>
            this.control.onCurrentContextChanged(this.getCurrentContext()));

        this.connect(workspace.currentDesktopChanged, (desktop: number, client: KWin.Client) =>
            this.control.onCurrentContextChanged(this.getCurrentContext()));

        this.connect(workspace.clientAdded, (client: KWin.Client) => {
            const handler = () => {
                const window = this.registerWindow(client);
                this.control.onWindowAdded(window);
                if (window.state !== WindowState.Unmanaged)
                    this.bindWindowEvents(window, client);
                else
                    this.unregisterWindow(window);

                client.windowShown.disconnect(handler);
            };
            client.windowShown.connect(handler);
        });

        this.connect(workspace.clientRemoved, (client: KWin.Client) => {
            const window = this.queryWindow(client);
            if (window) {
                this.control.onWindowRemoved(window);
                this.unregisterWindow(window);
            }
        });

        this.connect(workspace.clientFullScreenSet, (client: KWin.Client, fullScreen: boolean, user: boolean) =>
            this.control.onWindowChanged(this.queryWindow(client), "fullscreen=" + fullScreen + " user=" + user));

        this.connect(workspace.clientMinimized, (client: KWin.Client) =>
            this.control.onWindowChanged(this.queryWindow(client), "minimized"));

        this.connect(workspace.clientUnminimized, (client: KWin.Client) =>
            this.control.onWindowChanged(this.queryWindow(client), "unminimized"));

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
                    this.control.onWindowMoveOver(window);
            }
            if (resizing !== client.resize) {
                resizing = client.resize;
                if (resizing)
                    this.control.onWindowResizeStart(window);
                else
                    this.control.onWindowResizeOver(window);
            }
        });

        this.connect(client.geometryChanged, () => {
            if (moving)
                this.control.onWindowMove(window);
            else if (resizing)
                this.control.onWindowResize(window);
            else {
                if (!window.actualGeometry.equals(window.geometry))
                    this.control.onWindowGeometryChanged(window);
            }
        });

        this.connect(client.screenChanged, () =>
            this.control.onWindowChanged(window, "screen=" + client.screen));

        this.connect(client.activitiesChanged, () =>
            this.control.onWindowChanged(window, "activity=" + client.activities.join(",")));

        this.connect(client.desktopChanged, () =>
            this.control.onWindowChanged(window, "desktop=" + client.desktop));
    }

    // TODO: private onConfigChanged = () => {
    //     this.loadConfig();
    //     this.engine.arrange();
    // }
    /* NOTE: check `bindEvents` for details */
}
