// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { createMock } from "ts-auto-mock";

import { TilingEngine } from ".";
import Config from "../config";
import { Controller } from "../controller";
import { DriverSurface } from "../driver/surface";

import Debug from "../util/debug";
import Rect from "../util/rect";
import TileLayout from "./layout/tile_layout";
import LayoutStore from "./layout_store";
import Window, { WindowState } from "./window";
import WindowStore from "./window_store";

describe("arrange", () => {
  it("happens on all screens", () => {
    // Arrange
    const screenMock = createMock<DriverSurface>();
    const fakeScreens = [screenMock, screenMock, screenMock, screenMock];

    const controllerMock = createMock<Controller>({ screens: fakeScreens });
    const debugMock = createMock<Debug>();
    const configMock = createMock<Config>();
    const engine = new TilingEngine(controllerMock, configMock, debugMock);

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
    const debugMock = createMock<Debug>();
    const configMock = createMock<Config>();
    const engine = new TilingEngine(controllerMock, configMock, debugMock);

    const window1 = createMock<Window>({
      shouldFloat: false,
      state: WindowState.Undecided,
    });

    const window2 = createMock<Window>({
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
      .spyOn(TilingEngine.prototype as any, "getTilingArea")
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
