// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import MonocleLayout from "./layout/monocle_layout";
import FloatingLayout from "./layout/floating_layout";

import { ILayout } from "./layout/ilayout";

import { DriverSurface } from "../driver/surface";

import { wrapIndex } from "../util/func";
import Config from "../config";

export class LayoutStoreEntry {
  public get currentLayout(): ILayout {
    return this.loadLayout(this.currentID);
  }

  private currentIndex: number | null;
  private currentID: string;
  private layouts: { [key: string]: ILayout };
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

  public cycleLayout(step: -1 | 1): ILayout {
    this.previousID = this.currentID;
    this.currentIndex =
      this.currentIndex !== null
        ? wrapIndex(this.currentIndex + step, this.config.layoutOrder.length)
        : 0;
    this.currentID = this.config.layoutOrder[this.currentIndex];
    return this.loadLayout(this.currentID);
  }

  public setLayout(targetID: string): ILayout {
    const targetLayout = this.loadLayout(targetID);
    if (
      targetLayout instanceof MonocleLayout &&
      this.currentLayout instanceof MonocleLayout
    ) {
      /* toggle Monocle "OFF" */
      this.currentID = this.previousID;
      this.previousID = targetID;
    } else if (this.currentID !== targetID) {
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

  private loadLayout(ID: string): ILayout {
    let layout = this.layouts[ID];
    if (!layout) layout = this.layouts[ID] = this.config.layoutFactories[ID]();
    return layout;
  }
}

export default class LayoutStore {
  private store: { [key: string]: LayoutStoreEntry };

  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.store = {};
  }

  public getCurrentLayout(srf: DriverSurface): ILayout {
    return srf.ignore
      ? FloatingLayout.instance
      : this.getEntry(srf.id).currentLayout;
  }

  public cycleLayout(srf: DriverSurface, step: 1 | -1): ILayout | null {
    if (srf.ignore) return null;
    return this.getEntry(srf.id).cycleLayout(step);
  }

  public setLayout(srf: DriverSurface, layoutClassID: string): ILayout | null {
    if (srf.ignore) return null;
    return this.getEntry(srf.id).setLayout(layoutClassID);
  }

  private getEntry(key: string): LayoutStoreEntry {
    if (!this.store[key]) this.store[key] = new LayoutStoreEntry(this.config);
    return this.store[key];
  }
}
