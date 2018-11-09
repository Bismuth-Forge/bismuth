PACKAGE_NAME = krohnkite
PACKAGE_VER  = 0.1
PACKAGE_FILE = $(PACKAGE_NAME).kwinscript

FILE_SCRIPT = pkg/contents/code/script.js
FILE_META   = pkg/metadata.desktop

all: $(PACKAGE_FILE)

clean:
	@rm -vf script.json
	@rm -rvf pkg/

$(PACKAGE_FILE): $(FILE_SCRIPT)
$(PACKAGE_FILE): $(FILE_META)
	@rm -f "$(PACKAGE_FILE)"
	@7z a -tzip $(PACKAGE_FILE) ./pkg/*

$(FILE_SCRIPT):
	@mkdir -vp `dirname $(FILE_SCRIPT)`
	tsc --outFile $(FILE_SCRIPT)

$(FILE_META): res/metadata.desktop
	@mkdir -vp `dirname $(FILE_META)`
	sed "s/0\.0/$(PACKAGE_VER)/" $< > $(FILE_META)

.PHONY: all clean