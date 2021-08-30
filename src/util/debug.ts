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

declare global {
  var DEBUG: any
}

var DEBUG = {
  enabled: false,
  started: new Date().getTime(),
};

export function debug(f: () => any) {
  if (DEBUG.enabled) {
    const timestamp = (new Date().getTime() - DEBUG.started) / 1000;
    console.log("[" + timestamp + "]", f()); // tslint:disable-line:no-console
  }
}

export function debugObj(f: () => [string, any]) {
  if (DEBUG.enabled) {
    const timestamp = (new Date().getTime() - DEBUG.started) / 1000;
    const [name, obj] = f();
    const buf = [];
    for (const i in obj) buf.push(i + "=" + obj[i]);

    console.log("[" + timestamp + "]", name + ": " + buf.join(" ")); // tslint:disable-line:no-console
  }
}
