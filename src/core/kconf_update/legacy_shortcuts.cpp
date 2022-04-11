// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "legacy_shortcuts.hpp"

#include <QAction>
#include <QKeySequence>

#include <KConfigGroup>
#include <KGlobalAccel>
#include <KSharedConfig>

namespace Bismuth
{

void KConfUpdate::migrate()
{
    moveOldKWinShortcutsToNewBismuthComponent();
}

void KConfUpdate::moveOldKWinShortcutsToNewBismuthComponent()
{
    auto globAccel = KGlobalAccel::self();

    auto moveShortcut = [&](const char *oldEntryName, const char *newEntryName) {
        auto oldKeysequence = globAccel->globalShortcut(QStringLiteral("kwin"), oldEntryName);

        // Remove the old shortcuts
        auto action = QAction();
        action.setObjectName(oldEntryName);
        action.setProperty("componentName", QStringLiteral("kwin"));

        globAccel->setShortcut(&action, {});
        globAccel->removeAllShortcuts(&action);

        auto newAction = QAction();
        action.setObjectName(newEntryName);
        action.setProperty("componentName", QStringLiteral("bismuth"));

        auto existingKeysequence = globAccel->globalShortcut(QStringLiteral("bismuth"), newEntryName);

        // Only override the shortcut if it's empty
        // For some reason KGlobalAccel leaves the empty entries sometimes
        // Therefore we cannot rely on Autoloading
        if (existingKeysequence.empty()) {
            globAccel->setShortcut(&action, oldKeysequence, KGlobalAccel::NoAutoloading);
        }
    };

    auto shortcutsrc = KSharedConfig::openConfig("kglobalshortcutsrc");
    auto versionGroup = shortcutsrc->group("$Version");

    auto updInfo = versionGroup.readEntry("update_info", QStringList());
    auto old = updInfo.contains("bismuth_shortcuts_category.upd:bismuth-shortcuts-category");

    auto shouldNotUpdate = updInfo.contains("bismuth_shortcuts_from_kwin.upd:bismuth-shortcuts-from-kwin");

    if (shouldNotUpdate) {
        return;
    }

    updInfo.append(QStringLiteral("bismuth_shortcuts_from_kwin.upd:bismuth-shortcuts-from-kwin"));

    moveShortcut("bismuth_decrease_master_size", "decrease_master_size");
    moveShortcut("bismuth_decrease_master_win_count", "decrease_master_win_count");
    moveShortcut("bismuth_decrease_window_height", "decrease_window_height");
    moveShortcut("bismuth_decrease_window_width", "decrease_window_width");
    moveShortcut("bismuth_focus_bottom_window", "focus_bottom_window");
    moveShortcut("bismuth_focus_left_window", "focus_left_window");
    moveShortcut("bismuth_focus_next_window", "focus_next_window");
    moveShortcut("bismuth_focus_prev_window", "focus_prev_window");
    moveShortcut("bismuth_focus_right_window", "focus_right_window");
    moveShortcut("bismuth_focus_upper_window", "focus_upper_window");
    moveShortcut("bismuth_increase_master_size", "increase_master_size");
    moveShortcut("bismuth_increase_master_win_count", "increase_master_win_count");
    moveShortcut("bismuth_increase_window_height", "increase_window_height");
    moveShortcut("bismuth_increase_window_width", "increase_window_width");
    moveShortcut("bismuth_move_window_to_bottom_pos", "move_window_to_bottom_pos");
    moveShortcut("bismuth_move_window_to_left_pos", "move_window_to_left_pos");
    moveShortcut("bismuth_move_window_to_next_pos", "move_window_to_next_pos");
    moveShortcut("bismuth_move_window_to_prev_pos", "move_window_to_prev_pos");
    moveShortcut("bismuth_move_window_to_right_pos", "move_window_to_right_pos");
    moveShortcut("bismuth_move_window_to_upper_pos", "move_window_to_upper_pos");
    moveShortcut("bismuth_next_layout", "next_layout");
    moveShortcut("bismuth_prev_layout", "prev_layout");
    moveShortcut("bismuth_push_window_to_master", "push_window_to_master");
    moveShortcut("bismuth_rotate", "rotate");
    moveShortcut("bismuth_rotate_part", "rotate_part");
    moveShortcut("bismuth_rotate_reverse", "rotate_reverse");
    moveShortcut("bismuth_toggle_float_layout", "toggle_float_layout");
    moveShortcut("bismuth_toggle_monocle_layout", "toggle_monocle_layout");
    moveShortcut("bismuth_toggle_quarter_layout", "toggle_quarter_layout");
    moveShortcut("bismuth_toggle_spiral_layout", "toggle_spiral_layout");
    moveShortcut("bismuth_toggle_spread_layout", "toggle_spread_layout");
    moveShortcut("bismuth_toggle_stair_layout", "toggle_stair_layout");
    moveShortcut("bismuth_toggle_three_column_layout", "toggle_three_column_layout");
    moveShortcut("bismuth_toggle_tile_layout", "toggle_tile_layout");
    moveShortcut("bismuth_toggle_window_floating", "toggle_window_floating");

    versionGroup.writeEntry("update_info", updInfo);
}
}
