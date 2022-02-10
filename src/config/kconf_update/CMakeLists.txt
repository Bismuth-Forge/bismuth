# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

install(
  FILES old_conf_ui.upd shortcuts_category.upd new_logger.upd
  DESTINATION ${KDE_INSTALL_KCONFUPDATEDIR}
)
install(
  PROGRAMS old_conf_ui.sh
  DESTINATION ${KDE_INSTALL_KCONFUPDATEDIR}
)
