PACKAGE_NAME = krohnkite
PACKAGE_VER  = 0.5
PACKAGE_FILE = $(PACKAGE_NAME)-$(PACKAGE_VER).kwinscript

PACKAGE_DIR = pkg

FILE_SCRIPT = $(PACKAGE_DIR)/contents/code/script.js
FILE_META   = $(PACKAGE_DIR)/metadata.desktop
FILE_QML    = $(PACKAGE_DIR)/contents/ui/main.qml
FILE_CONFIG_XML = $(PACKAGE_DIR)/contents/config/main.xml
FILE_CONFIG_UI  = $(PACKAGE_DIR)/contents/ui/config.ui

all: $(PACKAGE_DIR)

clean:
	@rm -vf script.json
	@rm -rvf $(PACKAGE_DIR)

install: package
	plasmapkg2 -t kwinscript -s $(PACKAGE_NAME) \
		&& plasmapkg2 -u $(PACKAGE_FILE) \
		|| plasmapkg2 -i $(PACKAGE_FILE)
		
uninstall:
	plasmapkg2 -t kwinscript -r $(PACKAGE_NAME)

package: $(PACKAGE_FILE)

run: $(PACKAGE_DIR)
	bin/load-script.sh "$(FILE_QML)" "$(PACKAGE_NAME)-test"
	@find "$(PACKAGE_DIR)" '(' -name "*.qmlc" -o -name "*.jsc" ')' -delete

stop:
	bin/load-script.sh "unload" "$(PACKAGE_NAME)-test"

$(PACKAGE_FILE): $(PACKAGE_DIR)
	@rm -f "$(PACKAGE_FILE)"
	@7z a -tzip $(PACKAGE_FILE) ./$(PACKAGE_DIR)/*

$(PACKAGE_DIR): $(FILE_SCRIPT) $(FILE_META) $(FILE_QML)
$(PACKAGE_DIR): $(FILE_CONFIG_XML) $(FILE_CONFIG_UI)
	@touch $@

$(FILE_SCRIPT): $(wildcard src/*.ts) $(wildcard src/*/*.ts)
	@mkdir -vp `dirname $(FILE_SCRIPT)`
	tsc --outFile $(FILE_SCRIPT)

$(FILE_META): res/metadata.desktop
	@mkdir -vp `dirname $(FILE_META)`
	sed "s/0\.0/$(PACKAGE_VER)/" $< > $(FILE_META)

$(FILE_QML): res/main.qml
	@mkdir -vp `dirname $@`
	@cp -v $< $@

$(FILE_CONFIG_XML): res/config.xml
	@mkdir -vp `dirname $@`
	@cp -v $< $@

$(FILE_CONFIG_UI): res/config.ui
	@mkdir -vp `dirname $@`
	@cp -v $< $@

.PHONY: all clean install package
