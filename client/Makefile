SRC_DIR = src
DEST_DIR = dist
NODE_MODULES = node_modules
NPM       = npm
WEBPACK   = $(NODE_MODULES)/.bin/webpack
WEBPACK_SRV = $(NODE_MODULES)/.bin/webpack-dev-server

HTML_FILES = $(wildcard $(SRC_DIR)/*.html)
JS_FILES = $(wildcard $(SRC_DIR)/js/*.js)
ASSET_FILES = $(wildcard $(SRC_DIR)/assets/*)

HTML_OUT = $(addprefix $(DEST_DIR)/,$(notdir $(HTML_FILES)))
ASSETS_OUT = $(addprefix $(DEST_DIR)/assets/,$(notdir $(ASSET_FILES)))

STATIC = $(HTML_OUT) $(ASSETS_OUT)
BUNDLE  = $(DEST_DIR)/bundle.js
TARGET  = $(STATIC) $(BUNDLE)

all : $(TARGET)

$(BUNDLE) : webpack.config.js $(WEBPACK) $(JS_FILES)
	$(WEBPACK) --progress --colors

$(DEST_DIR)/%.html : $(SRC_DIR)/%.html
	install -v -m 644 -D $< $@

$(DEST_DIR)/assets/% : $(SRC_DIR)/assets/%
	install -v -m 644 -D $< $@

$(WEBPACK) : $(NODE_MODULES)
$(WEBPACK_SRV) : $(NODE_MODULES)

$(NODE_MODULES) : package.json
	$(NPM) install

serve : $(WEBPACK_SRV) $(STATIC)
	$(WEBPACK_SRV) --progress --colors

watch : $(WEBPACK) $(STATIC)
	$(WEBPACK) --progress --colors --watch

clean :
	rm -rf $(NODE_MODULES) $(DEST_DIR)

.PHONY : all clean
