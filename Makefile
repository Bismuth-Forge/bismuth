# SPDX-FileCopyrightText: Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

MAKEFLAGS += --always-make

all: build

clean:
	scripts/clean.sh

build:
	scripts/build.sh

sysdep-install:
	scripts/sysdep-install.sh

install: build
	scripts/install.sh

uninstall:
	scripts/uninstall.sh

restart-kwin-x11:
	kwin_x11 --replace & disown

restart-plasma:
	plasmashell --replace & disown

docs:
	npx typedoc --out build/docs

test:
	scripts/test.sh

setup-dev-env: sysdep-install
	pre-commit install
	npm install # Install development dependencies
