#!/usr/bin/env sh
set -e

# Load script to KWin
bin/load-script.sh "$npm_package_config_build_dir/contents/ui/main.qml" \
  "$npm_package_name-test"

# Remove unnecessary files
find "$npm_package_config_build_dir" \
  '(' -name "*.qmlc" -o -name "*.jsc" ')' -delete
