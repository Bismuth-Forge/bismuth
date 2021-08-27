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
 * Provides contextual information and operations to Layout layer.
 *
 * Its purpose is to limit the visibility of information and operation. It's
 * not really a find-grained control mechanism, but is simple and concise.
 */
class EngineContext {
  public get backend(): string {
    return this.drvctx.backend;
  }

  public get currentWindow(): Window | null {
    return this.drvctx.currentWindow;
  }

  public set currentWindow(window: Window | null) {
    this.drvctx.currentWindow = window;
  }

  constructor(private drvctx: IDriverContext, private engine: TilingEngine) {}

  public setTimeout(func: () => void, timeout: number): void {
    this.drvctx.setTimeout(func, timeout);
  }

  public cycleFocus(step: -1 | 1) {
    this.engine.focusOrder(this.drvctx, step);
  }

  public moveWindow(window: Window, target: Window, after?: boolean) {
    this.engine.windows.move(window, target, after);
  }

  public showNotification(text: string) {
    this.drvctx.showNotification(text);
  }
}
