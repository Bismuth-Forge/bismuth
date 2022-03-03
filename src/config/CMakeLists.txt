# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

project(bismuth-config)

install(FILES "bismuth_config.kcfg" DESTINATION ${KDE_INSTALL_KCFGDIR})

add_subdirectory(kconf_update)
