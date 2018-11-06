#!/bin/bash

set -xe

(
	cat engine.js;
	cat main.js;
) \
| grep -v '^\s*\/\/' \
> combined.js
