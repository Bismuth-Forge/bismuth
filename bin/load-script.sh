#!/bin/sh

#set -x

file_path="$1"
plugin_name="$2"

#
# Functions
#

_invoke() {
	method="$1"
	shift 1

	dbus-send --session --print-reply=literal \
		--dest="org.kde.KWin" \
		"/Scripting" "org.kde.kwin.Scripting.${method}" \
		"$@"
}

check_loaded() {
	_invoke "isScriptLoaded" string:"${plugin_name}" \
		| awk '{ print $2 }'
}

unload_script() {
	_invoke "unloadScript" string:"${plugin_name}"
}

#
# Main
#

if [ "${file_path}" = "unload" ]; then
	unload_script
	[ "$(check_loaded)" = "false" ] && exit

	echo "$(basename $0): Failed to unload script: ${plugin_name}" >&2
	exit 1
fi

file_path="$(realpath "${file_path}")"
if [ ! -f "${file_path}" ]; then
	echo "$(basename $0): File does not exist: ${file_path}" >&2
	exit 1
fi

if [ "$(check_loaded)" != "false" ]; then
	unload_script
fi

# randomized file_path
# (KWin doesn't reload files, and keep running old versions.)
file_path_random="${file_path}.$$.qml"
trap "{ rm -vf ${file_path_random}; }" EXIT
cp -v "${file_path}" "${file_path_random}"

# load script and run
_invoke "loadDeclarativeScript" string:"${file_path_random}" string:"${plugin_name}"
_invoke "start"

if [ "$(check_loaded)" = "false" ]; then
	echo "$(basename $0): Failed to load script: ${file_path}, ${plugin_name}" >&2
	exit 1
fi
