// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/unbound-method */

import { createMock } from "ts-auto-mock";
import { Engine } from "../engine";
import { WindowsLayout } from "../engine/layout";
import Window from "../engine/window";
import * as Action from "./action";

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
        const action = new Action.FocusUpperWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("up");
      });
    });

    describe("down", () => {
      it("correctly executes", () => {
        const action = new Action.FocusBottomWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("down");
      });
    });

    describe("left", () => {
      it("correctly executes", () => {
        const action = new Action.FocusLeftWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("left");
      });
    });

    describe("right", () => {
      it("correctly executes", () => {
        const action = new Action.FocusRightWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusDir).toBeCalledWith("right");
      });
    });

    describe("next", () => {
      it("correctly executes", () => {
        const action = new Action.FocusNextWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusOrder).toBeCalledWith(1);
      });
    });

    describe("prev", () => {
      it("correctly executes", () => {
        const action = new Action.FocusPreviousWindow(fakeEngine);

        action.execute();

        expect(fakeEngine.focusOrder).toBeCalledWith(-1);
      });
    });
  });

  describe("move window", () => {
    let fakeEngine: Engine;
    let fakeCurrentWindow: Window;
    beforeEach(() => {
      fakeCurrentWindow = createMock<Window>();

      fakeEngine = createMock<Engine>({
        swapOrder: jest.fn(),
        swapDirOrMoveFloat: jest.fn(),
        currentWindow: jest.fn().mockReturnValue(fakeCurrentWindow),
      });
    });

    describe("up", () => {
      it("correctly executes", () => {
        const action = new Action.MoveActiveWindowUp(fakeEngine);

        action.execute();

        expect(fakeEngine.swapDirOrMoveFloat).toBeCalledWith("up");
      });
    });

    describe("down", () => {
      it("correctly executes", () => {
        const action = new Action.MoveActiveWindowDown(fakeEngine);

        action.execute();

        expect(fakeEngine.swapDirOrMoveFloat).toBeCalledWith("down");
      });
    });

    describe("left", () => {
      it("correctly executes", () => {
        const action = new Action.MoveActiveWindowLeft(fakeEngine);

        action.execute();

        expect(fakeEngine.swapDirOrMoveFloat).toBeCalledWith("left");
      });
    });

    describe("right", () => {
      it("correctly executes", () => {
        const action = new Action.MoveActiveWindowRight(fakeEngine);

        action.execute();

        expect(fakeEngine.swapDirOrMoveFloat).toBeCalledWith("right");
      });
    });

    describe("next", () => {
      it("correctly executes", () => {
        const action = new Action.MoveActiveWindowToNextPosition(fakeEngine);

        action.execute();

        expect(fakeEngine.swapOrder).toBeCalledWith(fakeCurrentWindow, 1);
      });
    });

    describe("prev", () => {
      it("correctly executes", () => {
        const action = new Action.MoveActiveWindowToPreviousPosition(
          fakeEngine
        );

        action.execute();

        expect(fakeEngine.swapOrder).toBeCalledWith(fakeCurrentWindow, -1);
      });
    });
  });

  describe("window resize", () => {
    let fakeEngine: Engine;
    let fakeCurrentWindow: Window;

    beforeEach(() => {
      fakeCurrentWindow = createMock<Window>();

      fakeEngine = createMock<Engine>({
        resizeWindow: jest.fn(),
        currentWindow: jest.fn().mockReturnValue(fakeCurrentWindow),
      });
    });

    describe("width increase", () => {
      it("correctly executes", () => {
        const action = new Action.IncreaseActiveWindowWidth(fakeEngine);

        action.execute();

        expect(fakeEngine.resizeWindow).toBeCalledWith(
          fakeCurrentWindow,
          "east",
          1
        );
      });
    });

    describe("width decrease", () => {
      it("correctly executes", () => {
        const action = new Action.DecreaseActiveWindowWidth(fakeEngine);

        action.execute();

        expect(fakeEngine.resizeWindow).toBeCalledWith(
          fakeCurrentWindow,
          "east",
          -1
        );
      });
    });

    describe("height increase", () => {
      it("correctly executes", () => {
        const action = new Action.IncreaseActiveWindowHeight(fakeEngine);

        action.execute();

        expect(fakeEngine.resizeWindow).toBeCalledWith(
          fakeCurrentWindow,
          "south",
          1
        );
      });
    });

    describe("height decrease", () => {
      it("correctly executes", () => {
        const action = new Action.DecreaseActiveWindowHeight(fakeEngine);

        action.execute();

        expect(fakeEngine.resizeWindow).toBeCalledWith(
          fakeCurrentWindow,
          "south",
          -1
        );
      });
    });
  });

  describe("master area", () => {
    let fakeEngine: Engine;

    beforeEach(() => {
      fakeEngine = createMock<Engine>({
        showNotification: jest.fn(),
      });
    });

    describe("increase windows count", () => {
      it("shows a note that there is no master area in general case", () => {
        const action = new Action.IncreaseMasterAreaWindowCount(fakeEngine);

        action.execute();

        expect(fakeEngine.showNotification).toBeCalledWith("No Master Area");
      });
    });

    describe("decrease windows count", () => {
      it("shows a note that there is no master area in general case", () => {
        const action = new Action.DecreaseMasterAreaWindowCount(fakeEngine);

        action.execute();

        expect(fakeEngine.showNotification).toBeCalledWith("No Master Area");
      });
    });

    describe("increase size", () => {
      it("shows a note that there is no master area in general case", () => {
        const action = new Action.IncreaseLayoutMasterAreaSize(fakeEngine);

        action.execute();

        expect(fakeEngine.showNotification).toBeCalledWith("No Master Area");
      });
    });

    describe("decrease size", () => {
      it("shows a note that there is no master area in general case", () => {
        const action = new Action.DecreaseLayoutMasterAreaSize(fakeEngine);

        action.execute();

        expect(fakeEngine.showNotification).toBeCalledWith("No Master Area");
      });
    });
  });

  describe("toggle floating", () => {
    it("executes correctly", () => {
      const fakeCurrentWindow = createMock<Window>();
      const fakeEngine = createMock<Engine>({
        toggleFloat: jest.fn(),
        currentWindow: jest.fn().mockReturnValue(fakeCurrentWindow),
      });

      const action = new Action.ToggleActiveWindowFloating(fakeEngine);

      action.execute();

      expect(fakeEngine.toggleFloat).toBeCalledWith(fakeCurrentWindow);
    });
  });

  describe("push window into master area", () => {
    it("executes correctly", () => {
      const fakeCurrentWindow = createMock<Window>();
      const fakeEngine = createMock<Engine>({
        setMaster: jest.fn(),
        currentWindow: jest.fn().mockReturnValue(fakeCurrentWindow),
      });

      const action = new Action.PushActiveWindowIntoMasterAreaFront(fakeEngine);

      action.execute();

      expect(fakeEngine.setMaster).toBeCalledWith(fakeCurrentWindow);
    });
  });

  describe("layout switching", () => {
    let fakeEngine: Engine;
    let fakeCurrentWindow: Window;

    beforeEach(() => {
      fakeCurrentWindow = createMock<Window>();

      fakeEngine = createMock<Engine>({
        cycleLayout: jest.fn(),
        setLayout: jest.fn(),
        currentWindow: jest.fn().mockReturnValue(fakeCurrentWindow),
      });
    });

    describe("next layout", () => {
      it("executes correctly", () => {
        const action = new Action.SwitchToNextLayout(fakeEngine);

        action.execute();

        expect(fakeEngine.cycleLayout).toBeCalledWith(1);
      });
    });

    describe("prev layout", () => {
      it("executes correctly", () => {
        const action = new Action.SwitchToPreviousLayout(fakeEngine);

        action.execute();

        expect(fakeEngine.cycleLayout).toBeCalledWith(-1);
      });
    });

    describe("set layout", () => {
      it("executes correctly when asking to set Monocle Layout", () => {
        const action = new Action.SetMonocleLayout(fakeEngine);

        action.execute();

        expect(fakeEngine.setLayout).toBeCalledWith("MonocleLayout");
      });
    });
  });
});
