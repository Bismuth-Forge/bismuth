<!--
  SPDX-FileCopyrightText: 2021-2022 Mikhail Zolotukhin <mail@gikari.com>
  SPDX-License-Identifier: MIT
-->

# 🕶️ Vision

> Simple by default, powerful when needed
>
> - KDE Plasma motto

Bismuth aims to be a full replacement to the standalone tiling window managers
within the KDE Plasma ecosystem, that works out of the box, has a good UI/UX,
and provides a reasonable amount of features.

## Comparison with alternatives

If you want a tiling windows experience, you have the following options right
now:

1. Standalone tiling window managers (i3, Sway, bspwm, dwm, XMonad etc.)
2. Pop Shell in GNOME
3. Various tiling KWin scripts in KDE Plasma

The above solutions have problems, that Bismuth tries to overcome, and the
features it tries to implement.

### What about standalone tiling window managers?

Classic tiling window managers are powerful, but require too much work to make
the user system usable and also lack of general integration of the desktop
environments.

For example, to install and use Sway/i3 - you need also to install and
configure:

1. Panels
2. Power management
3. Volume control
4. Brightness keys
5. Keyboard layouts
6. Screen locking
7. Drive management
8. Notifications
9. App Launcher
10. Networks manager
11. ... (Did we forgot something?)

Even more, all those features the users have to configure are disjointed and
not integrated between each other. They are not looking good. While on the
desktop environments all those features come out of the box, and they are
integrated, look good and consistent. Oh, and they also have more
functionality. Also, you have to configure everything in the config file, which
is not an intuitive approach, which wastes user time.

> Man! I just wanted to try out window tiling. I have better things to do.
>
> - A busy user, probably

### What about Pop Shell?

You have to install GNOME and meet all the unforeseen consequences of that
decision. This is of course is a fine solution, if you're fine with GNOME. But
what if you are already using KDE Plasma? Maybe you also would like to apply
some themes, customize some panels, colors and other things... Or you're short
on time and don't want to install and mess around with the different desktop
environment?

Pop Shell does not help you with any of that, but, honestly speaking, it is a
very user-friendly and well-made solution, that is very polished, so it's a
good example for Bismuth as the mid-to-end goal.

### What's the problem with the existing KWin Scripts?

KWin Scripts are powerful extensions of KDE Plasma functionality, but they have
technical limitations that make them not so nice to use.

For example, the configuration is done in a non-user-friendly manner, where the
user has to make a symbolic link to some `.desktop` file, that enables some
dialog window, where settings are not applied without the script restart.
Furthermore, the settings window is ugly and does not match [KDE
HIG](https://develop.kde.org/hig/). KWin Script also cannot use dynamic Plasma
Applet or Window Decoration, which limits its functionality. Not to mention,
KWin Scripting API does not let you register shortcuts in a user-friendly
manner with the separate shortcuts' category in the System Settings.

The list of technical limitations could go on and on, but I think the reader
would understand, that KDE Plasma needs more, than a KWin Script to compete
with standalone tiling window managers and Pop Shell.

## So, what is Bismuth, then?

Bismuth is a KDE Plasma tiling extension, which means that it combines all the
types of KDE Plasma add-ons, that would make the User Experience better. All of
those add-ons are able to communicate together and with KDE Plasma, to that the
resulting solution feels integrated by itself and with the desktop, as if it
was baked into KDE Plasma natively.

## What Bismuth is not?

There should be a notice about what the Bismuth is not going to have as a part
of its lifetime.

First, Bismuth **is not** a piece of software, that aims to replicate every
feature of every tiling window manager in existence. Only a reasonable subset
of the features will be implemented. This might be a technical limitation or
UI/UX limitation.

And second, Bismuth won't be able to have a particular functionality
implemented that heavily depends on the upstream technologies, such as KWin.
This might include, for example, a "workspaces" feature (a.k.a. "different
virtual desktops for different displays"). This is a technical limitation.
