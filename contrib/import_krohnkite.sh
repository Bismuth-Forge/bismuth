#!/bin/bash

# SPDX-FileCopyrightText: 2021-2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

main ()
{
  # Declare a map of shortcuts keys
  declare -A bis_to_kro
  bis_to_kro["decrease_master_size"]=""
  bis_to_kro["decrease_master_win_count"]="Krohnkite: Decrease"
  bis_to_kro["decrease_window_height"]="Krohnkite: Shrink Height"
  bis_to_kro["decrease_window_width"]="Krohnkite: Shrink Width"
  bis_to_kro["focus_bottom_window"]="Krohnkite: Down/Next"
  bis_to_kro["focus_left_window"]="Krohnkite: Left"
  bis_to_kro["focus_next_window"]=""
  bis_to_kro["focus_prev_window"]=""
  bis_to_kro["focus_right_window"]="Krohnkite: Right"
  bis_to_kro["focus_upper_window"]="Krohnkite: Up/Prev"
  bis_to_kro["increase_master_size"]=""
  bis_to_kro["increase_master_win_count"]="Krohnkite: Increase"
  bis_to_kro["increase_window_height"]="Krohnkite: Grow Height"
  bis_to_kro["increase_window_width"]="Krohnkite: Grow Width"
  bis_to_kro["move_window_to_bottom_pos"]="Krohnkite: Move Down/Next"
  bis_to_kro["move_window_to_left_pos"]="Krohnkite: Move Left"
  bis_to_kro["move_window_to_next_pos"]=""
  bis_to_kro["move_window_to_prev_pos"]=""
  bis_to_kro["move_window_to_right_pos"]="Krohnkite: Move Right"
  bis_to_kro["move_window_to_upper_pos"]="Krohnkite: Move Up/Prev"
  bis_to_kro["next_layout"]="Krohnkite: Next Layout"
  bis_to_kro["prev_layout"]="Krohnkite: Previous Layout"
  bis_to_kro["push_window_to_master"]="Krohnkite: Set master"
  bis_to_kro["rotate"]="Krohnkite: Rotate"
  bis_to_kro["rotate_part"]="Krohnkite: Rotate Part"
  bis_to_kro["toggle_monocle_layout"]="Krohnkite: Monocle Layout"
  bis_to_kro["toggle_quarter_layout"]="Krohnkite: Quarter Layout"
  bis_to_kro["toggle_spread_layout"]="Krohnkite: Spread Layout"
  bis_to_kro["toggle_stair_layout"]="Krohnkite: Stair Layout"
  bis_to_kro["toggle_three_column_layout"]="Krohnkite: Three Column Layout"
  bis_to_kro["toggle_tile_layout"]="Krohnkite: Tile Layout"
  bis_to_kro["toggle_window_floating"]="Krohnkite: Float"
  bis_to_kro["toggle_floating_layout"]="Krohnkite: Float All"

  config_file_path=${1:-"~/.config/kglobalshortcutsrc"}

  echo "Config file path: ${config_file_path}"
  echo "Importing Krohnkite shortcuts..."

  # Iterate over each pair and move the Krohnkite shortcut to Bismuth one
  for key in "${!bis_to_kro[@]}"; do
    bis_key="${key}"
    kro_key=${bis_to_kro[$key]}
    bis_val=$(kreadconfig5 --file "${config_file_path}" --group "bismuth" --key "${bis_key}")
    kro_val=$(kreadconfig5 --file "${config_file_path}" --group "kwin" --key "${kro_key}")

    IFS=',' read -ra bis_val_arr <<< "$bis_val"
    IFS=',' read -ra kro_val_arr <<< "$kro_val"

    bis_primary_shortcut="${bis_val_arr[0]}"
    bis_secondary_shortcut="${bis_val_arr[1]}"
    bis_description="${bis_val_arr[2]}"

    kro_primary_shortcut="${kro_val_arr[0]}"
    kro_secondary_shortcut="${kro_val_arr[1]}"
    kro_description="${kro_val_arr[2]}"

    kwriteconfig5 --file "${config_file_path}" --group "kwin" --key "${kro_key}" --delete > /dev/null 2>&1
    kwriteconfig5 --file "${config_file_path}" --group "bismuth" --key "${bis_key}" "${kro_primary_shortcut:-none},${kro_secondary_shortcut:-none},${bis_description}"
  done

  # Reload shortcuts configuration
  systemctl --user restart plasma-kglobalaccel
}

main $1
