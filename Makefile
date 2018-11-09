PACKAGE_NAME = krohnkite
PACKAGE_VER  = 0.1
PACKAGE_FILE = $(PACKAGE_NAME).kwinscript

FILE_SCRIPT = pkg/contents/code/script.js
FILE_META   = pkg/metadata.desktop
FILE_QML    = pkg/contents/ui/main.qml

all: $(PACKAGE_FILE)

clean:
	@rm -vf script.json
	@rm -rvf pkg/

$(PACKAGE_FILE): $(FILE_SCRIPT)
$(PACKAGE_FILE): $(FILE_META)
$(PACKAGE_FILE): $(FILE_QML)
	@rm -f "$(PACKAGE_FILE)"
	@7z a -tzip $(PACKAGE_FILE) ./pkg/*

$(FILE_SCRIPT): src/common.ts
$(FILE_SCRIPT): src/driver.ts
$(FILE_SCRIPT): src/engine.ts
$(FILE_SCRIPT): src/kwin.d.ts
	@mkdir -vp `dirname $(FILE_SCRIPT)`
	tsc --outFile $(FILE_SCRIPT)

$(FILE_META): res/metadata.desktop
	@mkdir -vp `dirname $(FILE_META)`
	sed "s/0\.0/$(PACKAGE_VER)/" $< > $(FILE_META)

$(FILE_QML): res/main.qml
	@mkdir -vp `dirname $(FILE_QML)`
	@cp -v $< $@

.PHONY: all clean