<!--
  SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
  SPDX-License-Identifier: MIT
-->

# 🗺️ Road map and project vision

This document describes the vision of a project and a general road map to its
features.

## 🕶️ Vision

> Simple by default, powerful when needed
>
> - KDE Plasma motto

Bismuth aims to be a full replacement to the standalone tiling window managers
within the KDE Plasma ecosystem, that works out of the box, has a good UI/UX,
and provides a reasonable amount of features.

### Comparison with alternatives

If you want a tiling windows experience, you have the following options right
now:

1. Standalone tiling window managers (i3, Sway, bspwm, dwm, XMonad etc.)
2. Pop Shell in GNOME
3. Various tiling KWin scripts in KDE Plasma

The above solutions have problems, that Bismuth tries to overcome, and the
features it tries to implement.

#### What about standalone tiling window managers?

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

#### What about Pop Shell?

You have to install GNOME and meet all the unforeseen consequences of that
decision. This is of course is a fine solution, if you're fine with GNOME. But
what if you are already using KDE Plasma? Maybe you also would like to apply
some themes, customize some panels, colors and other things... Or you're short
on time and don't want to install and mess around with the different desktop
environment?

Pop Shell does not help you with any of that, but, honestly speaking, it is a
very user-friendly and well made solution, that is very polished, so it's a
good example for Bismuth as the mid-to-end goal.

#### What's the problem with the existing KWin Scripts?

KWin Scripts is a powerful extension of KDE Plasma functionality, but only in
case, where you're trying to use the full potential of it. The existing
solutions are not trying to do it, either because [the current maintainer is
absent](https://github.com/esjeon/krohnkite) or because the desired
functionality [is not as rich as it could
be](https://github.com/kwin-scripts/kwin-tiling).

Bismuth actually has a KWin Script as its component, so as you may guess it's
trying to use its capabilities to its full potential! And currently we are
bumping the ceiling, so in addition to KWin Script we also introduced other
powerful Plasma extensions, such as standalone configuration module.

### What Bismuth is not?

A couple of points should be also added to clarify what Bismuth is not:

1. Bismuth **is not** a piece of software, that aims to replicate every feature
   of every tiling window manager in existence. Only a reasonable subset of the
   features will be implemented. But despite that, Bismuth tries to cover most
   of the use cases, so if you think it's beneficial for Bismuth to have a
   particular feature from any of the competitors, you are welcome to propose
   it to the bug tracker!
2. Bismuth is not going to compete with KWin for functionality, that is useful
   both for tiling window manager users, and the floating window manager users.
   In particular:
   1. Bismuth is not going to implement the window tabbing feature, that can be
      seen in window managers like i3 or Sway. This requires too many hacks
      from our side, while the native KWin implementation would benefit
      everyone.
   2. Bismuth is not going to implement the workspaces feature (a.k.a. "different
      virtual desktops for different displays"), that can be seen in tiling
      window managers. KWin has Virtual Desktops, which are mutually exclusive
      to it, so only KWin has the power to implement this well by making the
      users chose what particular implementation they want to leverage.

## 🧭 Current road map

This list is describing the major features and milestones, that are planned for
the near major releases. The order is approximate. The list does not mean, that
bug fixes and minor improvements have the least priority.

1. Plasma Applet, that integrates with the system tray and looks good and
   consistent with other Plasma applets. (planned for version 3.0)
2. Customizable Layouts via layout editor, that will let people customize
   initial master area size and rotation of the existing layouts, change their
   order or optionally include a manual layout, where there are literally no rules
   on how you place your tiles. (planned for version 4.0)
3. Porting the features, that are not already present in Bismuth, from Pop
   Shell. (any version)
4. General Stability and UI/UX improvements. (any version)
