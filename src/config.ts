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

class Config {
    public static enableMonocleLayout: boolean;
    public static enableSpreadLayout: boolean;
    public static enableStairLayout: boolean;
    public static enableTileLayout: boolean;
    public static floatUtility: boolean;
    public static layoutPerActivity: boolean;
    public static layoutPerDesktop: boolean;
    public static maximizeSoleTile: boolean;
    public static mouseResize: boolean;
    public static noTileBorder: boolean;
    public static screenGapBottom: number;
    public static screenGapLeft: number;
    public static screenGapRight: number;
    public static screenGapTop: number;
    public static tileLayoutGap: number;

    public static floatingClass: string[];
    public static ignoreClass: string[];

    public static load() {
        function commanSeparate(str: string): string[] {
            if (!str) return [];
            if (typeof str !== "string") return [];
            return str.split(",").map((part) => part.trim());
        }

        function load(name: string, def: any) {
            (Config as any)[name] = KWin.readConfig(name, def);
            debug(() => name + " : " + (Config as any)[name]);
        }

        DEBUG.enabled = DEBUG.enabled || KWin.readConfig("debug", false);

        load("enableMonocleLayout", true);
        load("enableSpreadLayout", true);
        load("enableStairLayout", true);
        load("enableTileLayout", true);
        load("floatUtility", true);
        load("layoutPerActivity", false);
        load("layoutPerDesktop", false);
        load("maximizeSoleTile", false);
        this.mouseResize = true; // TODO: load config
        load("noTileBorder", false);
        load("screenGapBottom", 0);
        load("screenGapLeft", 0);
        load("screenGapRight", 0);
        load("screenGapTop", 0);
        load("tileLayoutGap", 0);

        Config.floatingClass = commanSeparate(KWin.readConfig("floatingClass", ""));
        Config.ignoreClass = commanSeparate(KWin.readConfig("ignoreClass",
            "krunner,yakuake,spectacle,kded5"));
        debug(() => "floatingClass: " + Config.floatingClass);
        debug(() => "ignoreClass: " + Config.ignoreClass);
    }
}
