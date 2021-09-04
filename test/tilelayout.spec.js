// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

let assert = require("assert");
let K = require("../bismuth");

describe("TileLayout", function () {
  describe("#apply", function () {
    let layout = new K.TileLayout();
    let area = new K.Rect(0, 0, 1000, 1000);
    let srf = new K.TestContext(0);
    let gap;

    K.setTestConfig("tileLayoutGap", (gap = 0));

    it("tiles sole master to full screen", function () {
      let win = new K.Window(new K.TestWindow(srf));
      layout.apply([win], area);
      assert(win.geometry.equals(area));
    });

    it("corretly applies master ratio", function () {
      let master = new K.Window(new K.TestWindow(srf));
      let stack = new K.Window(new K.TestWindow(srf));

      let ratio = layout.masterRatio;
      let masterWidth = Math.floor(area.width * ratio);

      layout.apply([master, stack], area);
      assert.equal(master.geometry.width, masterWidth);
      assert.equal(stack.geometry.width, area.width - masterWidth);
    });

    it("supports non-origin screen", function () {
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
          assert(tiles[i].geometry.x + tiles[i].geometry.width <= base + size);
          assert(tiles[i].geometry.y + tiles[i].geometry.height <= base + size);
        }
      }
    });
  });
});
