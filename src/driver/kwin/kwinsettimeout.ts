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

class KWinTimerPool {
    public static readonly instance = new KWinTimerPool();

    public timers: QQmlTimer[];

    constructor() {
        this.timers = [];
    }

    public setTimeout(func: () => void, timeout: number) {
        const timer: QQmlTimer = this.timers.pop() ||
            Qt.createQmlObject("import QtQuick 2.0; Timer {}", scriptRoot);

        const callback = () => {
            try { timer.triggered.disconnect(callback); } catch (e) { /* ignore */ }
            try { func(); } catch (e) { /* ignore */ }
            this.timers.push(timer);
            debugObj(() => ["setTimeout/callback", { poolSize: this.timers.length}]);
        };

        timer.interval = timeout;
        timer.repeat = false;
        timer.triggered.connect(callback);
        timer.start();
    }
}

function KWinSetTimeout(func: () => void, timeout: number) {
    KWinTimerPool.instance.setTimeout(func, timeout);
}

declare var setTimeout: any;
try {
    if (!setTimeout)
        setTimeout = KWinSetTimeout;
} catch (e) {
    /* ignore */
}
