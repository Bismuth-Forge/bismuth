#!/usr/bin/env sh
set -e

# Remove build directory and package-lock
rm -vrf $npm_package_config_build_dir
rm -vf package-lock.json
rm -vrf node_modules/

