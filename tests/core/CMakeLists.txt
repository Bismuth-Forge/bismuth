# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

add_executable(test_runner)

target_sources(test_runner
  PRIVATE
  main.cpp
)

target_link_libraries(test_runner
  PRIVATE
  Qt5::Core
  Qt5::Quick
  Qt5::Qml
  Qt5::Test
  Bismuth::Core
)

doctest_discover_tests(test_runner)
