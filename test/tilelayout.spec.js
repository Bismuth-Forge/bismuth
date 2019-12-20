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

let assert = require('assert');
let K = require('../krohnkite');

describe('TileLayout', function() {
  describe('#apply', function() {
    let layout = new K.TileLayout();
    let area = new K.Rect(0, 0, 1000, 1000);
    let srf = new K.TestContext(0);
    let gap;

    K.setTestConfig('tileLayoutGap', gap = 0);

    it('tiles sole master to full screen', function() {
      let win = new K.Window(new K.TestWindow(srf));
      layout.apply([win], area);
      assert(win.geometry.equals(area));
    });

    it('corretly applies master ratio', function() {
      let master = new K.Window(new K.TestWindow(srf));
      let stack = new K.Window(new K.TestWindow(srf));

      let ratio = layout.masterRatio;
      let masterWidth = Math.floor(area.width * ratio);

      layout.apply([master, stack], area);
      assert.equal(master.geometry.width, masterWidth);
      assert.equal(stack.geometry.width, area.width - masterWidth);
    });

    it('supports non-origin screen', function() {
      const base = 30;
      const size = 1000;
      const area = new K.Rect(base, base, size, size);

      let tiles = [];
      for (let i = 0; i < 5; i++) {
        tiles.push(new K.Window(new K.TestWindow(srf)));
        layout.apply(tiles, area);

        for (let j = 0; j <= i; j++) {
          assert(tiles[i].geometry.x >= base);
          assert(tiles[i].geometry.y >= base);
          assert(tiles[i].geometry.x + tiles[i].geometry.width  <= base + size);
          assert(tiles[i].geometry.y + tiles[i].geometry.height <= base + size);
        }
      }
    });
  });
});
