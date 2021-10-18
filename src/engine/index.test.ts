// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/unbound-method */

import { createMock } from "ts-auto-mock";

import { EngineImpl } from ".";
import Config from "../config";
import { Controller } from "../controller";
import { DriverSurface } from "../driver/surface";

import { Log } from "../util/log";
import { Rect } from "../util/rect";
import TileLayout from "./layout/tile_layout";
import LayoutStore from "./layout_store";
import { EngineWindow, WindowState } from "./window";
import WindowStore from "./window_store";

describe("arrange", () => {
  it("happens on all screens", () => {
    // Arrange
    const screenMock = createMock<DriverSurface>();
    const fakeScreens = [screenMock, screenMock, screenMock, screenMock];

    const controllerMock = createMock<Controller>({ screens: fakeScreens });
    const logMock = createMock<Log>();
    const configMock = createMock<Config>();
    const engine = new EngineImpl(controllerMock, configMock, logMock);

    jest.spyOn(engine, "arrangeScreen").mockReturnValue();

    // Act
    engine.arrange();

    // Assert
    expect(engine.arrangeScreen).toBeCalledTimes(4);
  });
});

describe("arrangeScreen", () => {
  describe("window states are correctly changed", () => {
    // Arrange
    const controllerMock = createMock<Controller>();
    const logMock = createMock<Log>();
    const configMock = createMock<Config>();
    const engine = new EngineImpl(controllerMock, configMock, logMock);

    const window1 = createMock<EngineWindow>({
      shouldFloat: false,
      state: WindowState.Undecided,
    });

    const window2 = createMock<EngineWindow>({
      shouldFloat: true,
      state: WindowState.Undecided,
    });

    engine.windows = createMock<WindowStore>({
      getVisibleWindows: () => [window1, window2],
      getVisibleTileables: () => [],
    });

    engine.layouts = createMock<LayoutStore>({
      getCurrentLayout: () => createMock<TileLayout>(),
    });
    jest
      .spyOn(EngineImpl.prototype as any, "getTilingArea")
      .mockReturnValue(createMock<Rect>());

    const mockSurface = createMock<DriverSurface>();

    // Act
    engine.arrangeScreen(mockSurface);

    // Assert
    it("sets all undecided windows to tiled state, when they should not float", () => {
      expect(window1.state).toEqual(WindowState.Tiled);
    });
    it("sets all undecided windows to float state, when they should float", () => {
      expect(window2.state).toEqual(WindowState.Floating);
    });
  });
});
