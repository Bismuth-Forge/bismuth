<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
  SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
  SPDX-License-Identifier: MIT
-->

# 🔧 Tweaks after installation

## Setting Up for Multi-Screen

Bismuth supports multi-screen setup, but KWin has to be configured to unlock
the full potential of the script.

1. Enable `Separate Screen Focus` under `Window Management` >
   `Window Behavior` > `Multiscreen Behaviour`
2. Bind keys for global shortcut `Switch to Next/Previous Screen`
   (Recommend: `Meta + ,` / `Meta + .`)
3. Bind keys for global shortcut `Window to Next/Previous Screen`
   (Recommend: `Meta + <` / `Meta + >`)

Note: `Separate Screen Focus` appears only when multiple monitors are present.

## Removing Title Bars

Breeze window decoration can be configured to completely remove title bars from
all windows:

1. `System Setting` > `Application Style` > `Window Decorations`
2. Click `Configure Breeze` inside the decoration preview.
3. `Window-Specific Overrides` tab > `Add` button
4. Enter the followings, and press `Ok`:
   - `Regular expression to match`: `.*`
   - Tick `Hide window title bar`

## Changing Border Colors

Changing the border color makes it easier to identify current window. This is
convenient if title bars are removed.

1.  Open `~/.config/kdeglobals` with your favorite editor
2.  Scroll down and find `[WM]` section
3.  Append the followings to the section:

    - `frame=61,174,233`: set the border color of active window to _RGB(61,174,233)_
    - `inactiveFrame=239,240,241`: set the border color of inactive window to _RGB(239,240,241)_

    Here's a nice 2-liner that'll do it for you:

         kwriteconfig5 --file ~/.config/kdeglobals --group WM --key frame 61,174,233
         kwriteconfig5 --file ~/.config/kdeglobals --group WM --key inactiveFrame  239,240,241

4.  Create a new color scheme in `System Settings` > `Appearance` > `Colors`.
5.  Open the color scheme file in
    `~/.local/share/color-schemes/<color-sheme-name>.colorscheme` and remove
    all the `[XXX:Header]` groups, then save the file and exit.
6.  Select the edited color scheme in `System Settings`
7.  You must **restart** your session to see changes. (i.e. re-login, reboot)

Note: the RGB values presented here are for the default Breeze theme

Note: You might also need to set the border size larger than the theme's
default: `System Settings` > `Application Style` > `Window Decorations`: Uncheck
`Use theme's default window border size` and adjust the size (right from the
checkbox).

## Setting Minimum Geometry Size

Some applications like discord and KDE settings don't tile nicely as they have a minimum size requirement.
This causes the applications to overlap with other applications. To mitigate this we can set minimum size for all windows to be 0.

1. `System Setting` > `Window Management` > `Window Rules`
2. Click on `+ Add New...`
3. Set `Window class` to be `Unimportant`
4. Set `Window types` to `Normal Window`
5. Click `+ Add Properties...`
6. Add the `Minimum Size` Property
7. Set the fields to `Force` and `0` x `0`
8. Apply
