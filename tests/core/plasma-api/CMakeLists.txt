# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

target_sources(test_runner PRIVATE workspace.test.cpp client.mock.cpp
                                   workspace.mock.cpp)
