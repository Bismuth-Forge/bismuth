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

class KWinDriver {
    private engine: TilingEngine;

    constructor() {
        this.engine =  new TilingEngine(this);
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

    public getActiveClient(): KWin.Client {
        return workspace.activeClient;
    }

    public setActiveClient(client: KWin.Client) {
        workspace.activeClient = client;
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

    private bindEvents() {
        this.connect(workspace.clientAdded, (client: KWin.Client) => {
            let shown = false;
            client.windowShown.connect(() => {
                if (shown) return;
                shown = true;

                debugObj(() => ["windowShown", {client}]);
                this.onClientAdded(client);
            });
        });

        this.connect(workspace.clientRemoved, this.onClientRemoved);
        this.connect(workspace.numberScreensChanged, this.onNumberScreensChanged);

        this.connect(workspace.clientFullScreenSet, this.engine.arrange);
        this.connect(workspace.clientMinimized, this.engine.arrange);
        this.connect(workspace.clientUnminimized, this.engine.arrange);
        this.connect(workspace.currentActivityChanged, this.engine.arrange);

        this.connect(workspace.currentDesktopChanged, (desktop: number, client: KWin.Client) => {
            debugObj(() => ["currentDesktopChanged", {desktop, client}]);
            this.engine.jiggle = true;
            this.engine.arrange();
            if (Config.jiggleTiles)
                jiggleTimer.restart();
        });

        this.connect(workspace.screenResized, (screen: number) => {
            debugObj(() => ["screenResized", {screen}]);
            this.engine.arrange();
        });

        // TODO: options.configChanged.connect(this.onConfigChanged);
        /* NOTE: How disappointing. This doesn't work at all. Even an official kwin script tries this.
         *       https://github.com/KDE/kwin/blob/master/scripts/minimizeall/contents/code/main.js */
    }

    private bindClientEvents(client: KWin.Client) {
        this.connect(client.activitiesChanged, () => {
            debugObj(() => ["activitiesChanged", {client}]);
            this.engine.arrange();
        });

        this.connect(client.desktopChanged, () => {
            debugObj(() => ["desktopChanged", {client}]);
            this.engine.arrange();
        });

        this.connect(client.geometryChanged, () => {
            if (client.move || client.resize) return;

            debugObj(() => ["geometryChanged", {client, geometry: client.geometry}]);
            this.engine.arrangeClient(client);
        });

        this.connect(client.moveResizedChanged, () => {
            if (client.move || client.resize) {
                debugObj(() => ["moveResizedChanged", {client}]);
                if (this.engine.setClientFloat(client) === true)
                    this.engine.arrange();
            }
        });

        this.connect(client.screenChanged, () => {
            debugObj(() => ["screenChanged", {client}]);
            this.engine.arrange();
        });
    }

    private onClientAdded = (client: KWin.Client) => {
        if (client.specialWindow) return;
        if (String(client.resourceClass) === "plasmashell") return;

        debugObj(() => ["onClientAdded", {client, class: client.resourceClass}]);
        if (this.engine.manageClient(client))
            this.bindClientEvents(client);
    }

    private onClientRemoved = (client: KWin.Client) => {
        debugObj(() => ["onClientRemoved ", {client}]);
        /* XXX: This is merely an attempt to remove the exited client.
         * Sometimes, the client is not found in the tile list, and causes an
         * exception in `engine.arrange`. */
        this.engine.unmanageClient(client);
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
