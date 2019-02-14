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

class Context {
    public readonly screen: number;

    private readonly _activity: string;
    private readonly _desktop: number;
    private readonly _driver: KWinDriver;
    private _path: string | null;

    public get path(): string {
        if (!this._path) {
            this._path = String(this.screen);
            if (Config.layoutPerActivity)
                this._path += "@" + this._activity;
            if (Config.layoutPerDesktop)
                this._path += "#" + this._desktop;
        }
        return this._path;
    }

    public get skipTiling(): boolean {
        const activityName = this._driver.getActivityName(this._activity);
        return (
            (Config.ignoreActivity.indexOf(activityName) >= 0)
            || (Config.ignoreScreen.indexOf(this.screen) >= 0)
        );
    }

    constructor(driver: KWinDriver, screen: number, activity: string, desktop: number) {
        this.screen = screen;
        this._activity = activity;
        this._desktop = desktop;
        this._driver = driver;
        this._path = null;
    }

    public includes(client: KWin.Client) {
        return (
            (client.desktop === this._desktop
                || client.desktop === -1 /* on all desktop */)
            && (client.activities.length === 0 /* on all activities */
                || client.activities.indexOf(this._activity) !== -1)
        );
    }

    public withScreen(screen: number): Context {
        return new Context(this._driver, screen, this._activity, this._desktop);
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
    private tileMap: {[key: string]: Tile};
    private timerPool: QQmlTimer[];

    constructor() {
        this.activityNameMap = {};
        this.engine = new TilingEngine(this);
        this.control = new TilingController(this.engine);
        this.tileMap = {};
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
            const tile = this.createTile(clients[i]);
            this.engine.manageClient(tile);
            if (tile.managed)
                this.bindTileEvents(tile, clients[i]);
            else
                this.removeTile(tile);
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

    public getCurrentContext(): Context {
        return new Context(
            this,
            (workspace.activeClient) ? workspace.activeClient.screen : 0,
            workspace.currentActivity,
            workspace.currentDesktop,
        );
    }

    public getCurrentTile(): Tile | null {
        const client = workspace.activeClient;
        if (!client)
            return null;
        return this.loadTile(client);
    }

    public getWorkingArea(screenId: number): Rect {
        return Rect.from(
            workspace.clientArea(KWin.PlacementArea, screenId, workspace.currentDesktop),
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

    private createTile(client: KWin.Client): Tile {
        const tile = new Tile(client);
        const key = tile.id;
        debugObj(() => ["createTile", {key, client}]);
        return (this.tileMap[key] = tile);
    }

    private loadTile(client: KWin.Client): Tile | null {
        const key = Tile.clientToId(client);
        return this.tileMap[key] || null;
    }

    private removeTile(tile: Tile) {
        const key = tile.id;
        debugObj(() => ["removeTile", {key}]);
        delete this.tileMap[key];
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
                const tile = this.createTile(client);
                this.control.onTileAdded(tile);
                if (tile.managed)
                    this.bindTileEvents(tile, client);
                else
                    this.removeTile(tile);

                client.windowShown.disconnect(handler);
            };
            client.windowShown.connect(handler);
        });

        this.connect(workspace.clientRemoved, (client: KWin.Client) => {
            const tile = this.loadTile(client);
            if (tile) {
                this.control.onTileRemoved(tile);
                this.removeTile(tile);
            }
        });

        this.connect(workspace.clientFullScreenSet, (client: KWin.Client, fullScreen: boolean, user: boolean) =>
            this.control.onTileChanged(this.loadTile(client), "fullscreen=" + fullScreen + " user=" + user));

        this.connect(workspace.clientMinimized, (client: KWin.Client) =>
            this.control.onTileChanged(this.loadTile(client), "minimized"));

        this.connect(workspace.clientUnminimized, (client: KWin.Client) =>
            this.control.onTileChanged(this.loadTile(client), "unminimized"));

        // TODO: options.configChanged.connect(this.onConfigChanged);
        /* NOTE: How disappointing. This doesn't work at all. Even an official kwin script tries this.
         *       https://github.com/KDE/kwin/blob/master/scripts/minimizeall/contents/code/main.js */
    }

    private bindTileEvents(tile: Tile, client: KWin.Client) {
        let moving = false;
        let resizing = false;

        this.connect(client.moveResizedChanged, () => {
            debugObj(() => ["moveResizedChanged", {tile, move: client.move, resize: client.resize}]);
            if (moving !== client.move) {
                moving = client.move;
                if (moving)
                    this.control.onTileMoveStart(tile);
                else
                    this.control.onTileMoveOver(tile);
            }
            if (resizing !== client.resize) {
                resizing = client.resize;
                if (resizing)
                    this.control.onTileResizeStart(tile);
                else
                    this.control.onTileResizeOver(tile);
            }
        });

        this.connect(client.geometryChanged, () => {
            if (moving)
                this.control.onTileMove(tile);
            else if (resizing)
                this.control.onTileResize(tile);
            else {
                if (tile.isGeometryChanged())
                    this.control.onTileGeometryChanged(tile);
            }
        });

        this.connect(client.screenChanged, () =>
            this.control.onTileChanged(tile, "screen=" + client.screen));

        this.connect(client.activitiesChanged, () =>
            this.control.onTileChanged(tile, "activity=" + client.activities.join(",")));

        this.connect(client.desktopChanged, () =>
            this.control.onTileChanged(tile, "desktop=" + client.desktop));
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
