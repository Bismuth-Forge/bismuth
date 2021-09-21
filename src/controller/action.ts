// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { Engine } from "../engine";

/**
 * Action that is requested by the user.
 */
export interface Action {
  /**
   * Action name. It will be displayed it the shortcuts configuration window
   */
  readonly name: string;

  /**
   * The keybinding, that will be assigned to action by default.
   */
  readonly defaultKeybinding: string;

  /**
   * Execute action. This is basically a Command Design Pattern.
   */
  execute(): void;

  /**
   * Execute action, but ignoring any overrides in the process
   */
  executeWithoutLayoutOverride(): void;
}

/**
 * Action basic implementation. Provides common grounds for other
 * actions. Such as a template of action execution.
 */
abstract class ActionImpl implements Action {
  constructor(
    protected engine: Engine,
    public name: string,
    public defaultKeybinding: string
  ) {}

  /**
   * Action execution pattern. Executes the action override optionally
   * defined in the layout and if not found executes the default
   * behavior.
   */
  public execute(): void {
    console.log(`Bismuth: Executing action ${this.name}`);

    const currentLayout = this.engine.currentLayoutOnCurrentSurface();
    if (currentLayout.executeAction) {
      currentLayout.executeAction(this.engine, this);
    } else {
      this.executeWithoutLayoutOverride();
    }

    // TODO: Maybe it worth moving this into engine?
    this.engine.arrange();
  }

  /**
   * Default action implementation on all layouts
   */
  public abstract executeWithoutLayoutOverride(): void;
}

export class FocusNextWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Focus Next Window", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusOrder(+1);
  }
}

export class FocusPreviousWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Focus Previous Window", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusOrder(-1);
  }
}

export class FocusUpperWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Focus Upper Window", "Meta+K");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("up");
  }
}

export class FocusBottomWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Focus Bottom Window", "Meta+J");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("down");
  }
}

export class FocusLeftWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Focus Left Window", "Meta+H");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("left");
  }
}

export class FocusRightWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Focus Right Window", "Meta+L");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("right");
  }
}

export class MoveActiveWindowToNextPosition
  extends ActionImpl
  implements Action
{
  constructor(protected engine: Engine) {
    super(engine, "Move Window to the Next Position", "");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.swapOrder(win, +1);
    }
  }
}

export class MoveActiveWindowToPreviousPosition
  extends ActionImpl
  implements Action
{
  constructor(protected engine: Engine) {
    super(engine, "Move Window to the Previous Position", "");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.swapOrder(win, -1);
    }
  }
}

export class MoveActiveWindowUp extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Move Window Up", "Meta+Shift+K");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("up");
  }
}

export class MoveActiveWindowDown extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Move Window Down", "Meta+Shift+J");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("down");
  }
}

export class MoveActiveWindowLeft extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Move Window Left", "Meta+Shift+H");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("left");
  }
}

export class MoveActiveWindowRight extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Move Window Right", "Meta+Shift+L");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("right");
  }
}

export class IncreaseActiveWindowWidth extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Increase Window Width", "Meta+Ctrl+L");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.resizeWindow(win, "east", 1);
    }
  }
}

export class IncreaseActiveWindowHeight extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Increase Window Height", "Meta+Ctrl+J");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.resizeWindow(win, "south", 1);
    }
  }
}

export class DecreaseActiveWindowWidth extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Decrease Window Width", "Meta+Ctrl+H");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.resizeWindow(win, "east", -1);
    }
  }
}

export class DecreaseActiveWindowHeight extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Decrease Window Height", "Meta+Ctrl+K");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.resizeWindow(win, "south", -1);
    }
  }
}

export class IncreaseMasterAreaWindowCount
  extends ActionImpl
  implements Action
{
  constructor(protected engine: Engine) {
    super(engine, "Increase Master Area Window Count", "Meta+I");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("No Master Area");
  }
}

export class DecreaseMasterAreaWindowCount
  extends ActionImpl
  implements Action
{
  constructor(protected engine: Engine) {
    super(engine, "Decrease Master Area Window Count", "Meta+D");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("No Master Area");
  }
}

export class IncreaseLayoutMasterAreaSize extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Increase Master Area Size", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("No Master Area");
  }
}

export class DecreaseLayoutMasterAreaSize extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Decrease Master Area Size", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("No Master Area");
  }
}

export class ToggleActiveWindowFloating extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Toggle Active Window Floating", "Meta+F");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.toggleFloat(win);
    }
  }
}

export class PushActiveWindowIntoMasterAreaFront
  extends ActionImpl
  implements Action
{
  constructor(protected engine: Engine) {
    super(engine, "Push Active Window to Master Area", "Meta+Return");
  }

  public executeWithoutLayoutOverride(): void {
    const win = this.engine.currentWindow();
    if (win) {
      this.engine.setMaster(win);
    }
  }
}

export class SwitchToNextLayout extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Switch to the Next Layout", "Meta+\\");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.cycleLayout(1);
  }
}

export class SwitchToPreviousLayout extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Switch to the Previous Layout", "Meta+|");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.cycleLayout(-1);
  }
}

abstract class SetCurrentLayout extends ActionImpl implements Action {
  constructor(protected engine: Engine, protected layoutId: string) {
    super(engine, "", "");
  }

  public executeWithoutLayoutOverride(): void {
    console.log("Set layout called!");

    this.engine.setLayout(this.layoutId);
  }
}

export class SetTileLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(engine, "TileLayout");
    this.name = "Toggle Tile Layout";
    this.defaultKeybinding = "Meta+T";
  }
}

export class SetMonocleLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(engine, "MonocleLayout");
    this.name = "Toggle Monocle Layout";
    this.defaultKeybinding = "Meta+M";
  }
}

export class SetThreeColumnLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(engine, "ThreeColumnLayout");
    this.name = "Toggle Three Column Layout";
    this.defaultKeybinding = "";
  }
}

export class SetSpreadLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(engine, "SpreadLayout");
    this.name = "Toggle Spread Layout";
    this.defaultKeybinding = "";
  }
}

export class SetStairLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(engine, "StairLayout");
    this.name = "Toggle Stair Layout";
    this.defaultKeybinding = "";
  }
}

export class SetFloatingLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    // NOTE: space is intentional (Temporary)
    super(engine, "FloatingLayout ");
    this.name = "Toggle Stair Layout";
    this.defaultKeybinding = "Meta+Shift+F";
  }
}

export class SetQuarterLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    // NOTE: space is intentional (Temporary)
    super(engine, "QuarterLayout ");
    this.name = "Toggle Quarter Layout";
    this.defaultKeybinding = "";
  }
}

export class Rotate extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Rotate", "Meta+R");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("left");
  }
}

export class RotatePart extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "Rotate Part", "Meta+Shift+R");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("left");
  }
}
