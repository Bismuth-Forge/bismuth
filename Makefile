PROJECT_NAME = krohnkite
PROJECT_VER  = 0.6.1
PROJECT_REV  = $(shell git rev-parse HEAD | cut -b-7)

KWINPKG_FILE = $(PROJECT_NAME)-$(PROJECT_VER).kwinscript
KWINPKG_DIR = pkg

KWIN_META   = $(KWINPKG_DIR)/metadata.desktop
KWIN_QML    = $(KWINPKG_DIR)/contents/ui/main.qml

NODE_SCRIPT = krohnkite.js
NODE_META   = package.json
NODE_FILES  = $(NODE_SCRIPT) $(NODE_META) package-lock.json

SRC = $(shell find src -name "*.ts")

all: $(KWINPKG_DIR)

clean:
	@rm -rvf $(KWINPKG_DIR)
	@rm -vf $(NODE_FILES)

install: package
	plasmapkg2 -t kwinscript -s $(PROJECT_NAME) \
		&& plasmapkg2 -u $(KWINPKG_FILE) \
		|| plasmapkg2 -i $(KWINPKG_FILE)
		
uninstall:
	plasmapkg2 -t kwinscript -r $(PROJECT_NAME)

package: $(KWINPKG_FILE)

test: $(NODE_SCRIPT) $(NODE_META)
	npm test

run: $(KWINPKG_DIR)
	bin/load-script.sh "$(KWIN_QML)" "$(PROJECT_NAME)-test"
	@find "$(KWINPKG_DIR)" '(' -name "*.qmlc" -o -name "*.jsc" ')' -delete

stop:
	bin/load-script.sh "unload" "$(PROJECT_NAME)-test"

$(KWINPKG_FILE): $(KWINPKG_DIR)
	@rm -f "$(KWINPKG_FILE)"
	@7z a -tzip $(KWINPKG_FILE) ./$(KWINPKG_DIR)/*

$(KWINPKG_DIR): $(KWIN_META)
$(KWINPKG_DIR): $(KWIN_QML)
$(KWINPKG_DIR): $(KWINPKG_DIR)/contents/ui/config.ui
$(KWINPKG_DIR): $(KWINPKG_DIR)/contents/ui/popup.qml
$(KWINPKG_DIR): $(KWINPKG_DIR)/contents/code/script.js
$(KWINPKG_DIR): $(KWINPKG_DIR)/contents/config/main.xml
	@touch $@

$(KWIN_META): res/metadata.desktop
	@mkdir -vp `dirname $(KWIN_META)`
	sed "s/\$$VER/$(PROJECT_VER)/" $< \
		| sed "s/\$$REV/$(PROJECT_REV)/" \
		> $(KWIN_META)

$(KWIN_QML): res/main.qml
$(KWINPKG_DIR)/contents/ui/config.ui: res/config.ui
$(KWINPKG_DIR)/contents/ui/popup.qml: res/popup.qml
$(KWINPKG_DIR)/contents/code/script.js: $(NODE_SCRIPT)
$(KWINPKG_DIR)/contents/config/main.xml: res/config.xml
$(KWINPKG_DIR)/%:
	@mkdir -vp `dirname $@`
	@cp -v $< $@

$(NODE_SCRIPT): $(SRC)
	tsc

$(NODE_META): res/package.json
	sed "s/\$$VER/$(PROJECT_VER).0/" $< > $@

.PHONY: all clean install package test run stop
