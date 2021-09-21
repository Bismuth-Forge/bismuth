// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { createMock } from "ts-auto-mock";
import { Engine } from "../engine";
import { FocusUpperWindow } from "./action";

describe("action", () => {
  describe("focus up", () => {
    const fakeEngine = createMock<Engine>({ focusDir: jest.fn() });
    const action = new FocusUpperWindow(fakeEngine);
    it("correctly executes", () => {
      // Arrange
      jest.spyOn(fakeEngine, "focusDir");

      // Act
      action.execute();

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(fakeEngine.focusDir).toBeCalledWith("up");
    });
  });
});
