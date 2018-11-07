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

class KWinDriver
{
    engine: TilingEngine;

    /*
     * Signal handlers
     */

    private bindEvents()
    {
        workspace.clientAdded.connect(this.onClientAdded);
        workspace.clientRemoved.connect(this.onClientRemoved);
        workspace.numberScreensChanged.connect(this.onNumberScreensChanged);

        var engine_arrange = () => { this.engine.arrange(); }
        workspace.clientMinimized.connect(engine_arrange);
        workspace.clientUnminimized.connect(engine_arrange);
        workspace.currentDesktopChanged.connect(engine_arrange);

        // TODO: store screen size in engine?
        workspace.screenResized.connect(engine_arrange);

        // TODO: handle workspace.clientMaximizeSet signal
        // TODO: handle workspace.clientFullScreenSet signal
        // TODO: handle workspace.currentActivityChanged signal
        // TODO: handle workspace.activitiesChanged signal
        // TODO: handle workspace.activityAdded signal
        // TODO: handle workspace.activityRemoved signal
        // TODO: handle workspace.numberDesktopsChanged signal(???)
    }

    private onClientAdded = (client: KWin.Client) =>
    {
        // TODO: check resourceClasses for some windows
        this.engine.manageClient(client);

        client.desktopChanged.connect(this.engine.arrange);
        client.geometryChanged.connect(() => {
            if(client.move || client.resize) return;
            this.engine.arrangeClient(client);
        });
        client.moveResizedChanged.connect(() => {
            if(client.move || client.resize) return;
            this.engine.arrange();
        });
    };

    private onClientRemoved = (client: KWin.Client) =>
    {
        /* XXX: This is merely an attempt to remove the exited client.
         * Sometimes, the client is not found in the tile list, and causes an
         * exception in `engine.arrange`.
         */
        this.engine.unmanageClient(client);
    };

    private onNumberScreensChanged = (count: number) =>
    {
        while(this.engine.screens.length < count)
            this.engine.addScreen(this.engine.screens.length);
        while(this.engine.screens.length > count)
            this.engine.screenRemove(this.engine.screens.length - 1);
    };

    /*
     * Utils
     */

    public getWorkingArea(screenId: number): QRect
    {
        // TODO: verify: can each desktops have a different placement area?
        return workspace.clientArea(
            KWin.PlacementArea, screenId, workspace.currentDesktop);
    }

    public getClientGeometry(client: KWin.Client): QRect
    {
        return {
            x: client.geometry.x,
            y: client.geometry.y,
            width: client.geometry.width,
            height: client.geometry.height
        };
    }

    public setClientGeometry(client: KWin.Client, geometry: QRect)
    {
        client.geometry = {
            x: geometry.x,
            y: geometry.y,
            width: geometry.width,
            height: geometry.height
        };
    }

    public isClientVisible(client: KWin.Client, screenId: number)
    {
        // TODO: test KWin::Toplevel properties...?
        return (
            (!client.minimized) &&
            (client.desktop == workspace.currentDesktop
                || client.desktop == -1 /* on all desktop */) &&
            (client.screen == screenId)
        );
    }

    /*
     * Main
     */

    public main()
    {
        this.engine = new TilingEngine(this);

        this.bindEvents();
        this.onNumberScreensChanged(workspace.numScreens);
        workspace.clientList().map(this.onClientAdded);
    }
}

(new KWinDriver()).main();
