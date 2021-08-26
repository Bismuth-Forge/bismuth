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

package:
	npm run package

install:
	npm run install

uninstall:
	npm run uninstall

.PHONY: all clean build run start stop test package pack install
