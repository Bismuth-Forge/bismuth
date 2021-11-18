// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import FloatingLayout from "./layout/floating_layout";

import { WindowsLayout } from "./layout";

import { DriverSurface } from "../driver/surface";

import { wrapIndex } from "../util/func";
import { Config } from "../config";

export class LayoutStoreEntry {
  public get currentLayout(): WindowsLayout {
    return this.loadLayout(this.currentID);
  }

  private currentIndex: number | null;
  private currentID: string;
  private layouts: { [key: string]: WindowsLayout };
  private previousID: string;

  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.currentIndex = 0;
    this.currentID = this.config.layoutOrder[0];
    this.layouts = {};
    this.previousID = this.currentID;

    this.loadLayout(this.currentID);
  }

  public cycleLayout(step: -1 | 1): WindowsLayout {
    this.previousID = this.currentID;
    this.currentIndex =
      this.currentIndex !== null
        ? wrapIndex(this.currentIndex + step, this.config.layoutOrder.length)
        : 0;
    this.currentID = this.config.layoutOrder[this.currentIndex];
    return this.loadLayout(this.currentID);
  }

  public toggleLayout(targetID: string): WindowsLayout {
    const targetLayout = this.loadLayout(targetID);

    // Toggle if requested, set otherwise
    if (this.currentID === targetID) {
      this.currentID = this.previousID;
      this.previousID = targetID;
    } else {
      this.previousID = this.currentID;
      this.currentID = targetID;
    }

    this.updateCurrentIndex();
    return targetLayout;
  }

  private updateCurrentIndex(): void {
    const idx = this.config.layoutOrder.indexOf(this.currentID);
    this.currentIndex = idx === -1 ? null : idx;
  }

  private loadLayout(ID: string): WindowsLayout {
    let layout = this.layouts[ID];
    if (!layout) {
      layout = this.layouts[ID] = this.config.layoutFactories[ID]();
    }
    return layout;
  }
}

export default class LayoutStore {
  private store: { [key: string]: LayoutStoreEntry };

  constructor(private config: Config) {
    this.store = {};
  }

  public getCurrentLayout(srf: DriverSurface): WindowsLayout {
    return srf.ignore
      ? FloatingLayout.instance
      : this.getEntry(srf.id).currentLayout;
  }

  public cycleLayout(srf: DriverSurface, step: 1 | -1): WindowsLayout | null {
    if (srf.ignore) {
      return null;
    }
    return this.getEntry(srf.id).cycleLayout(step);
  }

  public toggleLayout(
    surf: DriverSurface,
    layoutClassID: string
  ): WindowsLayout | null {
    if (surf.ignore) {
      return null;
    }
    return this.getEntry(surf.id).toggleLayout(layoutClassID);
  }

  private getEntry(key: string): LayoutStoreEntry {
    if (!this.store[key]) {
      this.store[key] = new LayoutStoreEntry(this.config);
    }
    return this.store[key];
  }
}
