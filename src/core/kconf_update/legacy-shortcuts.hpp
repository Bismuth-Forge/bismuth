// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

namespace Bismuth
{

struct KConfUpdate {
    static void migrate();

private:
    static void moveOldKWinShortcutsToNewBismuthComponent();
};

}
