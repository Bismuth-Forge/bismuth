// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/unbound-method */

import { createMock } from "ts-auto-mock";
import { Engine } from "../engine";
import { WindowsLayout } from "../engine/layout";
import {
  FocusBottomWindow,
  FocusLeftWindow,
  FocusNextWindow,
  FocusPreviousWindow,
  FocusRightWindow,
  FocusUpperWindow,
} from "./action";

describe("action", () => {
  describe("focus", () => {
    let fakeEngine: Engine;
    beforeEach(() => {
      fakeEngine = createMock<Engine>({
        focusDir: jest.fn(),
        focusOrder: jest.fn(),
        currentLayoutOnCurrentSurface: jest
          .fn()
          .mockReturnValue(createMock<WindowsLayout>()),
      });
    });

    describe("up", () => {
      it("correctly executes", () => {
        const action = new FocusUpperWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("up");
      });
    });

    describe("down", () => {
      it("correctly executes", () => {
        const action = new FocusBottomWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("down");
      });
    });

    describe("left", () => {
      it("correctly executes", () => {
        const action = new FocusLeftWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("left");
      });
    });

    describe("right", () => {
      it("correctly executes", () => {
        const action = new FocusRightWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("right");
      });
    });

    describe("next", () => {
      it("correctly executes", () => {
        const action = new FocusNextWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusOrder).toBeCalledWith(1);
      });
    });

    describe("prev", () => {
      it("correctly executes", () => {
        const action = new FocusPreviousWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusOrder).toBeCalledWith(-1);
      });
    });
  });
});
