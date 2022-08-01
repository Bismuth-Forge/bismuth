#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2022 Ignacy Kajdan <git@verahawk.com>
# SPDX-License-Identifier: MIT

# Exit immediately on error
set -eu

# Check if scour is installed
if ! command -v scour &> /dev/null; then
  echo '"scour" could not be found.' >&2
  exit 1
fi

# Determine the absolute path to the repository
repo_dir_path="$(unset CDPATH && cd "$(dirname "$0")/.." && echo "$PWD")"
if ! [ "$(basename "${repo_dir_path}")" = bismuth ]; then
  echo 'Could not determine the absolute path of the repository. Bailing out.' >&2
  exit 1
fi

echo 'Optimizing icons...'

for icon in "${repo_dir_path}"/src/kcm/icons/*.svg \
            "${repo_dir_path}"/src/kwinscript/icons/*.svg; do
  # File name without leading path and .svg suffix
  base_name="$(basename "${icon}" .svg)"

  # Append .tmp to unoptimized icon's name
  mv "${icon}" "${icon}.tmp"

  scour --create-groups                         \
        --strip-xml-prolog                      \
        --remove-descriptive-elements           \
        --enable-viewboxing                     \
        --nindent 2                             \
        --strip-xml-space                       \
        --enable-id-stripping                   \
        --protect-ids-list=current-color-scheme \
        -i "${icon}.tmp"                        \
        -o "${icon}"

  # Remove unoptimized icon
  rm "${icon}.tmp"
done

echo 'Done!'
