# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

install(FILES local_install_to_global.upd
        DESTINATION ${KDE_INSTALL_KCONFUPDATEDIR})
install(PROGRAMS local_install_to_global.sh
        DESTINATION ${KDE_INSTALL_KCONFUPDATEDIR})
