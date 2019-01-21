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
class KWinDriver {
    private engine: TilingEngine;
    private control: TilingController;
    private tileMap: {[key: string]: Tile};
    private timerPool: QQmlTimer[];

    constructor() {
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

        this.engine.updateScreenCount(workspace.numScreens);

        const clients = workspace.clientList();
        for (let i = 0; i < clients.length; i++) {
            const tile = this.loadTile(clients[i]);
            this.engine.manageClient(tile);
            this.bindTileEvents(tile);
        }
        this.engine.arrange();
    }

    /*
     * Utils
     */

    public getWorkingArea(screenId: number): Rect {
        return Rect.from(
            workspace.clientArea(KWin.PlacementArea, screenId, workspace.currentDesktop),
        );
    }

    public getActiveTile(): Tile | null {
        const client = workspace.activeClient;
        if (!client)
            return null;
        return this.loadTile(client);
    }

    public setActiveClient(client: KWin.Client) {
        workspace.activeClient = client;
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

    private connect = (signal: QSignal, handler: (..._: any[]) => void) => {
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

    private loadTile(client: KWin.Client): Tile {
        const key = String(client);
        let tile;
        if (!(tile = this.tileMap[key])) {
            debugObj(() => ["loadTile/created", {key, client}]);
            tile = new Tile(client);
            this.tileMap[key] = tile;
        }
        return tile;
    }

    private removeTile(tile: Tile) {
        const key = String(tile.client);
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
                const tile = this.loadTile(client);
                this.control.onTileAdded(tile);
                this.bindTileEvents(tile);

                client.windowShown.disconnect(handler);
            };
            client.windowShown.connect(handler);
        });

        this.connect(workspace.clientRemoved, (client: KWin.Client) => {
            const tile = this.loadTile(client);
            this.control.onTileRemoved(tile);
            this.removeTile(tile);
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

    private bindTileEvents(tile: Tile) {
        const client = tile.client;
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
            else
                this.control.onTileGeometryChanged(tile);
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
}
