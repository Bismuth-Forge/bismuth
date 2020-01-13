PROJECT_NAME = krohnkite
PROJECT_VER  = 0.6
PROJECT_REV  = $(shell git rev-parse HEAD | cut -b-7)

KWINPKG_FILE = $(PROJECT_NAME)-$(PROJECT_VER).kwinscript
KWINPKG_DIR = pkg

KWIN_SCRIPT = $(KWINPKG_DIR)/contents/code/script.js
KWIN_META   = $(KWINPKG_DIR)/metadata.desktop
KWIN_QML    = $(KWINPKG_DIR)/contents/ui/main.qml
KWIN_POPQML = $(KWINPKG_DIR)/contents/ui/popup.qml
KWIN_CONFIG_XML = $(KWINPKG_DIR)/contents/config/main.xml
KWIN_CONFIG_UI  = $(KWINPKG_DIR)/contents/ui/config.ui

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

$(KWINPKG_DIR): $(KWIN_SCRIPT) $(KWIN_META) $(KWIN_QML) $(KWIN_POPQML)
$(KWINPKG_DIR): $(KWIN_CONFIG_XML) $(KWIN_CONFIG_UI)
	@touch $@

$(KWIN_SCRIPT): $(NODE_SCRIPT)
	@mkdir -vp `dirname $(KWIN_SCRIPT)`
	cp -a $< $@

$(KWIN_META): res/metadata.desktop
	@mkdir -vp `dirname $(KWIN_META)`
	sed "s/\$$VER/$(PROJECT_VER)/" $< \
		| sed "s/\$$REV/$(PROJECT_REV)/" \
		> $(KWIN_META)

$(KWIN_QML): res/main.qml
	@mkdir -vp `dirname $@`
	@cp -v $< $@

$(KWIN_POPQML): res/popup.qml
	@mkdir -vp `dirname $@`
	@cp -v $< $@

$(KWIN_CONFIG_XML): res/config.xml
	@mkdir -vp `dirname $@`
	@cp -v $< $@

$(KWIN_CONFIG_UI): res/config.ui
	@mkdir -vp `dirname $@`
	@cp -v $< $@

$(NODE_SCRIPT): $(SRC)
	tsc

$(NODE_META): res/package.json
	sed "s/\$$VER/$(PROJECT_VER).0/" $< > $@

.PHONY: all clean install package test run stop
