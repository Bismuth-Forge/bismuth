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

class KWinDriver {
    private engine: TilingEngine;
    private tileMap: {[key: string]: Tile};
    private timerPool: QQmlTimer[];

    constructor() {
        this.engine =  new TilingEngine(this);
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

        this.onNumberScreensChanged(workspace.numScreens);

        const clients = workspace.clientList();
        for (let i = 0; i < clients.length; i++)
            this.onClientAdded(clients[i]);

        if (Config.jiggleTiles)
            jiggleTimer.triggered.connect(this.onJiggleTimerTriggered);
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
            tile = new Tile(client);
            this.tileMap[key] = tile;
        }
        return tile;
    }

    private bindEvents() {
        this.connect(workspace.numberScreensChanged, this.onNumberScreensChanged);
        this.connect(workspace.screenResized, (screen: number) => {
            debugObj(() => ["screenResized", {screen}]);
            this.engine.arrange();
        });

        this.connect(workspace.currentActivityChanged, this.engine.arrange);
        this.connect(workspace.currentDesktopChanged, (desktop: number, client: KWin.Client) => {
            debugObj(() => ["currentDesktopChanged", {desktop, client}]);
            this.engine.jiggle = true;
            this.engine.arrange();
            if (Config.jiggleTiles)
                jiggleTimer.restart();
        });

        this.connect(workspace.clientAdded, (client: KWin.Client) => {
            const handler = () => {
                client.windowShown.disconnect(handler);
                this.onClientAdded(client);
            };
            client.windowShown.connect(handler);
        });
        this.connect(workspace.clientRemoved, this.onClientRemoved);

        this.connect(workspace.clientFullScreenSet, (client: KWin.Client, fullScreen: boolean, user: boolean) =>
            this.onClientChanged(this.loadTile(client), "fullscreen=" + fullScreen + " user=" + user));
        this.connect(workspace.clientMinimized, (client: KWin.Client) =>
            this.onClientChanged(this.loadTile(client), "minimized"));
        this.connect(workspace.clientUnminimized, (client: KWin.Client) =>
            this.onClientChanged(this.loadTile(client), "unminimized"));

        // TODO: options.configChanged.connect(this.onConfigChanged);
        /* NOTE: How disappointing. This doesn't work at all. Even an official kwin script tries this.
         *       https://github.com/KDE/kwin/blob/master/scripts/minimizeall/contents/code/main.js */
    }

    private bindClientEvents(client: KWin.Client) {
        const tile = this.loadTile(client);
        let moving = false;
        let resizing = false;

        this.connect(client.moveResizedChanged, () => {
            debugObj(() => ["moveResizedChanged", {tile, move: client.move, resize: client.resize}]);
            if (moving !== client.move) {
                moving = client.move;
                if (moving)
                    this.onClientMoveStart(tile);
                else
                    this.onClientMoveOver(tile);
            }

            if (resizing !== client.resize) {
                resizing = client.resize;
                if (resizing)
                    this.onClientResizeStart(tile);
                else
                    this.onClientResizeOver(tile);
            }
        });

        this.connect(client.geometryChanged, () => {
            if (moving) {
                this.onClientMove(tile);
            } else if (resizing) {
                this.onClientResize(tile);
            } else {
                /* client geometry changed without user intervention */
                debugObj(() => ["geometryChanged", {tile, geometry: client.geometry}]);
                this.engine.enforceClientSize(tile);
            }
        });

        this.connect(client.screenChanged, () => this.onClientChanged(tile, "screen=" + client.screen));
        this.connect(client.activitiesChanged, () =>
            this.onClientChanged(tile, "activity=" + client.activities.join(",")));
        this.connect(client.desktopChanged, () => this.onClientChanged(tile, "desktop=" + client.desktop));

    }

    private onClientAdded = (client: KWin.Client) => {
        if (client.specialWindow) return;
        if (String(client.resourceClass) === "plasmashell") return;

        debugObj(() => ["onClientAdded", {client, class: client.resourceClass}]);
        const tile = this.loadTile(client);
        this.engine.manageClient(tile);
        if (tile.managed)
            this.bindClientEvents(client);
    }

    private onClientRemoved = (tile: Tile) => {
        debugObj(() => ["onClientRemoved ", {tile}]);
        /* XXX: This is merely an attempt to remove the exited client.
         * Sometimes, the client is not found in the tile list, and causes an
         * exception in `engine.arrange`. */
        this.engine.unmanageClient(tile);
    }

    private onClientMoveStart = (tile: Tile) => {
        if (this.engine.setClientFloat(tile) === true)
            this.engine.arrange();
    }

    private onClientMove = (tile: Tile) => {
        return;
    }

    private onClientMoveOver = (tile: Tile) => {
        return;
    }

    private onClientResizeStart = (tile: Tile) => {
        if (this.engine.setClientFloat(tile) === true)
            this.engine.arrange();
    }

    private onClientResize = (tile: Tile) => {
        return;
    }

    private onClientResizeOver = (tile: Tile) => {
        return;
    }

    private onClientChanged = (tile: Tile, comment?: string) => {
        debugObj(() => ["onClientChanged", {tile, comment}]);
        this.engine.arrange();
    }

    private onNumberScreensChanged = (count: number) => {
        debugObj(() => ["onNumberScreensChanged", {count}]);
        this.engine.setNumberScreen(count);
    }

    private onJiggleTimerTriggered = () => {
        this.engine.jiggle = false;
        this.engine.arrange();
    }

    // TODO: private onConfigChanged = () => {
    //     this.loadConfig();
    //     this.engine.arrange();
    // }
    /* NOTE: check `bindEvents` for details */
}
