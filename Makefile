# SPDX-FileCopyrightText: Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

MAKEFLAGS += --always-make

all: build

clean:
	tools/clean.sh

build:
	tools/build.sh

sysdep-install:
	tools/sysdep-install.sh

install: build
	tools/install.sh

uninstall:
	tools/uninstall.sh

restart-kwin-x11:
	kwin_x11 --replace & disown

restart-plasma:
	plasmashell --replace & disown

test:
	tools/test.sh

setup-dev-env: sysdep-install
	pre-commit install
