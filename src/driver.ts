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

class KWinContext {
    public readonly screen: number;
    public readonly activity: string;
    public readonly desktop: number;

    private readonly _driver: KWinDriver;
    private _path: string | null;

    public get id(): string {
        if (!this._path) {
            this._path = String(this.screen);
            if (Config.layoutPerActivity)
                this._path += "@" + this.activity;
            if (Config.layoutPerDesktop)
                this._path += "#" + this.desktop;
        }
        return this._path;
    }

    public get ignore(): boolean {
        const activityName = this._driver.getActivityName(this.activity);
        return (
            (Config.ignoreActivity.indexOf(activityName) >= 0)
            || (Config.ignoreScreen.indexOf(this.screen) >= 0)
        );
    }

    constructor(driver: KWinDriver, screen: number, activity: string, desktop: number) {
        this.screen = screen;
        this.activity = activity;
        this.desktop = desktop;

        this._driver = driver;
        this._path = null;
    }

    public includes(client: KWin.Client) {
        return (
            (client.desktop === this.desktop
                || client.desktop === -1 /* on all desktop */)
            && (client.activities.length === 0 /* on all activities */
                || client.activities.indexOf(this.activity) !== -1)
            && (client.screen === this.screen)
        );
    }

    public withScreen(screen: number): KWinContext {
        return new KWinContext(this._driver, screen, this.activity, this.desktop);
    }
}

/**
 * Abstracts KDE implementation specific details.
 *
 * Driver is responsible for initializing the tiling logic, connecting
 * signals(Qt/KDE term for binding events), and providing specific utility
 * functions.
 */
class KWinDriver {
    private activityNameMap: {[key: string]: string};
    private engine: TilingEngine;
    private control: TilingController;
    private windowMap: {[key: string]: Window};
    private timerPool: QQmlTimer[];

    constructor() {
        this.activityNameMap = {};
        this.engine = new TilingEngine(this);
        this.control = new TilingController(this.engine);
        this.windowMap = {};
        this.timerPool = Array();
    }

    /*
     * Main
     */

    public main() {
        Config.load();

        this.bindEvents();
        this.bindShortcut();
        this.initActivityNameMap();

        this.engine.updateScreenCount(workspace.numScreens);

        const clients = workspace.clientList();
        for (let i = 0; i < clients.length; i++) {
            const window = this.registerWindow(clients[i]);
            this.engine.manageClient(window);
            if (window.managed)
                this.bindWindowEvents(window, clients[i]);
            else
                this.unregisterWindow(window);
        }
        this.engine.arrange();
    }

    /*
     * Utils
     */

    public getActivityName(id: string): string {
        if (!this.activityNameMap[id])
            debug(() => "can't find activity name for " + id);
        return this.activityNameMap[id] || "";
    }

    public getCurrentContext(): KWinContext {
        return new KWinContext(
            this,
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

    public getWorkingArea(ctx: KWinContext): Rect {
        return Rect.from(
            workspace.clientArea(KWin.PlacementArea, ctx.screen, workspace.currentDesktop),
        );
    }

    /*
     * Timer API
     */

    public setTimeout(func: () => void, delay: number) {
        const timer: QQmlTimer = this.timerPool.pop() ||
            Qt.createQmlObject("import QtQuick 2.0; Timer {}", scriptRoot);
        timer.interval = delay;
        timer.repeat = false;

        const callback = () => {
            try { timer.triggered.disconnect(callback); } catch (e) { /* ignore */ }
            try { func(); } catch (e) { /* ignore */ }
            this.timerPool.push(timer);
            debugObj(() => ["setTimeout/callback", { poolSize: this.timerPool.length}]);
        };
        timer.triggered.connect(callback);
        timer.start();
    }

    /*
     * Shortcut
     */

    private bindShortcut() {
        if (!KWin.registerShortcut) return;

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
        const window = new Window(client);
        const key = window.id;
        debugObj(() => ["registerWindow", {key, client}]);
        return (this.windowMap[key] = window);
    }

    private queryWindow(client: KWin.Client): Window | null {
        const key = Window.clientToId(client);
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
            this.control.onScreenResized(screen));

        this.connect(workspace.currentActivityChanged, (activity: string) =>
            this.control.onCurrentActivityChanged(activity));

        this.connect(workspace.currentDesktopChanged, (desktop: number, client: KWin.Client) =>
            this.control.onCurrentDesktopChanged(desktop));

        this.connect(workspace.clientAdded, (client: KWin.Client) => {
            const handler = () => {
                const window = this.registerWindow(client);
                this.control.onWindowAdded(window);
                if (window.managed)
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

    private initActivityNameMap() {
        const update = () => {
            activityInfo.runningActivities().forEach((id) => {
                this.activityNameMap[id] = activityInfo.activityName(id);
            });
            debugObj(() => ["initActivityNameMap/update", this.activityNameMap]);
        };

        this.connect(activityInfo.namesOfRunningActivitiesChanged, update);
        update();
    }
}
