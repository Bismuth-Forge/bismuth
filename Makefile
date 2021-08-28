all: build

clean:
	npm run clean

build:
	npm run build

run start:
	npm start

stop:
	npm stop

test:
	npm test

docs:
	npm run docs

package:
	npm run package

install:
	npm run script-install

uninstall:
	npm run script-uninstall

.PHONY: all clean build run start stop test package pack install
