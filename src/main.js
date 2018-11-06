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

function KWinDriver() {
    var self = this;
    var engine = null;

    /*
     * Signal handlers
     */

    self._onClientAdded = function(client) {
        // DEBUG: print("clientAdded " + client + " " + client.resourceClass);

        // TODO: check resourceClasses for some windows
        if(!engine.manage(client))
            return;

        client.desktopChanged.connect(engine.arrange);
        client.geometryChanged.connect(function() {
            if(client.move || client.resize) return;
            engine.arrangeClient(client);
        });
        client.moveResizedChanged.connect(function() {
            if(client.move || client.resize) return;
            engine.arrange();
        });

        // DEBUG: print(" -> numTiles=" + engine.tiles.length);
    };

    self._onClientRemoved = function(client) {
        // DEBUG: print("clientRemoved " + client);
        /* XXX: This is merely an attempt to remove the exited client.
         * Sometimes, the client is not found in the tile list, and causes an
         * exception in `engine.arrange`.
         */
        engine.unmanage(client);
        // DEBUG: print(" -> numTiles=" + engine.tiles.length);
    };

    self._onNumberScreensChanged = function(count) {
        // DEBUG: print("numberScreenChanged " + count);
        while(engine.screens.length < count)
            engine.addScreen(engine.screens.length);
        while(engine.screens.length > count)
            engine.removeScreen(engine.screens.length - 1);
    };

    /*
     * Utils
     */

    self.getWorkingArea = function(screenId) {
        // TODO: verify: can each desktops have a different placement area?
        return workspace.clientArea(
            KWin.PlacementArea, screenId, workspace.currentDesktop);
    }

    self.getClientGeometry = function(client) {
        return {
            x: client.geometry.x,
            y: client.geometry.y,
            width: client.geometry.width,
            height: client.geometry.height
        };
    }

    self.setClientGeometry = function(client, x, y, width, height) {
        client.geometry = { x:x, y:y, width:width, height:height };
    }

    self.isClientVisible = function(client, screenId) {
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

    self.main = function() {
        engine = new TilingEngine(self);

        workspace.clientAdded.connect(self._onClientAdded);
        workspace.clientRemoved.connect(self._onClientRemoved);
        workspace.numberScreensChanged.connect(self._onNumberScreensChanged);

        workspace.clientMinimized.connect(engine.arrange);
        workspace.clientUnminimized.connect(engine.arrange);
        workspace.currentDesktopChanged.connect(engine.arrange);

        // TODO: store screen size in engine?
        workspace.screenResized.connect(engine.arrange);

        // TODO: handle workspace.clientMaximizeSet signal
        // TODO: handle workspace.clientFullScreenSet signal
        // TODO: handle workspace.currentActivityChanged signal
        // TODO: handle workspace.activitiesChanged signal
        // TODO: handle workspace.activityAdded signal
        // TODO: handle workspace.activityRemoved signal
        // TODO: handle workspace.numberDesktopsChanged signal(???)

        self._onNumberScreensChanged(workspace.numScreens);
        workspace.clientList().map(self._onClientAdded);
    }
}

(new KWinDriver()).main();
