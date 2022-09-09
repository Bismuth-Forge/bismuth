#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

gdb -pid $(pidof kwin_x11) -batch -ex "set logging file kwin_x11.gdb" -ex "set logging on" -ex "continue" -ex "thread apply all backtrace" -ex "quit"
