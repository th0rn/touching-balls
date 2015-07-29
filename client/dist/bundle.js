/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	var PIXI = __webpack_require__(1);
	var ASSETS = __webpack_require__(2);
	__webpack_require__(3);

	var width = 800;
	var height = 600;

	function clamp(x, low, high) {
	    return Math.max(low, Math.min(x, high));
	}

	function init() {
	    var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0x1099bb});
	    document.getElementById("game-div").appendChild(renderer.view);

	    var interactionManager = new PIXI.interaction.InteractionManager(renderer, {
	        intractionFrequency: 1
	    });

	    // create the root of the scene graph
	    var stage = new PIXI.Container();
	    stage.interactive = true;

	    // create a new Sprite using the texture
	    bunny = new PIXI.Sprite.fromImage(ASSETS.bunny);
	    bunny.anchor.x = 0.5;
	    bunny.anchor.y = 0.5;
	    target = new PIXI.Sprite.fromImage(ASSETS.carrot);
	    target.scale.x = 1.5;
	    target.scale.y = 1.5;
	    target.anchor.x = 0.5;
	    target.anchor.y = 0.5;

	    // move the sprite to the center of the screen
	    bunny.x = width / 2;
	    bunny.y = height / 2;
	    bunny.unit_y = 0.5;
	    bunny.true_y = 0.5;  // true_y is including hopping/walking motion
	    bunny.unit_x = 0.5;

	    stage.addChild(bunny);
	    stage.addChild(target);

	    // Maintain a single persistent connection
	    var namespace = '/test';
	    var socket = io.connect('http://' + document.domain + ':' + 5000 + namespace);

	    // The initial state, before receiving first message.
	    var state = new PIXI.Point(0.5, 0.5);
	    var mouse = new PIXI.Point(0.5, 0.5);

	    stage.on('mousemove', function(e) {
	        var x = e.data.global.x;
	        var y = e.data.global.y;
	        interactionManager.mapPositionToPoint(mouse, x, y);
	        mouse.x /= width;
	        // Flip the y axis so that increasing is up
	        mouse.y = 1 - mouse.y / height;
	    });

	    socket.on('connect', function(msg) {
	        console.log('Connected');
	    });

	    socket.on('state', function(msg) {
	        // Rescale from [-1, 1] -> [0, 1]
	        var x = Math.min(Math.max(0, (msg.x + 1) * 0.5), 1);
	        var y = Math.min(Math.max(0, (msg.y + 1) * 0.5), 1);
	        state.set(x, y);
	    });

	    var acc_factor = 0.001;
	    var x_vel = 0;
	    var y_vel = 0;
	    var hopVel = 0;
	    var hopHeight = 0;
	    var hopImpulse = 0.007;
	    var gravity = 0.0008;

	    // Store times in seconds
	    var then = Date.now() / 1000;
	    var tick = 0;
	    var onTarget = false;

	    function animate() {
	        requestAnimationFrame(animate);
	        if (!isFinite(mouse.x) || !isFinite(mouse.y)) {
	            return;
	        }

	        now = Date.now() / 1000;

	        var x_acc = mouse.x - bunny.unit_x;
	        maxVel = Math.min(Math.pow(Math.abs(x_acc), 1.4) * width, 2) / width;
	        x_vel = clamp(x_vel + x_acc * acc_factor, -maxVel, maxVel);

	        // Screen coordinates increase going down the screen
	        var y_acc = mouse.y - bunny.unit_y;
	        maxVel = Math.min(Math.pow(Math.abs(y_acc), 1.4) * height, 2) / height;
	        y_vel = clamp(y_vel + y_acc * acc_factor, -maxVel, maxVel);

	        // A closure around the 'state', which reflects the last message
	        // The first several updates are all garbage for some reason, so we
	        // just keep Mr. Bunny still until the world stabilizes
	        if (isFinite(state.x)) {
	            // Actually update position now
	            bunny.unit_x += x_vel;
	            bunny.x = bunny.unit_x * width;
	            target.x = state.x * width;
	        }
	        if (isFinite(state.y)) {
	            bunny.unit_y += y_vel;
	            bunny.true_y = bunny.unit_y + hopHeight;
	            bunny.y = (1 - bunny.true_y) * height;
	            target.y = (1 - state.y) * height;
	        }

	        // Mr bunny should walk and hop when he moves

	        // Gravity is always on
	        if (hopHeight <= 0) {
	            hopHeight = 0;
	            hopVel = 0;
	        } else {
	            hopHeight += hopVel;
	            hopVel -= gravity;
	        }

	        var speed = Math.hypot(x_vel, y_vel);
	        // Stop if not moving
	        if (speed < 0.0001) {
	            bunny.rotation *= 0.8;
	        // Walk if slow
	        } else if (speed < maxVel) {
	            bunny.rotation = Math.cos(7 * Math.PI * now) / 8;
	        // Hop if fast
	        } else {
	            end = Math.sign(x_acc) * Math.PI / 15;
	            bunny.rotation += (end - bunny.rotation) * 0.2;
	            if (hopHeight === 0) {
	                hopHeight = hopVel = hopImpulse;
	            }
	        }

	        // This carrot is so enticing!
	        if (onTarget) {
	            target.rotation *= 0.8;
	        } else {
	            target.rotation = Math.sin(2 * Math.PI * now) / 5;
	        }


	        // This is in absolute terms (pixels)
	        var dist = Math.hypot(
	            (bunny.unit_x - target.x) * width,
	            (bunny.unit_y - target.y) * height
	        );
	        if (dist < 10) {
	            if (!onTarget) {
	                console.log("Target acquired");
	                onTarget = true;
	            }
	        } else {
	            onTarget = false;
	        }

	        // render the container
	        renderer.render(stage);
	        if (now - then > 5) {
	            var fps = tick / (now - then);
	            console.log(Math.round(fps, 0).toString() + " FPS");
	            then = now;
	            tick = -1;
	        }
	        tick += 1;
	    }

	    // start animating
	    animate();

	}

	document.addEventListener("DOMContentLoaded", init);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = PIXI;

/***/ },
/* 2 */
/***/ function(module, exports) {

	
	exports.bunny = 'assets/bunny.png';
	exports.carrot = 'assets/carrot.png';


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(4);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(5)();
	// imports


	// module
	exports.push([module.id, "body {\n    background-color: #000000;\n    color: #ffffff;\n}\n\n#game-canvas {\n    /* background-color: #222222; */\n}\n", ""]);

	// exports


/***/ },
/* 5 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ]);