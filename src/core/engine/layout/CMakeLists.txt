# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

add_subdirectory(piece)

target_sources(bismuth_core PRIVATE layout.cpp utils.cpp tabbed.cpp
                                    master-stack.cpp floating.cpp)
