# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

add_subdirectory(layout)

target_sources(bismuth_core PRIVATE engine.cpp window-group.cpp surface.cpp
                                    layout.cpp)
