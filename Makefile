# SPDX-FileCopyrightText: Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

MAKEFLAGS += --always-make

all: build

clean:
	rm -vrf "build"

build:
	cmake -S "." -B "build" -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
	cmake --build "build"
	ln -sf "${PWD}/build/compile_commands.json" "./compile_commands.json"

sysdep-install:
	tools/sysdep-install.sh

install: build
	tools/install.sh

i: install

uninstall:
	sudo xargs rm < "build/install_manifest.txt"

restart-kwin-x11:
	kwin_x11 --replace & disown

restart-plasma:
	plasmashell --replace & disown

test:
	cmake -S "." -B "build" -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_EXPORT_COMPILE_COMMANDS=ON -DBUILD_TESTING=true
	cmake --build "build"
	build/bin/test_runner

setup-dev-env: sysdep-install
	pre-commit install

gdb:
	tools/debug.sh
