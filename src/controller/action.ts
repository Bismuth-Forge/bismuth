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
   * Action key. It will be used as the key in the shortcuts configuration file.
   * Better not use any special characters and spaces, but it is allowed.
   * To keep things simple and not break any user shortcuts in the future -
   * do not change this. It is only valuable to the computer and not the human.
   * The human sees @see description
   */
  readonly key: string;

  /**
   * Action user-friendly name. It will be displayed in the shortcuts configuration window.
   */
  readonly description: string;

  /**
   * The keybinding, that will be assigned to action by default.
   * When binding, existing shortcut will be kept, to this can be changed
   * freely.
   */
  readonly defaultKeybinding: string;

  /**
   * Execute action. This is basically a Command Design Pattern method.
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
    public key: string,
    public description: string,
    public defaultKeybinding: string
  ) {
    this.key = `bismuth_${this.key}`;
    this.description = `Bismuth: ${this.description}`;
  }

  /**
   * Action execution pattern. Executes the action override optionally
   * defined in the layout and if not found executes the default
   * behavior.
   */
  public execute(): void {
    console.log(`Bismuth: Executing action: ${this.key}`);

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
    super(engine, "focus_next_window", "Focus Next Window", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusOrder(+1, false);
  }
}

export class FocusPreviousWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "focus_prev_window", "Focus Previous Window", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusOrder(-1, false);
  }
}

export class FocusUpperWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "focus_upper_window", "Focus Upper Window", "Meta+K");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("up");
  }
}

export class FocusBottomWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "focus_bottom_window", "Focus Bottom Window", "Meta+J");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("down");
  }
}

export class FocusLeftWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "focus_left_window", "Focus Left Window", "Meta+H");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.focusDir("left");
  }
}

export class FocusRightWindow extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "focus_right_window", "Focus Right Window", "Meta+L");
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
    super(
      engine,
      "move_window_to_next_pos",
      "Move Window to the Next Position",
      ""
    );
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
    super(
      engine,
      "move_window_to_prev_pos",
      "Move Window to the Previous Position",
      ""
    );
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
    super(engine, "move_window_to_upper_pos", "Move Window Up", "Meta+Shift+K");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("up");
  }
}

export class MoveActiveWindowDown extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(
      engine,
      "move_window_to_bottom_pos",
      "Move Window Down",
      "Meta+Shift+J"
    );
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("down");
  }
}

export class MoveActiveWindowLeft extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(
      engine,
      "move_window_to_left_pos",
      "Move Window Left",
      "Meta+Shift+H"
    );
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("left");
  }
}

export class MoveActiveWindowRight extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(
      engine,
      "move_window_to_right_pos",
      "Move Window Right",
      "Meta+Shift+L"
    );
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.swapDirOrMoveFloat("right");
  }
}

export class IncreaseActiveWindowWidth extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(
      engine,
      "increase_window_width",
      "Increase Window Width",
      "Meta+Ctrl+L"
    );
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
    super(
      engine,
      "increase_window_height",
      "Increase Window Height",
      "Meta+Ctrl+J"
    );
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
    super(
      engine,
      "decrease_window_width",
      "Decrease Window Width",
      "Meta+Ctrl+H"
    );
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
    super(
      engine,
      "decrease_window_height",
      "Decrease Window Height",
      "Meta+Ctrl+K"
    );
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
    super(
      engine,
      "increase_master_win_count",
      "Increase Master Area Window Count",
      "Meta+]"
    );
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
    super(
      engine,
      "decrease_master_win_count",
      "Decrease Master Area Window Count",
      "Meta+["
    );
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("No Master Area");
  }
}

export class IncreaseLayoutMasterAreaSize extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "increase_master_size", "Increase Master Area Size", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("No Master Area");
  }
}

export class DecreaseLayoutMasterAreaSize extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "decrease_master_size", "Decrease Master Area Size", "");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("No Master Area");
  }
}

export class ToggleActiveWindowFloating extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(
      engine,
      "toggle_window_floating",
      "Toggle Active Window Floating",
      "Meta+F"
    );
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
    super(
      engine,
      "push_window_to_master",
      "Push Active Window to Master Area",
      "Meta+Return"
    );
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
    super(engine, "next_layout", "Switch to the Next Layout", "Meta+\\");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.cycleLayout(1);
  }
}

export class SwitchToPreviousLayout extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "prev_layout", "Switch to the Previous Layout", "Meta+|");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.cycleLayout(-1);
  }
}

abstract class SetCurrentLayout extends ActionImpl implements Action {
  constructor(
    protected engine: Engine,
    protected layoutId: string,
    key: string,
    description: string,
    defaultShortcut: string
  ) {
    super(engine, key, description, defaultShortcut);
  }

  public executeWithoutLayoutOverride(): void {
    console.log("Set layout called!");

    this.engine.setLayout(this.layoutId);
  }
}

export class SetTileLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(
      engine,
      "TileLayout",
      "toggle_tile_layout",
      "Toggle Tile Layout",
      "Meta+T"
    );
  }
}

export class SetMonocleLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(
      engine,
      "MonocleLayout",
      "toggle_monocle_layout",
      "Toggle Monocle Layout",
      "Meta+M"
    );
  }
}

export class SetThreeColumnLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(
      engine,
      "ThreeColumnLayout",
      "toggle_three_column_layout",
      "Toggle Three Column Layout",
      ""
    );
  }
}

export class SetSpreadLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(
      engine,
      "SpreadLayout",
      "toggle_spread_layout",
      "Toggle Spread Layout",
      ""
    );
  }
}

export class SetStairLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(
      engine,
      "StairLayout",
      "toggle_stair_layout",
      "Toggle Stair Layout",
      ""
    );
  }
}

export class SetFloatingLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    // NOTE: space is intentional (Temporary)
    super(
      engine,
      "FloatingLayout ",
      "toggle_float_layout",
      "Toggle Floating Layout",
      "Meta+Shift+F"
    );
  }
}

export class SetQuarterLayout extends SetCurrentLayout {
  constructor(protected engine: Engine) {
    super(
      engine,
      "QuarterLayout",
      "toggle_quarter_layout",
      "Toggle Quarter Layout",
      ""
    );
  }
}

export class Rotate extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "rotate", "Rotate", "Meta+R");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("Rotation Not Applicable");
  }
}

export class RotatePart extends ActionImpl implements Action {
  constructor(protected engine: Engine) {
    super(engine, "rotate_part", "Rotate Part", "Meta+Shift+R");
  }

  public executeWithoutLayoutOverride(): void {
    this.engine.showNotification("Rotation Not Applicable");
  }
}
