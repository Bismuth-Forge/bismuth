#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2021 Nicolas Vaughan <nivaca@fastmail.com>
#
# SPDX-License-Identifier: CC-BY-NC-4.0

read -r -p "Do you want to remove Bitmuth's keyboard shortcuts? [Y/n] " response
response=${response,,} # tolower
if [[ $response =~ ^(yes|y| ) ]] || [[ -z $response ]]; then
  sed -i -r 's/^bismuth.+//g' ~/.config/kglobalshortcutsrc
  # remove the multiple newlines left by sed
  sed -i -r ':a;N;$!ba;s/\n{3,}/\n\n/g' ~/.config/kglobalshortcutsrc
fi