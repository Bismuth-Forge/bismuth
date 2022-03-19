# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

install(FILES bismuth_old_conf_ui.upd bismuth_shortcuts_category.upd
              bismuth_new_logger.upd DESTINATION ${KDE_INSTALL_KCONFUPDATEDIR})
install(PROGRAMS bismuth_old_conf_ui.sh
        DESTINATION ${KDE_INSTALL_KCONFUPDATEDIR})
