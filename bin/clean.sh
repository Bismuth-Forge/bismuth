#!/usr/bin/env sh
set -e

# Remove build directory and package-lock
rm -vrf $npm_package_config_build_dir
rm -vf $npm_package_config_node_script package-lock.json
