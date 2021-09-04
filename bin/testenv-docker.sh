#!/bin/bash

# SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
# 
# SPDX-License-Identifier: MIT

set -mx

display=${1:-1}
edition=${2:-user}
case "$edition" in
	user|user-lts|dev-stable|dev-unstable);;
	*)
		echo "invalid edition: $edition" >&2
		exit 1
		;;
esac

projdir=$(realpath "$(dirname "$0")/..")
ctname="bismuth-$edition"

Xephyr \
	-dpi 96 \
	-screen 1366x768 \
	:"$display" &

ctid=$(docker ps -aq --filter "name=$ctname")
if [[ -z "$ctid" ]]; then
	docker run \
		--name "$ctname" \
		-e DISPLAY=":$display" \
		-v "$projdir":"/mnt" \
		-v "/tmp/.X11-unix":"/tmp/.X11-unix" \
		"kdeneon/plasma":"$edition" &

	# HACK: stop CPU hoggig bluetooth service invocation. This is a bug.
	(sleep 1; docker exec -u root "$ctname" rm '/usr/share/dbus-1/services/org.bluez.obex.service') &
else
	docker start "$ctname"
fi

fg Xephyr
wait
