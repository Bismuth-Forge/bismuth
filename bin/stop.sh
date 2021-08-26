#!/usr/bin/env sh
set -e

# Unload script from KWin
bin/load-script.sh "unload" "$npm_package_name-test"
