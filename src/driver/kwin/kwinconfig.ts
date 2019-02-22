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

class KWinConfig implements IConfig {
    //#region Layout
    public enableMonocleLayout: boolean;
    public enableQuarterLayout: boolean;
    public enableSpreadLayout: boolean;
    public enableStairLayout: boolean;
    public enableTileLayout: boolean;
    public maximizeSoleTile: boolean;
    public monocleMaximize: boolean;
    //#endregion

    //#region Features
    public mouseAdjustLayout: boolean;
    public noTileBorder: boolean;
    //#endregion

    //#region Gap
    public screenGapBottom: number;
    public screenGapLeft: number;
    public screenGapRight: number;
    public screenGapTop: number;
    public tileLayoutGap: number;
    //#endregion

    //#region KWin-specific
    public layoutPerActivity: boolean;
    public layoutPerDesktop: boolean;
    //#endregion

    //#region KWin rules
    public floatUtility: boolean;

    public floatingClass: string[];
    public floatingTitle: string[];
    public ignoreClass: string[];
    public ignoreTitle: string[];

    public ignoreActivity: string[];
    public ignoreScreen: number[];
    //#endregion

    constructor() {
        function commaSeparate(str: string): string[] {
            if (!str) return [];
            if (typeof str !== "string") return [];
            return str.split(",").map((part) => part.trim());
        }

        DEBUG.enabled = DEBUG.enabled || KWin.readConfig("debug", false);

        this.enableMonocleLayout  = KWin.readConfig("enableMonocleLayout" , true);
        this.enableQuarterLayout  = KWin.readConfig("enableQuarterLayout" , false);
        this.enableSpreadLayout   = KWin.readConfig("enableSpreadLayout"  , true);
        this.enableStairLayout    = KWin.readConfig("enableStairLayout"   , true);
        this.enableTileLayout     = KWin.readConfig("enableTileLayout"    , true);
        this.maximizeSoleTile     = KWin.readConfig("maximizeSoleTile"    , false);
        this.monocleMaximize      = KWin.readConfig("monocleMaximize"     , true);

        this.mouseAdjustLayout    = KWin.readConfig("mouseAdjustLayout"   , true);
        this.noTileBorder         = KWin.readConfig("noTileBorder"        , false);

        this.screenGapBottom      = KWin.readConfig("screenGapBottom"     , 0);
        this.screenGapLeft        = KWin.readConfig("screenGapLeft"       , 0);
        this.screenGapRight       = KWin.readConfig("screenGapRight"      , 0);
        this.screenGapTop         = KWin.readConfig("screenGapTop"        , 0);
        this.tileLayoutGap        = KWin.readConfig("tileLayoutGap"       , 0);

        this.layoutPerActivity    = KWin.readConfig("layoutPerActivity"   , false);
        this.layoutPerDesktop     = KWin.readConfig("layoutPerDesktop"    , false);
        this.floatUtility         = KWin.readConfig("floatUtility"        , true);

        this.floatingClass  = commaSeparate(KWin.readConfig("floatingClass" , ""));
        this.floatingTitle  = commaSeparate(KWin.readConfig("floatingTitle" , ""));
        this.ignoreActivity = commaSeparate(KWin.readConfig("ignoreActivity", ""));
        this.ignoreClass    = commaSeparate(KWin.readConfig("ignoreClass"   ,
            "krunner,yakuake,spectacle,kded5"));

        this.ignoreScreen = commaSeparate(KWin.readConfig("ignoreScreen", ""))
            .map((str) => parseInt(str, 10));
        this.ignoreTitle  = commaSeparate(KWin.readConfig("ignoreTitle" , ""));
    }

    public toString(): string {
        return "Config(" + JSON.stringify(this, undefined, 2) + ")";
    }
}

/* HACK: save casting */
let KWINCONFIG: KWinConfig;
