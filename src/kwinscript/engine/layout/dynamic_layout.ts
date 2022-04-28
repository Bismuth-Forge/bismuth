// SPDX-FileCopyrightText: 2022 Philippe Daouadi <philippe@ud2.org>
//
// SPDX-License-Identifier: MIT

import { WindowsLayout } from ".";

import { WindowState, EngineWindow } from "../window";

import {
  Action,
  SplitPartHorizontally,
  SplitPartVertically,
} from "../../controller/action";

import { Rect, RectDelta } from "../../util/rect";
import { Config } from "../../config";
import { Controller } from "../../controller";
import { Engine } from "..";
import LayoutUtils from "./layout_utils";

type SplitDirection = "horizontal" | "vertical";

export class DynamicLayoutPart {
  public gap: number;
  public direction: SplitDirection;
  public subParts: Array<DynamicLayoutPart | string>;

  private config: Config;

  constructor(config: Config, direction: SplitDirection = "horizontal") {
    this.config = config;
    this.gap = 0;
    this.direction = direction;
    this.subParts = [];
  }

  public split(direction: SplitDirection, currentWindow: EngineWindow): number {
    const replacePart = (position: number) => {
      const newPart = new DynamicLayoutPart(this.config, direction);
      newPart.subParts.push(currentWindow.id);
      this.subParts[position] = newPart;
    };

    for (let i = 0; i < this.subParts.length; ++i) {
      const subPart = this.subParts[i];
      if (subPart === currentWindow.id) {
        // If this part contains a single window, replace it instead of nesting
        // a new split. This operation will be handled by the caller.
        if (this.subParts.length === 1) return 2;

        replacePart(i);
        return 1;
      } else if (subPart instanceof DynamicLayoutPart) {
        const splitResult = subPart.split(direction, currentWindow);
        if (splitResult === 1) {
          return 1;
        } else if (splitResult === 2) {
          // The subpart can't handle the split itself, replace it completely.
          replacePart(i);
        }
      }
    }

    return 0;
  }

  public prepare(tiles: EngineWindow[], topLevel: boolean = true): void {
    // Make sure that all windows are referenced. Remove the ones that have
    // disappeared, and add the potentially new ones at the end. Note that most
    // window additions should be handled by newWindow().
    for (let i = 0; i < this.subParts.length; ++i) {
      const subPart = this.subParts[i];
      if (subPart instanceof DynamicLayoutPart) {
        subPart.prepare(tiles, false);
      } else {
        if (tiles.length > 0 && subPart === tiles[0].id) {
          tiles.shift();
        } else {
          this.subParts.splice(i, 1);
          --i;
        }
      }
    }
    // Remaining windows
    if (topLevel) {
      while (tiles.length > 0) {
        this.subParts.push(tiles[0].id);
        tiles.shift();
      }
    }
  }

  public handelNewWindow(
    currentWindow: EngineWindow,
    newWindow: EngineWindow
  ): boolean {
    // The new window was inserted in the WindowStore just after the current
    // window, so find it so that we can insert it at the same place, and in the
    // same subpart.
    for (let i = 0; i < this.subParts.length; ++i) {
      const subPart = this.subParts[i];
      if (subPart instanceof DynamicLayoutPart) {
        if (subPart.handelNewWindow(currentWindow, newWindow)) return true;
      } else {
        if (subPart === currentWindow.id) {
          this.subParts.splice(i + 1, 0, newWindow.id);
          return true;
        }
      }
    }
    return false;
  }

  public apply(area: Rect, tiles: EngineWindow[]): Rect[] {
    const partAreas = LayoutUtils.splitAreaWeighted(
      area,
      this.subParts.map((_) => 1.0),
      this.gap,
      this.direction === "horizontal"
    );
    const rects: Array<Rect> = [];
    this.subParts.forEach((subPart, i) => {
      if (subPart instanceof DynamicLayoutPart) {
        const subRects = subPart.apply(partAreas[i], tiles);
        rects.splice(rects.length, 0, ...subRects);
      } else {
        if (subPart !== tiles[0].id) {
          // FIXME: how are we supposed to log these kind of recoverable errors?
          console.error(
            `apply: unexpected window id: ${tiles[0].id}, expected: ${subPart}`
          );
        }
        rects.push(partAreas[i]);
        tiles.shift();
      }
    });
    return rects;
  }

  // FIXME: debug stuff, remove
  public dump(depth: number = 0): void {
    this.subParts.forEach((subPart) => {
      if (subPart instanceof DynamicLayoutPart) subPart.dump(depth + 1);
      else console.log("  ".repeat(depth), subPart);
    });
  }
}

export default class DynamicLayout implements WindowsLayout {
  public static readonly MIN_MASTER_RATIO = 0.2;
  public static readonly MAX_MASTER_RATIO = 0.8;
  public static readonly id = "DynamicLayout";
  public readonly classID = DynamicLayout.id;
  public readonly name = "Dynamic Layout";
  public readonly icon = "bismuth-dynamic";

  private parts: DynamicLayoutPart;

  private config: Config;

  constructor(config: Config) {
    this.config = config;

    this.parts = new DynamicLayoutPart(this.config);

    this.parts.gap = this.config.tileLayoutGap;
  }

  public handelNewWindow(
    currentWindow: EngineWindow,
    newWindow: EngineWindow
  ): void {
    this.parts.handelNewWindow(currentWindow, newWindow);
  }

  public apply(
    _controller: Controller,
    tileables: EngineWindow[],
    area: Rect
  ): void {
    tileables.forEach((tileable) => (tileable.state = WindowState.Tiled));
    this.parts.dump();

    // Applying the layout must be done in two steps. First we prepare to detect
    // all windows we might have missed (like when the layout is first used) and
    // add them to the layout. Then we can apply the layout, once it has been
    // synchronized with the current windows.
    this.parts.prepare(tileables.slice());
    const rects = this.parts.apply(area, tileables.slice());
    rects.forEach((geometry, i) => {
      tileables[i].geometry = geometry;
    });
  }

  public executeAction(engine: Engine, action: Action): void {
    this.parts.dump();
    if (action instanceof SplitPartHorizontally) {
      const currentWindow = engine.currentWindow();
      if (currentWindow) this.parts.split("horizontal", currentWindow);
    } else if (action instanceof SplitPartVertically) {
      const currentWindow = engine.currentWindow();
      if (currentWindow) this.parts.split("vertical", currentWindow);
    } else {
      action.executeWithoutLayoutOverride();
    }
    this.parts.dump();
  }

  public toString(): string {
    return `DynamicLayout()`;
  }
}
