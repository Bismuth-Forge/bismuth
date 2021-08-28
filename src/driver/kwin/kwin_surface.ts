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

class KWinSurface implements ISurface {
  public static generateId(screen: number, activity: string, desktop: number) {
    let path = String(screen);
    if (KWINCONFIG.layoutPerActivity) path += "@" + activity;
    if (KWINCONFIG.layoutPerDesktop) path += "#" + desktop;
    return path;
  }

  public readonly id: string;
  public readonly ignore: boolean;
  public readonly workingArea: Rect;

  public readonly screen: number;
  public readonly activity: string;
  public readonly desktop: number;

  constructor(screen: number, activity: string, desktop: number) {
    const activityName = activityInfo.activityName(activity);

    this.id = KWinSurface.generateId(screen, activity, desktop);
    this.ignore =
      KWINCONFIG.ignoreActivity.indexOf(activityName) >= 0 ||
      KWINCONFIG.ignoreScreen.indexOf(screen) >= 0;
    this.workingArea = toRect(
      workspace.clientArea(KWin.PlacementArea, screen, desktop)
    );

    this.screen = screen;
    this.activity = activity;
    this.desktop = desktop;
  }

  public next(): ISurface | null {
    if (this.desktop === workspace.desktops)
      /* this is the last virtual desktop */
      /* TODO: option to create additional desktop */
      return null;

    return new KWinSurface(this.screen, this.activity, this.desktop + 1);
  }

  public toString(): string {
    return (
      "KWinSurface(" +
      [
        this.screen,
        activityInfo.activityName(this.activity),
        this.desktop,
      ].join(", ") +
      ")"
    );
  }
}
