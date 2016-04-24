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

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//
	__webpack_require__(2);
	var collapsible = __webpack_require__(8);
	var d3 = __webpack_require__(9);
	var global = __webpack_require__(10);
	var utils = __webpack_require__(13);
	var time = __webpack_require__(14);
	var topo = __webpack_require__(34);
	var points = __webpack_require__(24);
	var lines = __webpack_require__(31);
	var areas = __webpack_require__(32);
	var counts = __webpack_require__(33);
	var locations = __webpack_require__(37);

	// ---HTML---//

	createHtml();

	// ---MODULE VARIABLES---//

	var zoom = d3.behavior.zoom().scaleExtent(
	  [global.minScaleExtent, global.maxScaleExtent]).center(
	  [global.width / 2, global.height / 2]).size(
	  [global.width, global.height]).on("zoom", move);

	var svg = d3.select(".container").append('svg') //
	.attr("class", "svg")
	  .attr("preserveAspectRatio", "xMinYMin meet")
	  .attr("viewBox", "0 0 " + global.width + " " + global.height)
	  .call(zoom);

	global.g = svg.append("g");

	var MAP = "map";
	var TREE = "tree";
	var COUNTS = "counts";
	var COUNT = "count";

	// ---FUNCTIONS---//

	function createHtml() {

	  document.write("<div class=\"all\" style=\"display: block;\">");

	  document.write("		<div id=\"controls\">");
	  document.write("			<h2>");
	  document.write("				Current date: <span id=\"currentDate\"> 0 <\/span>");
	  document.write("			<\/h2>");

	  document.write("			<div>");
	  document.write("				<div id=\"playPause\"><\/div>");
	  document.write("				<div id=\"timeSlider\"><\/div>");
	  document.write("			<\/div>");
	  document.write("		<\/div>");

	  // ---SELECTORS AND CONTAINER---//

	  document
	    .write("		<div class=\"selectorsANDcontainer\" style=\"display: block;\">");

	  // ---SELECTORS---//

	  document.write("			<div class=\"selectors\" style=\"display: block;\">");

	  document.write("			<\/div>");
	  // ---END: SELECTORS ---//

	  document.write("			<div class=\"container\" id=\"container\"><\/div>");

	  document.write("		<\/div>");
	  // ---END: SELECTORS AND CONTAINER---//

	  document.write("	<\/div>");
	  // ---END: ALL---//

	} // END: createDivs

	function move() {

	  var t = d3.event.translate;
	  var s = d3.event.scale;
	  var h = global.height / 4;

	  t[0] = Math.min((global.width / global.height) * (s - 1), Math.max(
	    global.width * (1 - s), t[0]));

	  t[1] = Math.min(h * (s - 1) + h * s, Math.max(global.height * (1 - s) - h * s, t[1]));

	  zoom.translate(t);
	  global.g.attr("transform", "translate(" + t + ")scale(" + s + ")");

	  // fit the paths to the zoom level
	  // d3.selectAll(".country").attr("stroke-width", 1.0 / s);
	  // d3.selectAll(".line").attr("stroke-width", lines.lineWidth / s);
	  d3.selectAll(".point").attr("stroke-width", 1.0 / s);
	} // END: move

	function render() {

	  d3.json("data.json", function(error, json) {

	    if (error) {
	      return console.warn(error);
	    }

	    var timeLine = json.timeLine;
	    if (!(typeof timeLine === 'undefined')) {
	      time.initializeTimeSlider(timeLine);
	    } else {
	      global.hasTime = false;
	    }

	    var layers = json.layers;
	    var axisAttributes = json.axisAttributes;
	    var nodeAttributes = json.pointAttributes;
	    var lineAttributes = json.lineAttributes;
	    var areaAttributes = json.areaAttributes;
	    var mapAttributes = json.mapAttributes;
	    var locations_ = json.locations;

	    // ---MAP LAYER

	    var mapRendered = false;
	    layers.forEach(function(layer) {

	      var type = layer.type;
	      if (type == MAP) {

	        var geojson = layer.geojson;
	        topo.generateTopoLayer(geojson);

	        topo.setupPanels(mapAttributes);

	        mapRendered = true;

	      } // END: MAP check

	    });

	    if (!mapRendered) {
	      topo.generateEmptyTopoLayer(nodeAttributes, axisAttributes);
	    }

	    layers.forEach(function(layer) {

	      var type = layer.type;
	      if (type == COUNTS) {

	        var countAttribute = utils.getObject(nodeAttributes, "id", COUNT);
	        var counts_ = layer.points;

	        if (counts_.length > 0) {
	          counts.generateCountsLayer(counts_, locations_, countAttribute);
	          counts.setupPanels(countAttribute);
	          global.hasCounts = true;
	        } else {
	          global.hasCounts = false;
	        }

	      } // END: COUNTS check

	    });

	    layers.forEach(function(layer) {

	      var type = layer.type;
	      if (type == TREE) {

	        var nodes = layer.points;
	        var branches = layer.lines;
	        var areas_ = layer.areas;

	        if (!(typeof areas_ === 'undefined')) {
	          areas.generateAreasLayer(areas_, areaAttributes);
	          areas.setupPanels(areaAttributes);
	          global.hasAreas = true;
	        } else {
	          global.hasAreas = false;
	        }

	        if (!(typeof branches === 'undefined')) {
	          lines.generateLinesLayer(branches, nodes, locations_, lineAttributes);
	          lines.setupPanels(lineAttributes);
	          global.hasLines = true;
	        } else {
	          global.hasLines = false;
	        }

	        if (!(typeof nodes === 'undefined')) {
	          points.generatePointsLayer(nodes, locations_, nodeAttributes);
	          points.setupPanels(nodeAttributes);
	          global.hasPoints = true;
	        } else {
	          global.hasPoints = false;
	        }

	      } // END: TREE check

	    });

	    if (!(typeof locations_ === 'undefined')) {

	      locations.generateLocationsLayer(locations_);
	      locations.generateLabels(locations_);
	      locations.setupPanels();
	      global.hasLocations = true;

	    } else {
	      global.hasLocations = false;
	    }

	  });

	} // END: render

	function setupPanels() {
	  setupZoomButtons();
	  setupSaveSVGButton();
	  setupToggleLayerVisibility();
	} //END: setupPanels

	function setupToggleLayerVisibility() {

		var str =("				<div class=\"panelcollapsed\">")+
	  ("					<h2>Toggle layer visibility<\/h2>") +
	   ("					<div id=\"layerVisibility\" class=\"panelcontent\">") +
	 ("					<\/div>") +
	 ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	}//END:setupToggleLayerVisibility

	function setupSaveSVGButton() {

	  var str = ("				<div class=\"panelcollapsed\">") +
	    ("					<h2>Export<\/h2>") +
	    ("					<div class=\"panelcontent\">") +
	    ("						<button id=\"saveSVG\">Save SVG<\/button>") +
	    ("					<\/div>") +
	    ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  var saveSVGButton = document.getElementById("saveSVG");
	  d3.select(saveSVGButton).on('click', function() {

	    var tmp = document.getElementById("container");
	    var svg = tmp.getElementsByTagName("svg")[0];

	    // Extract the data as SVG text string
	    var svg_xml = (new XMLSerializer).serializeToString(svg);

	    window.open().document.write(svg_xml);

	  });

	} //END:setupSaveSVGButton

	function setupZoomButtons() {
	// not exacly JSX :)
	  var str = ("				<div class=\"buttons\">") +
	    ("					<button data-zoom=\"+1\">Zoom In<\/button>") +
	    ("					<button data-zoom=\"-1\">Zoom Out<\/button>") +
	    ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  d3.selectAll("button[data-zoom]").on("click", clicked);

	} //END:setupZoomButtons

	function clicked() {
	  svg.call(zoom.event);

	  var center0 = zoom.center();
	  var translate0 = zoom.translate();
	  var coordinates0 = coordinates(center0);

	  // console.log(zoom.scale());

	  zoom.scale(zoom.scale() * Math.pow(1.5, +this.getAttribute("data-zoom")));

	  if (zoom.scale() < global.minScaleExtent) {
	    zoom.scale(global.minScaleExtent);
	  }

	  if (zoom.scale() > global.maxScaleExtent) {
	    zoom.scale(global.maxScaleExtent);
	  }

	  // Translate back to the center.
	  var center1 = point(coordinates0);
	  zoom.translate([translate0[0] + center0[0] - center1[0],
	    translate0[1] + center0[1] - center1[1]
	  ]);

	  svg.transition().duration(750).call(zoom.event);
	}

	function coordinates(point) {
	  var scale = zoom.scale(),
	    translate = zoom.translate();
	  return [(point[0] - translate[0]) / scale,
	    (point[1] - translate[1]) / scale
	  ];
	}

	function point(coordinates) {
	  var scale = zoom.scale(),
	    translate = zoom.translate();
	  return [coordinates[0] * scale + translate[0],
	    coordinates[1] * scale + translate[1]
	  ];
	}

	// ---CALLS---//

	setupPanels();
	render();

	collapsible.setUpPanels();
	collapsible.collapseAll();
	// collapsible.expandAll();

	console.log("Done!");

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.1
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-02-22T19:11Z
	 */

	(function( global, factory ) {

		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

	// Pass this if window is not defined yet
	}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr = [];

	var document = window.document;

	var slice = arr.slice;

	var concat = arr.concat;

	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var support = {};



	var
		version = "2.2.1",

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},

		// Support: Android<4.1
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,

		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// Start with an empty selector
		selector: "",

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num != null ?

				// Return just the one element from the set
				( num < 0 ? this[ num + this.length ] : this[ num ] ) :

				// Return all the elements in a clean array
				slice.call( this );
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];

						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},

		isArray: Array.isArray,

		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},

		isNumeric: function( obj ) {

			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			var realStringObj = obj && obj.toString();
			return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
		},

		isPlainObject: function( obj ) {

			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}

			if ( obj.constructor &&
					!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}

			// If the function hasn't returned already, we're confident that
			// |obj| is a plain object, created by {} or constructed with new Object
			return true;
		},

		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},

		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}

			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},

		// Evaluates a script in a global context
		globalEval: function( code ) {
			var script,
				indirect = eval;

			code = jQuery.trim( code );

			if ( code ) {

				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if ( code.indexOf( "use strict" ) === 1 ) {
					script = document.createElement( "script" );
					script.text = code;
					document.head.appendChild( script ).parentNode.removeChild( script );
				} else {

					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval

					indirect( code );
				}
			}
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},

		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},

		// Support: Android<4.1
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply( [], ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;

			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}

			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: Date.now,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	// JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	/* jshint ignore: end */

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	function isArrayLike( obj ) {

		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );

		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */
	(function( window ) {

	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,

		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,

		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,

		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,
		rescape = /'|\\/g,

		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		};

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?

			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :

			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}

	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, nidselect, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {

			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

					// ID selector
					if ( (m = match[1]) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {

								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {

								results.push( elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {

						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;

					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {

						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rescape, "\\$&" );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
						while ( i-- ) {
							groups[i] = nidselect + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}

					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */
	function assert( fn ) {
		var div = document.createElement("div");

		try {
			return !!fn( div );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( div.parentNode ) {
				div.parentNode.removeChild( div );
			}
			// release memory in IE
			div = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;

		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				( ~b.sourceIndex || MAX_NEGATIVE ) -
				( ~a.sourceIndex || MAX_NEGATIVE );

		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}

		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}

	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, parent,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );

		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( (parent = document.defaultView) && parent.top !== parent ) {
			// Support: IE 11
			if ( parent.addEventListener ) {
				parent.addEventListener( "unload", unloadHandler, false );

			// Support: IE 9 - 10 only
			} else if ( parent.attachEvent ) {
				parent.attachEvent( "onunload", unloadHandler );
			}
		}

		/* Attributes
		---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( div ) {
			div.className = "i";
			return !div.getAttribute("className");
		});

		/* getElement(s)By*
		---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return !div.getElementsByTagName("*").length;
		});

		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( div ) {
			docElem.appendChild( div ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});

		// ID find and filter
		if ( support.getById ) {
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var m = context.getElementById( id );
					return m ? [ m ] : [];
				}
			};
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];

			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}

		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :

			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			};

		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];

		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( div ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";

				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( div.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}

				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}

				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibing-combinator selector` fails
				if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});

			assert(function( div ) {
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				div.appendChild( input ).setAttribute( "name", "D" );

				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( div.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}

		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {

			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( div, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );

		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];

			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;

			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}

			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}

			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}

			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};

		return document;
	};

	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};

	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );

		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}

		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};

	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};

	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();

				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];

				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},

			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},

			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},

			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {

											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index

								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( (node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});

									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {

										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});

												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});

												uniqueCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );

				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),

			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),

			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),

			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			"root": function( elem ) {
				return elem === docElem;
			},

			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},

			// Boolean properties
			"enabled": function( elem ) {
				return elem.disabled === false;
			},

			"disabled": function( elem ) {
				return elem.disabled === true;
			},

			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},

			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},

			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},

			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),

			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),

			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),

			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};

	Expr.pseudos["nth"] = Expr.pseudos["eq"];

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}

			matched = false;

			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++;

		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

							if ( (oldCache = uniqueCache[ dir ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ dir ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,

				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

						// ...intermediate processing is necessary
						[] :

						// ...otherwise use results directly
						results :
					matcherIn;

			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

							seed[temp] = !(results[temp] = elem);
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;

				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						Sizzle.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};

	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( div ) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute( "value", "" );
		return div.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( div ) {
		return div.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}

	return Sizzle;

	})( window );



	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;



	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			} );

		}

		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );

		}

		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}

			qualifier = jQuery.filter( qualifier, elements );
		}

		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i,
				len = this.length,
				ret = [],
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						// Support: Blackberry 4.6
						// gEBID returns nodes no longer in the document (#6963)
						if ( elem && elem.parentNode ) {

							// Inject the element directly into the jQuery object
							this.length = 1;
							this[ 0 ] = elem;
						}

						this.context = document;
						this.selector = selector;
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this.context = this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;

			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( pos ?
						pos.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnotwhite = ( /\S+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, listener list, final state
					[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
					[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					then: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
								var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

								// deferred[ done | fail | progress ] for forwarding actions to newDefer
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this === promise ? newDefer.promise() : this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Keep pipe for back-compat
			promise.pipe = promise.then;

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 3 ];

				// promise[ done | fail | progress ] = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add( function() {

						// state = [ resolved | rejected ]
						state = stateString;

					// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
				}

				// deferred[ resolve | reject | notify ]
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
					return this;
				};
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( subordinate /* , ..., subordinateN */ ) {
			var i = 0,
				resolveValues = slice.call( arguments ),
				length = resolveValues.length,

				// the count of uncompleted subordinates
				remaining = length !== 1 ||
					( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

				// the master Deferred.
				// If resolveValues consist of only a single Deferred, just use that.
				deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

				// Update function for both resolve and progress values
				updateFunc = function( i, contexts, values ) {
					return function( value ) {
						contexts[ i ] = this;
						values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( values === progressValues ) {
							deferred.notifyWith( contexts, values );
						} else if ( !( --remaining ) ) {
							deferred.resolveWith( contexts, values );
						}
					};
				},

				progressValues, progressContexts, resolveContexts;

			// Add listeners to Deferred subordinates; treat others as resolved
			if ( length > 1 ) {
				progressValues = new Array( length );
				progressContexts = new Array( length );
				resolveContexts = new Array( length );
				for ( ; i < length; i++ ) {
					if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
						resolveValues[ i ].promise()
							.progress( updateFunc( i, progressContexts, progressValues ) )
							.done( updateFunc( i, resolveContexts, resolveValues ) )
							.fail( deferred.reject );
					} else {
						--remaining;
					}
				}
			}

			// If we're not waiting on anything, resolve the master
			if ( !remaining ) {
				deferred.resolveWith( resolveContexts, resolveValues );
			}

			return deferred.promise();
		}
	} );


	// The deferred used on DOM ready
	var readyList;

	jQuery.fn.ready = function( fn ) {

		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
				jQuery( document ).off( "ready" );
			}
		}
	} );

	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	jQuery.ready.promise = function( obj ) {
		if ( !readyList ) {

			readyList = jQuery.Deferred();

			// Catch cases where $(document).ready() is called
			// after the browser event has already occurred.
			// Support: IE9-10 only
			// Older IE sometimes signals "interactive" too soon
			if ( document.readyState === "complete" ||
				( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

				// Handle it asynchronously to allow scripts the opportunity to delay ready
				window.setTimeout( jQuery.ready );

			} else {

				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", completed );

				// A fallback to window.onload, that will always work
				window.addEventListener( "load", completed );
			}
		}
		return readyList.promise( obj );
	};

	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		register: function( owner, initial ) {
			var value = initial || {};

			// If it is a node unlikely to be stringify-ed or looped over
			// use plain assignment
			if ( owner.nodeType ) {
				owner[ this.expando ] = value;

			// Otherwise secure it in a non-enumerable, non-writable property
			// configurability must be true to allow the property to be
			// deleted with the delete operator
			} else {
				Object.defineProperty( owner, this.expando, {
					value: value,
					writable: true,
					configurable: true
				} );
			}
			return owner[ this.expando ];
		},
		cache: function( owner ) {

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( !acceptData( owner ) ) {
				return {};
			}

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			if ( typeof data === "string" ) {
				cache[ data ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
				owner[ this.expando ] && owner[ this.expando ][ key ];
		},
		access: function( owner, key, value ) {
			var stored;

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				stored = this.get( owner, key );

				return stored !== undefined ?
					stored : this.get( owner, jQuery.camelCase( key ) );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i, name, camel,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key === undefined ) {
				this.register( owner );

			} else {

				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {

					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat( key.map( jQuery.camelCase ) );
				} else {
					camel = jQuery.camelCase( key );

					// Try the string as a key before any manipulation
					if ( key in cache ) {
						name = [ key, camel ];
					} else {

						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ?
							[ name ] : ( name.match( rnotwhite ) || [] );
					}
				}

				i = name.length;

				while ( i-- ) {
					delete cache[ name[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <= 35-45+
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://code.google.com/p/chromium/issues/detail?id=378607
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :

						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE11+
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data, camelKey;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// with the key as-is
					data = dataUser.get( elem, key ) ||

						// Try to find dashed key if it exists (gh-2779)
						// This is for 2.2.x only
						dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

					if ( data !== undefined ) {
						return data;
					}

					camelKey = jQuery.camelCase( key );

					// Attempt to get data from the cache
					// with the key camelized
					data = dataUser.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, camelKey, undefined );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				camelKey = jQuery.camelCase( key );
				this.each( function() {

					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = dataUser.get( this, camelKey );

					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					dataUser.set( this, camelKey, value );

					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
						dataUser.set( this, key, value );
					}
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var isHidden = function( elem, el ) {

			// isHidden might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
			return jQuery.css( elem, "display" ) === "none" ||
				!jQuery.contains( elem.ownerDocument, elem );
		};



	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return jQuery.css( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			do {

				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";

				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );

			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([\w:-]+)/ );

	var rscriptType = ( /^$|\/(?:java|ecma)script/i );



	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	// Support: IE9
	wrapMap.optgroup = wrapMap.option;

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;


	function getAll( context, tag ) {

		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];

		return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
			jQuery.merge( [ context ], ret ) :
			ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0-4.3, Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();


	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	// Support: IE9
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( event ) {

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( event );

			var i, j, ret, matched, handleObj,
				handlerQueue = [],
				args = slice.call( arguments ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, matches, sel, handleObj,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Support (at least): Chrome, IE9
			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			//
			// Support: Firefox<=42+
			// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
			if ( delegateCount && cur.nodeType &&
				( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matches[ sel ] === undefined ) {
								matches[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push( { elem: cur, handlers: matches } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
			"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split( " " ),
			filter: function( event, original ) {

				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
				"screenX screenY toElement" ).split( " " ),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button;

				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY +
						( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
						( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},

		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];

			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

			event = new jQuery.Event( originalEvent );

			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}

			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}

			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}

			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {

				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {

				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android<4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

		// Support: IE 10-11, Edge 10240+
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

	// Manipulating tables requires a tbody
	function manipulationTarget( elem, content ) {
		return jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

			elem.getElementsByTagName( "tbody" )[ 0 ] ||
				elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
			elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );

		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;

			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android<4.1, PhantomJS<2
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {

		// Keep domManip exposed until 3.0 (gh-2225)
		domManip: domManip,

		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );


	var iframe,
		elemdisplay = {

			// Support: Firefox
			// We have to pre-define these values for FF (#10227)
			HTML: "block",
			BODY: "block"
		};

	/**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */

	// Called only from within defaultDisplay
	function actualDisplay( name, doc ) {
		var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

			display = jQuery.css( elem[ 0 ], "display" );

		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();

		return display;
	}

	/**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */
	function defaultDisplay( nodeName ) {
		var doc = document,
			display = elemdisplay[ nodeName ];

		if ( !display ) {
			display = actualDisplay( nodeName, doc );

			// If the simple way fails, read from inside an iframe
			if ( display === "none" || !display ) {

				// Use the already-created iframe if possible
				iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
					.appendTo( doc.documentElement );

				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[ 0 ].contentDocument;

				// Support: IE
				doc.write();
				doc.close();

				display = actualDisplay( nodeName, doc );
				iframe.detach();
			}

			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}

		return display;
	}
	var rmargin = ( /^margin/ );

	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var getStyles = function( elem ) {

			// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};

	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};


	var documentElement = document.documentElement;



	( function() {
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";

			documentElement.removeChild( container );
		}

		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {

				// Support: Android 4.0-4.3
				// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
				// since that compresses better and they're computed together anyway.
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {

				// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return reliableMarginLeftVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =

					// Support: Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;box-sizing:content-box;" +
					"display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				documentElement.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

				documentElement.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,

		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},

		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;

	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {

		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	function setPositiveNumber( elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?

			// If we already have the right measurement, avoid augmentation
			4 :

			// Otherwise initialize for horizontal or vertical properties
			name === "width" ? 1 : 0,

			val = 0;

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}

			if ( isBorderBox ) {

				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {

				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		return val;
	}

	function getWidthOrHeight( elem, name, extra ) {

		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
			val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Support: IE11 only
		// In IE 11 fullscreen elements inside of an iframe have
		// 100x too small dimensions (gh-1764).
		if ( document.msFullscreenElement && window.top !== window ) {

			// Support: IE11 only
			// Running getBoundingClientRect on a disconnected node
			// in IE throws an error.
			if ( elem.getClientRects().length ) {
				val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
			}
		}

		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {

			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}

		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}

	function showHide( elements, show ) {
		var display, elem, hidden,
			values = [],
			index = 0,
			length = elements.length;

		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			values[ index ] = dataPriv.get( elem, "olddisplay" );
			display = elem.style.display;
			if ( show ) {

				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !values[ index ] && display === "none" ) {
					elem.style.display = "";
				}

				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( elem.style.display === "" && isHidden( elem ) ) {
					values[ index ] = dataPriv.access(
						elem,
						"olddisplay",
						defaultDisplay( elem.nodeName )
					);
				}
			} else {
				hidden = isHidden( elem );

				if ( display !== "none" || !hidden ) {
					dataPriv.set(
						elem,
						"olddisplay",
						hidden ? display : jQuery.css( elem, "display" )
					);
				}
			}
		}

		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
			if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
				elem.style.display = show ? values[ index ] || "" : "none";
			}
		}

		return elements;
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;

			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// Support: IE9-11+
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					style[ name ] = value;
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );

			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
						elem.offsetWidth === 0 ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);

	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
		function( elem, computed ) {
			if ( computed ) {
				return swap( elem, { "display": "inline-block" },
					curCSS, [ elem, "marginRight" ] );
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		},
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHidden( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back Compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4 ; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		/* jshint validthis: true */
		var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHidden( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Handle queue: false promises
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Height/width overflow pass
		if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css( elem, "display" );

			// Test default display if display is currently "none"
			checkDisplay = display === "none" ?
				dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

			if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
				style.display = "inline-block";
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// show/hide pass
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.exec( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// If there is dataShow left over from a stopped hide or show
					// and we are going to proceed with show, we should pretend to be hidden
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

			// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}

		if ( !jQuery.isEmptyObject( orig ) ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", {} );
			}

			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}
			if ( hidden ) {
				jQuery( elem ).show();
			} else {
				anim.done( function() {
					jQuery( elem ).hide();
				} );
			}
			anim.done( function() {
				var prop;

				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
			for ( prop in orig ) {
				tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = tween.start;
					if ( hidden ) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}

		// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
			style.display = display;
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length ; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length ; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}

	jQuery.Animation = jQuery.extend( Animation, {
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnotwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length ; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHidden ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = jQuery.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};

	jQuery.fx.stop = function() {
		window.clearInterval( timerId );

		timerId = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[ name ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name, propName,
				i = 0,
				attrNames = value && value.match( rnotwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					propName = jQuery.propFix[ name ] || name;

					// Boolean attributes get special treatment (#10870)
					if ( jQuery.expr.match.bool.test( name ) ) {

						// Set corresponding property to false
						elem[ propName ] = false;
					}

					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					return tabindex ?
						parseInt( tabindex, 10 ) :
						rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								-1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




	var rclass = /[\t\r\n\f]/g;

	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );

					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {

							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value;

			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			return this.each( function() {
				var className, i, self, classNames;

				if ( type === "string" ) {

					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnotwhite ) || [];

					while ( ( className = classNames[ i++ ] ) ) {

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + getClass( elem ) + " " ).replace( rclass, " " )
						.indexOf( className ) > -1
				) {
					return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					return typeof ret === "string" ?

						// Handle most common string cases
						ret.replace( rreturn, "" ) :

						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					// Support: IE<11
					// option.value not trimmed (#14858)
					return jQuery.trim( elem.value );
				}
			},
			select: {
				get: function( elem ) {
					var value, option,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one" || index < 0,
						values = one ? null : [],
						max = one ? index + 1 : options.length,
						i = index < 0 ?
							max :
							one ? index : 0;

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								( support.optDisabled ?
									!option.disabled : option.getAttribute( "disabled" ) === null ) &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];
						if ( option.selected =
								jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true

					// Previously, `originalEvent: {}` was set here, so stopPropagation call
					// would not be triggered on donor event, since in our own
					// jQuery.event.stopPropagation function we had a check for existence of
					// originalEvent.stopPropagation method, so, consequently it would be a noop.
					//
					// But now, this "simulate" function is used only for events
					// for which stopPropagation() is noop, so there is no need for that anymore.
					//
					// For the 1.x branch though, guard for "click" and "submit"
					// events is still used, but was moved to jQuery.event.stopPropagation function
					// because `originalEvent` should point to the original event for the constancy
					// with other events and for more focused logic
				}
			);

			jQuery.event.trigger( e, null, elem );

			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
		function( i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );

	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );




	support.focusin = "onfocusin" in window;


	// Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};

			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );

					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;

					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );

					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;

	var nonce = jQuery.now();

	var rquery = ( /\?/ );



	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function( data ) {
		return JSON.parse( data + "" );
	};


	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE9
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};


	var
		rhash = /#.*$/,
		rts = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

			if ( jQuery.isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

			// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// The jqXHR state
				state = 0,

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},

					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						var lname = name.toLowerCase();
						if ( !state ) {
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( state < 2 ) {
								for ( code in map ) {

									// Lazy-add the new callback in a way that preserves old ones
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							} else {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR ).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;

			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE8-11+
				// IE throws exception if url is malformed, e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE8-11+
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// If data is available, append data to url
				if ( s.data ) {
					cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add anti-cache in url if needed
				if ( s.cache === false ) {
					s.url = rts.test( cacheURL ) ?

						// If there is already a '_' parameter, set its value
						cacheURL.replace( rts, "$1_=" + nonce++ ) :

						// Otherwise add one to the end
						cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
				}
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( state === 2 ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					state = 1;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );

					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Called once
				if ( state === 2 ) {
					return;
				}

				// State is "done" now
				state = 2;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );


	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapAll( html.call( this, i ) );
				} );
			}

			if ( this[ 0 ] ) {

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function() {
			return this.parent().each( function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			} ).end();
		}
	} );


	jQuery.expr.filters.hidden = function( elem ) {
		return !jQuery.expr.filters.visible( elem );
	};
	jQuery.expr.filters.visible = function( elem ) {

		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		// Use OR instead of AND as the element is not visible if either is true
		// See tickets #10406 and #13132
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	};




	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( jQuery.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && jQuery.type( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, value ) {

				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();

				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						} ) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE9
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE9
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );

					// Support: IE9
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Support: Safari 8+
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();


	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		context = context || ( support.createHTMLDocument ?
			document.implementation.createHTMLDocument( "" ) :
			document );

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	// Keep a copy of the old load method
	var _load = jQuery.fn.load;

	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );
		}

		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = jQuery.trim( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( jQuery.isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}

	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( jQuery.isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {
		offset: function( options ) {
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var docElem, win,
				elem = this[ 0 ],
				box = { top: 0, left: 0 },
				doc = elem && elem.ownerDocument;

			if ( !doc ) {
				return;
			}

			docElem = doc.documentElement;

			// Make sure it's not a disconnected DOM node
			if ( !jQuery.contains( docElem, elem ) ) {
				return box;
			}

			box = elem.getBoundingClientRect();
			win = getWindow( doc );
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},

		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();

			} else {

				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( jQuery.isWindow( elem ) ) {

						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable, null );
			};
		} );
	} );


	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},
		size: function() {
			return this.length;
		}
	} );

	jQuery.fn.andSelf = jQuery.fn.addBack;




	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}



	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}

	return jQuery;
	}));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(3);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./main.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./main.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	exports.push([module.id, ".container {\n\tborder: 2px solid #000;\n\tborder-radius: 5px;\n/* \theight: auto; */\n/* \twidth: auto; */\n/* \toverflow: hidden; */\n/* \tdisplay: inline-block; */\n    position: relative;\n/*     width: 100%; */\n/*     padding-bottom: 100%; aspect ratio */\n    vertical-align: top;\n    overflow: hidden;\n}\n\n\n.selectors {\n\t\t/*width: 20%;*/\n\t/*margin-top: 1.5cm;*/\n\tfloat: left;\n\toverflow: hidden;\n}\n\n/* styling for collapsible panels */\n.panel, .panelcollapsed {\n\tmargin-top: 5px;\n\tmargin-right: 5px;\n}\n\n/* panel heading */\n.panel h2, .panelcollapsed h2 {\n\tfont-size: 14px;\n\tfont-weight: 300;\n\tmargin: 0px;\n\tpadding: 4px;\n\tpadding-left: 20px;\n\t/*\tbackground: #EEEEEE; */\n\tbackground-image: url("+__webpack_require__(5)+");\n\tbackground-repeat: no-repeat;\n\tbackground-position: left center;\n\tborder-top: 1px solid #CCC;\n\t/*\tborder-bottom: 1px solid #CCC;\n\t\t\tborder-right: 1px solid #CCC;\n\t\t\tborder-left: 1px solid #CCC;\n\t\t\t-moz-border-radius: 3px;\n\t\t\t-webkit-border-radius: 3px;\n\t\t\t*/\n}\n\n/* panel heading on rollover */\n.panel h2:hover, .panelcollapsed h2:hover {\n\tbackground-color: #F5F7F9;\n}\n\n/* heading of a collapsed panel */\n.panelcollapsed h2 {\n\t/*\tbackground: #DDDDDD; */\n\tbackground-image: url("+__webpack_require__(6)+");\n\tbackground-repeat: no-repeat;\n\tbackground-position: left center;\n\tborder-color: #CCC;\n}\n\n/* panel content - do not set borders or paddings */\n.panelcontent {\n\tbackground: #FFFFFF;\n\toverflow: hidden;\n}\n\n/* collapsed panel content */\n.panelcollapsed .panelcontent {\n\tdisplay: none;\n}\n\n.wrapper {\n\twidth: 190px;\n\tmargin: 25px 0;\n\tmargin-left: 10px;\n\tmargin-right: 15px;\n}\n", ""]);

/***/ },
/* 4 */
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
/* 5 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEWZmZkAAAD///+vdKeCAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfgAhITNhzZPa1FAAAAL0lEQVQI12NgQABGByDBGgAkREOARNhUoFCEqgMDawJnAANXo9MCPLINTAvAZgAALLUJJYoEJIcAAAAASUVORK5CYII="

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEWZmZkAAAD///+vdKeCAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfgAhITNjjlPkmUAAAAMElEQVQI12NggANWB8YABs4A1gQGphDRBgaGqWFAQdUIIMGZAJR1asQjy8DUADEEAGENCSWLr9OZAAAAAElFTkSuQmCC"

/***/ },
/* 7 */
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
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

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

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
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


/***/ },
/* 8 */
/***/ function(module, exports) {

	var PANEL_NORMAL_CLASS = "panel";
	var PANEL_COLLAPSED_CLASS = "panelcollapsed";
	var PANEL_HEADING_TAG = "h2";
	var PANEL_CONTENT_CLASS = "panelcontent";
	var PANEL_COOKIE_NAME = "panels";
	var PANEL_ANIMATION_DELAY = 20; /* ms */
	var PANEL_ANIMATION_STEPS = 10;

	var exports = module.exports = {
			setUpPanels : setUpPanels,
			collapseAll : collapseAll,
			expandAll : expandAll
	};

	function setUpPanels() {

		loadSettings();

		// get all headings
		var headingTags = document.getElementsByTagName(PANEL_HEADING_TAG);

		// go through all tags
		for (var i = 0; i < headingTags.length; i++) {
			var el = headingTags[i];

			// make sure it's the heading inside a panel
			if (el.parentNode.className != PANEL_NORMAL_CLASS
					&& el.parentNode.className != PANEL_COLLAPSED_CLASS)
				continue;

			// get the text value of the tag
			var name = el.firstChild.nodeValue;

			// look for the name in loaded settings, apply the normal/collapsed
			// class
			if (panelsStatus[name] == "false")
				el.parentNode.className = PANEL_COLLAPSED_CLASS;
			else if (panelsStatus[name] == "true")
				el.parentNode.className = PANEL_NORMAL_CLASS;
			else {
				// if no saved setting, see the initial setting
				panelsStatus[name] = (el.parentNode.className == PANEL_NORMAL_CLASS) ? "true"
						: "false";
			}

			// add the click behavor to headings
			el.onclick = function() {
				var target = this.parentNode;
				var name = this.firstChild.nodeValue;
				var collapsed = (target.className == PANEL_COLLAPSED_CLASS);
				saveSettings(name, collapsed ? "true" : "false");
				animateTogglePanel(target, collapsed);
			};
		}
	}

	/**
	 * Start the expand/collapse animation of the panel
	 *
	 * @param panel
	 *            reference to the panel div
	 */
	function animateTogglePanel(panel, expanding) {
		// find the .panelcontent div
		var elements = panel.getElementsByTagName("div");
		var panelContent = null;
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].className == PANEL_CONTENT_CLASS) {
				panelContent = elements[i];
				break;
			}
		}

		// make sure the content is visible before getting its height
		panelContent.style.display = "block";

		// get the height of the content
		var contentHeight = panelContent.offsetHeight;

		// if panel is collapsed and expanding, we must start with 0 height
		if (expanding)
			panelContent.style.height = "0px";

		var stepHeight = contentHeight / PANEL_ANIMATION_STEPS;
		var direction = (!expanding ? -1 : 1);

		setTimeout(function() {
			animateStep(panelContent, 1, stepHeight, direction)
		}, PANEL_ANIMATION_DELAY);
	}

	/**
	 * Change the height of the target
	 *
	 * @param panelContent
	 *            reference to the panel content to change height
	 * @param iteration
	 *            current iteration; animation will be stopped when iteration
	 *            reaches PANEL_ANIMATION_STEPS
	 * @param stepHeight
	 *            height increment to be added/substracted in one step
	 * @param direction
	 *            1 for expanding, -1 for collapsing
	 */
	function animateStep(panelContent, iteration, stepHeight, direction) {
		if (iteration < PANEL_ANIMATION_STEPS) {
			panelContent.style.height = Math.round(((direction > 0) ? iteration
					: 10 - iteration)
					* stepHeight)
					+ "px";
			iteration++;
			setTimeout(function() {
				animateStep(panelContent, iteration, stepHeight, direction)
			}, PANEL_ANIMATION_DELAY);
		} else {
			// set class for the panel
			panelContent.parentNode.className = (direction < 0) ? PANEL_COLLAPSED_CLASS
					: PANEL_NORMAL_CLASS;
			// clear inline styles
			panelContent.style.display = panelContent.style.height = "";
		}
	}

	// -----------------------------------------------------------------------------------------------
	// Load-Save
	// -----------------------------------------------------------------------------------------------
	/**
	 * Reads the "panels" cookie if exists, expects data formatted as
	 * key:value|key:value... puts in panelsStatus object
	 */
	function loadSettings() {
		// prepare the object that will keep the panel statuses
		panelsStatus = {};

		// find the cookie name
		var start = document.cookie.indexOf(PANEL_COOKIE_NAME + "=");
		if (start == -1)
			return;

		// starting point of the value
		start += PANEL_COOKIE_NAME.length + 1;

		// find end point of the value
		var end = document.cookie.indexOf(";", start);
		if (end == -1)
			end = document.cookie.length;

		// get the value, split into key:value pairs
		var cookieValue = unescape(document.cookie.substring(start, end));
		var panelsData = cookieValue.split("|");

		// split each key:value pair and put in object
		for (var i = 0; i < panelsData.length; i++) {
			var pair = panelsData[i].split(":");
			panelsStatus[pair[0]] = pair[1];
		}
	}

	function expandAll() {
		for ( var key in panelsStatus)
			saveSettings(key, "true");

		setUpPanels();
	}

	function collapseAll() {
		for ( var key in panelsStatus) {
			saveSettings(key, "false");
		}

		setUpPanels();
	}

	/**
	 * Takes data from the panelsStatus object, formats as key:value|key:value...
	 * and puts in cookie valid for 365 days
	 *
	 * @param key
	 *            key name to save
	 * @paeam value key value
	 */
	function saveSettings(key, value) {
		// put the new value in the object
		panelsStatus[key] = value;

		// create an array that will keep the key:value pairs
		var panelsData = [];
		for ( var key in panelsStatus)
			panelsData.push(key + ":" + panelsStatus[key]);

		// set the cookie expiration date 1 year from now
		var today = new Date();
		var expirationDate = new Date(today.getTime() + 365 * 1000 * 60 * 60 * 24);
		// write the cookie
		document.cookie = PANEL_COOKIE_NAME + "=" + escape(panelsData.join("|"))
				+ ";expires=" + expirationDate.toGMTString();
	}

	// -----------------------------------------------------------------------------------------------
	// Register setUpPanels to be executed on load
	if (window.addEventListener) {
		// the "proper" way
		window.addEventListener("load", setUpPanels, false);
	} else if (window.attachEvent) {
		// the IE way
		window.attachEvent("onload", setUpPanels);
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;!function() {
	  var d3 = {
	    version: "3.5.16"
	  };
	  var d3_arraySlice = [].slice, d3_array = function(list) {
	    return d3_arraySlice.call(list);
	  };
	  var d3_document = this.document;
	  function d3_documentElement(node) {
	    return node && (node.ownerDocument || node.document || node).documentElement;
	  }
	  function d3_window(node) {
	    return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
	  }
	  if (d3_document) {
	    try {
	      d3_array(d3_document.documentElement.childNodes)[0].nodeType;
	    } catch (e) {
	      d3_array = function(list) {
	        var i = list.length, array = new Array(i);
	        while (i--) array[i] = list[i];
	        return array;
	      };
	    }
	  }
	  if (!Date.now) Date.now = function() {
	    return +new Date();
	  };
	  if (d3_document) {
	    try {
	      d3_document.createElement("DIV").style.setProperty("opacity", 0, "");
	    } catch (error) {
	      var d3_element_prototype = this.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = this.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
	      d3_element_prototype.setAttribute = function(name, value) {
	        d3_element_setAttribute.call(this, name, value + "");
	      };
	      d3_element_prototype.setAttributeNS = function(space, local, value) {
	        d3_element_setAttributeNS.call(this, space, local, value + "");
	      };
	      d3_style_prototype.setProperty = function(name, value, priority) {
	        d3_style_setProperty.call(this, name, value + "", priority);
	      };
	    }
	  }
	  d3.ascending = d3_ascending;
	  function d3_ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	  }
	  d3.descending = function(a, b) {
	    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	  };
	  d3.min = function(array, f) {
	    var i = -1, n = array.length, a, b;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
	    }
	    return a;
	  };
	  d3.max = function(array, f) {
	    var i = -1, n = array.length, a, b;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
	    }
	    return a;
	  };
	  d3.extent = function(array, f) {
	    var i = -1, n = array.length, a, b, c;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = c = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = c = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    }
	    return [ a, c ];
	  };
	  function d3_number(x) {
	    return x === null ? NaN : +x;
	  }
	  function d3_numeric(x) {
	    return !isNaN(x);
	  }
	  d3.sum = function(array, f) {
	    var s = 0, n = array.length, a, i = -1;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = +array[i])) s += a;
	    } else {
	      while (++i < n) if (d3_numeric(a = +f.call(array, array[i], i))) s += a;
	    }
	    return s;
	  };
	  d3.mean = function(array, f) {
	    var s = 0, n = array.length, a, i = -1, j = n;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
	    } else {
	      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) s += a; else --j;
	    }
	    if (j) return s / j;
	  };
	  d3.quantile = function(values, p) {
	    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
	    return e ? v + e * (values[h] - v) : v;
	  };
	  d3.median = function(array, f) {
	    var numbers = [], n = array.length, a, i = -1;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
	    } else {
	      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) numbers.push(a);
	    }
	    if (numbers.length) return d3.quantile(numbers.sort(d3_ascending), .5);
	  };
	  d3.variance = function(array, f) {
	    var n = array.length, m = 0, a, d, s = 0, i = -1, j = 0;
	    if (arguments.length === 1) {
	      while (++i < n) {
	        if (d3_numeric(a = d3_number(array[i]))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    } else {
	      while (++i < n) {
	        if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    }
	    if (j > 1) return s / (j - 1);
	  };
	  d3.deviation = function() {
	    var v = d3.variance.apply(this, arguments);
	    return v ? Math.sqrt(v) : v;
	  };
	  function d3_bisector(compare) {
	    return {
	      left: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
	        }
	        return lo;
	      },
	      right: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
	        }
	        return lo;
	      }
	    };
	  }
	  var d3_bisect = d3_bisector(d3_ascending);
	  d3.bisectLeft = d3_bisect.left;
	  d3.bisect = d3.bisectRight = d3_bisect.right;
	  d3.bisector = function(f) {
	    return d3_bisector(f.length === 1 ? function(d, x) {
	      return d3_ascending(f(d), x);
	    } : f);
	  };
	  d3.shuffle = function(array, i0, i1) {
	    if ((m = arguments.length) < 3) {
	      i1 = array.length;
	      if (m < 2) i0 = 0;
	    }
	    var m = i1 - i0, t, i;
	    while (m) {
	      i = Math.random() * m-- | 0;
	      t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
	    }
	    return array;
	  };
	  d3.permute = function(array, indexes) {
	    var i = indexes.length, permutes = new Array(i);
	    while (i--) permutes[i] = array[indexes[i]];
	    return permutes;
	  };
	  d3.pairs = function(array) {
	    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
	    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
	    return pairs;
	  };
	  d3.transpose = function(matrix) {
	    if (!(n = matrix.length)) return [];
	    for (var i = -1, m = d3.min(matrix, d3_transposeLength), transpose = new Array(m); ++i < m; ) {
	      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n; ) {
	        row[j] = matrix[j][i];
	      }
	    }
	    return transpose;
	  };
	  function d3_transposeLength(d) {
	    return d.length;
	  }
	  d3.zip = function() {
	    return d3.transpose(arguments);
	  };
	  d3.keys = function(map) {
	    var keys = [];
	    for (var key in map) keys.push(key);
	    return keys;
	  };
	  d3.values = function(map) {
	    var values = [];
	    for (var key in map) values.push(map[key]);
	    return values;
	  };
	  d3.entries = function(map) {
	    var entries = [];
	    for (var key in map) entries.push({
	      key: key,
	      value: map[key]
	    });
	    return entries;
	  };
	  d3.merge = function(arrays) {
	    var n = arrays.length, m, i = -1, j = 0, merged, array;
	    while (++i < n) j += arrays[i].length;
	    merged = new Array(j);
	    while (--n >= 0) {
	      array = arrays[n];
	      m = array.length;
	      while (--m >= 0) {
	        merged[--j] = array[m];
	      }
	    }
	    return merged;
	  };
	  var abs = Math.abs;
	  d3.range = function(start, stop, step) {
	    if (arguments.length < 3) {
	      step = 1;
	      if (arguments.length < 2) {
	        stop = start;
	        start = 0;
	      }
	    }
	    if ((stop - start) / step === Infinity) throw new Error("infinite range");
	    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
	    start *= k, stop *= k, step *= k;
	    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
	    return range;
	  };
	  function d3_range_integerScale(x) {
	    var k = 1;
	    while (x * k % 1) k *= 10;
	    return k;
	  }
	  function d3_class(ctor, properties) {
	    for (var key in properties) {
	      Object.defineProperty(ctor.prototype, key, {
	        value: properties[key],
	        enumerable: false
	      });
	    }
	  }
	  d3.map = function(object, f) {
	    var map = new d3_Map();
	    if (object instanceof d3_Map) {
	      object.forEach(function(key, value) {
	        map.set(key, value);
	      });
	    } else if (Array.isArray(object)) {
	      var i = -1, n = object.length, o;
	      if (arguments.length === 1) while (++i < n) map.set(i, object[i]); else while (++i < n) map.set(f.call(object, o = object[i], i), o);
	    } else {
	      for (var key in object) map.set(key, object[key]);
	    }
	    return map;
	  };
	  function d3_Map() {
	    this._ = Object.create(null);
	  }
	  var d3_map_proto = "__proto__", d3_map_zero = "\x00";
	  d3_class(d3_Map, {
	    has: d3_map_has,
	    get: function(key) {
	      return this._[d3_map_escape(key)];
	    },
	    set: function(key, value) {
	      return this._[d3_map_escape(key)] = value;
	    },
	    remove: d3_map_remove,
	    keys: d3_map_keys,
	    values: function() {
	      var values = [];
	      for (var key in this._) values.push(this._[key]);
	      return values;
	    },
	    entries: function() {
	      var entries = [];
	      for (var key in this._) entries.push({
	        key: d3_map_unescape(key),
	        value: this._[key]
	      });
	      return entries;
	    },
	    size: d3_map_size,
	    empty: d3_map_empty,
	    forEach: function(f) {
	      for (var key in this._) f.call(this, d3_map_unescape(key), this._[key]);
	    }
	  });
	  function d3_map_escape(key) {
	    return (key += "") === d3_map_proto || key[0] === d3_map_zero ? d3_map_zero + key : key;
	  }
	  function d3_map_unescape(key) {
	    return (key += "")[0] === d3_map_zero ? key.slice(1) : key;
	  }
	  function d3_map_has(key) {
	    return d3_map_escape(key) in this._;
	  }
	  function d3_map_remove(key) {
	    return (key = d3_map_escape(key)) in this._ && delete this._[key];
	  }
	  function d3_map_keys() {
	    var keys = [];
	    for (var key in this._) keys.push(d3_map_unescape(key));
	    return keys;
	  }
	  function d3_map_size() {
	    var size = 0;
	    for (var key in this._) ++size;
	    return size;
	  }
	  function d3_map_empty() {
	    for (var key in this._) return false;
	    return true;
	  }
	  d3.nest = function() {
	    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
	    function map(mapType, array, depth) {
	      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
	      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
	      while (++i < n) {
	        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
	          values.push(object);
	        } else {
	          valuesByKey.set(keyValue, [ object ]);
	        }
	      }
	      if (mapType) {
	        object = mapType();
	        setter = function(keyValue, values) {
	          object.set(keyValue, map(mapType, values, depth));
	        };
	      } else {
	        object = {};
	        setter = function(keyValue, values) {
	          object[keyValue] = map(mapType, values, depth);
	        };
	      }
	      valuesByKey.forEach(setter);
	      return object;
	    }
	    function entries(map, depth) {
	      if (depth >= keys.length) return map;
	      var array = [], sortKey = sortKeys[depth++];
	      map.forEach(function(key, keyMap) {
	        array.push({
	          key: key,
	          values: entries(keyMap, depth)
	        });
	      });
	      return sortKey ? array.sort(function(a, b) {
	        return sortKey(a.key, b.key);
	      }) : array;
	    }
	    nest.map = function(array, mapType) {
	      return map(mapType, array, 0);
	    };
	    nest.entries = function(array) {
	      return entries(map(d3.map, array, 0), 0);
	    };
	    nest.key = function(d) {
	      keys.push(d);
	      return nest;
	    };
	    nest.sortKeys = function(order) {
	      sortKeys[keys.length - 1] = order;
	      return nest;
	    };
	    nest.sortValues = function(order) {
	      sortValues = order;
	      return nest;
	    };
	    nest.rollup = function(f) {
	      rollup = f;
	      return nest;
	    };
	    return nest;
	  };
	  d3.set = function(array) {
	    var set = new d3_Set();
	    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
	    return set;
	  };
	  function d3_Set() {
	    this._ = Object.create(null);
	  }
	  d3_class(d3_Set, {
	    has: d3_map_has,
	    add: function(key) {
	      this._[d3_map_escape(key += "")] = true;
	      return key;
	    },
	    remove: d3_map_remove,
	    values: d3_map_keys,
	    size: d3_map_size,
	    empty: d3_map_empty,
	    forEach: function(f) {
	      for (var key in this._) f.call(this, d3_map_unescape(key));
	    }
	  });
	  d3.behavior = {};
	  function d3_identity(d) {
	    return d;
	  }
	  d3.rebind = function(target, source) {
	    var i = 1, n = arguments.length, method;
	    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
	    return target;
	  };
	  function d3_rebind(target, source, method) {
	    return function() {
	      var value = method.apply(source, arguments);
	      return value === source ? target : value;
	    };
	  }
	  function d3_vendorSymbol(object, name) {
	    if (name in object) return name;
	    name = name.charAt(0).toUpperCase() + name.slice(1);
	    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
	      var prefixName = d3_vendorPrefixes[i] + name;
	      if (prefixName in object) return prefixName;
	    }
	  }
	  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
	  function d3_noop() {}
	  d3.dispatch = function() {
	    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
	    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	    return dispatch;
	  };
	  function d3_dispatch() {}
	  d3_dispatch.prototype.on = function(type, listener) {
	    var i = type.indexOf("."), name = "";
	    if (i >= 0) {
	      name = type.slice(i + 1);
	      type = type.slice(0, i);
	    }
	    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
	    if (arguments.length === 2) {
	      if (listener == null) for (type in this) {
	        if (this.hasOwnProperty(type)) this[type].on(name, null);
	      }
	      return this;
	    }
	  };
	  function d3_dispatch_event(dispatch) {
	    var listeners = [], listenerByName = new d3_Map();
	    function event() {
	      var z = listeners, i = -1, n = z.length, l;
	      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
	      return dispatch;
	    }
	    event.on = function(name, listener) {
	      var l = listenerByName.get(name), i;
	      if (arguments.length < 2) return l && l.on;
	      if (l) {
	        l.on = null;
	        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
	        listenerByName.remove(name);
	      }
	      if (listener) listeners.push(listenerByName.set(name, {
	        on: listener
	      }));
	      return dispatch;
	    };
	    return event;
	  }
	  d3.event = null;
	  function d3_eventPreventDefault() {
	    d3.event.preventDefault();
	  }
	  function d3_eventSource() {
	    var e = d3.event, s;
	    while (s = e.sourceEvent) e = s;
	    return e;
	  }
	  function d3_eventDispatch(target) {
	    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
	    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	    dispatch.of = function(thiz, argumentz) {
	      return function(e1) {
	        try {
	          var e0 = e1.sourceEvent = d3.event;
	          e1.target = target;
	          d3.event = e1;
	          dispatch[e1.type].apply(thiz, argumentz);
	        } finally {
	          d3.event = e0;
	        }
	      };
	    };
	    return dispatch;
	  }
	  d3.requote = function(s) {
	    return s.replace(d3_requote_re, "\\$&");
	  };
	  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
	  var d3_subclass = {}.__proto__ ? function(object, prototype) {
	    object.__proto__ = prototype;
	  } : function(object, prototype) {
	    for (var property in prototype) object[property] = prototype[property];
	  };
	  function d3_selection(groups) {
	    d3_subclass(groups, d3_selectionPrototype);
	    return groups;
	  }
	  var d3_select = function(s, n) {
	    return n.querySelector(s);
	  }, d3_selectAll = function(s, n) {
	    return n.querySelectorAll(s);
	  }, d3_selectMatches = function(n, s) {
	    var d3_selectMatcher = n.matches || n[d3_vendorSymbol(n, "matchesSelector")];
	    d3_selectMatches = function(n, s) {
	      return d3_selectMatcher.call(n, s);
	    };
	    return d3_selectMatches(n, s);
	  };
	  if (typeof Sizzle === "function") {
	    d3_select = function(s, n) {
	      return Sizzle(s, n)[0] || null;
	    };
	    d3_selectAll = Sizzle;
	    d3_selectMatches = Sizzle.matchesSelector;
	  }
	  d3.selection = function() {
	    return d3.select(d3_document.documentElement);
	  };
	  var d3_selectionPrototype = d3.selection.prototype = [];
	  d3_selectionPrototype.select = function(selector) {
	    var subgroups = [], subgroup, subnode, group, node;
	    selector = d3_selection_selector(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = (group = this[j]).parentNode;
	      for (var i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
	          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_selector(selector) {
	    return typeof selector === "function" ? selector : function() {
	      return d3_select(selector, this);
	    };
	  }
	  d3_selectionPrototype.selectAll = function(selector) {
	    var subgroups = [], subgroup, node;
	    selector = d3_selection_selectorAll(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
	          subgroup.parentNode = node;
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_selectorAll(selector) {
	    return typeof selector === "function" ? selector : function() {
	      return d3_selectAll(selector, this);
	    };
	  }
	  var d3_nsXhtml = "http://www.w3.org/1999/xhtml";
	  var d3_nsPrefix = {
	    svg: "http://www.w3.org/2000/svg",
	    xhtml: d3_nsXhtml,
	    xlink: "http://www.w3.org/1999/xlink",
	    xml: "http://www.w3.org/XML/1998/namespace",
	    xmlns: "http://www.w3.org/2000/xmlns/"
	  };
	  d3.ns = {
	    prefix: d3_nsPrefix,
	    qualify: function(name) {
	      var i = name.indexOf(":"), prefix = name;
	      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
	      return d3_nsPrefix.hasOwnProperty(prefix) ? {
	        space: d3_nsPrefix[prefix],
	        local: name
	      } : name;
	    }
	  };
	  d3_selectionPrototype.attr = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") {
	        var node = this.node();
	        name = d3.ns.qualify(name);
	        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
	      }
	      for (value in name) this.each(d3_selection_attr(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_attr(name, value));
	  };
	  function d3_selection_attr(name, value) {
	    name = d3.ns.qualify(name);
	    function attrNull() {
	      this.removeAttribute(name);
	    }
	    function attrNullNS() {
	      this.removeAttributeNS(name.space, name.local);
	    }
	    function attrConstant() {
	      this.setAttribute(name, value);
	    }
	    function attrConstantNS() {
	      this.setAttributeNS(name.space, name.local, value);
	    }
	    function attrFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
	    }
	    function attrFunctionNS() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
	    }
	    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
	  }
	  function d3_collapse(s) {
	    return s.trim().replace(/\s+/g, " ");
	  }
	  d3_selectionPrototype.classed = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") {
	        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
	        if (value = node.classList) {
	          while (++i < n) if (!value.contains(name[i])) return false;
	        } else {
	          value = node.getAttribute("class");
	          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
	        }
	        return true;
	      }
	      for (value in name) this.each(d3_selection_classed(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_classed(name, value));
	  };
	  function d3_selection_classedRe(name) {
	    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
	  }
	  function d3_selection_classes(name) {
	    return (name + "").trim().split(/^|\s+/);
	  }
	  function d3_selection_classed(name, value) {
	    name = d3_selection_classes(name).map(d3_selection_classedName);
	    var n = name.length;
	    function classedConstant() {
	      var i = -1;
	      while (++i < n) name[i](this, value);
	    }
	    function classedFunction() {
	      var i = -1, x = value.apply(this, arguments);
	      while (++i < n) name[i](this, x);
	    }
	    return typeof value === "function" ? classedFunction : classedConstant;
	  }
	  function d3_selection_classedName(name) {
	    var re = d3_selection_classedRe(name);
	    return function(node, value) {
	      if (c = node.classList) return value ? c.add(name) : c.remove(name);
	      var c = node.getAttribute("class") || "";
	      if (value) {
	        re.lastIndex = 0;
	        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
	      } else {
	        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
	      }
	    };
	  }
	  d3_selectionPrototype.style = function(name, value, priority) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof name !== "string") {
	        if (n < 2) value = "";
	        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
	        return this;
	      }
	      if (n < 2) {
	        var node = this.node();
	        return d3_window(node).getComputedStyle(node, null).getPropertyValue(name);
	      }
	      priority = "";
	    }
	    return this.each(d3_selection_style(name, value, priority));
	  };
	  function d3_selection_style(name, value, priority) {
	    function styleNull() {
	      this.style.removeProperty(name);
	    }
	    function styleConstant() {
	      this.style.setProperty(name, value, priority);
	    }
	    function styleFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
	    }
	    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
	  }
	  d3_selectionPrototype.property = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") return this.node()[name];
	      for (value in name) this.each(d3_selection_property(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_property(name, value));
	  };
	  function d3_selection_property(name, value) {
	    function propertyNull() {
	      delete this[name];
	    }
	    function propertyConstant() {
	      this[name] = value;
	    }
	    function propertyFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) delete this[name]; else this[name] = x;
	    }
	    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
	  }
	  d3_selectionPrototype.text = function(value) {
	    return arguments.length ? this.each(typeof value === "function" ? function() {
	      var v = value.apply(this, arguments);
	      this.textContent = v == null ? "" : v;
	    } : value == null ? function() {
	      this.textContent = "";
	    } : function() {
	      this.textContent = value;
	    }) : this.node().textContent;
	  };
	  d3_selectionPrototype.html = function(value) {
	    return arguments.length ? this.each(typeof value === "function" ? function() {
	      var v = value.apply(this, arguments);
	      this.innerHTML = v == null ? "" : v;
	    } : value == null ? function() {
	      this.innerHTML = "";
	    } : function() {
	      this.innerHTML = value;
	    }) : this.node().innerHTML;
	  };
	  d3_selectionPrototype.append = function(name) {
	    name = d3_selection_creator(name);
	    return this.select(function() {
	      return this.appendChild(name.apply(this, arguments));
	    });
	  };
	  function d3_selection_creator(name) {
	    function create() {
	      var document = this.ownerDocument, namespace = this.namespaceURI;
	      return namespace === d3_nsXhtml && document.documentElement.namespaceURI === d3_nsXhtml ? document.createElement(name) : document.createElementNS(namespace, name);
	    }
	    function createNS() {
	      return this.ownerDocument.createElementNS(name.space, name.local);
	    }
	    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? createNS : create;
	  }
	  d3_selectionPrototype.insert = function(name, before) {
	    name = d3_selection_creator(name);
	    before = d3_selection_selector(before);
	    return this.select(function() {
	      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
	    });
	  };
	  d3_selectionPrototype.remove = function() {
	    return this.each(d3_selectionRemove);
	  };
	  function d3_selectionRemove() {
	    var parent = this.parentNode;
	    if (parent) parent.removeChild(this);
	  }
	  d3_selectionPrototype.data = function(value, key) {
	    var i = -1, n = this.length, group, node;
	    if (!arguments.length) {
	      value = new Array(n = (group = this[0]).length);
	      while (++i < n) {
	        if (node = group[i]) {
	          value[i] = node.__data__;
	        }
	      }
	      return value;
	    }
	    function bind(group, groupData) {
	      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
	      if (key) {
	        var nodeByKeyValue = new d3_Map(), keyValues = new Array(n), keyValue;
	        for (i = -1; ++i < n; ) {
	          if (node = group[i]) {
	            if (nodeByKeyValue.has(keyValue = key.call(node, node.__data__, i))) {
	              exitNodes[i] = node;
	            } else {
	              nodeByKeyValue.set(keyValue, node);
	            }
	            keyValues[i] = keyValue;
	          }
	        }
	        for (i = -1; ++i < m; ) {
	          if (!(node = nodeByKeyValue.get(keyValue = key.call(groupData, nodeData = groupData[i], i)))) {
	            enterNodes[i] = d3_selection_dataNode(nodeData);
	          } else if (node !== true) {
	            updateNodes[i] = node;
	            node.__data__ = nodeData;
	          }
	          nodeByKeyValue.set(keyValue, true);
	        }
	        for (i = -1; ++i < n; ) {
	          if (i in keyValues && nodeByKeyValue.get(keyValues[i]) !== true) {
	            exitNodes[i] = group[i];
	          }
	        }
	      } else {
	        for (i = -1; ++i < n0; ) {
	          node = group[i];
	          nodeData = groupData[i];
	          if (node) {
	            node.__data__ = nodeData;
	            updateNodes[i] = node;
	          } else {
	            enterNodes[i] = d3_selection_dataNode(nodeData);
	          }
	        }
	        for (;i < m; ++i) {
	          enterNodes[i] = d3_selection_dataNode(groupData[i]);
	        }
	        for (;i < n; ++i) {
	          exitNodes[i] = group[i];
	        }
	      }
	      enterNodes.update = updateNodes;
	      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
	      enter.push(enterNodes);
	      update.push(updateNodes);
	      exit.push(exitNodes);
	    }
	    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
	    if (typeof value === "function") {
	      while (++i < n) {
	        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
	      }
	    } else {
	      while (++i < n) {
	        bind(group = this[i], value);
	      }
	    }
	    update.enter = function() {
	      return enter;
	    };
	    update.exit = function() {
	      return exit;
	    };
	    return update;
	  };
	  function d3_selection_dataNode(data) {
	    return {
	      __data__: data
	    };
	  }
	  d3_selectionPrototype.datum = function(value) {
	    return arguments.length ? this.property("__data__", value) : this.property("__data__");
	  };
	  d3_selectionPrototype.filter = function(filter) {
	    var subgroups = [], subgroup, group, node;
	    if (typeof filter !== "function") filter = d3_selection_filter(filter);
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = (group = this[j]).parentNode;
	      for (var i = 0, n = group.length; i < n; i++) {
	        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
	          subgroup.push(node);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_filter(selector) {
	    return function() {
	      return d3_selectMatches(this, selector);
	    };
	  }
	  d3_selectionPrototype.order = function() {
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
	        if (node = group[i]) {
	          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
	          next = node;
	        }
	      }
	    }
	    return this;
	  };
	  d3_selectionPrototype.sort = function(comparator) {
	    comparator = d3_selection_sortComparator.apply(this, arguments);
	    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
	    return this.order();
	  };
	  function d3_selection_sortComparator(comparator) {
	    if (!arguments.length) comparator = d3_ascending;
	    return function(a, b) {
	      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
	    };
	  }
	  d3_selectionPrototype.each = function(callback) {
	    return d3_selection_each(this, function(node, i, j) {
	      callback.call(node, node.__data__, i, j);
	    });
	  };
	  function d3_selection_each(groups, callback) {
	    for (var j = 0, m = groups.length; j < m; j++) {
	      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
	        if (node = group[i]) callback(node, i, j);
	      }
	    }
	    return groups;
	  }
	  d3_selectionPrototype.call = function(callback) {
	    var args = d3_array(arguments);
	    callback.apply(args[0] = this, args);
	    return this;
	  };
	  d3_selectionPrototype.empty = function() {
	    return !this.node();
	  };
	  d3_selectionPrototype.node = function() {
	    for (var j = 0, m = this.length; j < m; j++) {
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        var node = group[i];
	        if (node) return node;
	      }
	    }
	    return null;
	  };
	  d3_selectionPrototype.size = function() {
	    var n = 0;
	    d3_selection_each(this, function() {
	      ++n;
	    });
	    return n;
	  };
	  function d3_selection_enter(selection) {
	    d3_subclass(selection, d3_selection_enterPrototype);
	    return selection;
	  }
	  var d3_selection_enterPrototype = [];
	  d3.selection.enter = d3_selection_enter;
	  d3.selection.enter.prototype = d3_selection_enterPrototype;
	  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
	  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
	  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
	  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
	  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
	  d3_selection_enterPrototype.select = function(selector) {
	    var subgroups = [], subgroup, subnode, upgroup, group, node;
	    for (var j = -1, m = this.length; ++j < m; ) {
	      upgroup = (group = this[j]).update;
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = group.parentNode;
	      for (var i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
	          subnode.__data__ = node.__data__;
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  d3_selection_enterPrototype.insert = function(name, before) {
	    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
	    return d3_selectionPrototype.insert.call(this, name, before);
	  };
	  function d3_selection_enterInsertBefore(enter) {
	    var i0, j0;
	    return function(d, i, j) {
	      var group = enter[j].update, n = group.length, node;
	      if (j != j0) j0 = j, i0 = 0;
	      if (i >= i0) i0 = i + 1;
	      while (!(node = group[i0]) && ++i0 < n) ;
	      return node;
	    };
	  }
	  d3.select = function(node) {
	    var group;
	    if (typeof node === "string") {
	      group = [ d3_select(node, d3_document) ];
	      group.parentNode = d3_document.documentElement;
	    } else {
	      group = [ node ];
	      group.parentNode = d3_documentElement(node);
	    }
	    return d3_selection([ group ]);
	  };
	  d3.selectAll = function(nodes) {
	    var group;
	    if (typeof nodes === "string") {
	      group = d3_array(d3_selectAll(nodes, d3_document));
	      group.parentNode = d3_document.documentElement;
	    } else {
	      group = d3_array(nodes);
	      group.parentNode = null;
	    }
	    return d3_selection([ group ]);
	  };
	  d3_selectionPrototype.on = function(type, listener, capture) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof type !== "string") {
	        if (n < 2) listener = false;
	        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
	        return this;
	      }
	      if (n < 2) return (n = this.node()["__on" + type]) && n._;
	      capture = false;
	    }
	    return this.each(d3_selection_on(type, listener, capture));
	  };
	  function d3_selection_on(type, listener, capture) {
	    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
	    if (i > 0) type = type.slice(0, i);
	    var filter = d3_selection_onFilters.get(type);
	    if (filter) type = filter, wrap = d3_selection_onFilter;
	    function onRemove() {
	      var l = this[name];
	      if (l) {
	        this.removeEventListener(type, l, l.$);
	        delete this[name];
	      }
	    }
	    function onAdd() {
	      var l = wrap(listener, d3_array(arguments));
	      onRemove.call(this);
	      this.addEventListener(type, this[name] = l, l.$ = capture);
	      l._ = listener;
	    }
	    function removeAll() {
	      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
	      for (var name in this) {
	        if (match = name.match(re)) {
	          var l = this[name];
	          this.removeEventListener(match[1], l, l.$);
	          delete this[name];
	        }
	      }
	    }
	    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
	  }
	  var d3_selection_onFilters = d3.map({
	    mouseenter: "mouseover",
	    mouseleave: "mouseout"
	  });
	  if (d3_document) {
	    d3_selection_onFilters.forEach(function(k) {
	      if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
	    });
	  }
	  function d3_selection_onListener(listener, argumentz) {
	    return function(e) {
	      var o = d3.event;
	      d3.event = e;
	      argumentz[0] = this.__data__;
	      try {
	        listener.apply(this, argumentz);
	      } finally {
	        d3.event = o;
	      }
	    };
	  }
	  function d3_selection_onFilter(listener, argumentz) {
	    var l = d3_selection_onListener(listener, argumentz);
	    return function(e) {
	      var target = this, related = e.relatedTarget;
	      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
	        l.call(target, e);
	      }
	    };
	  }
	  var d3_event_dragSelect, d3_event_dragId = 0;
	  function d3_event_dragSuppress(node) {
	    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window(node)).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
	    if (d3_event_dragSelect == null) {
	      d3_event_dragSelect = "onselectstart" in node ? false : d3_vendorSymbol(node.style, "userSelect");
	    }
	    if (d3_event_dragSelect) {
	      var style = d3_documentElement(node).style, select = style[d3_event_dragSelect];
	      style[d3_event_dragSelect] = "none";
	    }
	    return function(suppressClick) {
	      w.on(name, null);
	      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
	      if (suppressClick) {
	        var off = function() {
	          w.on(click, null);
	        };
	        w.on(click, function() {
	          d3_eventPreventDefault();
	          off();
	        }, true);
	        setTimeout(off, 0);
	      }
	    };
	  }
	  d3.mouse = function(container) {
	    return d3_mousePoint(container, d3_eventSource());
	  };
	  var d3_mouse_bug44083 = this.navigator && /WebKit/.test(this.navigator.userAgent) ? -1 : 0;
	  function d3_mousePoint(container, e) {
	    if (e.changedTouches) e = e.changedTouches[0];
	    var svg = container.ownerSVGElement || container;
	    if (svg.createSVGPoint) {
	      var point = svg.createSVGPoint();
	      if (d3_mouse_bug44083 < 0) {
	        var window = d3_window(container);
	        if (window.scrollX || window.scrollY) {
	          svg = d3.select("body").append("svg").style({
	            position: "absolute",
	            top: 0,
	            left: 0,
	            margin: 0,
	            padding: 0,
	            border: "none"
	          }, "important");
	          var ctm = svg[0][0].getScreenCTM();
	          d3_mouse_bug44083 = !(ctm.f || ctm.e);
	          svg.remove();
	        }
	      }
	      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
	      point.y = e.clientY;
	      point = point.matrixTransform(container.getScreenCTM().inverse());
	      return [ point.x, point.y ];
	    }
	    var rect = container.getBoundingClientRect();
	    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
	  }
	  d3.touch = function(container, touches, identifier) {
	    if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
	    if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
	      if ((touch = touches[i]).identifier === identifier) {
	        return d3_mousePoint(container, touch);
	      }
	    }
	  };
	  d3.behavior.drag = function() {
	    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, d3_window, "mousemove", "mouseup"), touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_identity, "touchmove", "touchend");
	    function drag() {
	      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
	    }
	    function dragstart(id, position, subject, move, end) {
	      return function() {
	        var that = this, target = d3.event.target.correspondingElement || d3.event.target, parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(), dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset, dragSubject = d3.select(subject(target)).on(move + dragName, moved).on(end + dragName, ended), dragRestore = d3_event_dragSuppress(target), position0 = position(parent, dragId);
	        if (origin) {
	          dragOffset = origin.apply(that, arguments);
	          dragOffset = [ dragOffset.x - position0[0], dragOffset.y - position0[1] ];
	        } else {
	          dragOffset = [ 0, 0 ];
	        }
	        dispatch({
	          type: "dragstart"
	        });
	        function moved() {
	          var position1 = position(parent, dragId), dx, dy;
	          if (!position1) return;
	          dx = position1[0] - position0[0];
	          dy = position1[1] - position0[1];
	          dragged |= dx | dy;
	          position0 = position1;
	          dispatch({
	            type: "drag",
	            x: position1[0] + dragOffset[0],
	            y: position1[1] + dragOffset[1],
	            dx: dx,
	            dy: dy
	          });
	        }
	        function ended() {
	          if (!position(parent, dragId)) return;
	          dragSubject.on(move + dragName, null).on(end + dragName, null);
	          dragRestore(dragged);
	          dispatch({
	            type: "dragend"
	          });
	        }
	      };
	    }
	    drag.origin = function(x) {
	      if (!arguments.length) return origin;
	      origin = x;
	      return drag;
	    };
	    return d3.rebind(drag, event, "on");
	  };
	  function d3_behavior_dragTouchId() {
	    return d3.event.changedTouches[0].identifier;
	  }
	  d3.touches = function(container, touches) {
	    if (arguments.length < 2) touches = d3_eventSource().touches;
	    return touches ? d3_array(touches).map(function(touch) {
	      var point = d3_mousePoint(container, touch);
	      point.identifier = touch.identifier;
	      return point;
	    }) : [];
	  };
	  var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;
	  function d3_sgn(x) {
	    return x > 0 ? 1 : x < 0 ? -1 : 0;
	  }
	  function d3_cross2d(a, b, c) {
	    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	  }
	  function d3_acos(x) {
	    return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
	  }
	  function d3_asin(x) {
	    return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
	  }
	  function d3_sinh(x) {
	    return ((x = Math.exp(x)) - 1 / x) / 2;
	  }
	  function d3_cosh(x) {
	    return ((x = Math.exp(x)) + 1 / x) / 2;
	  }
	  function d3_tanh(x) {
	    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
	  }
	  function d3_haversin(x) {
	    return (x = Math.sin(x / 2)) * x;
	  }
	  var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
	  d3.interpolateZoom = function(p0, p1) {
	    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
	    if (d2 < ε2) {
	      S = Math.log(w1 / w0) / ρ;
	      i = function(t) {
	        return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(ρ * t * S) ];
	      };
	    } else {
	      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
	      S = (r1 - r0) / ρ;
	      i = function(t) {
	        var s = t * S, coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
	        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(ρ * s + r0) ];
	      };
	    }
	    i.duration = S * 1e3;
	    return i;
	  };
	  d3.behavior.zoom = function() {
	    var view = {
	      x: 0,
	      y: 0,
	      k: 1
	    }, translate0, center0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, duration = 250, zooming = 0, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
	    if (!d3_behavior_zoomWheel) {
	      d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
	        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
	      }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
	        return d3.event.wheelDelta;
	      }, "mousewheel") : (d3_behavior_zoomDelta = function() {
	        return -d3.event.detail;
	      }, "MozMousePixelScroll");
	    }
	    function zoom(g) {
	      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
	    }
	    zoom.event = function(g) {
	      g.each(function() {
	        var dispatch = event.of(this, arguments), view1 = view;
	        if (d3_transitionInheritId) {
	          d3.select(this).transition().each("start.zoom", function() {
	            view = this.__chart__ || {
	              x: 0,
	              y: 0,
	              k: 1
	            };
	            zoomstarted(dispatch);
	          }).tween("zoom:zoom", function() {
	            var dx = size[0], dy = size[1], cx = center0 ? center0[0] : dx / 2, cy = center0 ? center0[1] : dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
	            return function(t) {
	              var l = i(t), k = dx / l[2];
	              this.__chart__ = view = {
	                x: cx - l[0] * k,
	                y: cy - l[1] * k,
	                k: k
	              };
	              zoomed(dispatch);
	            };
	          }).each("interrupt.zoom", function() {
	            zoomended(dispatch);
	          }).each("end.zoom", function() {
	            zoomended(dispatch);
	          });
	        } else {
	          this.__chart__ = view;
	          zoomstarted(dispatch);
	          zoomed(dispatch);
	          zoomended(dispatch);
	        }
	      });
	    };
	    zoom.translate = function(_) {
	      if (!arguments.length) return [ view.x, view.y ];
	      view = {
	        x: +_[0],
	        y: +_[1],
	        k: view.k
	      };
	      rescale();
	      return zoom;
	    };
	    zoom.scale = function(_) {
	      if (!arguments.length) return view.k;
	      view = {
	        x: view.x,
	        y: view.y,
	        k: null
	      };
	      scaleTo(+_);
	      rescale();
	      return zoom;
	    };
	    zoom.scaleExtent = function(_) {
	      if (!arguments.length) return scaleExtent;
	      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.center = function(_) {
	      if (!arguments.length) return center;
	      center = _ && [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.size = function(_) {
	      if (!arguments.length) return size;
	      size = _ && [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.duration = function(_) {
	      if (!arguments.length) return duration;
	      duration = +_;
	      return zoom;
	    };
	    zoom.x = function(z) {
	      if (!arguments.length) return x1;
	      x1 = z;
	      x0 = z.copy();
	      view = {
	        x: 0,
	        y: 0,
	        k: 1
	      };
	      return zoom;
	    };
	    zoom.y = function(z) {
	      if (!arguments.length) return y1;
	      y1 = z;
	      y0 = z.copy();
	      view = {
	        x: 0,
	        y: 0,
	        k: 1
	      };
	      return zoom;
	    };
	    function location(p) {
	      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
	    }
	    function point(l) {
	      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
	    }
	    function scaleTo(s) {
	      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
	    }
	    function translateTo(p, l) {
	      l = point(l);
	      view.x += p[0] - l[0];
	      view.y += p[1] - l[1];
	    }
	    function zoomTo(that, p, l, k) {
	      that.__chart__ = {
	        x: view.x,
	        y: view.y,
	        k: view.k
	      };
	      scaleTo(Math.pow(2, k));
	      translateTo(center0 = p, l);
	      that = d3.select(that);
	      if (duration > 0) that = that.transition().duration(duration);
	      that.call(zoom.event);
	    }
	    function rescale() {
	      if (x1) x1.domain(x0.range().map(function(x) {
	        return (x - view.x) / view.k;
	      }).map(x0.invert));
	      if (y1) y1.domain(y0.range().map(function(y) {
	        return (y - view.y) / view.k;
	      }).map(y0.invert));
	    }
	    function zoomstarted(dispatch) {
	      if (!zooming++) dispatch({
	        type: "zoomstart"
	      });
	    }
	    function zoomed(dispatch) {
	      rescale();
	      dispatch({
	        type: "zoom",
	        scale: view.k,
	        translate: [ view.x, view.y ]
	      });
	    }
	    function zoomended(dispatch) {
	      if (!--zooming) dispatch({
	        type: "zoomend"
	      }), center0 = null;
	    }
	    function mousedowned() {
	      var that = this, dispatch = event.of(that, arguments), dragged = 0, subject = d3.select(d3_window(that)).on(mousemove, moved).on(mouseup, ended), location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress(that);
	      d3_selection_interrupt.call(that);
	      zoomstarted(dispatch);
	      function moved() {
	        dragged = 1;
	        translateTo(d3.mouse(that), location0);
	        zoomed(dispatch);
	      }
	      function ended() {
	        subject.on(mousemove, null).on(mouseup, null);
	        dragRestore(dragged);
	        zoomended(dispatch);
	      }
	    }
	    function touchstarted() {
	      var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0, zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName, touchend = "touchend" + zoomName, targets = [], subject = d3.select(that), dragRestore = d3_event_dragSuppress(that);
	      started();
	      zoomstarted(dispatch);
	      subject.on(mousedown, null).on(touchstart, started);
	      function relocate() {
	        var touches = d3.touches(that);
	        scale0 = view.k;
	        touches.forEach(function(t) {
	          if (t.identifier in locations0) locations0[t.identifier] = location(t);
	        });
	        return touches;
	      }
	      function started() {
	        var target = d3.event.target;
	        d3.select(target).on(touchmove, moved).on(touchend, ended);
	        targets.push(target);
	        var changed = d3.event.changedTouches;
	        for (var i = 0, n = changed.length; i < n; ++i) {
	          locations0[changed[i].identifier] = null;
	        }
	        var touches = relocate(), now = Date.now();
	        if (touches.length === 1) {
	          if (now - touchtime < 500) {
	            var p = touches[0];
	            zoomTo(that, p, locations0[p.identifier], Math.floor(Math.log(view.k) / Math.LN2) + 1);
	            d3_eventPreventDefault();
	          }
	          touchtime = now;
	        } else if (touches.length > 1) {
	          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
	          distance0 = dx * dx + dy * dy;
	        }
	      }
	      function moved() {
	        var touches = d3.touches(that), p0, l0, p1, l1;
	        d3_selection_interrupt.call(that);
	        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
	          p1 = touches[i];
	          if (l1 = locations0[p1.identifier]) {
	            if (l0) break;
	            p0 = p1, l0 = l1;
	          }
	        }
	        if (l1) {
	          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
	          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
	          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
	          scaleTo(scale1 * scale0);
	        }
	        touchtime = null;
	        translateTo(p0, l0);
	        zoomed(dispatch);
	      }
	      function ended() {
	        if (d3.event.touches.length) {
	          var changed = d3.event.changedTouches;
	          for (var i = 0, n = changed.length; i < n; ++i) {
	            delete locations0[changed[i].identifier];
	          }
	          for (var identifier in locations0) {
	            return void relocate();
	          }
	        }
	        d3.selectAll(targets).on(zoomName, null);
	        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
	        dragRestore();
	        zoomended(dispatch);
	      }
	    }
	    function mousewheeled() {
	      var dispatch = event.of(this, arguments);
	      if (mousewheelTimer) clearTimeout(mousewheelTimer); else d3_selection_interrupt.call(this), 
	      translate0 = location(center0 = center || d3.mouse(this)), zoomstarted(dispatch);
	      mousewheelTimer = setTimeout(function() {
	        mousewheelTimer = null;
	        zoomended(dispatch);
	      }, 50);
	      d3_eventPreventDefault();
	      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
	      translateTo(center0, translate0);
	      zoomed(dispatch);
	    }
	    function dblclicked() {
	      var p = d3.mouse(this), k = Math.log(view.k) / Math.LN2;
	      zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
	    }
	    return d3.rebind(zoom, event, "on");
	  };
	  var d3_behavior_zoomInfinity = [ 0, Infinity ], d3_behavior_zoomDelta, d3_behavior_zoomWheel;
	  d3.color = d3_color;
	  function d3_color() {}
	  d3_color.prototype.toString = function() {
	    return this.rgb() + "";
	  };
	  d3.hsl = d3_hsl;
	  function d3_hsl(h, s, l) {
	    return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
	  }
	  var d3_hslPrototype = d3_hsl.prototype = new d3_color();
	  d3_hslPrototype.brighter = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_hsl(this.h, this.s, this.l / k);
	  };
	  d3_hslPrototype.darker = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_hsl(this.h, this.s, k * this.l);
	  };
	  d3_hslPrototype.rgb = function() {
	    return d3_hsl_rgb(this.h, this.s, this.l);
	  };
	  function d3_hsl_rgb(h, s, l) {
	    var m1, m2;
	    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
	    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
	    l = l < 0 ? 0 : l > 1 ? 1 : l;
	    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
	    m1 = 2 * l - m2;
	    function v(h) {
	      if (h > 360) h -= 360; else if (h < 0) h += 360;
	      if (h < 60) return m1 + (m2 - m1) * h / 60;
	      if (h < 180) return m2;
	      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
	      return m1;
	    }
	    function vv(h) {
	      return Math.round(v(h) * 255);
	    }
	    return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
	  }
	  d3.hcl = d3_hcl;
	  function d3_hcl(h, c, l) {
	    return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
	  }
	  var d3_hclPrototype = d3_hcl.prototype = new d3_color();
	  d3_hclPrototype.brighter = function(k) {
	    return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
	  };
	  d3_hclPrototype.darker = function(k) {
	    return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
	  };
	  d3_hclPrototype.rgb = function() {
	    return d3_hcl_lab(this.h, this.c, this.l).rgb();
	  };
	  function d3_hcl_lab(h, c, l) {
	    if (isNaN(h)) h = 0;
	    if (isNaN(c)) c = 0;
	    return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
	  }
	  d3.lab = d3_lab;
	  function d3_lab(l, a, b) {
	    return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.h, l.c, l.l) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
	  }
	  var d3_lab_K = 18;
	  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
	  var d3_labPrototype = d3_lab.prototype = new d3_color();
	  d3_labPrototype.brighter = function(k) {
	    return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
	  };
	  d3_labPrototype.darker = function(k) {
	    return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
	  };
	  d3_labPrototype.rgb = function() {
	    return d3_lab_rgb(this.l, this.a, this.b);
	  };
	  function d3_lab_rgb(l, a, b) {
	    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
	    x = d3_lab_xyz(x) * d3_lab_X;
	    y = d3_lab_xyz(y) * d3_lab_Y;
	    z = d3_lab_xyz(z) * d3_lab_Z;
	    return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
	  }
	  function d3_lab_hcl(l, a, b) {
	    return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
	  }
	  function d3_lab_xyz(x) {
	    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
	  }
	  function d3_xyz_lab(x) {
	    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
	  }
	  function d3_xyz_rgb(r) {
	    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
	  }
	  d3.rgb = d3_rgb;
	  function d3_rgb(r, g, b) {
	    return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
	  }
	  function d3_rgbNumber(value) {
	    return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
	  }
	  function d3_rgbString(value) {
	    return d3_rgbNumber(value) + "";
	  }
	  var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
	  d3_rgbPrototype.brighter = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    var r = this.r, g = this.g, b = this.b, i = 30;
	    if (!r && !g && !b) return new d3_rgb(i, i, i);
	    if (r && r < i) r = i;
	    if (g && g < i) g = i;
	    if (b && b < i) b = i;
	    return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
	  };
	  d3_rgbPrototype.darker = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_rgb(k * this.r, k * this.g, k * this.b);
	  };
	  d3_rgbPrototype.hsl = function() {
	    return d3_rgb_hsl(this.r, this.g, this.b);
	  };
	  d3_rgbPrototype.toString = function() {
	    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
	  };
	  function d3_rgb_hex(v) {
	    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
	  }
	  function d3_rgb_parse(format, rgb, hsl) {
	    var r = 0, g = 0, b = 0, m1, m2, color;
	    m1 = /([a-z]+)\((.*)\)/.exec(format = format.toLowerCase());
	    if (m1) {
	      m2 = m1[2].split(",");
	      switch (m1[1]) {
	       case "hsl":
	        {
	          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
	        }

	       case "rgb":
	        {
	          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
	        }
	      }
	    }
	    if (color = d3_rgb_names.get(format)) {
	      return rgb(color.r, color.g, color.b);
	    }
	    if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.slice(1), 16))) {
	      if (format.length === 4) {
	        r = (color & 3840) >> 4;
	        r = r >> 4 | r;
	        g = color & 240;
	        g = g >> 4 | g;
	        b = color & 15;
	        b = b << 4 | b;
	      } else if (format.length === 7) {
	        r = (color & 16711680) >> 16;
	        g = (color & 65280) >> 8;
	        b = color & 255;
	      }
	    }
	    return rgb(r, g, b);
	  }
	  function d3_rgb_hsl(r, g, b) {
	    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
	    if (d) {
	      s = l < .5 ? d / (max + min) : d / (2 - max - min);
	      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
	      h *= 60;
	    } else {
	      h = NaN;
	      s = l > 0 && l < 1 ? 0 : h;
	    }
	    return new d3_hsl(h, s, l);
	  }
	  function d3_rgb_lab(r, g, b) {
	    r = d3_rgb_xyz(r);
	    g = d3_rgb_xyz(g);
	    b = d3_rgb_xyz(b);
	    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
	    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
	  }
	  function d3_rgb_xyz(r) {
	    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
	  }
	  function d3_rgb_parseNumber(c) {
	    var f = parseFloat(c);
	    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
	  }
	  var d3_rgb_names = d3.map({
	    aliceblue: 15792383,
	    antiquewhite: 16444375,
	    aqua: 65535,
	    aquamarine: 8388564,
	    azure: 15794175,
	    beige: 16119260,
	    bisque: 16770244,
	    black: 0,
	    blanchedalmond: 16772045,
	    blue: 255,
	    blueviolet: 9055202,
	    brown: 10824234,
	    burlywood: 14596231,
	    cadetblue: 6266528,
	    chartreuse: 8388352,
	    chocolate: 13789470,
	    coral: 16744272,
	    cornflowerblue: 6591981,
	    cornsilk: 16775388,
	    crimson: 14423100,
	    cyan: 65535,
	    darkblue: 139,
	    darkcyan: 35723,
	    darkgoldenrod: 12092939,
	    darkgray: 11119017,
	    darkgreen: 25600,
	    darkgrey: 11119017,
	    darkkhaki: 12433259,
	    darkmagenta: 9109643,
	    darkolivegreen: 5597999,
	    darkorange: 16747520,
	    darkorchid: 10040012,
	    darkred: 9109504,
	    darksalmon: 15308410,
	    darkseagreen: 9419919,
	    darkslateblue: 4734347,
	    darkslategray: 3100495,
	    darkslategrey: 3100495,
	    darkturquoise: 52945,
	    darkviolet: 9699539,
	    deeppink: 16716947,
	    deepskyblue: 49151,
	    dimgray: 6908265,
	    dimgrey: 6908265,
	    dodgerblue: 2003199,
	    firebrick: 11674146,
	    floralwhite: 16775920,
	    forestgreen: 2263842,
	    fuchsia: 16711935,
	    gainsboro: 14474460,
	    ghostwhite: 16316671,
	    gold: 16766720,
	    goldenrod: 14329120,
	    gray: 8421504,
	    green: 32768,
	    greenyellow: 11403055,
	    grey: 8421504,
	    honeydew: 15794160,
	    hotpink: 16738740,
	    indianred: 13458524,
	    indigo: 4915330,
	    ivory: 16777200,
	    khaki: 15787660,
	    lavender: 15132410,
	    lavenderblush: 16773365,
	    lawngreen: 8190976,
	    lemonchiffon: 16775885,
	    lightblue: 11393254,
	    lightcoral: 15761536,
	    lightcyan: 14745599,
	    lightgoldenrodyellow: 16448210,
	    lightgray: 13882323,
	    lightgreen: 9498256,
	    lightgrey: 13882323,
	    lightpink: 16758465,
	    lightsalmon: 16752762,
	    lightseagreen: 2142890,
	    lightskyblue: 8900346,
	    lightslategray: 7833753,
	    lightslategrey: 7833753,
	    lightsteelblue: 11584734,
	    lightyellow: 16777184,
	    lime: 65280,
	    limegreen: 3329330,
	    linen: 16445670,
	    magenta: 16711935,
	    maroon: 8388608,
	    mediumaquamarine: 6737322,
	    mediumblue: 205,
	    mediumorchid: 12211667,
	    mediumpurple: 9662683,
	    mediumseagreen: 3978097,
	    mediumslateblue: 8087790,
	    mediumspringgreen: 64154,
	    mediumturquoise: 4772300,
	    mediumvioletred: 13047173,
	    midnightblue: 1644912,
	    mintcream: 16121850,
	    mistyrose: 16770273,
	    moccasin: 16770229,
	    navajowhite: 16768685,
	    navy: 128,
	    oldlace: 16643558,
	    olive: 8421376,
	    olivedrab: 7048739,
	    orange: 16753920,
	    orangered: 16729344,
	    orchid: 14315734,
	    palegoldenrod: 15657130,
	    palegreen: 10025880,
	    paleturquoise: 11529966,
	    palevioletred: 14381203,
	    papayawhip: 16773077,
	    peachpuff: 16767673,
	    peru: 13468991,
	    pink: 16761035,
	    plum: 14524637,
	    powderblue: 11591910,
	    purple: 8388736,
	    rebeccapurple: 6697881,
	    red: 16711680,
	    rosybrown: 12357519,
	    royalblue: 4286945,
	    saddlebrown: 9127187,
	    salmon: 16416882,
	    sandybrown: 16032864,
	    seagreen: 3050327,
	    seashell: 16774638,
	    sienna: 10506797,
	    silver: 12632256,
	    skyblue: 8900331,
	    slateblue: 6970061,
	    slategray: 7372944,
	    slategrey: 7372944,
	    snow: 16775930,
	    springgreen: 65407,
	    steelblue: 4620980,
	    tan: 13808780,
	    teal: 32896,
	    thistle: 14204888,
	    tomato: 16737095,
	    turquoise: 4251856,
	    violet: 15631086,
	    wheat: 16113331,
	    white: 16777215,
	    whitesmoke: 16119285,
	    yellow: 16776960,
	    yellowgreen: 10145074
	  });
	  d3_rgb_names.forEach(function(key, value) {
	    d3_rgb_names.set(key, d3_rgbNumber(value));
	  });
	  function d3_functor(v) {
	    return typeof v === "function" ? v : function() {
	      return v;
	    };
	  }
	  d3.functor = d3_functor;
	  d3.xhr = d3_xhrType(d3_identity);
	  function d3_xhrType(response) {
	    return function(url, mimeType, callback) {
	      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
	      mimeType = null;
	      return d3_xhr(url, mimeType, response, callback);
	    };
	  }
	  function d3_xhr(url, mimeType, response, callback) {
	    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
	    if (this.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
	    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
	      request.readyState > 3 && respond();
	    };
	    function respond() {
	      var status = request.status, result;
	      if (!status && d3_xhrHasResponse(request) || status >= 200 && status < 300 || status === 304) {
	        try {
	          result = response.call(xhr, request);
	        } catch (e) {
	          dispatch.error.call(xhr, e);
	          return;
	        }
	        dispatch.load.call(xhr, result);
	      } else {
	        dispatch.error.call(xhr, request);
	      }
	    }
	    request.onprogress = function(event) {
	      var o = d3.event;
	      d3.event = event;
	      try {
	        dispatch.progress.call(xhr, request);
	      } finally {
	        d3.event = o;
	      }
	    };
	    xhr.header = function(name, value) {
	      name = (name + "").toLowerCase();
	      if (arguments.length < 2) return headers[name];
	      if (value == null) delete headers[name]; else headers[name] = value + "";
	      return xhr;
	    };
	    xhr.mimeType = function(value) {
	      if (!arguments.length) return mimeType;
	      mimeType = value == null ? null : value + "";
	      return xhr;
	    };
	    xhr.responseType = function(value) {
	      if (!arguments.length) return responseType;
	      responseType = value;
	      return xhr;
	    };
	    xhr.response = function(value) {
	      response = value;
	      return xhr;
	    };
	    [ "get", "post" ].forEach(function(method) {
	      xhr[method] = function() {
	        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
	      };
	    });
	    xhr.send = function(method, data, callback) {
	      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
	      request.open(method, url, true);
	      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
	      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
	      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
	      if (responseType != null) request.responseType = responseType;
	      if (callback != null) xhr.on("error", callback).on("load", function(request) {
	        callback(null, request);
	      });
	      dispatch.beforesend.call(xhr, request);
	      request.send(data == null ? null : data);
	      return xhr;
	    };
	    xhr.abort = function() {
	      request.abort();
	      return xhr;
	    };
	    d3.rebind(xhr, dispatch, "on");
	    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
	  }
	  function d3_xhr_fixCallback(callback) {
	    return callback.length === 1 ? function(error, request) {
	      callback(error == null ? request : null);
	    } : callback;
	  }
	  function d3_xhrHasResponse(request) {
	    var type = request.responseType;
	    return type && type !== "text" ? request.response : request.responseText;
	  }
	  d3.dsv = function(delimiter, mimeType) {
	    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
	    function dsv(url, row, callback) {
	      if (arguments.length < 3) callback = row, row = null;
	      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
	      xhr.row = function(_) {
	        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
	      };
	      return xhr;
	    }
	    function response(request) {
	      return dsv.parse(request.responseText);
	    }
	    function typedResponse(f) {
	      return function(request) {
	        return dsv.parse(request.responseText, f);
	      };
	    }
	    dsv.parse = function(text, f) {
	      var o;
	      return dsv.parseRows(text, function(row, i) {
	        if (o) return o(row, i - 1);
	        var a = new Function("d", "return {" + row.map(function(name, i) {
	          return JSON.stringify(name) + ": d[" + i + "]";
	        }).join(",") + "}");
	        o = f ? function(row, i) {
	          return f(a(row), i);
	        } : a;
	      });
	    };
	    dsv.parseRows = function(text, f) {
	      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
	      function token() {
	        if (I >= N) return EOF;
	        if (eol) return eol = false, EOL;
	        var j = I;
	        if (text.charCodeAt(j) === 34) {
	          var i = j;
	          while (i++ < N) {
	            if (text.charCodeAt(i) === 34) {
	              if (text.charCodeAt(i + 1) !== 34) break;
	              ++i;
	            }
	          }
	          I = i + 2;
	          var c = text.charCodeAt(i + 1);
	          if (c === 13) {
	            eol = true;
	            if (text.charCodeAt(i + 2) === 10) ++I;
	          } else if (c === 10) {
	            eol = true;
	          }
	          return text.slice(j + 1, i).replace(/""/g, '"');
	        }
	        while (I < N) {
	          var c = text.charCodeAt(I++), k = 1;
	          if (c === 10) eol = true; else if (c === 13) {
	            eol = true;
	            if (text.charCodeAt(I) === 10) ++I, ++k;
	          } else if (c !== delimiterCode) continue;
	          return text.slice(j, I - k);
	        }
	        return text.slice(j);
	      }
	      while ((t = token()) !== EOF) {
	        var a = [];
	        while (t !== EOL && t !== EOF) {
	          a.push(t);
	          t = token();
	        }
	        if (f && (a = f(a, n++)) == null) continue;
	        rows.push(a);
	      }
	      return rows;
	    };
	    dsv.format = function(rows) {
	      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
	      var fieldSet = new d3_Set(), fields = [];
	      rows.forEach(function(row) {
	        for (var field in row) {
	          if (!fieldSet.has(field)) {
	            fields.push(fieldSet.add(field));
	          }
	        }
	      });
	      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
	        return fields.map(function(field) {
	          return formatValue(row[field]);
	        }).join(delimiter);
	      })).join("\n");
	    };
	    dsv.formatRows = function(rows) {
	      return rows.map(formatRow).join("\n");
	    };
	    function formatRow(row) {
	      return row.map(formatValue).join(delimiter);
	    }
	    function formatValue(text) {
	      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
	    }
	    return dsv;
	  };
	  d3.csv = d3.dsv(",", "text/csv");
	  d3.tsv = d3.dsv("	", "text/tab-separated-values");
	  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_frame = this[d3_vendorSymbol(this, "requestAnimationFrame")] || function(callback) {
	    setTimeout(callback, 17);
	  };
	  d3.timer = function() {
	    d3_timer.apply(this, arguments);
	  };
	  function d3_timer(callback, delay, then) {
	    var n = arguments.length;
	    if (n < 2) delay = 0;
	    if (n < 3) then = Date.now();
	    var time = then + delay, timer = {
	      c: callback,
	      t: time,
	      n: null
	    };
	    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
	    d3_timer_queueTail = timer;
	    if (!d3_timer_interval) {
	      d3_timer_timeout = clearTimeout(d3_timer_timeout);
	      d3_timer_interval = 1;
	      d3_timer_frame(d3_timer_step);
	    }
	    return timer;
	  }
	  function d3_timer_step() {
	    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
	    if (delay > 24) {
	      if (isFinite(delay)) {
	        clearTimeout(d3_timer_timeout);
	        d3_timer_timeout = setTimeout(d3_timer_step, delay);
	      }
	      d3_timer_interval = 0;
	    } else {
	      d3_timer_interval = 1;
	      d3_timer_frame(d3_timer_step);
	    }
	  }
	  d3.timer.flush = function() {
	    d3_timer_mark();
	    d3_timer_sweep();
	  };
	  function d3_timer_mark() {
	    var now = Date.now(), timer = d3_timer_queueHead;
	    while (timer) {
	      if (now >= timer.t && timer.c(now - timer.t)) timer.c = null;
	      timer = timer.n;
	    }
	    return now;
	  }
	  function d3_timer_sweep() {
	    var t0, t1 = d3_timer_queueHead, time = Infinity;
	    while (t1) {
	      if (t1.c) {
	        if (t1.t < time) time = t1.t;
	        t1 = (t0 = t1).n;
	      } else {
	        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
	      }
	    }
	    d3_timer_queueTail = t0;
	    return time;
	  }
	  function d3_format_precision(x, p) {
	    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
	  }
	  d3.round = function(x, n) {
	    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
	  };
	  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
	  d3.formatPrefix = function(value, precision) {
	    var i = 0;
	    if (value = +value) {
	      if (value < 0) value *= -1;
	      if (precision) value = d3.round(value, d3_format_precision(value, precision));
	      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
	      i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
	    }
	    return d3_formatPrefixes[8 + i / 3];
	  };
	  function d3_formatPrefix(d, i) {
	    var k = Math.pow(10, abs(8 - i) * 3);
	    return {
	      scale: i > 8 ? function(d) {
	        return d / k;
	      } : function(d) {
	        return d * k;
	      },
	      symbol: d
	    };
	  }
	  function d3_locale_numberFormat(locale) {
	    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping && locale_thousands ? function(value, width) {
	      var i = value.length, t = [], j = 0, g = locale_grouping[0], length = 0;
	      while (i > 0 && g > 0) {
	        if (length + g + 1 > width) g = Math.max(1, width - length);
	        t.push(value.substring(i -= g, i + g));
	        if ((length += g + 1) > width) break;
	        g = locale_grouping[j = (j + 1) % locale_grouping.length];
	      }
	      return t.reverse().join(locale_thousands);
	    } : d3_identity;
	    return function(specifier) {
	      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "-", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false, exponent = true;
	      if (precision) precision = +precision.substring(1);
	      if (zfill || fill === "0" && align === "=") {
	        zfill = fill = "0";
	        align = "=";
	      }
	      switch (type) {
	       case "n":
	        comma = true;
	        type = "g";
	        break;

	       case "%":
	        scale = 100;
	        suffix = "%";
	        type = "f";
	        break;

	       case "p":
	        scale = 100;
	        suffix = "%";
	        type = "r";
	        break;

	       case "b":
	       case "o":
	       case "x":
	       case "X":
	        if (symbol === "#") prefix = "0" + type.toLowerCase();

	       case "c":
	        exponent = false;

	       case "d":
	        integer = true;
	        precision = 0;
	        break;

	       case "s":
	        scale = -1;
	        type = "r";
	        break;
	      }
	      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
	      if (type == "r" && !precision) type = "g";
	      if (precision != null) {
	        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
	      }
	      type = d3_format_types.get(type) || d3_format_typeDefault;
	      var zcomma = zfill && comma;
	      return function(value) {
	        var fullSuffix = suffix;
	        if (integer && value % 1) return "";
	        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign === "-" ? "" : sign;
	        if (scale < 0) {
	          var unit = d3.formatPrefix(value, precision);
	          value = unit.scale(value);
	          fullSuffix = unit.symbol + suffix;
	        } else {
	          value *= scale;
	        }
	        value = type(value, precision);
	        var i = value.lastIndexOf("."), before, after;
	        if (i < 0) {
	          var j = exponent ? value.lastIndexOf("e") : -1;
	          if (j < 0) before = value, after = ""; else before = value.substring(0, j), after = value.substring(j);
	        } else {
	          before = value.substring(0, i);
	          after = locale_decimal + value.substring(i + 1);
	        }
	        if (!zfill && comma) before = formatGroup(before, Infinity);
	        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
	        if (zcomma) before = formatGroup(padding + before, padding.length ? width - after.length : Infinity);
	        negative += prefix;
	        value = before + after;
	        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
	      };
	    };
	  }
	  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
	  var d3_format_types = d3.map({
	    b: function(x) {
	      return x.toString(2);
	    },
	    c: function(x) {
	      return String.fromCharCode(x);
	    },
	    o: function(x) {
	      return x.toString(8);
	    },
	    x: function(x) {
	      return x.toString(16);
	    },
	    X: function(x) {
	      return x.toString(16).toUpperCase();
	    },
	    g: function(x, p) {
	      return x.toPrecision(p);
	    },
	    e: function(x, p) {
	      return x.toExponential(p);
	    },
	    f: function(x, p) {
	      return x.toFixed(p);
	    },
	    r: function(x, p) {
	      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
	    }
	  });
	  function d3_format_typeDefault(x) {
	    return x + "";
	  }
	  var d3_time = d3.time = {}, d3_date = Date;
	  function d3_date_utc() {
	    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
	  }
	  d3_date_utc.prototype = {
	    getDate: function() {
	      return this._.getUTCDate();
	    },
	    getDay: function() {
	      return this._.getUTCDay();
	    },
	    getFullYear: function() {
	      return this._.getUTCFullYear();
	    },
	    getHours: function() {
	      return this._.getUTCHours();
	    },
	    getMilliseconds: function() {
	      return this._.getUTCMilliseconds();
	    },
	    getMinutes: function() {
	      return this._.getUTCMinutes();
	    },
	    getMonth: function() {
	      return this._.getUTCMonth();
	    },
	    getSeconds: function() {
	      return this._.getUTCSeconds();
	    },
	    getTime: function() {
	      return this._.getTime();
	    },
	    getTimezoneOffset: function() {
	      return 0;
	    },
	    valueOf: function() {
	      return this._.valueOf();
	    },
	    setDate: function() {
	      d3_time_prototype.setUTCDate.apply(this._, arguments);
	    },
	    setDay: function() {
	      d3_time_prototype.setUTCDay.apply(this._, arguments);
	    },
	    setFullYear: function() {
	      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
	    },
	    setHours: function() {
	      d3_time_prototype.setUTCHours.apply(this._, arguments);
	    },
	    setMilliseconds: function() {
	      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
	    },
	    setMinutes: function() {
	      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
	    },
	    setMonth: function() {
	      d3_time_prototype.setUTCMonth.apply(this._, arguments);
	    },
	    setSeconds: function() {
	      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
	    },
	    setTime: function() {
	      d3_time_prototype.setTime.apply(this._, arguments);
	    }
	  };
	  var d3_time_prototype = Date.prototype;
	  function d3_time_interval(local, step, number) {
	    function round(date) {
	      var d0 = local(date), d1 = offset(d0, 1);
	      return date - d0 < d1 - date ? d0 : d1;
	    }
	    function ceil(date) {
	      step(date = local(new d3_date(date - 1)), 1);
	      return date;
	    }
	    function offset(date, k) {
	      step(date = new d3_date(+date), k);
	      return date;
	    }
	    function range(t0, t1, dt) {
	      var time = ceil(t0), times = [];
	      if (dt > 1) {
	        while (time < t1) {
	          if (!(number(time) % dt)) times.push(new Date(+time));
	          step(time, 1);
	        }
	      } else {
	        while (time < t1) times.push(new Date(+time)), step(time, 1);
	      }
	      return times;
	    }
	    function range_utc(t0, t1, dt) {
	      try {
	        d3_date = d3_date_utc;
	        var utc = new d3_date_utc();
	        utc._ = t0;
	        return range(utc, t1, dt);
	      } finally {
	        d3_date = Date;
	      }
	    }
	    local.floor = local;
	    local.round = round;
	    local.ceil = ceil;
	    local.offset = offset;
	    local.range = range;
	    var utc = local.utc = d3_time_interval_utc(local);
	    utc.floor = utc;
	    utc.round = d3_time_interval_utc(round);
	    utc.ceil = d3_time_interval_utc(ceil);
	    utc.offset = d3_time_interval_utc(offset);
	    utc.range = range_utc;
	    return local;
	  }
	  function d3_time_interval_utc(method) {
	    return function(date, k) {
	      try {
	        d3_date = d3_date_utc;
	        var utc = new d3_date_utc();
	        utc._ = date;
	        return method(utc, k)._;
	      } finally {
	        d3_date = Date;
	      }
	    };
	  }
	  d3_time.year = d3_time_interval(function(date) {
	    date = d3_time.day(date);
	    date.setMonth(0, 1);
	    return date;
	  }, function(date, offset) {
	    date.setFullYear(date.getFullYear() + offset);
	  }, function(date) {
	    return date.getFullYear();
	  });
	  d3_time.years = d3_time.year.range;
	  d3_time.years.utc = d3_time.year.utc.range;
	  d3_time.day = d3_time_interval(function(date) {
	    var day = new d3_date(2e3, 0);
	    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
	    return day;
	  }, function(date, offset) {
	    date.setDate(date.getDate() + offset);
	  }, function(date) {
	    return date.getDate() - 1;
	  });
	  d3_time.days = d3_time.day.range;
	  d3_time.days.utc = d3_time.day.utc.range;
	  d3_time.dayOfYear = function(date) {
	    var year = d3_time.year(date);
	    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
	  };
	  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
	    i = 7 - i;
	    var interval = d3_time[day] = d3_time_interval(function(date) {
	      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
	      return date;
	    }, function(date, offset) {
	      date.setDate(date.getDate() + Math.floor(offset) * 7);
	    }, function(date) {
	      var day = d3_time.year(date).getDay();
	      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
	    });
	    d3_time[day + "s"] = interval.range;
	    d3_time[day + "s"].utc = interval.utc.range;
	    d3_time[day + "OfYear"] = function(date) {
	      var day = d3_time.year(date).getDay();
	      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
	    };
	  });
	  d3_time.week = d3_time.sunday;
	  d3_time.weeks = d3_time.sunday.range;
	  d3_time.weeks.utc = d3_time.sunday.utc.range;
	  d3_time.weekOfYear = d3_time.sundayOfYear;
	  function d3_locale_timeFormat(locale) {
	    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
	    function d3_time_format(template) {
	      var n = template.length;
	      function format(date) {
	        var string = [], i = -1, j = 0, c, p, f;
	        while (++i < n) {
	          if (template.charCodeAt(i) === 37) {
	            string.push(template.slice(j, i));
	            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
	            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
	            string.push(c);
	            j = i + 1;
	          }
	        }
	        string.push(template.slice(j, i));
	        return string.join("");
	      }
	      format.parse = function(string) {
	        var d = {
	          y: 1900,
	          m: 0,
	          d: 1,
	          H: 0,
	          M: 0,
	          S: 0,
	          L: 0,
	          Z: null
	        }, i = d3_time_parse(d, template, string, 0);
	        if (i != string.length) return null;
	        if ("p" in d) d.H = d.H % 12 + d.p * 12;
	        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
	        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("W" in d || "U" in d) {
	          if (!("w" in d)) d.w = "W" in d ? 1 : 0;
	          date.setFullYear(d.y, 0, 1);
	          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
	        } else date.setFullYear(d.y, d.m, d.d);
	        date.setHours(d.H + (d.Z / 100 | 0), d.M + d.Z % 100, d.S, d.L);
	        return localZ ? date._ : date;
	      };
	      format.toString = function() {
	        return template;
	      };
	      return format;
	    }
	    function d3_time_parse(date, template, string, j) {
	      var c, p, t, i = 0, n = template.length, m = string.length;
	      while (i < n) {
	        if (j >= m) return -1;
	        c = template.charCodeAt(i++);
	        if (c === 37) {
	          t = template.charAt(i++);
	          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
	          if (!p || (j = p(date, string, j)) < 0) return -1;
	        } else if (c != string.charCodeAt(j++)) {
	          return -1;
	        }
	      }
	      return j;
	    }
	    d3_time_format.utc = function(template) {
	      var local = d3_time_format(template);
	      function format(date) {
	        try {
	          d3_date = d3_date_utc;
	          var utc = new d3_date();
	          utc._ = date;
	          return local(utc);
	        } finally {
	          d3_date = Date;
	        }
	      }
	      format.parse = function(string) {
	        try {
	          d3_date = d3_date_utc;
	          var date = local.parse(string);
	          return date && date._;
	        } finally {
	          d3_date = Date;
	        }
	      };
	      format.toString = local.toString;
	      return format;
	    };
	    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
	    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
	    locale_periods.forEach(function(p, i) {
	      d3_time_periodLookup.set(p.toLowerCase(), i);
	    });
	    var d3_time_formats = {
	      a: function(d) {
	        return locale_shortDays[d.getDay()];
	      },
	      A: function(d) {
	        return locale_days[d.getDay()];
	      },
	      b: function(d) {
	        return locale_shortMonths[d.getMonth()];
	      },
	      B: function(d) {
	        return locale_months[d.getMonth()];
	      },
	      c: d3_time_format(locale_dateTime),
	      d: function(d, p) {
	        return d3_time_formatPad(d.getDate(), p, 2);
	      },
	      e: function(d, p) {
	        return d3_time_formatPad(d.getDate(), p, 2);
	      },
	      H: function(d, p) {
	        return d3_time_formatPad(d.getHours(), p, 2);
	      },
	      I: function(d, p) {
	        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
	      },
	      j: function(d, p) {
	        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
	      },
	      L: function(d, p) {
	        return d3_time_formatPad(d.getMilliseconds(), p, 3);
	      },
	      m: function(d, p) {
	        return d3_time_formatPad(d.getMonth() + 1, p, 2);
	      },
	      M: function(d, p) {
	        return d3_time_formatPad(d.getMinutes(), p, 2);
	      },
	      p: function(d) {
	        return locale_periods[+(d.getHours() >= 12)];
	      },
	      S: function(d, p) {
	        return d3_time_formatPad(d.getSeconds(), p, 2);
	      },
	      U: function(d, p) {
	        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
	      },
	      w: function(d) {
	        return d.getDay();
	      },
	      W: function(d, p) {
	        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
	      },
	      x: d3_time_format(locale_date),
	      X: d3_time_format(locale_time),
	      y: function(d, p) {
	        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
	      },
	      Y: function(d, p) {
	        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
	      },
	      Z: d3_time_zone,
	      "%": function() {
	        return "%";
	      }
	    };
	    var d3_time_parsers = {
	      a: d3_time_parseWeekdayAbbrev,
	      A: d3_time_parseWeekday,
	      b: d3_time_parseMonthAbbrev,
	      B: d3_time_parseMonth,
	      c: d3_time_parseLocaleFull,
	      d: d3_time_parseDay,
	      e: d3_time_parseDay,
	      H: d3_time_parseHour24,
	      I: d3_time_parseHour24,
	      j: d3_time_parseDayOfYear,
	      L: d3_time_parseMilliseconds,
	      m: d3_time_parseMonthNumber,
	      M: d3_time_parseMinutes,
	      p: d3_time_parseAmPm,
	      S: d3_time_parseSeconds,
	      U: d3_time_parseWeekNumberSunday,
	      w: d3_time_parseWeekdayNumber,
	      W: d3_time_parseWeekNumberMonday,
	      x: d3_time_parseLocaleDate,
	      X: d3_time_parseLocaleTime,
	      y: d3_time_parseYear,
	      Y: d3_time_parseFullYear,
	      Z: d3_time_parseZone,
	      "%": d3_time_parseLiteralPercent
	    };
	    function d3_time_parseWeekdayAbbrev(date, string, i) {
	      d3_time_dayAbbrevRe.lastIndex = 0;
	      var n = d3_time_dayAbbrevRe.exec(string.slice(i));
	      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseWeekday(date, string, i) {
	      d3_time_dayRe.lastIndex = 0;
	      var n = d3_time_dayRe.exec(string.slice(i));
	      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseMonthAbbrev(date, string, i) {
	      d3_time_monthAbbrevRe.lastIndex = 0;
	      var n = d3_time_monthAbbrevRe.exec(string.slice(i));
	      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseMonth(date, string, i) {
	      d3_time_monthRe.lastIndex = 0;
	      var n = d3_time_monthRe.exec(string.slice(i));
	      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseLocaleFull(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
	    }
	    function d3_time_parseLocaleDate(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
	    }
	    function d3_time_parseLocaleTime(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
	    }
	    function d3_time_parseAmPm(date, string, i) {
	      var n = d3_time_periodLookup.get(string.slice(i, i += 2).toLowerCase());
	      return n == null ? -1 : (date.p = n, i);
	    }
	    return d3_time_format;
	  }
	  var d3_time_formatPads = {
	    "-": "",
	    _: " ",
	    "0": "0"
	  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
	  function d3_time_formatPad(value, fill, width) {
	    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
	    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
	  }
	  function d3_time_formatRe(names) {
	    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
	  }
	  function d3_time_formatLookup(names) {
	    var map = new d3_Map(), i = -1, n = names.length;
	    while (++i < n) map.set(names[i].toLowerCase(), i);
	    return map;
	  }
	  function d3_time_parseWeekdayNumber(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 1));
	    return n ? (date.w = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseWeekNumberSunday(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i));
	    return n ? (date.U = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseWeekNumberMonday(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i));
	    return n ? (date.W = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseFullYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 4));
	    return n ? (date.y = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
	  }
	  function d3_time_parseZone(date, string, i) {
	    return /^[+-]\d{4}$/.test(string = string.slice(i, i + 5)) ? (date.Z = -string, 
	    i + 5) : -1;
	  }
	  function d3_time_expandYear(d) {
	    return d + (d > 68 ? 1900 : 2e3);
	  }
	  function d3_time_parseMonthNumber(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
	  }
	  function d3_time_parseDay(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.d = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseDayOfYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
	    return n ? (date.j = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseHour24(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.H = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseMinutes(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.M = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseSeconds(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.S = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseMilliseconds(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
	    return n ? (date.L = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_zone(d) {
	    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = abs(z) / 60 | 0, zm = abs(z) % 60;
	    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
	  }
	  function d3_time_parseLiteralPercent(date, string, i) {
	    d3_time_percentRe.lastIndex = 0;
	    var n = d3_time_percentRe.exec(string.slice(i, i + 1));
	    return n ? i + n[0].length : -1;
	  }
	  function d3_time_formatMulti(formats) {
	    var n = formats.length, i = -1;
	    while (++i < n) formats[i][0] = this(formats[i][0]);
	    return function(date) {
	      var i = 0, f = formats[i];
	      while (!f[1](date)) f = formats[++i];
	      return f[0](date);
	    };
	  }
	  d3.locale = function(locale) {
	    return {
	      numberFormat: d3_locale_numberFormat(locale),
	      timeFormat: d3_locale_timeFormat(locale)
	    };
	  };
	  var d3_locale_enUS = d3.locale({
	    decimal: ".",
	    thousands: ",",
	    grouping: [ 3 ],
	    currency: [ "$", "" ],
	    dateTime: "%a %b %e %X %Y",
	    date: "%m/%d/%Y",
	    time: "%H:%M:%S",
	    periods: [ "AM", "PM" ],
	    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
	  });
	  d3.format = d3_locale_enUS.numberFormat;
	  d3.geo = {};
	  function d3_adder() {}
	  d3_adder.prototype = {
	    s: 0,
	    t: 0,
	    add: function(y) {
	      d3_adderSum(y, this.t, d3_adderTemp);
	      d3_adderSum(d3_adderTemp.s, this.s, this);
	      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
	    },
	    reset: function() {
	      this.s = this.t = 0;
	    },
	    valueOf: function() {
	      return this.s;
	    }
	  };
	  var d3_adderTemp = new d3_adder();
	  function d3_adderSum(a, b, o) {
	    var x = o.s = a + b, bv = x - a, av = x - bv;
	    o.t = a - av + (b - bv);
	  }
	  d3.geo.stream = function(object, listener) {
	    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
	      d3_geo_streamObjectType[object.type](object, listener);
	    } else {
	      d3_geo_streamGeometry(object, listener);
	    }
	  };
	  function d3_geo_streamGeometry(geometry, listener) {
	    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
	      d3_geo_streamGeometryType[geometry.type](geometry, listener);
	    }
	  }
	  var d3_geo_streamObjectType = {
	    Feature: function(feature, listener) {
	      d3_geo_streamGeometry(feature.geometry, listener);
	    },
	    FeatureCollection: function(object, listener) {
	      var features = object.features, i = -1, n = features.length;
	      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
	    }
	  };
	  var d3_geo_streamGeometryType = {
	    Sphere: function(object, listener) {
	      listener.sphere();
	    },
	    Point: function(object, listener) {
	      object = object.coordinates;
	      listener.point(object[0], object[1], object[2]);
	    },
	    MultiPoint: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
	    },
	    LineString: function(object, listener) {
	      d3_geo_streamLine(object.coordinates, listener, 0);
	    },
	    MultiLineString: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
	    },
	    Polygon: function(object, listener) {
	      d3_geo_streamPolygon(object.coordinates, listener);
	    },
	    MultiPolygon: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
	    },
	    GeometryCollection: function(object, listener) {
	      var geometries = object.geometries, i = -1, n = geometries.length;
	      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
	    }
	  };
	  function d3_geo_streamLine(coordinates, listener, closed) {
	    var i = -1, n = coordinates.length - closed, coordinate;
	    listener.lineStart();
	    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
	    listener.lineEnd();
	  }
	  function d3_geo_streamPolygon(coordinates, listener) {
	    var i = -1, n = coordinates.length;
	    listener.polygonStart();
	    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
	    listener.polygonEnd();
	  }
	  d3.geo.area = function(object) {
	    d3_geo_areaSum = 0;
	    d3.geo.stream(object, d3_geo_area);
	    return d3_geo_areaSum;
	  };
	  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
	  var d3_geo_area = {
	    sphere: function() {
	      d3_geo_areaSum += 4 * π;
	    },
	    point: d3_noop,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: function() {
	      d3_geo_areaRingSum.reset();
	      d3_geo_area.lineStart = d3_geo_areaRingStart;
	    },
	    polygonEnd: function() {
	      var area = 2 * d3_geo_areaRingSum;
	      d3_geo_areaSum += area < 0 ? 4 * π + area : area;
	      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
	    }
	  };
	  function d3_geo_areaRingStart() {
	    var λ00, φ00, λ0, cosφ0, sinφ0;
	    d3_geo_area.point = function(λ, φ) {
	      d3_geo_area.point = nextPoint;
	      λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
	      sinφ0 = Math.sin(φ);
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      φ = φ * d3_radians / 2 + π / 4;
	      var dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(adλ), v = k * sdλ * Math.sin(adλ);
	      d3_geo_areaRingSum.add(Math.atan2(v, u));
	      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
	    }
	    d3_geo_area.lineEnd = function() {
	      nextPoint(λ00, φ00);
	    };
	  }
	  function d3_geo_cartesian(spherical) {
	    var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
	    return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
	  }
	  function d3_geo_cartesianDot(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	  }
	  function d3_geo_cartesianCross(a, b) {
	    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
	  }
	  function d3_geo_cartesianAdd(a, b) {
	    a[0] += b[0];
	    a[1] += b[1];
	    a[2] += b[2];
	  }
	  function d3_geo_cartesianScale(vector, k) {
	    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
	  }
	  function d3_geo_cartesianNormalize(d) {
	    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
	    d[0] /= l;
	    d[1] /= l;
	    d[2] /= l;
	  }
	  function d3_geo_spherical(cartesian) {
	    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
	  }
	  function d3_geo_sphericalEqual(a, b) {
	    return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
	  }
	  d3.geo.bounds = function() {
	    var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
	    var bound = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        bound.point = ringPoint;
	        bound.lineStart = ringStart;
	        bound.lineEnd = ringEnd;
	        dλSum = 0;
	        d3_geo_area.polygonStart();
	      },
	      polygonEnd: function() {
	        d3_geo_area.polygonEnd();
	        bound.point = point;
	        bound.lineStart = lineStart;
	        bound.lineEnd = lineEnd;
	        if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
	        range[0] = λ0, range[1] = λ1;
	      }
	    };
	    function point(λ, φ) {
	      ranges.push(range = [ λ0 = λ, λ1 = λ ]);
	      if (φ < φ0) φ0 = φ;
	      if (φ > φ1) φ1 = φ;
	    }
	    function linePoint(λ, φ) {
	      var p = d3_geo_cartesian([ λ * d3_radians, φ * d3_radians ]);
	      if (p0) {
	        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
	        d3_geo_cartesianNormalize(inflection);
	        inflection = d3_geo_spherical(inflection);
	        var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
	        if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
	          var φi = inflection[1] * d3_degrees;
	          if (φi > φ1) φ1 = φi;
	        } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
	          var φi = -inflection[1] * d3_degrees;
	          if (φi < φ0) φ0 = φi;
	        } else {
	          if (φ < φ0) φ0 = φ;
	          if (φ > φ1) φ1 = φ;
	        }
	        if (antimeridian) {
	          if (λ < λ_) {
	            if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
	          } else {
	            if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
	          }
	        } else {
	          if (λ1 >= λ0) {
	            if (λ < λ0) λ0 = λ;
	            if (λ > λ1) λ1 = λ;
	          } else {
	            if (λ > λ_) {
	              if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
	            } else {
	              if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
	            }
	          }
	        }
	      } else {
	        point(λ, φ);
	      }
	      p0 = p, λ_ = λ;
	    }
	    function lineStart() {
	      bound.point = linePoint;
	    }
	    function lineEnd() {
	      range[0] = λ0, range[1] = λ1;
	      bound.point = point;
	      p0 = null;
	    }
	    function ringPoint(λ, φ) {
	      if (p0) {
	        var dλ = λ - λ_;
	        dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
	      } else λ__ = λ, φ__ = φ;
	      d3_geo_area.point(λ, φ);
	      linePoint(λ, φ);
	    }
	    function ringStart() {
	      d3_geo_area.lineStart();
	    }
	    function ringEnd() {
	      ringPoint(λ__, φ__);
	      d3_geo_area.lineEnd();
	      if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
	      range[0] = λ0, range[1] = λ1;
	      p0 = null;
	    }
	    function angle(λ0, λ1) {
	      return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
	    }
	    function compareRanges(a, b) {
	      return a[0] - b[0];
	    }
	    function withinRange(x, range) {
	      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
	    }
	    return function(feature) {
	      φ1 = λ1 = -(λ0 = φ0 = Infinity);
	      ranges = [];
	      d3.geo.stream(feature, bound);
	      var n = ranges.length;
	      if (n) {
	        ranges.sort(compareRanges);
	        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
	          b = ranges[i];
	          if (withinRange(b[0], a) || withinRange(b[1], a)) {
	            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
	            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
	          } else {
	            merged.push(a = b);
	          }
	        }
	        var best = -Infinity, dλ;
	        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
	          b = merged[i];
	          if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
	        }
	      }
	      ranges = range = null;
	      return λ0 === Infinity || φ0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ λ0, φ0 ], [ λ1, φ1 ] ];
	    };
	  }();
	  d3.geo.centroid = function(object) {
	    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
	    d3.geo.stream(object, d3_geo_centroid);
	    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
	    if (m < ε2) {
	      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
	      if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
	      m = x * x + y * y + z * z;
	      if (m < ε2) return [ NaN, NaN ];
	    }
	    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
	  };
	  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
	  var d3_geo_centroid = {
	    sphere: d3_noop,
	    point: d3_geo_centroidPoint,
	    lineStart: d3_geo_centroidLineStart,
	    lineEnd: d3_geo_centroidLineEnd,
	    polygonStart: function() {
	      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
	    }
	  };
	  function d3_geo_centroidPoint(λ, φ) {
	    λ *= d3_radians;
	    var cosφ = Math.cos(φ *= d3_radians);
	    d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
	  }
	  function d3_geo_centroidPointXYZ(x, y, z) {
	    ++d3_geo_centroidW0;
	    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
	    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
	    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
	  }
	  function d3_geo_centroidLineStart() {
	    var x0, y0, z0;
	    d3_geo_centroid.point = function(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians);
	      x0 = cosφ * Math.cos(λ);
	      y0 = cosφ * Math.sin(λ);
	      z0 = Math.sin(φ);
	      d3_geo_centroid.point = nextPoint;
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
	      d3_geo_centroidW1 += w;
	      d3_geo_centroidX1 += w * (x0 + (x0 = x));
	      d3_geo_centroidY1 += w * (y0 + (y0 = y));
	      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    }
	  }
	  function d3_geo_centroidLineEnd() {
	    d3_geo_centroid.point = d3_geo_centroidPoint;
	  }
	  function d3_geo_centroidRingStart() {
	    var λ00, φ00, x0, y0, z0;
	    d3_geo_centroid.point = function(λ, φ) {
	      λ00 = λ, φ00 = φ;
	      d3_geo_centroid.point = nextPoint;
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians);
	      x0 = cosφ * Math.cos(λ);
	      y0 = cosφ * Math.sin(λ);
	      z0 = Math.sin(φ);
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    };
	    d3_geo_centroid.lineEnd = function() {
	      nextPoint(λ00, φ00);
	      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
	      d3_geo_centroid.point = d3_geo_centroidPoint;
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
	      d3_geo_centroidX2 += v * cx;
	      d3_geo_centroidY2 += v * cy;
	      d3_geo_centroidZ2 += v * cz;
	      d3_geo_centroidW1 += w;
	      d3_geo_centroidX1 += w * (x0 + (x0 = x));
	      d3_geo_centroidY1 += w * (y0 + (y0 = y));
	      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    }
	  }
	  function d3_geo_compose(a, b) {
	    function compose(x, y) {
	      return x = a(x, y), b(x[0], x[1]);
	    }
	    if (a.invert && b.invert) compose.invert = function(x, y) {
	      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
	    };
	    return compose;
	  }
	  function d3_true() {
	    return true;
	  }
	  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
	    var subject = [], clip = [];
	    segments.forEach(function(segment) {
	      if ((n = segment.length - 1) <= 0) return;
	      var n, p0 = segment[0], p1 = segment[n];
	      if (d3_geo_sphericalEqual(p0, p1)) {
	        listener.lineStart();
	        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
	        listener.lineEnd();
	        return;
	      }
	      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
	      a.o = b;
	      subject.push(a);
	      clip.push(b);
	      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
	      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
	      a.o = b;
	      subject.push(a);
	      clip.push(b);
	    });
	    clip.sort(compare);
	    d3_geo_clipPolygonLinkCircular(subject);
	    d3_geo_clipPolygonLinkCircular(clip);
	    if (!subject.length) return;
	    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
	      clip[i].e = entry = !entry;
	    }
	    var start = subject[0], points, point;
	    while (1) {
	      var current = start, isSubject = true;
	      while (current.v) if ((current = current.n) === start) return;
	      points = current.z;
	      listener.lineStart();
	      do {
	        current.v = current.o.v = true;
	        if (current.e) {
	          if (isSubject) {
	            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
	          } else {
	            interpolate(current.x, current.n.x, 1, listener);
	          }
	          current = current.n;
	        } else {
	          if (isSubject) {
	            points = current.p.z;
	            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
	          } else {
	            interpolate(current.x, current.p.x, -1, listener);
	          }
	          current = current.p;
	        }
	        current = current.o;
	        points = current.z;
	        isSubject = !isSubject;
	      } while (!current.v);
	      listener.lineEnd();
	    }
	  }
	  function d3_geo_clipPolygonLinkCircular(array) {
	    if (!(n = array.length)) return;
	    var n, i = 0, a = array[0], b;
	    while (++i < n) {
	      a.n = b = array[i];
	      b.p = a;
	      a = b;
	    }
	    a.n = b = array[0];
	    b.p = a;
	  }
	  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
	    this.x = point;
	    this.z = points;
	    this.o = other;
	    this.e = entry;
	    this.v = false;
	    this.n = this.p = null;
	  }
	  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
	    return function(rotate, listener) {
	      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
	      var clip = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          clip.point = pointRing;
	          clip.lineStart = ringStart;
	          clip.lineEnd = ringEnd;
	          segments = [];
	          polygon = [];
	        },
	        polygonEnd: function() {
	          clip.point = point;
	          clip.lineStart = lineStart;
	          clip.lineEnd = lineEnd;
	          segments = d3.merge(segments);
	          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
	          if (segments.length) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
	          } else if (clipStartInside) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            listener.lineStart();
	            interpolate(null, null, 1, listener);
	            listener.lineEnd();
	          }
	          if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
	          segments = polygon = null;
	        },
	        sphere: function() {
	          listener.polygonStart();
	          listener.lineStart();
	          interpolate(null, null, 1, listener);
	          listener.lineEnd();
	          listener.polygonEnd();
	        }
	      };
	      function point(λ, φ) {
	        var point = rotate(λ, φ);
	        if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
	      }
	      function pointLine(λ, φ) {
	        var point = rotate(λ, φ);
	        line.point(point[0], point[1]);
	      }
	      function lineStart() {
	        clip.point = pointLine;
	        line.lineStart();
	      }
	      function lineEnd() {
	        clip.point = point;
	        line.lineEnd();
	      }
	      var segments;
	      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false, polygon, ring;
	      function pointRing(λ, φ) {
	        ring.push([ λ, φ ]);
	        var point = rotate(λ, φ);
	        ringListener.point(point[0], point[1]);
	      }
	      function ringStart() {
	        ringListener.lineStart();
	        ring = [];
	      }
	      function ringEnd() {
	        pointRing(ring[0][0], ring[0][1]);
	        ringListener.lineEnd();
	        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
	        ring.pop();
	        polygon.push(ring);
	        ring = null;
	        if (!n) return;
	        if (clean & 1) {
	          segment = ringSegments[0];
	          var n = segment.length - 1, i = -1, point;
	          if (n > 0) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            listener.lineStart();
	            while (++i < n) listener.point((point = segment[i])[0], point[1]);
	            listener.lineEnd();
	          }
	          return;
	        }
	        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
	        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
	      }
	      return clip;
	    };
	  }
	  function d3_geo_clipSegmentLength1(segment) {
	    return segment.length > 1;
	  }
	  function d3_geo_clipBufferListener() {
	    var lines = [], line;
	    return {
	      lineStart: function() {
	        lines.push(line = []);
	      },
	      point: function(λ, φ) {
	        line.push([ λ, φ ]);
	      },
	      lineEnd: d3_noop,
	      buffer: function() {
	        var buffer = lines;
	        lines = [];
	        line = null;
	        return buffer;
	      },
	      rejoin: function() {
	        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
	      }
	    };
	  }
	  function d3_geo_clipSort(a, b) {
	    return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
	  }
	  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -π, -π / 2 ]);
	  function d3_geo_clipAntimeridianLine(listener) {
	    var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
	    return {
	      lineStart: function() {
	        listener.lineStart();
	        clean = 1;
	      },
	      point: function(λ1, φ1) {
	        var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
	        if (abs(dλ - π) < ε) {
	          listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
	          listener.point(sλ0, φ0);
	          listener.lineEnd();
	          listener.lineStart();
	          listener.point(sλ1, φ0);
	          listener.point(λ1, φ0);
	          clean = 0;
	        } else if (sλ0 !== sλ1 && dλ >= π) {
	          if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
	          if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
	          φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
	          listener.point(sλ0, φ0);
	          listener.lineEnd();
	          listener.lineStart();
	          listener.point(sλ1, φ0);
	          clean = 0;
	        }
	        listener.point(λ0 = λ1, φ0 = φ1);
	        sλ0 = sλ1;
	      },
	      lineEnd: function() {
	        listener.lineEnd();
	        λ0 = φ0 = NaN;
	      },
	      clean: function() {
	        return 2 - clean;
	      }
	    };
	  }
	  function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
	    var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
	    return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
	  }
	  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
	    var φ;
	    if (from == null) {
	      φ = direction * halfπ;
	      listener.point(-π, φ);
	      listener.point(0, φ);
	      listener.point(π, φ);
	      listener.point(π, 0);
	      listener.point(π, -φ);
	      listener.point(0, -φ);
	      listener.point(-π, -φ);
	      listener.point(-π, 0);
	      listener.point(-π, φ);
	    } else if (abs(from[0] - to[0]) > ε) {
	      var s = from[0] < to[0] ? π : -π;
	      φ = direction * s / 2;
	      listener.point(-s, φ);
	      listener.point(0, φ);
	      listener.point(s, φ);
	    } else {
	      listener.point(to[0], to[1]);
	    }
	  }
	  function d3_geo_pointInPolygon(point, polygon) {
	    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
	    d3_geo_areaRingSum.reset();
	    for (var i = 0, n = polygon.length; i < n; ++i) {
	      var ring = polygon[i], m = ring.length;
	      if (!m) continue;
	      var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
	      while (true) {
	        if (j === m) j = 0;
	        point = ring[j];
	        var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, antimeridian = adλ > π, k = sinφ0 * sinφ;
	        d3_geo_areaRingSum.add(Math.atan2(k * sdλ * Math.sin(adλ), cosφ0 * cosφ + k * Math.cos(adλ)));
	        polarAngle += antimeridian ? dλ + sdλ * τ : dλ;
	        if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
	          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
	          d3_geo_cartesianNormalize(arc);
	          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
	          d3_geo_cartesianNormalize(intersection);
	          var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
	          if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
	            winding += antimeridian ^ dλ >= 0 ? 1 : -1;
	          }
	        }
	        if (!j++) break;
	        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
	      }
	    }
	    return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
	  }
	  function d3_geo_clipCircle(radius) {
	    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
	    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -π, radius - π ]);
	    function visible(λ, φ) {
	      return Math.cos(λ) * Math.cos(φ) > cr;
	    }
	    function clipLine(listener) {
	      var point0, c0, v0, v00, clean;
	      return {
	        lineStart: function() {
	          v00 = v0 = false;
	          clean = 1;
	        },
	        point: function(λ, φ) {
	          var point1 = [ λ, φ ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
	          if (!point0 && (v00 = v0 = v)) listener.lineStart();
	          if (v !== v0) {
	            point2 = intersect(point0, point1);
	            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
	              point1[0] += ε;
	              point1[1] += ε;
	              v = visible(point1[0], point1[1]);
	            }
	          }
	          if (v !== v0) {
	            clean = 0;
	            if (v) {
	              listener.lineStart();
	              point2 = intersect(point1, point0);
	              listener.point(point2[0], point2[1]);
	            } else {
	              point2 = intersect(point0, point1);
	              listener.point(point2[0], point2[1]);
	              listener.lineEnd();
	            }
	            point0 = point2;
	          } else if (notHemisphere && point0 && smallRadius ^ v) {
	            var t;
	            if (!(c & c0) && (t = intersect(point1, point0, true))) {
	              clean = 0;
	              if (smallRadius) {
	                listener.lineStart();
	                listener.point(t[0][0], t[0][1]);
	                listener.point(t[1][0], t[1][1]);
	                listener.lineEnd();
	              } else {
	                listener.point(t[1][0], t[1][1]);
	                listener.lineEnd();
	                listener.lineStart();
	                listener.point(t[0][0], t[0][1]);
	              }
	            }
	          }
	          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
	            listener.point(point1[0], point1[1]);
	          }
	          point0 = point1, v0 = v, c0 = c;
	        },
	        lineEnd: function() {
	          if (v0) listener.lineEnd();
	          point0 = null;
	        },
	        clean: function() {
	          return clean | (v00 && v0) << 1;
	        }
	      };
	    }
	    function intersect(a, b, two) {
	      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
	      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
	      if (!determinant) return !two && a;
	      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
	      d3_geo_cartesianAdd(A, B);
	      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
	      if (t2 < 0) return;
	      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
	      d3_geo_cartesianAdd(q, A);
	      q = d3_geo_spherical(q);
	      if (!two) return q;
	      var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
	      if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
	      var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
	      if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
	      if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
	        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
	        d3_geo_cartesianAdd(q1, A);
	        return [ q, d3_geo_spherical(q1) ];
	      }
	    }
	    function code(λ, φ) {
	      var r = smallRadius ? radius : π - radius, code = 0;
	      if (λ < -r) code |= 1; else if (λ > r) code |= 2;
	      if (φ < -r) code |= 4; else if (φ > r) code |= 8;
	      return code;
	    }
	  }
	  function d3_geom_clipLine(x0, y0, x1, y1) {
	    return function(line) {
	      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
	      r = x0 - ax;
	      if (!dx && r > 0) return;
	      r /= dx;
	      if (dx < 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      } else if (dx > 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      }
	      r = x1 - ax;
	      if (!dx && r < 0) return;
	      r /= dx;
	      if (dx < 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      } else if (dx > 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      }
	      r = y0 - ay;
	      if (!dy && r > 0) return;
	      r /= dy;
	      if (dy < 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      } else if (dy > 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      }
	      r = y1 - ay;
	      if (!dy && r < 0) return;
	      r /= dy;
	      if (dy < 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      } else if (dy > 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      }
	      if (t0 > 0) line.a = {
	        x: ax + t0 * dx,
	        y: ay + t0 * dy
	      };
	      if (t1 < 1) line.b = {
	        x: ax + t1 * dx,
	        y: ay + t1 * dy
	      };
	      return line;
	    };
	  }
	  var d3_geo_clipExtentMAX = 1e9;
	  d3.geo.clipExtent = function() {
	    var x0, y0, x1, y1, stream, clip, clipExtent = {
	      stream: function(output) {
	        if (stream) stream.valid = false;
	        stream = clip(output);
	        stream.valid = true;
	        return stream;
	      },
	      extent: function(_) {
	        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
	        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
	        if (stream) stream.valid = false, stream = null;
	        return clipExtent;
	      }
	    };
	    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
	  };
	  function d3_geo_clipExtent(x0, y0, x1, y1) {
	    return function(listener) {
	      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
	      var clip = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          listener = bufferListener;
	          segments = [];
	          polygon = [];
	          clean = true;
	        },
	        polygonEnd: function() {
	          listener = listener_;
	          segments = d3.merge(segments);
	          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
	          if (inside || visible) {
	            listener.polygonStart();
	            if (inside) {
	              listener.lineStart();
	              interpolate(null, null, 1, listener);
	              listener.lineEnd();
	            }
	            if (visible) {
	              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
	            }
	            listener.polygonEnd();
	          }
	          segments = polygon = ring = null;
	        }
	      };
	      function insidePolygon(p) {
	        var wn = 0, n = polygon.length, y = p[1];
	        for (var i = 0; i < n; ++i) {
	          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
	            b = v[j];
	            if (a[1] <= y) {
	              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
	            } else {
	              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
	            }
	            a = b;
	          }
	        }
	        return wn !== 0;
	      }
	      function interpolate(from, to, direction, listener) {
	        var a = 0, a1 = 0;
	        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
	          do {
	            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
	          } while ((a = (a + direction + 4) % 4) !== a1);
	        } else {
	          listener.point(to[0], to[1]);
	        }
	      }
	      function pointVisible(x, y) {
	        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
	      }
	      function point(x, y) {
	        if (pointVisible(x, y)) listener.point(x, y);
	      }
	      var x__, y__, v__, x_, y_, v_, first, clean;
	      function lineStart() {
	        clip.point = linePoint;
	        if (polygon) polygon.push(ring = []);
	        first = true;
	        v_ = false;
	        x_ = y_ = NaN;
	      }
	      function lineEnd() {
	        if (segments) {
	          linePoint(x__, y__);
	          if (v__ && v_) bufferListener.rejoin();
	          segments.push(bufferListener.buffer());
	        }
	        clip.point = point;
	        if (v_) listener.lineEnd();
	      }
	      function linePoint(x, y) {
	        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
	        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
	        var v = pointVisible(x, y);
	        if (polygon) ring.push([ x, y ]);
	        if (first) {
	          x__ = x, y__ = y, v__ = v;
	          first = false;
	          if (v) {
	            listener.lineStart();
	            listener.point(x, y);
	          }
	        } else {
	          if (v && v_) listener.point(x, y); else {
	            var l = {
	              a: {
	                x: x_,
	                y: y_
	              },
	              b: {
	                x: x,
	                y: y
	              }
	            };
	            if (clipLine(l)) {
	              if (!v_) {
	                listener.lineStart();
	                listener.point(l.a.x, l.a.y);
	              }
	              listener.point(l.b.x, l.b.y);
	              if (!v) listener.lineEnd();
	              clean = false;
	            } else if (v) {
	              listener.lineStart();
	              listener.point(x, y);
	              clean = false;
	            }
	          }
	        }
	        x_ = x, y_ = y, v_ = v;
	      }
	      return clip;
	    };
	    function corner(p, direction) {
	      return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
	    }
	    function compare(a, b) {
	      return comparePoints(a.x, b.x);
	    }
	    function comparePoints(a, b) {
	      var ca = corner(a, 1), cb = corner(b, 1);
	      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
	    }
	  }
	  function d3_geo_conic(projectAt) {
	    var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
	    p.parallels = function(_) {
	      if (!arguments.length) return [ φ0 / π * 180, φ1 / π * 180 ];
	      return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
	    };
	    return p;
	  }
	  function d3_geo_conicEqualArea(φ0, φ1) {
	    var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
	    function forward(λ, φ) {
	      var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
	      return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = ρ0 - y;
	      return [ Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
	    };
	    return forward;
	  }
	  (d3.geo.conicEqualArea = function() {
	    return d3_geo_conic(d3_geo_conicEqualArea);
	  }).raw = d3_geo_conicEqualArea;
	  d3.geo.albers = function() {
	    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
	  };
	  d3.geo.albersUsa = function() {
	    var lower48 = d3.geo.albers();
	    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
	    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
	    var point, pointStream = {
	      point: function(x, y) {
	        point = [ x, y ];
	      }
	    }, lower48Point, alaskaPoint, hawaiiPoint;
	    function albersUsa(coordinates) {
	      var x = coordinates[0], y = coordinates[1];
	      point = null;
	      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
	      return point;
	    }
	    albersUsa.invert = function(coordinates) {
	      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
	      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
	    };
	    albersUsa.stream = function(stream) {
	      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
	      return {
	        point: function(x, y) {
	          lower48Stream.point(x, y);
	          alaskaStream.point(x, y);
	          hawaiiStream.point(x, y);
	        },
	        sphere: function() {
	          lower48Stream.sphere();
	          alaskaStream.sphere();
	          hawaiiStream.sphere();
	        },
	        lineStart: function() {
	          lower48Stream.lineStart();
	          alaskaStream.lineStart();
	          hawaiiStream.lineStart();
	        },
	        lineEnd: function() {
	          lower48Stream.lineEnd();
	          alaskaStream.lineEnd();
	          hawaiiStream.lineEnd();
	        },
	        polygonStart: function() {
	          lower48Stream.polygonStart();
	          alaskaStream.polygonStart();
	          hawaiiStream.polygonStart();
	        },
	        polygonEnd: function() {
	          lower48Stream.polygonEnd();
	          alaskaStream.polygonEnd();
	          hawaiiStream.polygonEnd();
	        }
	      };
	    };
	    albersUsa.precision = function(_) {
	      if (!arguments.length) return lower48.precision();
	      lower48.precision(_);
	      alaska.precision(_);
	      hawaii.precision(_);
	      return albersUsa;
	    };
	    albersUsa.scale = function(_) {
	      if (!arguments.length) return lower48.scale();
	      lower48.scale(_);
	      alaska.scale(_ * .35);
	      hawaii.scale(_);
	      return albersUsa.translate(lower48.translate());
	    };
	    albersUsa.translate = function(_) {
	      if (!arguments.length) return lower48.translate();
	      var k = lower48.scale(), x = +_[0], y = +_[1];
	      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
	      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ε, y + .12 * k + ε ], [ x - .214 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
	      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ε, y + .166 * k + ε ], [ x - .115 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
	      return albersUsa;
	    };
	    return albersUsa.scale(1070);
	  };
	  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
	    point: d3_noop,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: function() {
	      d3_geo_pathAreaPolygon = 0;
	      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
	      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
	    }
	  };
	  function d3_geo_pathAreaRingStart() {
	    var x00, y00, x0, y0;
	    d3_geo_pathArea.point = function(x, y) {
	      d3_geo_pathArea.point = nextPoint;
	      x00 = x0 = x, y00 = y0 = y;
	    };
	    function nextPoint(x, y) {
	      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
	      x0 = x, y0 = y;
	    }
	    d3_geo_pathArea.lineEnd = function() {
	      nextPoint(x00, y00);
	    };
	  }
	  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
	  var d3_geo_pathBounds = {
	    point: d3_geo_pathBoundsPoint,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: d3_noop,
	    polygonEnd: d3_noop
	  };
	  function d3_geo_pathBoundsPoint(x, y) {
	    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
	    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
	    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
	    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
	  }
	  function d3_geo_pathBuffer() {
	    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
	    var stream = {
	      point: point,
	      lineStart: function() {
	        stream.point = pointLineStart;
	      },
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        stream.lineEnd = lineEndPolygon;
	      },
	      polygonEnd: function() {
	        stream.lineEnd = lineEnd;
	        stream.point = point;
	      },
	      pointRadius: function(_) {
	        pointCircle = d3_geo_pathBufferCircle(_);
	        return stream;
	      },
	      result: function() {
	        if (buffer.length) {
	          var result = buffer.join("");
	          buffer = [];
	          return result;
	        }
	      }
	    };
	    function point(x, y) {
	      buffer.push("M", x, ",", y, pointCircle);
	    }
	    function pointLineStart(x, y) {
	      buffer.push("M", x, ",", y);
	      stream.point = pointLine;
	    }
	    function pointLine(x, y) {
	      buffer.push("L", x, ",", y);
	    }
	    function lineEnd() {
	      stream.point = point;
	    }
	    function lineEndPolygon() {
	      buffer.push("Z");
	    }
	    return stream;
	  }
	  function d3_geo_pathBufferCircle(radius) {
	    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
	  }
	  var d3_geo_pathCentroid = {
	    point: d3_geo_pathCentroidPoint,
	    lineStart: d3_geo_pathCentroidLineStart,
	    lineEnd: d3_geo_pathCentroidLineEnd,
	    polygonStart: function() {
	      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
	      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
	      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
	    }
	  };
	  function d3_geo_pathCentroidPoint(x, y) {
	    d3_geo_centroidX0 += x;
	    d3_geo_centroidY0 += y;
	    ++d3_geo_centroidZ0;
	  }
	  function d3_geo_pathCentroidLineStart() {
	    var x0, y0;
	    d3_geo_pathCentroid.point = function(x, y) {
	      d3_geo_pathCentroid.point = nextPoint;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    };
	    function nextPoint(x, y) {
	      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
	      d3_geo_centroidX1 += z * (x0 + x) / 2;
	      d3_geo_centroidY1 += z * (y0 + y) / 2;
	      d3_geo_centroidZ1 += z;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    }
	  }
	  function d3_geo_pathCentroidLineEnd() {
	    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
	  }
	  function d3_geo_pathCentroidRingStart() {
	    var x00, y00, x0, y0;
	    d3_geo_pathCentroid.point = function(x, y) {
	      d3_geo_pathCentroid.point = nextPoint;
	      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
	    };
	    function nextPoint(x, y) {
	      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
	      d3_geo_centroidX1 += z * (x0 + x) / 2;
	      d3_geo_centroidY1 += z * (y0 + y) / 2;
	      d3_geo_centroidZ1 += z;
	      z = y0 * x - x0 * y;
	      d3_geo_centroidX2 += z * (x0 + x);
	      d3_geo_centroidY2 += z * (y0 + y);
	      d3_geo_centroidZ2 += z * 3;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    }
	    d3_geo_pathCentroid.lineEnd = function() {
	      nextPoint(x00, y00);
	    };
	  }
	  function d3_geo_pathContext(context) {
	    var pointRadius = 4.5;
	    var stream = {
	      point: point,
	      lineStart: function() {
	        stream.point = pointLineStart;
	      },
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        stream.lineEnd = lineEndPolygon;
	      },
	      polygonEnd: function() {
	        stream.lineEnd = lineEnd;
	        stream.point = point;
	      },
	      pointRadius: function(_) {
	        pointRadius = _;
	        return stream;
	      },
	      result: d3_noop
	    };
	    function point(x, y) {
	      context.moveTo(x + pointRadius, y);
	      context.arc(x, y, pointRadius, 0, τ);
	    }
	    function pointLineStart(x, y) {
	      context.moveTo(x, y);
	      stream.point = pointLine;
	    }
	    function pointLine(x, y) {
	      context.lineTo(x, y);
	    }
	    function lineEnd() {
	      stream.point = point;
	    }
	    function lineEndPolygon() {
	      context.closePath();
	    }
	    return stream;
	  }
	  function d3_geo_resample(project) {
	    var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
	    function resample(stream) {
	      return (maxDepth ? resampleRecursive : resampleNone)(stream);
	    }
	    function resampleNone(stream) {
	      return d3_geo_transformPoint(stream, function(x, y) {
	        x = project(x, y);
	        stream.point(x[0], x[1]);
	      });
	    }
	    function resampleRecursive(stream) {
	      var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
	      var resample = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          stream.polygonStart();
	          resample.lineStart = ringStart;
	        },
	        polygonEnd: function() {
	          stream.polygonEnd();
	          resample.lineStart = lineStart;
	        }
	      };
	      function point(x, y) {
	        x = project(x, y);
	        stream.point(x[0], x[1]);
	      }
	      function lineStart() {
	        x0 = NaN;
	        resample.point = linePoint;
	        stream.lineStart();
	      }
	      function linePoint(λ, φ) {
	        var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
	        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
	        stream.point(x0, y0);
	      }
	      function lineEnd() {
	        resample.point = point;
	        stream.lineEnd();
	      }
	      function ringStart() {
	        lineStart();
	        resample.point = ringPoint;
	        resample.lineEnd = ringEnd;
	      }
	      function ringPoint(λ, φ) {
	        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
	        resample.point = linePoint;
	      }
	      function ringEnd() {
	        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
	        resample.lineEnd = lineEnd;
	        lineEnd();
	      }
	      return resample;
	    }
	    function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
	      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
	      if (d2 > 4 * δ2 && depth--) {
	        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
	        if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
	          resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
	          stream.point(x2, y2);
	          resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
	        }
	      }
	    }
	    resample.precision = function(_) {
	      if (!arguments.length) return Math.sqrt(δ2);
	      maxDepth = (δ2 = _ * _) > 0 && 16;
	      return resample;
	    };
	    return resample;
	  }
	  d3.geo.path = function() {
	    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
	    function path(object) {
	      if (object) {
	        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
	        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
	        d3.geo.stream(object, cacheStream);
	      }
	      return contextStream.result();
	    }
	    path.area = function(object) {
	      d3_geo_pathAreaSum = 0;
	      d3.geo.stream(object, projectStream(d3_geo_pathArea));
	      return d3_geo_pathAreaSum;
	    };
	    path.centroid = function(object) {
	      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
	      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
	      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
	    };
	    path.bounds = function(object) {
	      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
	      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
	      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
	    };
	    path.projection = function(_) {
	      if (!arguments.length) return projection;
	      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
	      return reset();
	    };
	    path.context = function(_) {
	      if (!arguments.length) return context;
	      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
	      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
	      return reset();
	    };
	    path.pointRadius = function(_) {
	      if (!arguments.length) return pointRadius;
	      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
	      return path;
	    };
	    function reset() {
	      cacheStream = null;
	      return path;
	    }
	    return path.projection(d3.geo.albersUsa()).context(null);
	  };
	  function d3_geo_pathProjectStream(project) {
	    var resample = d3_geo_resample(function(x, y) {
	      return project([ x * d3_degrees, y * d3_degrees ]);
	    });
	    return function(stream) {
	      return d3_geo_projectionRadians(resample(stream));
	    };
	  }
	  d3.geo.transform = function(methods) {
	    return {
	      stream: function(stream) {
	        var transform = new d3_geo_transform(stream);
	        for (var k in methods) transform[k] = methods[k];
	        return transform;
	      }
	    };
	  };
	  function d3_geo_transform(stream) {
	    this.stream = stream;
	  }
	  d3_geo_transform.prototype = {
	    point: function(x, y) {
	      this.stream.point(x, y);
	    },
	    sphere: function() {
	      this.stream.sphere();
	    },
	    lineStart: function() {
	      this.stream.lineStart();
	    },
	    lineEnd: function() {
	      this.stream.lineEnd();
	    },
	    polygonStart: function() {
	      this.stream.polygonStart();
	    },
	    polygonEnd: function() {
	      this.stream.polygonEnd();
	    }
	  };
	  function d3_geo_transformPoint(stream, point) {
	    return {
	      point: point,
	      sphere: function() {
	        stream.sphere();
	      },
	      lineStart: function() {
	        stream.lineStart();
	      },
	      lineEnd: function() {
	        stream.lineEnd();
	      },
	      polygonStart: function() {
	        stream.polygonStart();
	      },
	      polygonEnd: function() {
	        stream.polygonEnd();
	      }
	    };
	  }
	  d3.geo.projection = d3_geo_projection;
	  d3.geo.projectionMutator = d3_geo_projectionMutator;
	  function d3_geo_projection(project) {
	    return d3_geo_projectionMutator(function() {
	      return project;
	    })();
	  }
	  function d3_geo_projectionMutator(projectAt) {
	    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
	      x = project(x, y);
	      return [ x[0] * k + δx, δy - x[1] * k ];
	    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
	    function projection(point) {
	      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
	      return [ point[0] * k + δx, δy - point[1] * k ];
	    }
	    function invert(point) {
	      point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
	      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
	    }
	    projection.stream = function(output) {
	      if (stream) stream.valid = false;
	      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
	      stream.valid = true;
	      return stream;
	    };
	    projection.clipAngle = function(_) {
	      if (!arguments.length) return clipAngle;
	      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
	      return invalidate();
	    };
	    projection.clipExtent = function(_) {
	      if (!arguments.length) return clipExtent;
	      clipExtent = _;
	      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
	      return invalidate();
	    };
	    projection.scale = function(_) {
	      if (!arguments.length) return k;
	      k = +_;
	      return reset();
	    };
	    projection.translate = function(_) {
	      if (!arguments.length) return [ x, y ];
	      x = +_[0];
	      y = +_[1];
	      return reset();
	    };
	    projection.center = function(_) {
	      if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
	      λ = _[0] % 360 * d3_radians;
	      φ = _[1] % 360 * d3_radians;
	      return reset();
	    };
	    projection.rotate = function(_) {
	      if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
	      δλ = _[0] % 360 * d3_radians;
	      δφ = _[1] % 360 * d3_radians;
	      δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
	      return reset();
	    };
	    d3.rebind(projection, projectResample, "precision");
	    function reset() {
	      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
	      var center = project(λ, φ);
	      δx = x - center[0] * k;
	      δy = y + center[1] * k;
	      return invalidate();
	    }
	    function invalidate() {
	      if (stream) stream.valid = false, stream = null;
	      return projection;
	    }
	    return function() {
	      project = projectAt.apply(this, arguments);
	      projection.invert = project.invert && invert;
	      return reset();
	    };
	  }
	  function d3_geo_projectionRadians(stream) {
	    return d3_geo_transformPoint(stream, function(x, y) {
	      stream.point(x * d3_radians, y * d3_radians);
	    });
	  }
	  function d3_geo_equirectangular(λ, φ) {
	    return [ λ, φ ];
	  }
	  (d3.geo.equirectangular = function() {
	    return d3_geo_projection(d3_geo_equirectangular);
	  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
	  d3.geo.rotation = function(rotate) {
	    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
	    function forward(coordinates) {
	      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
	      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
	    }
	    forward.invert = function(coordinates) {
	      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
	      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
	    };
	    return forward;
	  };
	  function d3_geo_identityRotation(λ, φ) {
	    return [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
	  }
	  d3_geo_identityRotation.invert = d3_geo_equirectangular;
	  function d3_geo_rotation(δλ, δφ, δγ) {
	    return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
	  }
	  function d3_geo_forwardRotationλ(δλ) {
	    return function(λ, φ) {
	      return λ += δλ, [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
	    };
	  }
	  function d3_geo_rotationλ(δλ) {
	    var rotation = d3_geo_forwardRotationλ(δλ);
	    rotation.invert = d3_geo_forwardRotationλ(-δλ);
	    return rotation;
	  }
	  function d3_geo_rotationφγ(δφ, δγ) {
	    var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
	    function rotation(λ, φ) {
	      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
	      return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ) ];
	    }
	    rotation.invert = function(λ, φ) {
	      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
	      return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ) ];
	    };
	    return rotation;
	  }
	  d3.geo.circle = function() {
	    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
	    function circle() {
	      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
	      interpolate(null, null, 1, {
	        point: function(x, y) {
	          ring.push(x = rotate(x, y));
	          x[0] *= d3_degrees, x[1] *= d3_degrees;
	        }
	      });
	      return {
	        type: "Polygon",
	        coordinates: [ ring ]
	      };
	    }
	    circle.origin = function(x) {
	      if (!arguments.length) return origin;
	      origin = x;
	      return circle;
	    };
	    circle.angle = function(x) {
	      if (!arguments.length) return angle;
	      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
	      return circle;
	    };
	    circle.precision = function(_) {
	      if (!arguments.length) return precision;
	      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
	      return circle;
	    };
	    return circle.angle(90);
	  };
	  function d3_geo_circleInterpolate(radius, precision) {
	    var cr = Math.cos(radius), sr = Math.sin(radius);
	    return function(from, to, direction, listener) {
	      var step = direction * precision;
	      if (from != null) {
	        from = d3_geo_circleAngle(cr, from);
	        to = d3_geo_circleAngle(cr, to);
	        if (direction > 0 ? from < to : from > to) from += direction * τ;
	      } else {
	        from = radius + direction * τ;
	        to = radius - .5 * step;
	      }
	      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
	        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
	      }
	    };
	  }
	  function d3_geo_circleAngle(cr, point) {
	    var a = d3_geo_cartesian(point);
	    a[0] -= cr;
	    d3_geo_cartesianNormalize(a);
	    var angle = d3_acos(-a[1]);
	    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
	  }
	  d3.geo.distance = function(a, b) {
	    var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
	    return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
	  };
	  d3.geo.graticule = function() {
	    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
	    function graticule() {
	      return {
	        type: "MultiLineString",
	        coordinates: lines()
	      };
	    }
	    function lines() {
	      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
	        return abs(x % DX) > ε;
	      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
	        return abs(y % DY) > ε;
	      }).map(y));
	    }
	    graticule.lines = function() {
	      return lines().map(function(coordinates) {
	        return {
	          type: "LineString",
	          coordinates: coordinates
	        };
	      });
	    };
	    graticule.outline = function() {
	      return {
	        type: "Polygon",
	        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
	      };
	    };
	    graticule.extent = function(_) {
	      if (!arguments.length) return graticule.minorExtent();
	      return graticule.majorExtent(_).minorExtent(_);
	    };
	    graticule.majorExtent = function(_) {
	      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
	      X0 = +_[0][0], X1 = +_[1][0];
	      Y0 = +_[0][1], Y1 = +_[1][1];
	      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
	      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
	      return graticule.precision(precision);
	    };
	    graticule.minorExtent = function(_) {
	      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
	      x0 = +_[0][0], x1 = +_[1][0];
	      y0 = +_[0][1], y1 = +_[1][1];
	      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
	      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
	      return graticule.precision(precision);
	    };
	    graticule.step = function(_) {
	      if (!arguments.length) return graticule.minorStep();
	      return graticule.majorStep(_).minorStep(_);
	    };
	    graticule.majorStep = function(_) {
	      if (!arguments.length) return [ DX, DY ];
	      DX = +_[0], DY = +_[1];
	      return graticule;
	    };
	    graticule.minorStep = function(_) {
	      if (!arguments.length) return [ dx, dy ];
	      dx = +_[0], dy = +_[1];
	      return graticule;
	    };
	    graticule.precision = function(_) {
	      if (!arguments.length) return precision;
	      precision = +_;
	      x = d3_geo_graticuleX(y0, y1, 90);
	      y = d3_geo_graticuleY(x0, x1, precision);
	      X = d3_geo_graticuleX(Y0, Y1, 90);
	      Y = d3_geo_graticuleY(X0, X1, precision);
	      return graticule;
	    };
	    return graticule.majorExtent([ [ -180, -90 + ε ], [ 180, 90 - ε ] ]).minorExtent([ [ -180, -80 - ε ], [ 180, 80 + ε ] ]);
	  };
	  function d3_geo_graticuleX(y0, y1, dy) {
	    var y = d3.range(y0, y1 - ε, dy).concat(y1);
	    return function(x) {
	      return y.map(function(y) {
	        return [ x, y ];
	      });
	    };
	  }
	  function d3_geo_graticuleY(x0, x1, dx) {
	    var x = d3.range(x0, x1 - ε, dx).concat(x1);
	    return function(y) {
	      return x.map(function(x) {
	        return [ x, y ];
	      });
	    };
	  }
	  function d3_source(d) {
	    return d.source;
	  }
	  function d3_target(d) {
	    return d.target;
	  }
	  d3.geo.greatArc = function() {
	    var source = d3_source, source_, target = d3_target, target_;
	    function greatArc() {
	      return {
	        type: "LineString",
	        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
	      };
	    }
	    greatArc.distance = function() {
	      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
	    };
	    greatArc.source = function(_) {
	      if (!arguments.length) return source;
	      source = _, source_ = typeof _ === "function" ? null : _;
	      return greatArc;
	    };
	    greatArc.target = function(_) {
	      if (!arguments.length) return target;
	      target = _, target_ = typeof _ === "function" ? null : _;
	      return greatArc;
	    };
	    greatArc.precision = function() {
	      return arguments.length ? greatArc : 0;
	    };
	    return greatArc;
	  };
	  d3.geo.interpolate = function(source, target) {
	    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
	  };
	  function d3_geo_interpolate(x0, y0, x1, y1) {
	    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
	    var interpolate = d ? function(t) {
	      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
	      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
	    } : function() {
	      return [ x0 * d3_degrees, y0 * d3_degrees ];
	    };
	    interpolate.distance = d;
	    return interpolate;
	  }
	  d3.geo.length = function(object) {
	    d3_geo_lengthSum = 0;
	    d3.geo.stream(object, d3_geo_length);
	    return d3_geo_lengthSum;
	  };
	  var d3_geo_lengthSum;
	  var d3_geo_length = {
	    sphere: d3_noop,
	    point: d3_noop,
	    lineStart: d3_geo_lengthLineStart,
	    lineEnd: d3_noop,
	    polygonStart: d3_noop,
	    polygonEnd: d3_noop
	  };
	  function d3_geo_lengthLineStart() {
	    var λ0, sinφ0, cosφ0;
	    d3_geo_length.point = function(λ, φ) {
	      λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
	      d3_geo_length.point = nextPoint;
	    };
	    d3_geo_length.lineEnd = function() {
	      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
	    };
	    function nextPoint(λ, φ) {
	      var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
	      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
	      λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
	    }
	  }
	  function d3_geo_azimuthal(scale, angle) {
	    function azimuthal(λ, φ) {
	      var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
	      return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
	    }
	    azimuthal.invert = function(x, y) {
	      var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
	      return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
	    };
	    return azimuthal;
	  }
	  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
	    return Math.sqrt(2 / (1 + cosλcosφ));
	  }, function(ρ) {
	    return 2 * Math.asin(ρ / 2);
	  });
	  (d3.geo.azimuthalEqualArea = function() {
	    return d3_geo_projection(d3_geo_azimuthalEqualArea);
	  }).raw = d3_geo_azimuthalEqualArea;
	  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
	    var c = Math.acos(cosλcosφ);
	    return c && c / Math.sin(c);
	  }, d3_identity);
	  (d3.geo.azimuthalEquidistant = function() {
	    return d3_geo_projection(d3_geo_azimuthalEquidistant);
	  }).raw = d3_geo_azimuthalEquidistant;
	  function d3_geo_conicConformal(φ0, φ1) {
	    var cosφ0 = Math.cos(φ0), t = function(φ) {
	      return Math.tan(π / 4 + φ / 2);
	    }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
	    if (!n) return d3_geo_mercator;
	    function forward(λ, φ) {
	      if (F > 0) {
	        if (φ < -halfπ + ε) φ = -halfπ + ε;
	      } else {
	        if (φ > halfπ - ε) φ = halfπ - ε;
	      }
	      var ρ = F / Math.pow(t(φ), n);
	      return [ ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
	      return [ Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ ];
	    };
	    return forward;
	  }
	  (d3.geo.conicConformal = function() {
	    return d3_geo_conic(d3_geo_conicConformal);
	  }).raw = d3_geo_conicConformal;
	  function d3_geo_conicEquidistant(φ0, φ1) {
	    var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
	    if (abs(n) < ε) return d3_geo_equirectangular;
	    function forward(λ, φ) {
	      var ρ = G - φ;
	      return [ ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = G - y;
	      return [ Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y) ];
	    };
	    return forward;
	  }
	  (d3.geo.conicEquidistant = function() {
	    return d3_geo_conic(d3_geo_conicEquidistant);
	  }).raw = d3_geo_conicEquidistant;
	  var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
	    return 1 / cosλcosφ;
	  }, Math.atan);
	  (d3.geo.gnomonic = function() {
	    return d3_geo_projection(d3_geo_gnomonic);
	  }).raw = d3_geo_gnomonic;
	  function d3_geo_mercator(λ, φ) {
	    return [ λ, Math.log(Math.tan(π / 4 + φ / 2)) ];
	  }
	  d3_geo_mercator.invert = function(x, y) {
	    return [ x, 2 * Math.atan(Math.exp(y)) - halfπ ];
	  };
	  function d3_geo_mercatorProjection(project) {
	    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
	    m.scale = function() {
	      var v = scale.apply(m, arguments);
	      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
	    };
	    m.translate = function() {
	      var v = translate.apply(m, arguments);
	      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
	    };
	    m.clipExtent = function(_) {
	      var v = clipExtent.apply(m, arguments);
	      if (v === m) {
	        if (clipAuto = _ == null) {
	          var k = π * scale(), t = translate();
	          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
	        }
	      } else if (clipAuto) {
	        v = null;
	      }
	      return v;
	    };
	    return m.clipExtent(null);
	  }
	  (d3.geo.mercator = function() {
	    return d3_geo_mercatorProjection(d3_geo_mercator);
	  }).raw = d3_geo_mercator;
	  var d3_geo_orthographic = d3_geo_azimuthal(function() {
	    return 1;
	  }, Math.asin);
	  (d3.geo.orthographic = function() {
	    return d3_geo_projection(d3_geo_orthographic);
	  }).raw = d3_geo_orthographic;
	  var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
	    return 1 / (1 + cosλcosφ);
	  }, function(ρ) {
	    return 2 * Math.atan(ρ);
	  });
	  (d3.geo.stereographic = function() {
	    return d3_geo_projection(d3_geo_stereographic);
	  }).raw = d3_geo_stereographic;
	  function d3_geo_transverseMercator(λ, φ) {
	    return [ Math.log(Math.tan(π / 4 + φ / 2)), -λ ];
	  }
	  d3_geo_transverseMercator.invert = function(x, y) {
	    return [ -y, 2 * Math.atan(Math.exp(x)) - halfπ ];
	  };
	  (d3.geo.transverseMercator = function() {
	    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
	    projection.center = function(_) {
	      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ _[1], -_[0] ]);
	    };
	    projection.rotate = function(_) {
	      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
	      [ _[0], _[1], _[2] - 90 ]);
	    };
	    return rotate([ 0, 0, 90 ]);
	  }).raw = d3_geo_transverseMercator;
	  d3.geom = {};
	  function d3_geom_pointX(d) {
	    return d[0];
	  }
	  function d3_geom_pointY(d) {
	    return d[1];
	  }
	  d3.geom.hull = function(vertices) {
	    var x = d3_geom_pointX, y = d3_geom_pointY;
	    if (arguments.length) return hull(vertices);
	    function hull(data) {
	      if (data.length < 3) return [];
	      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
	      for (i = 0; i < n; i++) {
	        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
	      }
	      points.sort(d3_geom_hullOrder);
	      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
	      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
	      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
	      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
	      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
	      return polygon;
	    }
	    hull.x = function(_) {
	      return arguments.length ? (x = _, hull) : x;
	    };
	    hull.y = function(_) {
	      return arguments.length ? (y = _, hull) : y;
	    };
	    return hull;
	  };
	  function d3_geom_hullUpper(points) {
	    var n = points.length, hull = [ 0, 1 ], hs = 2;
	    for (var i = 2; i < n; i++) {
	      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
	      hull[hs++] = i;
	    }
	    return hull.slice(0, hs);
	  }
	  function d3_geom_hullOrder(a, b) {
	    return a[0] - b[0] || a[1] - b[1];
	  }
	  d3.geom.polygon = function(coordinates) {
	    d3_subclass(coordinates, d3_geom_polygonPrototype);
	    return coordinates;
	  };
	  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
	  d3_geom_polygonPrototype.area = function() {
	    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
	    while (++i < n) {
	      a = b;
	      b = this[i];
	      area += a[1] * b[0] - a[0] * b[1];
	    }
	    return area * .5;
	  };
	  d3_geom_polygonPrototype.centroid = function(k) {
	    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
	    if (!arguments.length) k = -1 / (6 * this.area());
	    while (++i < n) {
	      a = b;
	      b = this[i];
	      c = a[0] * b[1] - b[0] * a[1];
	      x += (a[0] + b[0]) * c;
	      y += (a[1] + b[1]) * c;
	    }
	    return [ x * k, y * k ];
	  };
	  d3_geom_polygonPrototype.clip = function(subject) {
	    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
	    while (++i < n) {
	      input = subject.slice();
	      subject.length = 0;
	      b = this[i];
	      c = input[(m = input.length - closed) - 1];
	      j = -1;
	      while (++j < m) {
	        d = input[j];
	        if (d3_geom_polygonInside(d, a, b)) {
	          if (!d3_geom_polygonInside(c, a, b)) {
	            subject.push(d3_geom_polygonIntersect(c, d, a, b));
	          }
	          subject.push(d);
	        } else if (d3_geom_polygonInside(c, a, b)) {
	          subject.push(d3_geom_polygonIntersect(c, d, a, b));
	        }
	        c = d;
	      }
	      if (closed) subject.push(subject[0]);
	      a = b;
	    }
	    return subject;
	  };
	  function d3_geom_polygonInside(p, a, b) {
	    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
	  }
	  function d3_geom_polygonIntersect(c, d, a, b) {
	    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
	    return [ x1 + ua * x21, y1 + ua * y21 ];
	  }
	  function d3_geom_polygonClosed(coordinates) {
	    var a = coordinates[0], b = coordinates[coordinates.length - 1];
	    return !(a[0] - b[0] || a[1] - b[1]);
	  }
	  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
	  function d3_geom_voronoiBeach() {
	    d3_geom_voronoiRedBlackNode(this);
	    this.edge = this.site = this.circle = null;
	  }
	  function d3_geom_voronoiCreateBeach(site) {
	    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
	    beach.site = site;
	    return beach;
	  }
	  function d3_geom_voronoiDetachBeach(beach) {
	    d3_geom_voronoiDetachCircle(beach);
	    d3_geom_voronoiBeaches.remove(beach);
	    d3_geom_voronoiBeachPool.push(beach);
	    d3_geom_voronoiRedBlackNode(beach);
	  }
	  function d3_geom_voronoiRemoveBeach(beach) {
	    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
	      x: x,
	      y: y
	    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
	    d3_geom_voronoiDetachBeach(beach);
	    var lArc = previous;
	    while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
	      previous = lArc.P;
	      disappearing.unshift(lArc);
	      d3_geom_voronoiDetachBeach(lArc);
	      lArc = previous;
	    }
	    disappearing.unshift(lArc);
	    d3_geom_voronoiDetachCircle(lArc);
	    var rArc = next;
	    while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
	      next = rArc.N;
	      disappearing.push(rArc);
	      d3_geom_voronoiDetachBeach(rArc);
	      rArc = next;
	    }
	    disappearing.push(rArc);
	    d3_geom_voronoiDetachCircle(rArc);
	    var nArcs = disappearing.length, iArc;
	    for (iArc = 1; iArc < nArcs; ++iArc) {
	      rArc = disappearing[iArc];
	      lArc = disappearing[iArc - 1];
	      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
	    }
	    lArc = disappearing[0];
	    rArc = disappearing[nArcs - 1];
	    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
	    d3_geom_voronoiAttachCircle(lArc);
	    d3_geom_voronoiAttachCircle(rArc);
	  }
	  function d3_geom_voronoiAddBeach(site) {
	    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
	    while (node) {
	      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
	      if (dxl > ε) node = node.L; else {
	        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
	        if (dxr > ε) {
	          if (!node.R) {
	            lArc = node;
	            break;
	          }
	          node = node.R;
	        } else {
	          if (dxl > -ε) {
	            lArc = node.P;
	            rArc = node;
	          } else if (dxr > -ε) {
	            lArc = node;
	            rArc = node.N;
	          } else {
	            lArc = rArc = node;
	          }
	          break;
	        }
	      }
	    }
	    var newArc = d3_geom_voronoiCreateBeach(site);
	    d3_geom_voronoiBeaches.insert(lArc, newArc);
	    if (!lArc && !rArc) return;
	    if (lArc === rArc) {
	      d3_geom_voronoiDetachCircle(lArc);
	      rArc = d3_geom_voronoiCreateBeach(lArc.site);
	      d3_geom_voronoiBeaches.insert(newArc, rArc);
	      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
	      d3_geom_voronoiAttachCircle(lArc);
	      d3_geom_voronoiAttachCircle(rArc);
	      return;
	    }
	    if (!rArc) {
	      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
	      return;
	    }
	    d3_geom_voronoiDetachCircle(lArc);
	    d3_geom_voronoiDetachCircle(rArc);
	    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
	      x: (cy * hb - by * hc) / d + ax,
	      y: (bx * hc - cx * hb) / d + ay
	    };
	    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
	    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
	    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
	    d3_geom_voronoiAttachCircle(lArc);
	    d3_geom_voronoiAttachCircle(rArc);
	  }
	  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
	    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
	    if (!pby2) return rfocx;
	    var lArc = arc.P;
	    if (!lArc) return -Infinity;
	    site = lArc.site;
	    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
	    if (!plby2) return lfocx;
	    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
	    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
	    return (rfocx + lfocx) / 2;
	  }
	  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
	    var rArc = arc.N;
	    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
	    var site = arc.site;
	    return site.y === directrix ? site.x : Infinity;
	  }
	  function d3_geom_voronoiCell(site) {
	    this.site = site;
	    this.edges = [];
	  }
	  d3_geom_voronoiCell.prototype.prepare = function() {
	    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
	    while (iHalfEdge--) {
	      edge = halfEdges[iHalfEdge].edge;
	      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
	    }
	    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
	    return halfEdges.length;
	  };
	  function d3_geom_voronoiCloseCells(extent) {
	    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
	    while (iCell--) {
	      cell = cells[iCell];
	      if (!cell || !cell.prepare()) continue;
	      halfEdges = cell.edges;
	      nHalfEdges = halfEdges.length;
	      iHalfEdge = 0;
	      while (iHalfEdge < nHalfEdges) {
	        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
	        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
	        if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
	          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
	            x: x0,
	            y: abs(x2 - x0) < ε ? y2 : y1
	          } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
	            x: abs(y2 - y1) < ε ? x2 : x1,
	            y: y1
	          } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
	            x: x1,
	            y: abs(x2 - x1) < ε ? y2 : y0
	          } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
	            x: abs(y2 - y0) < ε ? x2 : x0,
	            y: y0
	          } : null), cell.site, null));
	          ++nHalfEdges;
	        }
	      }
	    }
	  }
	  function d3_geom_voronoiHalfEdgeOrder(a, b) {
	    return b.angle - a.angle;
	  }
	  function d3_geom_voronoiCircle() {
	    d3_geom_voronoiRedBlackNode(this);
	    this.x = this.y = this.arc = this.site = this.cy = null;
	  }
	  function d3_geom_voronoiAttachCircle(arc) {
	    var lArc = arc.P, rArc = arc.N;
	    if (!lArc || !rArc) return;
	    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
	    if (lSite === rSite) return;
	    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
	    var d = 2 * (ax * cy - ay * cx);
	    if (d >= -ε2) return;
	    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
	    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
	    circle.arc = arc;
	    circle.site = cSite;
	    circle.x = x + bx;
	    circle.y = cy + Math.sqrt(x * x + y * y);
	    circle.cy = cy;
	    arc.circle = circle;
	    var before = null, node = d3_geom_voronoiCircles._;
	    while (node) {
	      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
	        if (node.L) node = node.L; else {
	          before = node.P;
	          break;
	        }
	      } else {
	        if (node.R) node = node.R; else {
	          before = node;
	          break;
	        }
	      }
	    }
	    d3_geom_voronoiCircles.insert(before, circle);
	    if (!before) d3_geom_voronoiFirstCircle = circle;
	  }
	  function d3_geom_voronoiDetachCircle(arc) {
	    var circle = arc.circle;
	    if (circle) {
	      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
	      d3_geom_voronoiCircles.remove(circle);
	      d3_geom_voronoiCirclePool.push(circle);
	      d3_geom_voronoiRedBlackNode(circle);
	      arc.circle = null;
	    }
	  }
	  function d3_geom_voronoiClipEdges(extent) {
	    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
	    while (i--) {
	      e = edges[i];
	      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
	        e.a = e.b = null;
	        edges.splice(i, 1);
	      }
	    }
	  }
	  function d3_geom_voronoiConnectEdge(edge, extent) {
	    var vb = edge.b;
	    if (vb) return true;
	    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
	    if (ry === ly) {
	      if (fx < x0 || fx >= x1) return;
	      if (lx > rx) {
	        if (!va) va = {
	          x: fx,
	          y: y0
	        }; else if (va.y >= y1) return;
	        vb = {
	          x: fx,
	          y: y1
	        };
	      } else {
	        if (!va) va = {
	          x: fx,
	          y: y1
	        }; else if (va.y < y0) return;
	        vb = {
	          x: fx,
	          y: y0
	        };
	      }
	    } else {
	      fm = (lx - rx) / (ry - ly);
	      fb = fy - fm * fx;
	      if (fm < -1 || fm > 1) {
	        if (lx > rx) {
	          if (!va) va = {
	            x: (y0 - fb) / fm,
	            y: y0
	          }; else if (va.y >= y1) return;
	          vb = {
	            x: (y1 - fb) / fm,
	            y: y1
	          };
	        } else {
	          if (!va) va = {
	            x: (y1 - fb) / fm,
	            y: y1
	          }; else if (va.y < y0) return;
	          vb = {
	            x: (y0 - fb) / fm,
	            y: y0
	          };
	        }
	      } else {
	        if (ly < ry) {
	          if (!va) va = {
	            x: x0,
	            y: fm * x0 + fb
	          }; else if (va.x >= x1) return;
	          vb = {
	            x: x1,
	            y: fm * x1 + fb
	          };
	        } else {
	          if (!va) va = {
	            x: x1,
	            y: fm * x1 + fb
	          }; else if (va.x < x0) return;
	          vb = {
	            x: x0,
	            y: fm * x0 + fb
	          };
	        }
	      }
	    }
	    edge.a = va;
	    edge.b = vb;
	    return true;
	  }
	  function d3_geom_voronoiEdge(lSite, rSite) {
	    this.l = lSite;
	    this.r = rSite;
	    this.a = this.b = null;
	  }
	  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
	    var edge = new d3_geom_voronoiEdge(lSite, rSite);
	    d3_geom_voronoiEdges.push(edge);
	    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
	    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
	    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
	    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
	    return edge;
	  }
	  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
	    var edge = new d3_geom_voronoiEdge(lSite, null);
	    edge.a = va;
	    edge.b = vb;
	    d3_geom_voronoiEdges.push(edge);
	    return edge;
	  }
	  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
	    if (!edge.a && !edge.b) {
	      edge.a = vertex;
	      edge.l = lSite;
	      edge.r = rSite;
	    } else if (edge.l === rSite) {
	      edge.b = vertex;
	    } else {
	      edge.a = vertex;
	    }
	  }
	  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
	    var va = edge.a, vb = edge.b;
	    this.edge = edge;
	    this.site = lSite;
	    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
	  }
	  d3_geom_voronoiHalfEdge.prototype = {
	    start: function() {
	      return this.edge.l === this.site ? this.edge.a : this.edge.b;
	    },
	    end: function() {
	      return this.edge.l === this.site ? this.edge.b : this.edge.a;
	    }
	  };
	  function d3_geom_voronoiRedBlackTree() {
	    this._ = null;
	  }
	  function d3_geom_voronoiRedBlackNode(node) {
	    node.U = node.C = node.L = node.R = node.P = node.N = null;
	  }
	  d3_geom_voronoiRedBlackTree.prototype = {
	    insert: function(after, node) {
	      var parent, grandpa, uncle;
	      if (after) {
	        node.P = after;
	        node.N = after.N;
	        if (after.N) after.N.P = node;
	        after.N = node;
	        if (after.R) {
	          after = after.R;
	          while (after.L) after = after.L;
	          after.L = node;
	        } else {
	          after.R = node;
	        }
	        parent = after;
	      } else if (this._) {
	        after = d3_geom_voronoiRedBlackFirst(this._);
	        node.P = null;
	        node.N = after;
	        after.P = after.L = node;
	        parent = after;
	      } else {
	        node.P = node.N = null;
	        this._ = node;
	        parent = null;
	      }
	      node.L = node.R = null;
	      node.U = parent;
	      node.C = true;
	      after = node;
	      while (parent && parent.C) {
	        grandpa = parent.U;
	        if (parent === grandpa.L) {
	          uncle = grandpa.R;
	          if (uncle && uncle.C) {
	            parent.C = uncle.C = false;
	            grandpa.C = true;
	            after = grandpa;
	          } else {
	            if (after === parent.R) {
	              d3_geom_voronoiRedBlackRotateLeft(this, parent);
	              after = parent;
	              parent = after.U;
	            }
	            parent.C = false;
	            grandpa.C = true;
	            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
	          }
	        } else {
	          uncle = grandpa.L;
	          if (uncle && uncle.C) {
	            parent.C = uncle.C = false;
	            grandpa.C = true;
	            after = grandpa;
	          } else {
	            if (after === parent.L) {
	              d3_geom_voronoiRedBlackRotateRight(this, parent);
	              after = parent;
	              parent = after.U;
	            }
	            parent.C = false;
	            grandpa.C = true;
	            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
	          }
	        }
	        parent = after.U;
	      }
	      this._.C = false;
	    },
	    remove: function(node) {
	      if (node.N) node.N.P = node.P;
	      if (node.P) node.P.N = node.N;
	      node.N = node.P = null;
	      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
	      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
	      if (parent) {
	        if (parent.L === node) parent.L = next; else parent.R = next;
	      } else {
	        this._ = next;
	      }
	      if (left && right) {
	        red = next.C;
	        next.C = node.C;
	        next.L = left;
	        left.U = next;
	        if (next !== right) {
	          parent = next.U;
	          next.U = node.U;
	          node = next.R;
	          parent.L = node;
	          next.R = right;
	          right.U = next;
	        } else {
	          next.U = parent;
	          parent = next;
	          node = next.R;
	        }
	      } else {
	        red = node.C;
	        node = next;
	      }
	      if (node) node.U = parent;
	      if (red) return;
	      if (node && node.C) {
	        node.C = false;
	        return;
	      }
	      do {
	        if (node === this._) break;
	        if (node === parent.L) {
	          sibling = parent.R;
	          if (sibling.C) {
	            sibling.C = false;
	            parent.C = true;
	            d3_geom_voronoiRedBlackRotateLeft(this, parent);
	            sibling = parent.R;
	          }
	          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
	            if (!sibling.R || !sibling.R.C) {
	              sibling.L.C = false;
	              sibling.C = true;
	              d3_geom_voronoiRedBlackRotateRight(this, sibling);
	              sibling = parent.R;
	            }
	            sibling.C = parent.C;
	            parent.C = sibling.R.C = false;
	            d3_geom_voronoiRedBlackRotateLeft(this, parent);
	            node = this._;
	            break;
	          }
	        } else {
	          sibling = parent.L;
	          if (sibling.C) {
	            sibling.C = false;
	            parent.C = true;
	            d3_geom_voronoiRedBlackRotateRight(this, parent);
	            sibling = parent.L;
	          }
	          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
	            if (!sibling.L || !sibling.L.C) {
	              sibling.R.C = false;
	              sibling.C = true;
	              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
	              sibling = parent.L;
	            }
	            sibling.C = parent.C;
	            parent.C = sibling.L.C = false;
	            d3_geom_voronoiRedBlackRotateRight(this, parent);
	            node = this._;
	            break;
	          }
	        }
	        sibling.C = true;
	        node = parent;
	        parent = parent.U;
	      } while (!node.C);
	      if (node) node.C = false;
	    }
	  };
	  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
	    var p = node, q = node.R, parent = p.U;
	    if (parent) {
	      if (parent.L === p) parent.L = q; else parent.R = q;
	    } else {
	      tree._ = q;
	    }
	    q.U = parent;
	    p.U = q;
	    p.R = q.L;
	    if (p.R) p.R.U = p;
	    q.L = p;
	  }
	  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
	    var p = node, q = node.L, parent = p.U;
	    if (parent) {
	      if (parent.L === p) parent.L = q; else parent.R = q;
	    } else {
	      tree._ = q;
	    }
	    q.U = parent;
	    p.U = q;
	    p.L = q.R;
	    if (p.L) p.L.U = p;
	    q.R = p;
	  }
	  function d3_geom_voronoiRedBlackFirst(node) {
	    while (node.L) node = node.L;
	    return node;
	  }
	  function d3_geom_voronoi(sites, bbox) {
	    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
	    d3_geom_voronoiEdges = [];
	    d3_geom_voronoiCells = new Array(sites.length);
	    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
	    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
	    while (true) {
	      circle = d3_geom_voronoiFirstCircle;
	      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
	        if (site.x !== x0 || site.y !== y0) {
	          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
	          d3_geom_voronoiAddBeach(site);
	          x0 = site.x, y0 = site.y;
	        }
	        site = sites.pop();
	      } else if (circle) {
	        d3_geom_voronoiRemoveBeach(circle.arc);
	      } else {
	        break;
	      }
	    }
	    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
	    var diagram = {
	      cells: d3_geom_voronoiCells,
	      edges: d3_geom_voronoiEdges
	    };
	    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
	    return diagram;
	  }
	  function d3_geom_voronoiVertexOrder(a, b) {
	    return b.y - a.y || b.x - a.x;
	  }
	  d3.geom.voronoi = function(points) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
	    if (points) return voronoi(points);
	    function voronoi(data) {
	      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
	      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
	        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
	          var s = e.start();
	          return [ s.x, s.y ];
	        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
	        polygon.point = data[i];
	      });
	      return polygons;
	    }
	    function sites(data) {
	      return data.map(function(d, i) {
	        return {
	          x: Math.round(fx(d, i) / ε) * ε,
	          y: Math.round(fy(d, i) / ε) * ε,
	          i: i
	        };
	      });
	    }
	    voronoi.links = function(data) {
	      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
	        return edge.l && edge.r;
	      }).map(function(edge) {
	        return {
	          source: data[edge.l.i],
	          target: data[edge.r.i]
	        };
	      });
	    };
	    voronoi.triangles = function(data) {
	      var triangles = [];
	      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
	        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
	        while (++j < m) {
	          e0 = e1;
	          s0 = s1;
	          e1 = edges[j].edge;
	          s1 = e1.l === site ? e1.r : e1.l;
	          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
	            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
	          }
	        }
	      });
	      return triangles;
	    };
	    voronoi.x = function(_) {
	      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
	    };
	    voronoi.y = function(_) {
	      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
	    };
	    voronoi.clipExtent = function(_) {
	      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
	      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
	      return voronoi;
	    };
	    voronoi.size = function(_) {
	      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
	      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
	    };
	    return voronoi;
	  };
	  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
	  function d3_geom_voronoiTriangleArea(a, b, c) {
	    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
	  }
	  d3.geom.delaunay = function(vertices) {
	    return d3.geom.voronoi().triangles(vertices);
	  };
	  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
	    if (compat = arguments.length) {
	      x = d3_geom_quadtreeCompatX;
	      y = d3_geom_quadtreeCompatY;
	      if (compat === 3) {
	        y2 = y1;
	        x2 = x1;
	        y1 = x1 = 0;
	      }
	      return quadtree(points);
	    }
	    function quadtree(data) {
	      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
	      if (x1 != null) {
	        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
	      } else {
	        x2_ = y2_ = -(x1_ = y1_ = Infinity);
	        xs = [], ys = [];
	        n = data.length;
	        if (compat) for (i = 0; i < n; ++i) {
	          d = data[i];
	          if (d.x < x1_) x1_ = d.x;
	          if (d.y < y1_) y1_ = d.y;
	          if (d.x > x2_) x2_ = d.x;
	          if (d.y > y2_) y2_ = d.y;
	          xs.push(d.x);
	          ys.push(d.y);
	        } else for (i = 0; i < n; ++i) {
	          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
	          if (x_ < x1_) x1_ = x_;
	          if (y_ < y1_) y1_ = y_;
	          if (x_ > x2_) x2_ = x_;
	          if (y_ > y2_) y2_ = y_;
	          xs.push(x_);
	          ys.push(y_);
	        }
	      }
	      var dx = x2_ - x1_, dy = y2_ - y1_;
	      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
	      function insert(n, d, x, y, x1, y1, x2, y2) {
	        if (isNaN(x) || isNaN(y)) return;
	        if (n.leaf) {
	          var nx = n.x, ny = n.y;
	          if (nx != null) {
	            if (abs(nx - x) + abs(ny - y) < .01) {
	              insertChild(n, d, x, y, x1, y1, x2, y2);
	            } else {
	              var nPoint = n.point;
	              n.x = n.y = n.point = null;
	              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
	              insertChild(n, d, x, y, x1, y1, x2, y2);
	            }
	          } else {
	            n.x = x, n.y = y, n.point = d;
	          }
	        } else {
	          insertChild(n, d, x, y, x1, y1, x2, y2);
	        }
	      }
	      function insertChild(n, d, x, y, x1, y1, x2, y2) {
	        var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym, i = below << 1 | right;
	        n.leaf = false;
	        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
	        if (right) x1 = xm; else x2 = xm;
	        if (below) y1 = ym; else y2 = ym;
	        insert(n, d, x, y, x1, y1, x2, y2);
	      }
	      var root = d3_geom_quadtreeNode();
	      root.add = function(d) {
	        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
	      };
	      root.visit = function(f) {
	        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
	      };
	      root.find = function(point) {
	        return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
	      };
	      i = -1;
	      if (x1 == null) {
	        while (++i < n) {
	          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
	        }
	        --i;
	      } else data.forEach(root.add);
	      xs = ys = data = d = null;
	      return root;
	    }
	    quadtree.x = function(_) {
	      return arguments.length ? (x = _, quadtree) : x;
	    };
	    quadtree.y = function(_) {
	      return arguments.length ? (y = _, quadtree) : y;
	    };
	    quadtree.extent = function(_) {
	      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
	      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
	      y2 = +_[1][1];
	      return quadtree;
	    };
	    quadtree.size = function(_) {
	      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
	      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
	      return quadtree;
	    };
	    return quadtree;
	  };
	  function d3_geom_quadtreeCompatX(d) {
	    return d.x;
	  }
	  function d3_geom_quadtreeCompatY(d) {
	    return d.y;
	  }
	  function d3_geom_quadtreeNode() {
	    return {
	      leaf: true,
	      nodes: [],
	      point: null,
	      x: null,
	      y: null
	    };
	  }
	  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
	    if (!f(node, x1, y1, x2, y2)) {
	      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
	      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
	      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
	      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
	      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
	    }
	  }
	  function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
	    var minDistance2 = Infinity, closestPoint;
	    (function find(node, x1, y1, x2, y2) {
	      if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
	      if (point = node.point) {
	        var point, dx = x - node.x, dy = y - node.y, distance2 = dx * dx + dy * dy;
	        if (distance2 < minDistance2) {
	          var distance = Math.sqrt(minDistance2 = distance2);
	          x0 = x - distance, y0 = y - distance;
	          x3 = x + distance, y3 = y + distance;
	          closestPoint = point;
	        }
	      }
	      var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym;
	      for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
	        if (node = children[i & 3]) switch (i & 3) {
	         case 0:
	          find(node, x1, y1, xm, ym);
	          break;

	         case 1:
	          find(node, xm, y1, x2, ym);
	          break;

	         case 2:
	          find(node, x1, ym, xm, y2);
	          break;

	         case 3:
	          find(node, xm, ym, x2, y2);
	          break;
	        }
	      }
	    })(root, x0, y0, x3, y3);
	    return closestPoint;
	  }
	  d3.interpolateRgb = d3_interpolateRgb;
	  function d3_interpolateRgb(a, b) {
	    a = d3.rgb(a);
	    b = d3.rgb(b);
	    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
	    return function(t) {
	      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
	    };
	  }
	  d3.interpolateObject = d3_interpolateObject;
	  function d3_interpolateObject(a, b) {
	    var i = {}, c = {}, k;
	    for (k in a) {
	      if (k in b) {
	        i[k] = d3_interpolate(a[k], b[k]);
	      } else {
	        c[k] = a[k];
	      }
	    }
	    for (k in b) {
	      if (!(k in a)) {
	        c[k] = b[k];
	      }
	    }
	    return function(t) {
	      for (k in i) c[k] = i[k](t);
	      return c;
	    };
	  }
	  d3.interpolateNumber = d3_interpolateNumber;
	  function d3_interpolateNumber(a, b) {
	    a = +a, b = +b;
	    return function(t) {
	      return a * (1 - t) + b * t;
	    };
	  }
	  d3.interpolateString = d3_interpolateString;
	  function d3_interpolateString(a, b) {
	    var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
	    a = a + "", b = b + "";
	    while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
	      if ((bs = bm.index) > bi) {
	        bs = b.slice(bi, bs);
	        if (s[i]) s[i] += bs; else s[++i] = bs;
	      }
	      if ((am = am[0]) === (bm = bm[0])) {
	        if (s[i]) s[i] += bm; else s[++i] = bm;
	      } else {
	        s[++i] = null;
	        q.push({
	          i: i,
	          x: d3_interpolateNumber(am, bm)
	        });
	      }
	      bi = d3_interpolate_numberB.lastIndex;
	    }
	    if (bi < b.length) {
	      bs = b.slice(bi);
	      if (s[i]) s[i] += bs; else s[++i] = bs;
	    }
	    return s.length < 2 ? q[0] ? (b = q[0].x, function(t) {
	      return b(t) + "";
	    }) : function() {
	      return b;
	    } : (b = q.length, function(t) {
	      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    });
	  }
	  var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
	  d3.interpolate = d3_interpolate;
	  function d3_interpolate(a, b) {
	    var i = d3.interpolators.length, f;
	    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
	    return f;
	  }
	  d3.interpolators = [ function(a, b) {
	    var t = typeof b;
	    return (t === "string" ? d3_rgb_names.has(b.toLowerCase()) || /^(#|rgb\(|hsl\()/i.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
	  } ];
	  d3.interpolateArray = d3_interpolateArray;
	  function d3_interpolateArray(a, b) {
	    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
	    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
	    for (;i < na; ++i) c[i] = a[i];
	    for (;i < nb; ++i) c[i] = b[i];
	    return function(t) {
	      for (i = 0; i < n0; ++i) c[i] = x[i](t);
	      return c;
	    };
	  }
	  var d3_ease_default = function() {
	    return d3_identity;
	  };
	  var d3_ease = d3.map({
	    linear: d3_ease_default,
	    poly: d3_ease_poly,
	    quad: function() {
	      return d3_ease_quad;
	    },
	    cubic: function() {
	      return d3_ease_cubic;
	    },
	    sin: function() {
	      return d3_ease_sin;
	    },
	    exp: function() {
	      return d3_ease_exp;
	    },
	    circle: function() {
	      return d3_ease_circle;
	    },
	    elastic: d3_ease_elastic,
	    back: d3_ease_back,
	    bounce: function() {
	      return d3_ease_bounce;
	    }
	  });
	  var d3_ease_mode = d3.map({
	    "in": d3_identity,
	    out: d3_ease_reverse,
	    "in-out": d3_ease_reflect,
	    "out-in": function(f) {
	      return d3_ease_reflect(d3_ease_reverse(f));
	    }
	  });
	  d3.ease = function(name) {
	    var i = name.indexOf("-"), t = i >= 0 ? name.slice(0, i) : name, m = i >= 0 ? name.slice(i + 1) : "in";
	    t = d3_ease.get(t) || d3_ease_default;
	    m = d3_ease_mode.get(m) || d3_identity;
	    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
	  };
	  function d3_ease_clamp(f) {
	    return function(t) {
	      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
	    };
	  }
	  function d3_ease_reverse(f) {
	    return function(t) {
	      return 1 - f(1 - t);
	    };
	  }
	  function d3_ease_reflect(f) {
	    return function(t) {
	      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
	    };
	  }
	  function d3_ease_quad(t) {
	    return t * t;
	  }
	  function d3_ease_cubic(t) {
	    return t * t * t;
	  }
	  function d3_ease_cubicInOut(t) {
	    if (t <= 0) return 0;
	    if (t >= 1) return 1;
	    var t2 = t * t, t3 = t2 * t;
	    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
	  }
	  function d3_ease_poly(e) {
	    return function(t) {
	      return Math.pow(t, e);
	    };
	  }
	  function d3_ease_sin(t) {
	    return 1 - Math.cos(t * halfπ);
	  }
	  function d3_ease_exp(t) {
	    return Math.pow(2, 10 * (t - 1));
	  }
	  function d3_ease_circle(t) {
	    return 1 - Math.sqrt(1 - t * t);
	  }
	  function d3_ease_elastic(a, p) {
	    var s;
	    if (arguments.length < 2) p = .45;
	    if (arguments.length) s = p / τ * Math.asin(1 / a); else a = 1, s = p / 4;
	    return function(t) {
	      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
	    };
	  }
	  function d3_ease_back(s) {
	    if (!s) s = 1.70158;
	    return function(t) {
	      return t * t * ((s + 1) * t - s);
	    };
	  }
	  function d3_ease_bounce(t) {
	    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
	  }
	  d3.interpolateHcl = d3_interpolateHcl;
	  function d3_interpolateHcl(a, b) {
	    a = d3.hcl(a);
	    b = d3.hcl(b);
	    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
	    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
	    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
	    return function(t) {
	      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
	    };
	  }
	  d3.interpolateHsl = d3_interpolateHsl;
	  function d3_interpolateHsl(a, b) {
	    a = d3.hsl(a);
	    b = d3.hsl(b);
	    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
	    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
	    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
	    return function(t) {
	      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
	    };
	  }
	  d3.interpolateLab = d3_interpolateLab;
	  function d3_interpolateLab(a, b) {
	    a = d3.lab(a);
	    b = d3.lab(b);
	    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
	    return function(t) {
	      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
	    };
	  }
	  d3.interpolateRound = d3_interpolateRound;
	  function d3_interpolateRound(a, b) {
	    b -= a;
	    return function(t) {
	      return Math.round(a + b * t);
	    };
	  }
	  d3.transform = function(string) {
	    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
	    return (d3.transform = function(string) {
	      if (string != null) {
	        g.setAttribute("transform", string);
	        var t = g.transform.baseVal.consolidate();
	      }
	      return new d3_transform(t ? t.matrix : d3_transformIdentity);
	    })(string);
	  };
	  function d3_transform(m) {
	    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
	    if (r0[0] * r1[1] < r1[0] * r0[1]) {
	      r0[0] *= -1;
	      r0[1] *= -1;
	      kx *= -1;
	      kz *= -1;
	    }
	    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
	    this.translate = [ m.e, m.f ];
	    this.scale = [ kx, ky ];
	    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
	  }
	  d3_transform.prototype.toString = function() {
	    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
	  };
	  function d3_transformDot(a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	  }
	  function d3_transformNormalize(a) {
	    var k = Math.sqrt(d3_transformDot(a, a));
	    if (k) {
	      a[0] /= k;
	      a[1] /= k;
	    }
	    return k;
	  }
	  function d3_transformCombine(a, b, k) {
	    a[0] += k * b[0];
	    a[1] += k * b[1];
	    return a;
	  }
	  var d3_transformIdentity = {
	    a: 1,
	    b: 0,
	    c: 0,
	    d: 1,
	    e: 0,
	    f: 0
	  };
	  d3.interpolateTransform = d3_interpolateTransform;
	  function d3_interpolateTransformPop(s) {
	    return s.length ? s.pop() + "," : "";
	  }
	  function d3_interpolateTranslate(ta, tb, s, q) {
	    if (ta[0] !== tb[0] || ta[1] !== tb[1]) {
	      var i = s.push("translate(", null, ",", null, ")");
	      q.push({
	        i: i - 4,
	        x: d3_interpolateNumber(ta[0], tb[0])
	      }, {
	        i: i - 2,
	        x: d3_interpolateNumber(ta[1], tb[1])
	      });
	    } else if (tb[0] || tb[1]) {
	      s.push("translate(" + tb + ")");
	    }
	  }
	  function d3_interpolateRotate(ra, rb, s, q) {
	    if (ra !== rb) {
	      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
	      q.push({
	        i: s.push(d3_interpolateTransformPop(s) + "rotate(", null, ")") - 2,
	        x: d3_interpolateNumber(ra, rb)
	      });
	    } else if (rb) {
	      s.push(d3_interpolateTransformPop(s) + "rotate(" + rb + ")");
	    }
	  }
	  function d3_interpolateSkew(wa, wb, s, q) {
	    if (wa !== wb) {
	      q.push({
	        i: s.push(d3_interpolateTransformPop(s) + "skewX(", null, ")") - 2,
	        x: d3_interpolateNumber(wa, wb)
	      });
	    } else if (wb) {
	      s.push(d3_interpolateTransformPop(s) + "skewX(" + wb + ")");
	    }
	  }
	  function d3_interpolateScale(ka, kb, s, q) {
	    if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
	      var i = s.push(d3_interpolateTransformPop(s) + "scale(", null, ",", null, ")");
	      q.push({
	        i: i - 4,
	        x: d3_interpolateNumber(ka[0], kb[0])
	      }, {
	        i: i - 2,
	        x: d3_interpolateNumber(ka[1], kb[1])
	      });
	    } else if (kb[0] !== 1 || kb[1] !== 1) {
	      s.push(d3_interpolateTransformPop(s) + "scale(" + kb + ")");
	    }
	  }
	  function d3_interpolateTransform(a, b) {
	    var s = [], q = [];
	    a = d3.transform(a), b = d3.transform(b);
	    d3_interpolateTranslate(a.translate, b.translate, s, q);
	    d3_interpolateRotate(a.rotate, b.rotate, s, q);
	    d3_interpolateSkew(a.skew, b.skew, s, q);
	    d3_interpolateScale(a.scale, b.scale, s, q);
	    a = b = null;
	    return function(t) {
	      var i = -1, n = q.length, o;
	      while (++i < n) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    };
	  }
	  function d3_uninterpolateNumber(a, b) {
	    b = (b -= a = +a) || 1 / b;
	    return function(x) {
	      return (x - a) / b;
	    };
	  }
	  function d3_uninterpolateClamp(a, b) {
	    b = (b -= a = +a) || 1 / b;
	    return function(x) {
	      return Math.max(0, Math.min(1, (x - a) / b));
	    };
	  }
	  d3.layout = {};
	  d3.layout.bundle = function() {
	    return function(links) {
	      var paths = [], i = -1, n = links.length;
	      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
	      return paths;
	    };
	  };
	  function d3_layout_bundlePath(link) {
	    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
	    while (start !== lca) {
	      start = start.parent;
	      points.push(start);
	    }
	    var k = points.length;
	    while (end !== lca) {
	      points.splice(k, 0, end);
	      end = end.parent;
	    }
	    return points;
	  }
	  function d3_layout_bundleAncestors(node) {
	    var ancestors = [], parent = node.parent;
	    while (parent != null) {
	      ancestors.push(node);
	      node = parent;
	      parent = parent.parent;
	    }
	    ancestors.push(node);
	    return ancestors;
	  }
	  function d3_layout_bundleLeastCommonAncestor(a, b) {
	    if (a === b) return a;
	    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
	    while (aNode === bNode) {
	      sharedNode = aNode;
	      aNode = aNodes.pop();
	      bNode = bNodes.pop();
	    }
	    return sharedNode;
	  }
	  d3.layout.chord = function() {
	    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
	    function relayout() {
	      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
	      chords = [];
	      groups = [];
	      k = 0, i = -1;
	      while (++i < n) {
	        x = 0, j = -1;
	        while (++j < n) {
	          x += matrix[i][j];
	        }
	        groupSums.push(x);
	        subgroupIndex.push(d3.range(n));
	        k += x;
	      }
	      if (sortGroups) {
	        groupIndex.sort(function(a, b) {
	          return sortGroups(groupSums[a], groupSums[b]);
	        });
	      }
	      if (sortSubgroups) {
	        subgroupIndex.forEach(function(d, i) {
	          d.sort(function(a, b) {
	            return sortSubgroups(matrix[i][a], matrix[i][b]);
	          });
	        });
	      }
	      k = (τ - padding * n) / k;
	      x = 0, i = -1;
	      while (++i < n) {
	        x0 = x, j = -1;
	        while (++j < n) {
	          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
	          subgroups[di + "-" + dj] = {
	            index: di,
	            subindex: dj,
	            startAngle: a0,
	            endAngle: a1,
	            value: v
	          };
	        }
	        groups[di] = {
	          index: di,
	          startAngle: x0,
	          endAngle: x,
	          value: groupSums[di]
	        };
	        x += padding;
	      }
	      i = -1;
	      while (++i < n) {
	        j = i - 1;
	        while (++j < n) {
	          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
	          if (source.value || target.value) {
	            chords.push(source.value < target.value ? {
	              source: target,
	              target: source
	            } : {
	              source: source,
	              target: target
	            });
	          }
	        }
	      }
	      if (sortChords) resort();
	    }
	    function resort() {
	      chords.sort(function(a, b) {
	        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
	      });
	    }
	    chord.matrix = function(x) {
	      if (!arguments.length) return matrix;
	      n = (matrix = x) && matrix.length;
	      chords = groups = null;
	      return chord;
	    };
	    chord.padding = function(x) {
	      if (!arguments.length) return padding;
	      padding = x;
	      chords = groups = null;
	      return chord;
	    };
	    chord.sortGroups = function(x) {
	      if (!arguments.length) return sortGroups;
	      sortGroups = x;
	      chords = groups = null;
	      return chord;
	    };
	    chord.sortSubgroups = function(x) {
	      if (!arguments.length) return sortSubgroups;
	      sortSubgroups = x;
	      chords = null;
	      return chord;
	    };
	    chord.sortChords = function(x) {
	      if (!arguments.length) return sortChords;
	      sortChords = x;
	      if (chords) resort();
	      return chord;
	    };
	    chord.chords = function() {
	      if (!chords) relayout();
	      return chords;
	    };
	    chord.groups = function() {
	      if (!groups) relayout();
	      return groups;
	    };
	    return chord;
	  };
	  d3.layout.force = function() {
	    var force = {}, event = d3.dispatch("start", "tick", "end"), timer, size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
	    function repulse(node) {
	      return function(quad, x1, _, x2) {
	        if (quad.point !== node) {
	          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
	          if (dw * dw / theta2 < dn) {
	            if (dn < chargeDistance2) {
	              var k = quad.charge / dn;
	              node.px -= dx * k;
	              node.py -= dy * k;
	            }
	            return true;
	          }
	          if (quad.point && dn && dn < chargeDistance2) {
	            var k = quad.pointCharge / dn;
	            node.px -= dx * k;
	            node.py -= dy * k;
	          }
	        }
	        return !quad.charge;
	      };
	    }
	    force.tick = function() {
	      if ((alpha *= .99) < .005) {
	        timer = null;
	        event.end({
	          type: "end",
	          alpha: alpha = 0
	        });
	        return true;
	      }
	      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
	      for (i = 0; i < m; ++i) {
	        o = links[i];
	        s = o.source;
	        t = o.target;
	        x = t.x - s.x;
	        y = t.y - s.y;
	        if (l = x * x + y * y) {
	          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
	          x *= l;
	          y *= l;
	          t.x -= x * (k = s.weight + t.weight ? s.weight / (s.weight + t.weight) : .5);
	          t.y -= y * k;
	          s.x += x * (k = 1 - k);
	          s.y += y * k;
	        }
	      }
	      if (k = alpha * gravity) {
	        x = size[0] / 2;
	        y = size[1] / 2;
	        i = -1;
	        if (k) while (++i < n) {
	          o = nodes[i];
	          o.x += (x - o.x) * k;
	          o.y += (y - o.y) * k;
	        }
	      }
	      if (charge) {
	        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
	        i = -1;
	        while (++i < n) {
	          if (!(o = nodes[i]).fixed) {
	            q.visit(repulse(o));
	          }
	        }
	      }
	      i = -1;
	      while (++i < n) {
	        o = nodes[i];
	        if (o.fixed) {
	          o.x = o.px;
	          o.y = o.py;
	        } else {
	          o.x -= (o.px - (o.px = o.x)) * friction;
	          o.y -= (o.py - (o.py = o.y)) * friction;
	        }
	      }
	      event.tick({
	        type: "tick",
	        alpha: alpha
	      });
	    };
	    force.nodes = function(x) {
	      if (!arguments.length) return nodes;
	      nodes = x;
	      return force;
	    };
	    force.links = function(x) {
	      if (!arguments.length) return links;
	      links = x;
	      return force;
	    };
	    force.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return force;
	    };
	    force.linkDistance = function(x) {
	      if (!arguments.length) return linkDistance;
	      linkDistance = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.distance = force.linkDistance;
	    force.linkStrength = function(x) {
	      if (!arguments.length) return linkStrength;
	      linkStrength = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.friction = function(x) {
	      if (!arguments.length) return friction;
	      friction = +x;
	      return force;
	    };
	    force.charge = function(x) {
	      if (!arguments.length) return charge;
	      charge = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.chargeDistance = function(x) {
	      if (!arguments.length) return Math.sqrt(chargeDistance2);
	      chargeDistance2 = x * x;
	      return force;
	    };
	    force.gravity = function(x) {
	      if (!arguments.length) return gravity;
	      gravity = +x;
	      return force;
	    };
	    force.theta = function(x) {
	      if (!arguments.length) return Math.sqrt(theta2);
	      theta2 = x * x;
	      return force;
	    };
	    force.alpha = function(x) {
	      if (!arguments.length) return alpha;
	      x = +x;
	      if (alpha) {
	        if (x > 0) {
	          alpha = x;
	        } else {
	          timer.c = null, timer.t = NaN, timer = null;
	          event.end({
	            type: "end",
	            alpha: alpha = 0
	          });
	        }
	      } else if (x > 0) {
	        event.start({
	          type: "start",
	          alpha: alpha = x
	        });
	        timer = d3_timer(force.tick);
	      }
	      return force;
	    };
	    force.start = function() {
	      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
	      for (i = 0; i < n; ++i) {
	        (o = nodes[i]).index = i;
	        o.weight = 0;
	      }
	      for (i = 0; i < m; ++i) {
	        o = links[i];
	        if (typeof o.source == "number") o.source = nodes[o.source];
	        if (typeof o.target == "number") o.target = nodes[o.target];
	        ++o.source.weight;
	        ++o.target.weight;
	      }
	      for (i = 0; i < n; ++i) {
	        o = nodes[i];
	        if (isNaN(o.x)) o.x = position("x", w);
	        if (isNaN(o.y)) o.y = position("y", h);
	        if (isNaN(o.px)) o.px = o.x;
	        if (isNaN(o.py)) o.py = o.y;
	      }
	      distances = [];
	      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
	      strengths = [];
	      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
	      charges = [];
	      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
	      function position(dimension, size) {
	        if (!neighbors) {
	          neighbors = new Array(n);
	          for (j = 0; j < n; ++j) {
	            neighbors[j] = [];
	          }
	          for (j = 0; j < m; ++j) {
	            var o = links[j];
	            neighbors[o.source.index].push(o.target);
	            neighbors[o.target.index].push(o.source);
	          }
	        }
	        var candidates = neighbors[i], j = -1, l = candidates.length, x;
	        while (++j < l) if (!isNaN(x = candidates[j][dimension])) return x;
	        return Math.random() * size;
	      }
	      return force.resume();
	    };
	    force.resume = function() {
	      return force.alpha(.1);
	    };
	    force.stop = function() {
	      return force.alpha(0);
	    };
	    force.drag = function() {
	      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
	      if (!arguments.length) return drag;
	      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
	    };
	    function dragmove(d) {
	      d.px = d3.event.x, d.py = d3.event.y;
	      force.resume();
	    }
	    return d3.rebind(force, event, "on");
	  };
	  function d3_layout_forceDragstart(d) {
	    d.fixed |= 2;
	  }
	  function d3_layout_forceDragend(d) {
	    d.fixed &= ~6;
	  }
	  function d3_layout_forceMouseover(d) {
	    d.fixed |= 4;
	    d.px = d.x, d.py = d.y;
	  }
	  function d3_layout_forceMouseout(d) {
	    d.fixed &= ~4;
	  }
	  function d3_layout_forceAccumulate(quad, alpha, charges) {
	    var cx = 0, cy = 0;
	    quad.charge = 0;
	    if (!quad.leaf) {
	      var nodes = quad.nodes, n = nodes.length, i = -1, c;
	      while (++i < n) {
	        c = nodes[i];
	        if (c == null) continue;
	        d3_layout_forceAccumulate(c, alpha, charges);
	        quad.charge += c.charge;
	        cx += c.charge * c.cx;
	        cy += c.charge * c.cy;
	      }
	    }
	    if (quad.point) {
	      if (!quad.leaf) {
	        quad.point.x += Math.random() - .5;
	        quad.point.y += Math.random() - .5;
	      }
	      var k = alpha * charges[quad.point.index];
	      quad.charge += quad.pointCharge = k;
	      cx += k * quad.point.x;
	      cy += k * quad.point.y;
	    }
	    quad.cx = cx / quad.charge;
	    quad.cy = cy / quad.charge;
	  }
	  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
	  d3.layout.hierarchy = function() {
	    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
	    function hierarchy(root) {
	      var stack = [ root ], nodes = [], node;
	      root.depth = 0;
	      while ((node = stack.pop()) != null) {
	        nodes.push(node);
	        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
	          var n, childs, child;
	          while (--n >= 0) {
	            stack.push(child = childs[n]);
	            child.parent = node;
	            child.depth = node.depth + 1;
	          }
	          if (value) node.value = 0;
	          node.children = childs;
	        } else {
	          if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
	          delete node.children;
	        }
	      }
	      d3_layout_hierarchyVisitAfter(root, function(node) {
	        var childs, parent;
	        if (sort && (childs = node.children)) childs.sort(sort);
	        if (value && (parent = node.parent)) parent.value += node.value;
	      });
	      return nodes;
	    }
	    hierarchy.sort = function(x) {
	      if (!arguments.length) return sort;
	      sort = x;
	      return hierarchy;
	    };
	    hierarchy.children = function(x) {
	      if (!arguments.length) return children;
	      children = x;
	      return hierarchy;
	    };
	    hierarchy.value = function(x) {
	      if (!arguments.length) return value;
	      value = x;
	      return hierarchy;
	    };
	    hierarchy.revalue = function(root) {
	      if (value) {
	        d3_layout_hierarchyVisitBefore(root, function(node) {
	          if (node.children) node.value = 0;
	        });
	        d3_layout_hierarchyVisitAfter(root, function(node) {
	          var parent;
	          if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
	          if (parent = node.parent) parent.value += node.value;
	        });
	      }
	      return root;
	    };
	    return hierarchy;
	  };
	  function d3_layout_hierarchyRebind(object, hierarchy) {
	    d3.rebind(object, hierarchy, "sort", "children", "value");
	    object.nodes = object;
	    object.links = d3_layout_hierarchyLinks;
	    return object;
	  }
	  function d3_layout_hierarchyVisitBefore(node, callback) {
	    var nodes = [ node ];
	    while ((node = nodes.pop()) != null) {
	      callback(node);
	      if ((children = node.children) && (n = children.length)) {
	        var n, children;
	        while (--n >= 0) nodes.push(children[n]);
	      }
	    }
	  }
	  function d3_layout_hierarchyVisitAfter(node, callback) {
	    var nodes = [ node ], nodes2 = [];
	    while ((node = nodes.pop()) != null) {
	      nodes2.push(node);
	      if ((children = node.children) && (n = children.length)) {
	        var i = -1, n, children;
	        while (++i < n) nodes.push(children[i]);
	      }
	    }
	    while ((node = nodes2.pop()) != null) {
	      callback(node);
	    }
	  }
	  function d3_layout_hierarchyChildren(d) {
	    return d.children;
	  }
	  function d3_layout_hierarchyValue(d) {
	    return d.value;
	  }
	  function d3_layout_hierarchySort(a, b) {
	    return b.value - a.value;
	  }
	  function d3_layout_hierarchyLinks(nodes) {
	    return d3.merge(nodes.map(function(parent) {
	      return (parent.children || []).map(function(child) {
	        return {
	          source: parent,
	          target: child
	        };
	      });
	    }));
	  }
	  d3.layout.partition = function() {
	    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
	    function position(node, x, dx, dy) {
	      var children = node.children;
	      node.x = x;
	      node.y = node.depth * dy;
	      node.dx = dx;
	      node.dy = dy;
	      if (children && (n = children.length)) {
	        var i = -1, n, c, d;
	        dx = node.value ? dx / node.value : 0;
	        while (++i < n) {
	          position(c = children[i], x, d = c.value * dx, dy);
	          x += d;
	        }
	      }
	    }
	    function depth(node) {
	      var children = node.children, d = 0;
	      if (children && (n = children.length)) {
	        var i = -1, n;
	        while (++i < n) d = Math.max(d, depth(children[i]));
	      }
	      return 1 + d;
	    }
	    function partition(d, i) {
	      var nodes = hierarchy.call(this, d, i);
	      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
	      return nodes;
	    }
	    partition.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return partition;
	    };
	    return d3_layout_hierarchyRebind(partition, hierarchy);
	  };
	  d3.layout.pie = function() {
	    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ, padAngle = 0;
	    function pie(data) {
	      var n = data.length, values = data.map(function(d, i) {
	        return +value.call(pie, d, i);
	      }), a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle), da = (typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a, p = Math.min(Math.abs(da) / n, +(typeof padAngle === "function" ? padAngle.apply(this, arguments) : padAngle)), pa = p * (da < 0 ? -1 : 1), sum = d3.sum(values), k = sum ? (da - n * pa) / sum : 0, index = d3.range(n), arcs = [], v;
	      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
	        return values[j] - values[i];
	      } : function(i, j) {
	        return sort(data[i], data[j]);
	      });
	      index.forEach(function(i) {
	        arcs[i] = {
	          data: data[i],
	          value: v = values[i],
	          startAngle: a,
	          endAngle: a += v * k + pa,
	          padAngle: p
	        };
	      });
	      return arcs;
	    }
	    pie.value = function(_) {
	      if (!arguments.length) return value;
	      value = _;
	      return pie;
	    };
	    pie.sort = function(_) {
	      if (!arguments.length) return sort;
	      sort = _;
	      return pie;
	    };
	    pie.startAngle = function(_) {
	      if (!arguments.length) return startAngle;
	      startAngle = _;
	      return pie;
	    };
	    pie.endAngle = function(_) {
	      if (!arguments.length) return endAngle;
	      endAngle = _;
	      return pie;
	    };
	    pie.padAngle = function(_) {
	      if (!arguments.length) return padAngle;
	      padAngle = _;
	      return pie;
	    };
	    return pie;
	  };
	  var d3_layout_pieSortByValue = {};
	  d3.layout.stack = function() {
	    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
	    function stack(data, index) {
	      if (!(n = data.length)) return data;
	      var series = data.map(function(d, i) {
	        return values.call(stack, d, i);
	      });
	      var points = series.map(function(d) {
	        return d.map(function(v, i) {
	          return [ x.call(stack, v, i), y.call(stack, v, i) ];
	        });
	      });
	      var orders = order.call(stack, points, index);
	      series = d3.permute(series, orders);
	      points = d3.permute(points, orders);
	      var offsets = offset.call(stack, points, index);
	      var m = series[0].length, n, i, j, o;
	      for (j = 0; j < m; ++j) {
	        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
	        for (i = 1; i < n; ++i) {
	          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
	        }
	      }
	      return data;
	    }
	    stack.values = function(x) {
	      if (!arguments.length) return values;
	      values = x;
	      return stack;
	    };
	    stack.order = function(x) {
	      if (!arguments.length) return order;
	      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
	      return stack;
	    };
	    stack.offset = function(x) {
	      if (!arguments.length) return offset;
	      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
	      return stack;
	    };
	    stack.x = function(z) {
	      if (!arguments.length) return x;
	      x = z;
	      return stack;
	    };
	    stack.y = function(z) {
	      if (!arguments.length) return y;
	      y = z;
	      return stack;
	    };
	    stack.out = function(z) {
	      if (!arguments.length) return out;
	      out = z;
	      return stack;
	    };
	    return stack;
	  };
	  function d3_layout_stackX(d) {
	    return d.x;
	  }
	  function d3_layout_stackY(d) {
	    return d.y;
	  }
	  function d3_layout_stackOut(d, y0, y) {
	    d.y0 = y0;
	    d.y = y;
	  }
	  var d3_layout_stackOrders = d3.map({
	    "inside-out": function(data) {
	      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
	        return max[a] - max[b];
	      }), top = 0, bottom = 0, tops = [], bottoms = [];
	      for (i = 0; i < n; ++i) {
	        j = index[i];
	        if (top < bottom) {
	          top += sums[j];
	          tops.push(j);
	        } else {
	          bottom += sums[j];
	          bottoms.push(j);
	        }
	      }
	      return bottoms.reverse().concat(tops);
	    },
	    reverse: function(data) {
	      return d3.range(data.length).reverse();
	    },
	    "default": d3_layout_stackOrderDefault
	  });
	  var d3_layout_stackOffsets = d3.map({
	    silhouette: function(data) {
	      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
	      for (j = 0; j < m; ++j) {
	        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
	        if (o > max) max = o;
	        sums.push(o);
	      }
	      for (j = 0; j < m; ++j) {
	        y0[j] = (max - sums[j]) / 2;
	      }
	      return y0;
	    },
	    wiggle: function(data) {
	      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
	      y0[0] = o = o0 = 0;
	      for (j = 1; j < m; ++j) {
	        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
	        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
	          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
	            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
	          }
	          s2 += s3 * data[i][j][1];
	        }
	        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
	        if (o < o0) o0 = o;
	      }
	      for (j = 0; j < m; ++j) y0[j] -= o0;
	      return y0;
	    },
	    expand: function(data) {
	      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
	      for (j = 0; j < m; ++j) {
	        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
	        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
	      }
	      for (j = 0; j < m; ++j) y0[j] = 0;
	      return y0;
	    },
	    zero: d3_layout_stackOffsetZero
	  });
	  function d3_layout_stackOrderDefault(data) {
	    return d3.range(data.length);
	  }
	  function d3_layout_stackOffsetZero(data) {
	    var j = -1, m = data[0].length, y0 = [];
	    while (++j < m) y0[j] = 0;
	    return y0;
	  }
	  function d3_layout_stackMaxIndex(array) {
	    var i = 1, j = 0, v = array[0][1], k, n = array.length;
	    for (;i < n; ++i) {
	      if ((k = array[i][1]) > v) {
	        j = i;
	        v = k;
	      }
	    }
	    return j;
	  }
	  function d3_layout_stackReduceSum(d) {
	    return d.reduce(d3_layout_stackSum, 0);
	  }
	  function d3_layout_stackSum(p, d) {
	    return p + d[1];
	  }
	  d3.layout.histogram = function() {
	    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
	    function histogram(data, i) {
	      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
	      while (++i < m) {
	        bin = bins[i] = [];
	        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
	        bin.y = 0;
	      }
	      if (m > 0) {
	        i = -1;
	        while (++i < n) {
	          x = values[i];
	          if (x >= range[0] && x <= range[1]) {
	            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
	            bin.y += k;
	            bin.push(data[i]);
	          }
	        }
	      }
	      return bins;
	    }
	    histogram.value = function(x) {
	      if (!arguments.length) return valuer;
	      valuer = x;
	      return histogram;
	    };
	    histogram.range = function(x) {
	      if (!arguments.length) return ranger;
	      ranger = d3_functor(x);
	      return histogram;
	    };
	    histogram.bins = function(x) {
	      if (!arguments.length) return binner;
	      binner = typeof x === "number" ? function(range) {
	        return d3_layout_histogramBinFixed(range, x);
	      } : d3_functor(x);
	      return histogram;
	    };
	    histogram.frequency = function(x) {
	      if (!arguments.length) return frequency;
	      frequency = !!x;
	      return histogram;
	    };
	    return histogram;
	  };
	  function d3_layout_histogramBinSturges(range, values) {
	    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
	  }
	  function d3_layout_histogramBinFixed(range, n) {
	    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
	    while (++x <= n) f[x] = m * x + b;
	    return f;
	  }
	  function d3_layout_histogramRange(values) {
	    return [ d3.min(values), d3.max(values) ];
	  }
	  d3.layout.pack = function() {
	    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
	    function pack(d, i) {
	      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
	        return radius;
	      };
	      root.x = root.y = 0;
	      d3_layout_hierarchyVisitAfter(root, function(d) {
	        d.r = +r(d.value);
	      });
	      d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
	      if (padding) {
	        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
	        d3_layout_hierarchyVisitAfter(root, function(d) {
	          d.r += dr;
	        });
	        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
	        d3_layout_hierarchyVisitAfter(root, function(d) {
	          d.r -= dr;
	        });
	      }
	      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
	      return nodes;
	    }
	    pack.size = function(_) {
	      if (!arguments.length) return size;
	      size = _;
	      return pack;
	    };
	    pack.radius = function(_) {
	      if (!arguments.length) return radius;
	      radius = _ == null || typeof _ === "function" ? _ : +_;
	      return pack;
	    };
	    pack.padding = function(_) {
	      if (!arguments.length) return padding;
	      padding = +_;
	      return pack;
	    };
	    return d3_layout_hierarchyRebind(pack, hierarchy);
	  };
	  function d3_layout_packSort(a, b) {
	    return a.value - b.value;
	  }
	  function d3_layout_packInsert(a, b) {
	    var c = a._pack_next;
	    a._pack_next = b;
	    b._pack_prev = a;
	    b._pack_next = c;
	    c._pack_prev = b;
	  }
	  function d3_layout_packSplice(a, b) {
	    a._pack_next = b;
	    b._pack_prev = a;
	  }
	  function d3_layout_packIntersects(a, b) {
	    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
	    return .999 * dr * dr > dx * dx + dy * dy;
	  }
	  function d3_layout_packSiblings(node) {
	    if (!(nodes = node.children) || !(n = nodes.length)) return;
	    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
	    function bound(node) {
	      xMin = Math.min(node.x - node.r, xMin);
	      xMax = Math.max(node.x + node.r, xMax);
	      yMin = Math.min(node.y - node.r, yMin);
	      yMax = Math.max(node.y + node.r, yMax);
	    }
	    nodes.forEach(d3_layout_packLink);
	    a = nodes[0];
	    a.x = -a.r;
	    a.y = 0;
	    bound(a);
	    if (n > 1) {
	      b = nodes[1];
	      b.x = b.r;
	      b.y = 0;
	      bound(b);
	      if (n > 2) {
	        c = nodes[2];
	        d3_layout_packPlace(a, b, c);
	        bound(c);
	        d3_layout_packInsert(a, c);
	        a._pack_prev = c;
	        d3_layout_packInsert(c, b);
	        b = a._pack_next;
	        for (i = 3; i < n; i++) {
	          d3_layout_packPlace(a, b, c = nodes[i]);
	          var isect = 0, s1 = 1, s2 = 1;
	          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
	            if (d3_layout_packIntersects(j, c)) {
	              isect = 1;
	              break;
	            }
	          }
	          if (isect == 1) {
	            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
	              if (d3_layout_packIntersects(k, c)) {
	                break;
	              }
	            }
	          }
	          if (isect) {
	            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
	            i--;
	          } else {
	            d3_layout_packInsert(a, c);
	            b = c;
	            bound(c);
	          }
	        }
	      }
	    }
	    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
	    for (i = 0; i < n; i++) {
	      c = nodes[i];
	      c.x -= cx;
	      c.y -= cy;
	      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
	    }
	    node.r = cr;
	    nodes.forEach(d3_layout_packUnlink);
	  }
	  function d3_layout_packLink(node) {
	    node._pack_next = node._pack_prev = node;
	  }
	  function d3_layout_packUnlink(node) {
	    delete node._pack_next;
	    delete node._pack_prev;
	  }
	  function d3_layout_packTransform(node, x, y, k) {
	    var children = node.children;
	    node.x = x += k * node.x;
	    node.y = y += k * node.y;
	    node.r *= k;
	    if (children) {
	      var i = -1, n = children.length;
	      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
	    }
	  }
	  function d3_layout_packPlace(a, b, c) {
	    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
	    if (db && (dx || dy)) {
	      var da = b.r + c.r, dc = dx * dx + dy * dy;
	      da *= da;
	      db *= db;
	      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
	      c.x = a.x + x * dx + y * dy;
	      c.y = a.y + x * dy - y * dx;
	    } else {
	      c.x = a.x + db;
	      c.y = a.y;
	    }
	  }
	  d3.layout.tree = function() {
	    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = null;
	    function tree(d, i) {
	      var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
	      d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
	      d3_layout_hierarchyVisitBefore(root1, secondWalk);
	      if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
	        var left = root0, right = root0, bottom = root0;
	        d3_layout_hierarchyVisitBefore(root0, function(node) {
	          if (node.x < left.x) left = node;
	          if (node.x > right.x) right = node;
	          if (node.depth > bottom.depth) bottom = node;
	        });
	        var tx = separation(left, right) / 2 - left.x, kx = size[0] / (right.x + separation(right, left) / 2 + tx), ky = size[1] / (bottom.depth || 1);
	        d3_layout_hierarchyVisitBefore(root0, function(node) {
	          node.x = (node.x + tx) * kx;
	          node.y = node.depth * ky;
	        });
	      }
	      return nodes;
	    }
	    function wrapTree(root0) {
	      var root1 = {
	        A: null,
	        children: [ root0 ]
	      }, queue = [ root1 ], node1;
	      while ((node1 = queue.pop()) != null) {
	        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
	          queue.push((children[i] = child = {
	            _: children[i],
	            parent: node1,
	            children: (child = children[i].children) && child.slice() || [],
	            A: null,
	            a: null,
	            z: 0,
	            m: 0,
	            c: 0,
	            s: 0,
	            t: null,
	            i: i
	          }).a = child);
	        }
	      }
	      return root1.children[0];
	    }
	    function firstWalk(v) {
	      var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
	      if (children.length) {
	        d3_layout_treeShift(v);
	        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
	        if (w) {
	          v.z = w.z + separation(v._, w._);
	          v.m = v.z - midpoint;
	        } else {
	          v.z = midpoint;
	        }
	      } else if (w) {
	        v.z = w.z + separation(v._, w._);
	      }
	      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
	    }
	    function secondWalk(v) {
	      v._.x = v.z + v.parent.m;
	      v.m += v.parent.m;
	    }
	    function apportion(v, w, ancestor) {
	      if (w) {
	        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
	        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
	          vom = d3_layout_treeLeft(vom);
	          vop = d3_layout_treeRight(vop);
	          vop.a = v;
	          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
	          if (shift > 0) {
	            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
	            sip += shift;
	            sop += shift;
	          }
	          sim += vim.m;
	          sip += vip.m;
	          som += vom.m;
	          sop += vop.m;
	        }
	        if (vim && !d3_layout_treeRight(vop)) {
	          vop.t = vim;
	          vop.m += sim - sop;
	        }
	        if (vip && !d3_layout_treeLeft(vom)) {
	          vom.t = vip;
	          vom.m += sip - som;
	          ancestor = v;
	        }
	      }
	      return ancestor;
	    }
	    function sizeNode(node) {
	      node.x *= size[0];
	      node.y = node.depth * size[1];
	    }
	    tree.separation = function(x) {
	      if (!arguments.length) return separation;
	      separation = x;
	      return tree;
	    };
	    tree.size = function(x) {
	      if (!arguments.length) return nodeSize ? null : size;
	      nodeSize = (size = x) == null ? sizeNode : null;
	      return tree;
	    };
	    tree.nodeSize = function(x) {
	      if (!arguments.length) return nodeSize ? size : null;
	      nodeSize = (size = x) == null ? null : sizeNode;
	      return tree;
	    };
	    return d3_layout_hierarchyRebind(tree, hierarchy);
	  };
	  function d3_layout_treeSeparation(a, b) {
	    return a.parent == b.parent ? 1 : 2;
	  }
	  function d3_layout_treeLeft(v) {
	    var children = v.children;
	    return children.length ? children[0] : v.t;
	  }
	  function d3_layout_treeRight(v) {
	    var children = v.children, n;
	    return (n = children.length) ? children[n - 1] : v.t;
	  }
	  function d3_layout_treeMove(wm, wp, shift) {
	    var change = shift / (wp.i - wm.i);
	    wp.c -= change;
	    wp.s += shift;
	    wm.c += change;
	    wp.z += shift;
	    wp.m += shift;
	  }
	  function d3_layout_treeShift(v) {
	    var shift = 0, change = 0, children = v.children, i = children.length, w;
	    while (--i >= 0) {
	      w = children[i];
	      w.z += shift;
	      w.m += shift;
	      shift += w.s + (change += w.c);
	    }
	  }
	  function d3_layout_treeAncestor(vim, v, ancestor) {
	    return vim.a.parent === v.parent ? vim.a : ancestor;
	  }
	  d3.layout.cluster = function() {
	    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
	    function cluster(d, i) {
	      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
	      d3_layout_hierarchyVisitAfter(root, function(node) {
	        var children = node.children;
	        if (children && children.length) {
	          node.x = d3_layout_clusterX(children);
	          node.y = d3_layout_clusterY(children);
	        } else {
	          node.x = previousNode ? x += separation(node, previousNode) : 0;
	          node.y = 0;
	          previousNode = node;
	        }
	      });
	      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
	      d3_layout_hierarchyVisitAfter(root, nodeSize ? function(node) {
	        node.x = (node.x - root.x) * size[0];
	        node.y = (root.y - node.y) * size[1];
	      } : function(node) {
	        node.x = (node.x - x0) / (x1 - x0) * size[0];
	        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
	      });
	      return nodes;
	    }
	    cluster.separation = function(x) {
	      if (!arguments.length) return separation;
	      separation = x;
	      return cluster;
	    };
	    cluster.size = function(x) {
	      if (!arguments.length) return nodeSize ? null : size;
	      nodeSize = (size = x) == null;
	      return cluster;
	    };
	    cluster.nodeSize = function(x) {
	      if (!arguments.length) return nodeSize ? size : null;
	      nodeSize = (size = x) != null;
	      return cluster;
	    };
	    return d3_layout_hierarchyRebind(cluster, hierarchy);
	  };
	  function d3_layout_clusterY(children) {
	    return 1 + d3.max(children, function(child) {
	      return child.y;
	    });
	  }
	  function d3_layout_clusterX(children) {
	    return children.reduce(function(x, child) {
	      return x + child.x;
	    }, 0) / children.length;
	  }
	  function d3_layout_clusterLeft(node) {
	    var children = node.children;
	    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
	  }
	  function d3_layout_clusterRight(node) {
	    var children = node.children, n;
	    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
	  }
	  d3.layout.treemap = function() {
	    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
	    function scale(children, k) {
	      var i = -1, n = children.length, child, area;
	      while (++i < n) {
	        area = (child = children[i]).value * (k < 0 ? 0 : k);
	        child.area = isNaN(area) || area <= 0 ? 0 : area;
	      }
	    }
	    function squarify(node) {
	      var children = node.children;
	      if (children && children.length) {
	        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
	        scale(remaining, rect.dx * rect.dy / node.value);
	        row.area = 0;
	        while ((n = remaining.length) > 0) {
	          row.push(child = remaining[n - 1]);
	          row.area += child.area;
	          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
	            remaining.pop();
	            best = score;
	          } else {
	            row.area -= row.pop().area;
	            position(row, u, rect, false);
	            u = Math.min(rect.dx, rect.dy);
	            row.length = row.area = 0;
	            best = Infinity;
	          }
	        }
	        if (row.length) {
	          position(row, u, rect, true);
	          row.length = row.area = 0;
	        }
	        children.forEach(squarify);
	      }
	    }
	    function stickify(node) {
	      var children = node.children;
	      if (children && children.length) {
	        var rect = pad(node), remaining = children.slice(), child, row = [];
	        scale(remaining, rect.dx * rect.dy / node.value);
	        row.area = 0;
	        while (child = remaining.pop()) {
	          row.push(child);
	          row.area += child.area;
	          if (child.z != null) {
	            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
	            row.length = row.area = 0;
	          }
	        }
	        children.forEach(stickify);
	      }
	    }
	    function worst(row, u) {
	      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
	      while (++i < n) {
	        if (!(r = row[i].area)) continue;
	        if (r < rmin) rmin = r;
	        if (r > rmax) rmax = r;
	      }
	      s *= s;
	      u *= u;
	      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
	    }
	    function position(row, u, rect, flush) {
	      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
	      if (u == rect.dx) {
	        if (flush || v > rect.dy) v = rect.dy;
	        while (++i < n) {
	          o = row[i];
	          o.x = x;
	          o.y = y;
	          o.dy = v;
	          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
	        }
	        o.z = true;
	        o.dx += rect.x + rect.dx - x;
	        rect.y += v;
	        rect.dy -= v;
	      } else {
	        if (flush || v > rect.dx) v = rect.dx;
	        while (++i < n) {
	          o = row[i];
	          o.x = x;
	          o.y = y;
	          o.dx = v;
	          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
	        }
	        o.z = false;
	        o.dy += rect.y + rect.dy - y;
	        rect.x += v;
	        rect.dx -= v;
	      }
	    }
	    function treemap(d) {
	      var nodes = stickies || hierarchy(d), root = nodes[0];
	      root.x = root.y = 0;
	      if (root.value) root.dx = size[0], root.dy = size[1]; else root.dx = root.dy = 0;
	      if (stickies) hierarchy.revalue(root);
	      scale([ root ], root.dx * root.dy / root.value);
	      (stickies ? stickify : squarify)(root);
	      if (sticky) stickies = nodes;
	      return nodes;
	    }
	    treemap.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return treemap;
	    };
	    treemap.padding = function(x) {
	      if (!arguments.length) return padding;
	      function padFunction(node) {
	        var p = x.call(treemap, node, node.depth);
	        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
	      }
	      function padConstant(node) {
	        return d3_layout_treemapPad(node, x);
	      }
	      var type;
	      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
	      padConstant) : padConstant;
	      return treemap;
	    };
	    treemap.round = function(x) {
	      if (!arguments.length) return round != Number;
	      round = x ? Math.round : Number;
	      return treemap;
	    };
	    treemap.sticky = function(x) {
	      if (!arguments.length) return sticky;
	      sticky = x;
	      stickies = null;
	      return treemap;
	    };
	    treemap.ratio = function(x) {
	      if (!arguments.length) return ratio;
	      ratio = x;
	      return treemap;
	    };
	    treemap.mode = function(x) {
	      if (!arguments.length) return mode;
	      mode = x + "";
	      return treemap;
	    };
	    return d3_layout_hierarchyRebind(treemap, hierarchy);
	  };
	  function d3_layout_treemapPadNull(node) {
	    return {
	      x: node.x,
	      y: node.y,
	      dx: node.dx,
	      dy: node.dy
	    };
	  }
	  function d3_layout_treemapPad(node, padding) {
	    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
	    if (dx < 0) {
	      x += dx / 2;
	      dx = 0;
	    }
	    if (dy < 0) {
	      y += dy / 2;
	      dy = 0;
	    }
	    return {
	      x: x,
	      y: y,
	      dx: dx,
	      dy: dy
	    };
	  }
	  d3.random = {
	    normal: function(µ, σ) {
	      var n = arguments.length;
	      if (n < 2) σ = 1;
	      if (n < 1) µ = 0;
	      return function() {
	        var x, y, r;
	        do {
	          x = Math.random() * 2 - 1;
	          y = Math.random() * 2 - 1;
	          r = x * x + y * y;
	        } while (!r || r > 1);
	        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
	      };
	    },
	    logNormal: function() {
	      var random = d3.random.normal.apply(d3, arguments);
	      return function() {
	        return Math.exp(random());
	      };
	    },
	    bates: function(m) {
	      var random = d3.random.irwinHall(m);
	      return function() {
	        return random() / m;
	      };
	    },
	    irwinHall: function(m) {
	      return function() {
	        for (var s = 0, j = 0; j < m; j++) s += Math.random();
	        return s;
	      };
	    }
	  };
	  d3.scale = {};
	  function d3_scaleExtent(domain) {
	    var start = domain[0], stop = domain[domain.length - 1];
	    return start < stop ? [ start, stop ] : [ stop, start ];
	  }
	  function d3_scaleRange(scale) {
	    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
	  }
	  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
	    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
	    return function(x) {
	      return i(u(x));
	    };
	  }
	  function d3_scale_nice(domain, nice) {
	    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
	    if (x1 < x0) {
	      dx = i0, i0 = i1, i1 = dx;
	      dx = x0, x0 = x1, x1 = dx;
	    }
	    domain[i0] = nice.floor(x0);
	    domain[i1] = nice.ceil(x1);
	    return domain;
	  }
	  function d3_scale_niceStep(step) {
	    return step ? {
	      floor: function(x) {
	        return Math.floor(x / step) * step;
	      },
	      ceil: function(x) {
	        return Math.ceil(x / step) * step;
	      }
	    } : d3_scale_niceIdentity;
	  }
	  var d3_scale_niceIdentity = {
	    floor: d3_identity,
	    ceil: d3_identity
	  };
	  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
	    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
	    if (domain[k] < domain[0]) {
	      domain = domain.slice().reverse();
	      range = range.slice().reverse();
	    }
	    while (++j <= k) {
	      u.push(uninterpolate(domain[j - 1], domain[j]));
	      i.push(interpolate(range[j - 1], range[j]));
	    }
	    return function(x) {
	      var j = d3.bisect(domain, x, 1, k) - 1;
	      return i[j](u[j](x));
	    };
	  }
	  d3.scale.linear = function() {
	    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
	  };
	  function d3_scale_linear(domain, range, interpolate, clamp) {
	    var output, input;
	    function rescale() {
	      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
	      output = linear(domain, range, uninterpolate, interpolate);
	      input = linear(range, domain, uninterpolate, d3_interpolate);
	      return scale;
	    }
	    function scale(x) {
	      return output(x);
	    }
	    scale.invert = function(y) {
	      return input(y);
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(Number);
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.rangeRound = function(x) {
	      return scale.range(x).interpolate(d3_interpolateRound);
	    };
	    scale.clamp = function(x) {
	      if (!arguments.length) return clamp;
	      clamp = x;
	      return rescale();
	    };
	    scale.interpolate = function(x) {
	      if (!arguments.length) return interpolate;
	      interpolate = x;
	      return rescale();
	    };
	    scale.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    scale.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    scale.nice = function(m) {
	      d3_scale_linearNice(domain, m);
	      return rescale();
	    };
	    scale.copy = function() {
	      return d3_scale_linear(domain, range, interpolate, clamp);
	    };
	    return rescale();
	  }
	  function d3_scale_linearRebind(scale, linear) {
	    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
	  }
	  function d3_scale_linearNice(domain, m) {
	    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
	    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
	    return domain;
	  }
	  function d3_scale_linearTickRange(domain, m) {
	    if (m == null) m = 10;
	    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
	    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
	    extent[0] = Math.ceil(extent[0] / step) * step;
	    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
	    extent[2] = step;
	    return extent;
	  }
	  function d3_scale_linearTicks(domain, m) {
	    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
	  }
	  function d3_scale_linearTickFormat(domain, m, format) {
	    var range = d3_scale_linearTickRange(domain, m);
	    if (format) {
	      var match = d3_format_re.exec(format);
	      match.shift();
	      if (match[8] === "s") {
	        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
	        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
	        match[8] = "f";
	        format = d3.format(match.join(""));
	        return function(d) {
	          return format(prefix.scale(d)) + prefix.symbol;
	        };
	      }
	      if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
	      format = match.join("");
	    } else {
	      format = ",." + d3_scale_linearPrecision(range[2]) + "f";
	    }
	    return d3.format(format);
	  }
	  var d3_scale_linearFormatSignificant = {
	    s: 1,
	    g: 1,
	    p: 1,
	    r: 1,
	    e: 1
	  };
	  function d3_scale_linearPrecision(value) {
	    return -Math.floor(Math.log(value) / Math.LN10 + .01);
	  }
	  function d3_scale_linearFormatPrecision(type, range) {
	    var p = d3_scale_linearPrecision(range[2]);
	    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
	  }
	  d3.scale.log = function() {
	    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
	  };
	  function d3_scale_log(linear, base, positive, domain) {
	    function log(x) {
	      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
	    }
	    function pow(x) {
	      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
	    }
	    function scale(x) {
	      return linear(log(x));
	    }
	    scale.invert = function(x) {
	      return pow(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      positive = x[0] >= 0;
	      linear.domain((domain = x.map(Number)).map(log));
	      return scale;
	    };
	    scale.base = function(_) {
	      if (!arguments.length) return base;
	      base = +_;
	      linear.domain(domain.map(log));
	      return scale;
	    };
	    scale.nice = function() {
	      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
	      linear.domain(niced);
	      domain = niced.map(pow);
	      return scale;
	    };
	    scale.ticks = function() {
	      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
	      if (isFinite(j - i)) {
	        if (positive) {
	          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
	          ticks.push(pow(i));
	        } else {
	          ticks.push(pow(i));
	          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
	        }
	        for (i = 0; ticks[i] < u; i++) {}
	        for (j = ticks.length; ticks[j - 1] > v; j--) {}
	        ticks = ticks.slice(i, j);
	      }
	      return ticks;
	    };
	    scale.tickFormat = function(n, format) {
	      if (!arguments.length) return d3_scale_logFormat;
	      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
	      var k = Math.max(1, base * n / scale.ticks().length);
	      return function(d) {
	        var i = d / pow(Math.round(log(d)));
	        if (i * base < base - .5) i *= base;
	        return i <= k ? format(d) : "";
	      };
	    };
	    scale.copy = function() {
	      return d3_scale_log(linear.copy(), base, positive, domain);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
	    floor: function(x) {
	      return -Math.ceil(-x);
	    },
	    ceil: function(x) {
	      return -Math.floor(-x);
	    }
	  };
	  d3.scale.pow = function() {
	    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
	  };
	  function d3_scale_pow(linear, exponent, domain) {
	    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
	    function scale(x) {
	      return linear(powp(x));
	    }
	    scale.invert = function(x) {
	      return powb(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      linear.domain((domain = x.map(Number)).map(powp));
	      return scale;
	    };
	    scale.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    scale.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    scale.nice = function(m) {
	      return scale.domain(d3_scale_linearNice(domain, m));
	    };
	    scale.exponent = function(x) {
	      if (!arguments.length) return exponent;
	      powp = d3_scale_powPow(exponent = x);
	      powb = d3_scale_powPow(1 / exponent);
	      linear.domain(domain.map(powp));
	      return scale;
	    };
	    scale.copy = function() {
	      return d3_scale_pow(linear.copy(), exponent, domain);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  function d3_scale_powPow(e) {
	    return function(x) {
	      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
	    };
	  }
	  d3.scale.sqrt = function() {
	    return d3.scale.pow().exponent(.5);
	  };
	  d3.scale.ordinal = function() {
	    return d3_scale_ordinal([], {
	      t: "range",
	      a: [ [] ]
	    });
	  };
	  function d3_scale_ordinal(domain, ranger) {
	    var index, range, rangeBand;
	    function scale(x) {
	      return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
	    }
	    function steps(start, step) {
	      return d3.range(domain.length).map(function(i) {
	        return start + step * i;
	      });
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = [];
	      index = new d3_Map();
	      var i = -1, n = x.length, xi;
	      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
	      return scale[ranger.t].apply(scale, ranger.a);
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      rangeBand = 0;
	      ranger = {
	        t: "range",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangePoints = function(x, padding) {
	      if (arguments.length < 2) padding = 0;
	      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = (start + stop) / 2, 
	      0) : (stop - start) / (domain.length - 1 + padding);
	      range = steps(start + step * padding / 2, step);
	      rangeBand = 0;
	      ranger = {
	        t: "rangePoints",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeRoundPoints = function(x, padding) {
	      if (arguments.length < 2) padding = 0;
	      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = stop = Math.round((start + stop) / 2), 
	      0) : (stop - start) / (domain.length - 1 + padding) | 0;
	      range = steps(start + Math.round(step * padding / 2 + (stop - start - (domain.length - 1 + padding) * step) / 2), step);
	      rangeBand = 0;
	      ranger = {
	        t: "rangeRoundPoints",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeBands = function(x, padding, outerPadding) {
	      if (arguments.length < 2) padding = 0;
	      if (arguments.length < 3) outerPadding = padding;
	      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
	      range = steps(start + step * outerPadding, step);
	      if (reverse) range.reverse();
	      rangeBand = step * (1 - padding);
	      ranger = {
	        t: "rangeBands",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeRoundBands = function(x, padding, outerPadding) {
	      if (arguments.length < 2) padding = 0;
	      if (arguments.length < 3) outerPadding = padding;
	      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding));
	      range = steps(start + Math.round((stop - start - (domain.length - padding) * step) / 2), step);
	      if (reverse) range.reverse();
	      rangeBand = Math.round(step * (1 - padding));
	      ranger = {
	        t: "rangeRoundBands",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeBand = function() {
	      return rangeBand;
	    };
	    scale.rangeExtent = function() {
	      return d3_scaleExtent(ranger.a[0]);
	    };
	    scale.copy = function() {
	      return d3_scale_ordinal(domain, ranger);
	    };
	    return scale.domain(domain);
	  }
	  d3.scale.category10 = function() {
	    return d3.scale.ordinal().range(d3_category10);
	  };
	  d3.scale.category20 = function() {
	    return d3.scale.ordinal().range(d3_category20);
	  };
	  d3.scale.category20b = function() {
	    return d3.scale.ordinal().range(d3_category20b);
	  };
	  d3.scale.category20c = function() {
	    return d3.scale.ordinal().range(d3_category20c);
	  };
	  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
	  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
	  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
	  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
	  d3.scale.quantile = function() {
	    return d3_scale_quantile([], []);
	  };
	  function d3_scale_quantile(domain, range) {
	    var thresholds;
	    function rescale() {
	      var k = 0, q = range.length;
	      thresholds = [];
	      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
	      return scale;
	    }
	    function scale(x) {
	      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(d3_number).filter(d3_numeric).sort(d3_ascending);
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.quantiles = function() {
	      return thresholds;
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
	    };
	    scale.copy = function() {
	      return d3_scale_quantile(domain, range);
	    };
	    return rescale();
	  }
	  d3.scale.quantize = function() {
	    return d3_scale_quantize(0, 1, [ 0, 1 ]);
	  };
	  function d3_scale_quantize(x0, x1, range) {
	    var kx, i;
	    function scale(x) {
	      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
	    }
	    function rescale() {
	      kx = range.length / (x1 - x0);
	      i = range.length - 1;
	      return scale;
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return [ x0, x1 ];
	      x0 = +x[0];
	      x1 = +x[x.length - 1];
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      y = y < 0 ? NaN : y / kx + x0;
	      return [ y, y + 1 / kx ];
	    };
	    scale.copy = function() {
	      return d3_scale_quantize(x0, x1, range);
	    };
	    return rescale();
	  }
	  d3.scale.threshold = function() {
	    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
	  };
	  function d3_scale_threshold(domain, range) {
	    function scale(x) {
	      if (x <= x) return range[d3.bisect(domain, x)];
	    }
	    scale.domain = function(_) {
	      if (!arguments.length) return domain;
	      domain = _;
	      return scale;
	    };
	    scale.range = function(_) {
	      if (!arguments.length) return range;
	      range = _;
	      return scale;
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      return [ domain[y - 1], domain[y] ];
	    };
	    scale.copy = function() {
	      return d3_scale_threshold(domain, range);
	    };
	    return scale;
	  }
	  d3.scale.identity = function() {
	    return d3_scale_identity([ 0, 1 ]);
	  };
	  function d3_scale_identity(domain) {
	    function identity(x) {
	      return +x;
	    }
	    identity.invert = identity;
	    identity.domain = identity.range = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(identity);
	      return identity;
	    };
	    identity.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    identity.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    identity.copy = function() {
	      return d3_scale_identity(domain);
	    };
	    return identity;
	  }
	  d3.svg = {};
	  function d3_zero() {
	    return 0;
	  }
	  d3.svg.arc = function() {
	    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, cornerRadius = d3_zero, padRadius = d3_svg_arcAuto, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle, padAngle = d3_svg_arcPadAngle;
	    function arc() {
	      var r0 = Math.max(0, +innerRadius.apply(this, arguments)), r1 = Math.max(0, +outerRadius.apply(this, arguments)), a0 = startAngle.apply(this, arguments) - halfπ, a1 = endAngle.apply(this, arguments) - halfπ, da = Math.abs(a1 - a0), cw = a0 > a1 ? 0 : 1;
	      if (r1 < r0) rc = r1, r1 = r0, r0 = rc;
	      if (da >= τε) return circleSegment(r1, cw) + (r0 ? circleSegment(r0, 1 - cw) : "") + "Z";
	      var rc, cr, rp, ap, p0 = 0, p1 = 0, x0, y0, x1, y1, x2, y2, x3, y3, path = [];
	      if (ap = (+padAngle.apply(this, arguments) || 0) / 2) {
	        rp = padRadius === d3_svg_arcAuto ? Math.sqrt(r0 * r0 + r1 * r1) : +padRadius.apply(this, arguments);
	        if (!cw) p1 *= -1;
	        if (r1) p1 = d3_asin(rp / r1 * Math.sin(ap));
	        if (r0) p0 = d3_asin(rp / r0 * Math.sin(ap));
	      }
	      if (r1) {
	        x0 = r1 * Math.cos(a0 + p1);
	        y0 = r1 * Math.sin(a0 + p1);
	        x1 = r1 * Math.cos(a1 - p1);
	        y1 = r1 * Math.sin(a1 - p1);
	        var l1 = Math.abs(a1 - a0 - 2 * p1) <= π ? 0 : 1;
	        if (p1 && d3_svg_arcSweep(x0, y0, x1, y1) === cw ^ l1) {
	          var h1 = (a0 + a1) / 2;
	          x0 = r1 * Math.cos(h1);
	          y0 = r1 * Math.sin(h1);
	          x1 = y1 = null;
	        }
	      } else {
	        x0 = y0 = 0;
	      }
	      if (r0) {
	        x2 = r0 * Math.cos(a1 - p0);
	        y2 = r0 * Math.sin(a1 - p0);
	        x3 = r0 * Math.cos(a0 + p0);
	        y3 = r0 * Math.sin(a0 + p0);
	        var l0 = Math.abs(a0 - a1 + 2 * p0) <= π ? 0 : 1;
	        if (p0 && d3_svg_arcSweep(x2, y2, x3, y3) === 1 - cw ^ l0) {
	          var h0 = (a0 + a1) / 2;
	          x2 = r0 * Math.cos(h0);
	          y2 = r0 * Math.sin(h0);
	          x3 = y3 = null;
	        }
	      } else {
	        x2 = y2 = 0;
	      }
	      if (da > ε && (rc = Math.min(Math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))) > .001) {
	        cr = r0 < r1 ^ cw ? 0 : 1;
	        var rc1 = rc, rc0 = rc;
	        if (da < π) {
	          var oc = x3 == null ? [ x2, y2 ] : x1 == null ? [ x0, y0 ] : d3_geom_polygonIntersect([ x0, y0 ], [ x3, y3 ], [ x1, y1 ], [ x2, y2 ]), ax = x0 - oc[0], ay = y0 - oc[1], bx = x1 - oc[0], by = y1 - oc[1], kc = 1 / Math.sin(Math.acos((ax * bx + ay * by) / (Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by))) / 2), lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
	          rc0 = Math.min(rc, (r0 - lc) / (kc - 1));
	          rc1 = Math.min(rc, (r1 - lc) / (kc + 1));
	        }
	        if (x1 != null) {
	          var t30 = d3_svg_arcCornerTangents(x3 == null ? [ x2, y2 ] : [ x3, y3 ], [ x0, y0 ], r1, rc1, cw), t12 = d3_svg_arcCornerTangents([ x1, y1 ], [ x2, y2 ], r1, rc1, cw);
	          if (rc === rc1) {
	            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 0,", cr, " ", t30[1], "A", r1, ",", r1, " 0 ", 1 - cw ^ d3_svg_arcSweep(t30[1][0], t30[1][1], t12[1][0], t12[1][1]), ",", cw, " ", t12[1], "A", rc1, ",", rc1, " 0 0,", cr, " ", t12[0]);
	          } else {
	            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 1,", cr, " ", t12[0]);
	          }
	        } else {
	          path.push("M", x0, ",", y0);
	        }
	        if (x3 != null) {
	          var t03 = d3_svg_arcCornerTangents([ x0, y0 ], [ x3, y3 ], r0, -rc0, cw), t21 = d3_svg_arcCornerTangents([ x2, y2 ], x1 == null ? [ x0, y0 ] : [ x1, y1 ], r0, -rc0, cw);
	          if (rc === rc0) {
	            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t21[1], "A", r0, ",", r0, " 0 ", cw ^ d3_svg_arcSweep(t21[1][0], t21[1][1], t03[1][0], t03[1][1]), ",", 1 - cw, " ", t03[1], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
	          } else {
	            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
	          }
	        } else {
	          path.push("L", x2, ",", y2);
	        }
	      } else {
	        path.push("M", x0, ",", y0);
	        if (x1 != null) path.push("A", r1, ",", r1, " 0 ", l1, ",", cw, " ", x1, ",", y1);
	        path.push("L", x2, ",", y2);
	        if (x3 != null) path.push("A", r0, ",", r0, " 0 ", l0, ",", 1 - cw, " ", x3, ",", y3);
	      }
	      path.push("Z");
	      return path.join("");
	    }
	    function circleSegment(r1, cw) {
	      return "M0," + r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + -r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + r1;
	    }
	    arc.innerRadius = function(v) {
	      if (!arguments.length) return innerRadius;
	      innerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.outerRadius = function(v) {
	      if (!arguments.length) return outerRadius;
	      outerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.cornerRadius = function(v) {
	      if (!arguments.length) return cornerRadius;
	      cornerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.padRadius = function(v) {
	      if (!arguments.length) return padRadius;
	      padRadius = v == d3_svg_arcAuto ? d3_svg_arcAuto : d3_functor(v);
	      return arc;
	    };
	    arc.startAngle = function(v) {
	      if (!arguments.length) return startAngle;
	      startAngle = d3_functor(v);
	      return arc;
	    };
	    arc.endAngle = function(v) {
	      if (!arguments.length) return endAngle;
	      endAngle = d3_functor(v);
	      return arc;
	    };
	    arc.padAngle = function(v) {
	      if (!arguments.length) return padAngle;
	      padAngle = d3_functor(v);
	      return arc;
	    };
	    arc.centroid = function() {
	      var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - halfπ;
	      return [ Math.cos(a) * r, Math.sin(a) * r ];
	    };
	    return arc;
	  };
	  var d3_svg_arcAuto = "auto";
	  function d3_svg_arcInnerRadius(d) {
	    return d.innerRadius;
	  }
	  function d3_svg_arcOuterRadius(d) {
	    return d.outerRadius;
	  }
	  function d3_svg_arcStartAngle(d) {
	    return d.startAngle;
	  }
	  function d3_svg_arcEndAngle(d) {
	    return d.endAngle;
	  }
	  function d3_svg_arcPadAngle(d) {
	    return d && d.padAngle;
	  }
	  function d3_svg_arcSweep(x0, y0, x1, y1) {
	    return (x0 - x1) * y0 - (y0 - y1) * x0 > 0 ? 0 : 1;
	  }
	  function d3_svg_arcCornerTangents(p0, p1, r1, rc, cw) {
	    var x01 = p0[0] - p1[0], y01 = p0[1] - p1[1], lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x1 = p0[0] + ox, y1 = p0[1] + oy, x2 = p1[0] + ox, y2 = p1[1] + oy, x3 = (x1 + x2) / 2, y3 = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy, r = r1 - rc, D = x1 * y2 - x2 * y1, d = (dy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, r * r * d2 - D * D)), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x3, dy0 = cy0 - y3, dx1 = cx1 - x3, dy1 = cy1 - y3;
	    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
	    return [ [ cx0 - ox, cy0 - oy ], [ cx0 * r1 / r, cy0 * r1 / r ] ];
	  }
	  function d3_svg_line(projection) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
	    function line(data) {
	      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
	      function segment() {
	        segments.push("M", interpolate(projection(points), tension));
	      }
	      while (++i < n) {
	        if (defined.call(this, d = data[i], i)) {
	          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
	        } else if (points.length) {
	          segment();
	          points = [];
	        }
	      }
	      if (points.length) segment();
	      return segments.length ? segments.join("") : null;
	    }
	    line.x = function(_) {
	      if (!arguments.length) return x;
	      x = _;
	      return line;
	    };
	    line.y = function(_) {
	      if (!arguments.length) return y;
	      y = _;
	      return line;
	    };
	    line.defined = function(_) {
	      if (!arguments.length) return defined;
	      defined = _;
	      return line;
	    };
	    line.interpolate = function(_) {
	      if (!arguments.length) return interpolateKey;
	      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
	      return line;
	    };
	    line.tension = function(_) {
	      if (!arguments.length) return tension;
	      tension = _;
	      return line;
	    };
	    return line;
	  }
	  d3.svg.line = function() {
	    return d3_svg_line(d3_identity);
	  };
	  var d3_svg_lineInterpolators = d3.map({
	    linear: d3_svg_lineLinear,
	    "linear-closed": d3_svg_lineLinearClosed,
	    step: d3_svg_lineStep,
	    "step-before": d3_svg_lineStepBefore,
	    "step-after": d3_svg_lineStepAfter,
	    basis: d3_svg_lineBasis,
	    "basis-open": d3_svg_lineBasisOpen,
	    "basis-closed": d3_svg_lineBasisClosed,
	    bundle: d3_svg_lineBundle,
	    cardinal: d3_svg_lineCardinal,
	    "cardinal-open": d3_svg_lineCardinalOpen,
	    "cardinal-closed": d3_svg_lineCardinalClosed,
	    monotone: d3_svg_lineMonotone
	  });
	  d3_svg_lineInterpolators.forEach(function(key, value) {
	    value.key = key;
	    value.closed = /-closed$/.test(key);
	  });
	  function d3_svg_lineLinear(points) {
	    return points.length > 1 ? points.join("L") : points + "Z";
	  }
	  function d3_svg_lineLinearClosed(points) {
	    return points.join("L") + "Z";
	  }
	  function d3_svg_lineStep(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
	    if (n > 1) path.push("H", p[0]);
	    return path.join("");
	  }
	  function d3_svg_lineStepBefore(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
	    return path.join("");
	  }
	  function d3_svg_lineStepAfter(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
	    return path.join("");
	  }
	  function d3_svg_lineCardinalOpen(points, tension) {
	    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, -1), d3_svg_lineCardinalTangents(points, tension));
	  }
	  function d3_svg_lineCardinalClosed(points, tension) {
	    return points.length < 3 ? d3_svg_lineLinearClosed(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
	    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
	  }
	  function d3_svg_lineCardinal(points, tension) {
	    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
	  }
	  function d3_svg_lineHermite(points, tangents) {
	    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
	      return d3_svg_lineLinear(points);
	    }
	    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
	    if (quad) {
	      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
	      p0 = points[1];
	      pi = 2;
	    }
	    if (tangents.length > 1) {
	      t = tangents[1];
	      p = points[pi];
	      pi++;
	      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
	      for (var i = 2; i < tangents.length; i++, pi++) {
	        p = points[pi];
	        t = tangents[i];
	        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
	      }
	    }
	    if (quad) {
	      var lp = points[pi];
	      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
	    }
	    return path;
	  }
	  function d3_svg_lineCardinalTangents(points, tension) {
	    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
	    while (++i < n) {
	      p0 = p1;
	      p1 = p2;
	      p2 = points[i];
	      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
	    }
	    return tangents;
	  }
	  function d3_svg_lineBasis(points) {
	    if (points.length < 3) return d3_svg_lineLinear(points);
	    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
	    points.push(points[n - 1]);
	    while (++i <= n) {
	      pi = points[i];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    points.pop();
	    path.push("L", pi);
	    return path.join("");
	  }
	  function d3_svg_lineBasisOpen(points) {
	    if (points.length < 4) return d3_svg_lineLinear(points);
	    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
	    while (++i < 3) {
	      pi = points[i];
	      px.push(pi[0]);
	      py.push(pi[1]);
	    }
	    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
	    --i;
	    while (++i < n) {
	      pi = points[i];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    return path.join("");
	  }
	  function d3_svg_lineBasisClosed(points) {
	    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
	    while (++i < 4) {
	      pi = points[i % n];
	      px.push(pi[0]);
	      py.push(pi[1]);
	    }
	    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
	    --i;
	    while (++i < m) {
	      pi = points[i % n];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    return path.join("");
	  }
	  function d3_svg_lineBundle(points, tension) {
	    var n = points.length - 1;
	    if (n) {
	      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
	      while (++i <= n) {
	        p = points[i];
	        t = i / n;
	        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
	        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
	      }
	    }
	    return d3_svg_lineBasis(points);
	  }
	  function d3_svg_lineDot4(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	  }
	  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
	  function d3_svg_lineBasisBezier(path, x, y) {
	    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
	  }
	  function d3_svg_lineSlope(p0, p1) {
	    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
	  }
	  function d3_svg_lineFiniteDifferences(points) {
	    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
	    while (++i < j) {
	      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
	    }
	    m[i] = d;
	    return m;
	  }
	  function d3_svg_lineMonotoneTangents(points) {
	    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
	    while (++i < j) {
	      d = d3_svg_lineSlope(points[i], points[i + 1]);
	      if (abs(d) < ε) {
	        m[i] = m[i + 1] = 0;
	      } else {
	        a = m[i] / d;
	        b = m[i + 1] / d;
	        s = a * a + b * b;
	        if (s > 9) {
	          s = d * 3 / Math.sqrt(s);
	          m[i] = s * a;
	          m[i + 1] = s * b;
	        }
	      }
	    }
	    i = -1;
	    while (++i <= j) {
	      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
	      tangents.push([ s || 0, m[i] * s || 0 ]);
	    }
	    return tangents;
	  }
	  function d3_svg_lineMonotone(points) {
	    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
	  }
	  d3.svg.line.radial = function() {
	    var line = d3_svg_line(d3_svg_lineRadial);
	    line.radius = line.x, delete line.x;
	    line.angle = line.y, delete line.y;
	    return line;
	  };
	  function d3_svg_lineRadial(points) {
	    var point, i = -1, n = points.length, r, a;
	    while (++i < n) {
	      point = points[i];
	      r = point[0];
	      a = point[1] - halfπ;
	      point[0] = r * Math.cos(a);
	      point[1] = r * Math.sin(a);
	    }
	    return points;
	  }
	  function d3_svg_area(projection) {
	    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
	    function area(data) {
	      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
	        return x;
	      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
	        return y;
	      } : d3_functor(y1), x, y;
	      function segment() {
	        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
	      }
	      while (++i < n) {
	        if (defined.call(this, d = data[i], i)) {
	          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
	          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
	        } else if (points0.length) {
	          segment();
	          points0 = [];
	          points1 = [];
	        }
	      }
	      if (points0.length) segment();
	      return segments.length ? segments.join("") : null;
	    }
	    area.x = function(_) {
	      if (!arguments.length) return x1;
	      x0 = x1 = _;
	      return area;
	    };
	    area.x0 = function(_) {
	      if (!arguments.length) return x0;
	      x0 = _;
	      return area;
	    };
	    area.x1 = function(_) {
	      if (!arguments.length) return x1;
	      x1 = _;
	      return area;
	    };
	    area.y = function(_) {
	      if (!arguments.length) return y1;
	      y0 = y1 = _;
	      return area;
	    };
	    area.y0 = function(_) {
	      if (!arguments.length) return y0;
	      y0 = _;
	      return area;
	    };
	    area.y1 = function(_) {
	      if (!arguments.length) return y1;
	      y1 = _;
	      return area;
	    };
	    area.defined = function(_) {
	      if (!arguments.length) return defined;
	      defined = _;
	      return area;
	    };
	    area.interpolate = function(_) {
	      if (!arguments.length) return interpolateKey;
	      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
	      interpolateReverse = interpolate.reverse || interpolate;
	      L = interpolate.closed ? "M" : "L";
	      return area;
	    };
	    area.tension = function(_) {
	      if (!arguments.length) return tension;
	      tension = _;
	      return area;
	    };
	    return area;
	  }
	  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
	  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
	  d3.svg.area = function() {
	    return d3_svg_area(d3_identity);
	  };
	  d3.svg.area.radial = function() {
	    var area = d3_svg_area(d3_svg_lineRadial);
	    area.radius = area.x, delete area.x;
	    area.innerRadius = area.x0, delete area.x0;
	    area.outerRadius = area.x1, delete area.x1;
	    area.angle = area.y, delete area.y;
	    area.startAngle = area.y0, delete area.y0;
	    area.endAngle = area.y1, delete area.y1;
	    return area;
	  };
	  d3.svg.chord = function() {
	    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
	    function chord(d, i) {
	      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
	      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
	    }
	    function subgroup(self, f, d, i) {
	      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) - halfπ, a1 = endAngle.call(self, subgroup, i) - halfπ;
	      return {
	        r: r,
	        a0: a0,
	        a1: a1,
	        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
	        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
	      };
	    }
	    function equals(a, b) {
	      return a.a0 == b.a0 && a.a1 == b.a1;
	    }
	    function arc(r, p, a) {
	      return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
	    }
	    function curve(r0, p0, r1, p1) {
	      return "Q 0,0 " + p1;
	    }
	    chord.radius = function(v) {
	      if (!arguments.length) return radius;
	      radius = d3_functor(v);
	      return chord;
	    };
	    chord.source = function(v) {
	      if (!arguments.length) return source;
	      source = d3_functor(v);
	      return chord;
	    };
	    chord.target = function(v) {
	      if (!arguments.length) return target;
	      target = d3_functor(v);
	      return chord;
	    };
	    chord.startAngle = function(v) {
	      if (!arguments.length) return startAngle;
	      startAngle = d3_functor(v);
	      return chord;
	    };
	    chord.endAngle = function(v) {
	      if (!arguments.length) return endAngle;
	      endAngle = d3_functor(v);
	      return chord;
	    };
	    return chord;
	  };
	  function d3_svg_chordRadius(d) {
	    return d.radius;
	  }
	  d3.svg.diagonal = function() {
	    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
	    function diagonal(d, i) {
	      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
	        x: p0.x,
	        y: m
	      }, {
	        x: p3.x,
	        y: m
	      }, p3 ];
	      p = p.map(projection);
	      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
	    }
	    diagonal.source = function(x) {
	      if (!arguments.length) return source;
	      source = d3_functor(x);
	      return diagonal;
	    };
	    diagonal.target = function(x) {
	      if (!arguments.length) return target;
	      target = d3_functor(x);
	      return diagonal;
	    };
	    diagonal.projection = function(x) {
	      if (!arguments.length) return projection;
	      projection = x;
	      return diagonal;
	    };
	    return diagonal;
	  };
	  function d3_svg_diagonalProjection(d) {
	    return [ d.x, d.y ];
	  }
	  d3.svg.diagonal.radial = function() {
	    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
	    diagonal.projection = function(x) {
	      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
	    };
	    return diagonal;
	  };
	  function d3_svg_diagonalRadialProjection(projection) {
	    return function() {
	      var d = projection.apply(this, arguments), r = d[0], a = d[1] - halfπ;
	      return [ r * Math.cos(a), r * Math.sin(a) ];
	    };
	  }
	  d3.svg.symbol = function() {
	    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
	    function symbol(d, i) {
	      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
	    }
	    symbol.type = function(x) {
	      if (!arguments.length) return type;
	      type = d3_functor(x);
	      return symbol;
	    };
	    symbol.size = function(x) {
	      if (!arguments.length) return size;
	      size = d3_functor(x);
	      return symbol;
	    };
	    return symbol;
	  };
	  function d3_svg_symbolSize() {
	    return 64;
	  }
	  function d3_svg_symbolType() {
	    return "circle";
	  }
	  function d3_svg_symbolCircle(size) {
	    var r = Math.sqrt(size / π);
	    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
	  }
	  var d3_svg_symbols = d3.map({
	    circle: d3_svg_symbolCircle,
	    cross: function(size) {
	      var r = Math.sqrt(size / 5) / 2;
	      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
	    },
	    diamond: function(size) {
	      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
	      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
	    },
	    square: function(size) {
	      var r = Math.sqrt(size) / 2;
	      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
	    },
	    "triangle-down": function(size) {
	      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
	      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
	    },
	    "triangle-up": function(size) {
	      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
	      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
	    }
	  });
	  d3.svg.symbolTypes = d3_svg_symbols.keys();
	  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
	  d3_selectionPrototype.transition = function(name) {
	    var id = d3_transitionInheritId || ++d3_transitionId, ns = d3_transitionNamespace(name), subgroups = [], subgroup, node, transition = d3_transitionInherit || {
	      time: Date.now(),
	      ease: d3_ease_cubicInOut,
	      delay: 0,
	      duration: 250
	    };
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) d3_transitionNode(node, i, ns, id, transition);
	        subgroup.push(node);
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_selectionPrototype.interrupt = function(name) {
	    return this.each(name == null ? d3_selection_interrupt : d3_selection_interruptNS(d3_transitionNamespace(name)));
	  };
	  var d3_selection_interrupt = d3_selection_interruptNS(d3_transitionNamespace());
	  function d3_selection_interruptNS(ns) {
	    return function() {
	      var lock, activeId, active;
	      if ((lock = this[ns]) && (active = lock[activeId = lock.active])) {
	        active.timer.c = null;
	        active.timer.t = NaN;
	        if (--lock.count) delete lock[activeId]; else delete this[ns];
	        lock.active += .5;
	        active.event && active.event.interrupt.call(this, this.__data__, active.index);
	      }
	    };
	  }
	  function d3_transition(groups, ns, id) {
	    d3_subclass(groups, d3_transitionPrototype);
	    groups.namespace = ns;
	    groups.id = id;
	    return groups;
	  }
	  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
	  d3_transitionPrototype.call = d3_selectionPrototype.call;
	  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
	  d3_transitionPrototype.node = d3_selectionPrototype.node;
	  d3_transitionPrototype.size = d3_selectionPrototype.size;
	  d3.transition = function(selection, name) {
	    return selection && selection.transition ? d3_transitionInheritId ? selection.transition(name) : selection : d3.selection().transition(selection);
	  };
	  d3.transition.prototype = d3_transitionPrototype;
	  d3_transitionPrototype.select = function(selector) {
	    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnode, node;
	    selector = d3_selection_selector(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
	          if ("__data__" in node) subnode.__data__ = node.__data__;
	          d3_transitionNode(subnode, i, ns, id, node[ns][id]);
	          subgroup.push(subnode);
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_transitionPrototype.selectAll = function(selector) {
	    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnodes, node, subnode, transition;
	    selector = d3_selection_selectorAll(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          transition = node[ns][id];
	          subnodes = selector.call(node, node.__data__, i, j);
	          subgroups.push(subgroup = []);
	          for (var k = -1, o = subnodes.length; ++k < o; ) {
	            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, ns, id, transition);
	            subgroup.push(subnode);
	          }
	        }
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_transitionPrototype.filter = function(filter) {
	    var subgroups = [], subgroup, group, node;
	    if (typeof filter !== "function") filter = d3_selection_filter(filter);
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
	          subgroup.push(node);
	        }
	      }
	    }
	    return d3_transition(subgroups, this.namespace, this.id);
	  };
	  d3_transitionPrototype.tween = function(name, tween) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 2) return this.node()[ns][id].tween.get(name);
	    return d3_selection_each(this, tween == null ? function(node) {
	      node[ns][id].tween.remove(name);
	    } : function(node) {
	      node[ns][id].tween.set(name, tween);
	    });
	  };
	  function d3_transition_tween(groups, name, value, tween) {
	    var id = groups.id, ns = groups.namespace;
	    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
	    } : (value = tween(value), function(node) {
	      node[ns][id].tween.set(name, value);
	    }));
	  }
	  d3_transitionPrototype.attr = function(nameNS, value) {
	    if (arguments.length < 2) {
	      for (value in nameNS) this.attr(value, nameNS[value]);
	      return this;
	    }
	    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
	    function attrNull() {
	      this.removeAttribute(name);
	    }
	    function attrNullNS() {
	      this.removeAttributeNS(name.space, name.local);
	    }
	    function attrTween(b) {
	      return b == null ? attrNull : (b += "", function() {
	        var a = this.getAttribute(name), i;
	        return a !== b && (i = interpolate(a, b), function(t) {
	          this.setAttribute(name, i(t));
	        });
	      });
	    }
	    function attrTweenNS(b) {
	      return b == null ? attrNullNS : (b += "", function() {
	        var a = this.getAttributeNS(name.space, name.local), i;
	        return a !== b && (i = interpolate(a, b), function(t) {
	          this.setAttributeNS(name.space, name.local, i(t));
	        });
	      });
	    }
	    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
	  };
	  d3_transitionPrototype.attrTween = function(nameNS, tween) {
	    var name = d3.ns.qualify(nameNS);
	    function attrTween(d, i) {
	      var f = tween.call(this, d, i, this.getAttribute(name));
	      return f && function(t) {
	        this.setAttribute(name, f(t));
	      };
	    }
	    function attrTweenNS(d, i) {
	      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
	      return f && function(t) {
	        this.setAttributeNS(name.space, name.local, f(t));
	      };
	    }
	    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
	  };
	  d3_transitionPrototype.style = function(name, value, priority) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof name !== "string") {
	        if (n < 2) value = "";
	        for (priority in name) this.style(priority, name[priority], value);
	        return this;
	      }
	      priority = "";
	    }
	    function styleNull() {
	      this.style.removeProperty(name);
	    }
	    function styleString(b) {
	      return b == null ? styleNull : (b += "", function() {
	        var a = d3_window(this).getComputedStyle(this, null).getPropertyValue(name), i;
	        return a !== b && (i = d3_interpolate(a, b), function(t) {
	          this.style.setProperty(name, i(t), priority);
	        });
	      });
	    }
	    return d3_transition_tween(this, "style." + name, value, styleString);
	  };
	  d3_transitionPrototype.styleTween = function(name, tween, priority) {
	    if (arguments.length < 3) priority = "";
	    function styleTween(d, i) {
	      var f = tween.call(this, d, i, d3_window(this).getComputedStyle(this, null).getPropertyValue(name));
	      return f && function(t) {
	        this.style.setProperty(name, f(t), priority);
	      };
	    }
	    return this.tween("style." + name, styleTween);
	  };
	  d3_transitionPrototype.text = function(value) {
	    return d3_transition_tween(this, "text", value, d3_transition_text);
	  };
	  function d3_transition_text(b) {
	    if (b == null) b = "";
	    return function() {
	      this.textContent = b;
	    };
	  }
	  d3_transitionPrototype.remove = function() {
	    var ns = this.namespace;
	    return this.each("end.transition", function() {
	      var p;
	      if (this[ns].count < 2 && (p = this.parentNode)) p.removeChild(this);
	    });
	  };
	  d3_transitionPrototype.ease = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].ease;
	    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
	    return d3_selection_each(this, function(node) {
	      node[ns][id].ease = value;
	    });
	  };
	  d3_transitionPrototype.delay = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].delay;
	    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].delay = +value.call(node, node.__data__, i, j);
	    } : (value = +value, function(node) {
	      node[ns][id].delay = value;
	    }));
	  };
	  d3_transitionPrototype.duration = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].duration;
	    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].duration = Math.max(1, value.call(node, node.__data__, i, j));
	    } : (value = Math.max(1, value), function(node) {
	      node[ns][id].duration = value;
	    }));
	  };
	  d3_transitionPrototype.each = function(type, listener) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 2) {
	      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
	      try {
	        d3_transitionInheritId = id;
	        d3_selection_each(this, function(node, i, j) {
	          d3_transitionInherit = node[ns][id];
	          type.call(node, node.__data__, i, j);
	        });
	      } finally {
	        d3_transitionInherit = inherit;
	        d3_transitionInheritId = inheritId;
	      }
	    } else {
	      d3_selection_each(this, function(node) {
	        var transition = node[ns][id];
	        (transition.event || (transition.event = d3.dispatch("start", "end", "interrupt"))).on(type, listener);
	      });
	    }
	    return this;
	  };
	  d3_transitionPrototype.transition = function() {
	    var id0 = this.id, id1 = ++d3_transitionId, ns = this.namespace, subgroups = [], subgroup, group, node, transition;
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        if (node = group[i]) {
	          transition = node[ns][id0];
	          d3_transitionNode(node, i, ns, id1, {
	            time: transition.time,
	            ease: transition.ease,
	            delay: transition.delay + transition.duration,
	            duration: transition.duration
	          });
	        }
	        subgroup.push(node);
	      }
	    }
	    return d3_transition(subgroups, ns, id1);
	  };
	  function d3_transitionNamespace(name) {
	    return name == null ? "__transition__" : "__transition_" + name + "__";
	  }
	  function d3_transitionNode(node, i, ns, id, inherit) {
	    var lock = node[ns] || (node[ns] = {
	      active: 0,
	      count: 0
	    }), transition = lock[id], time, timer, duration, ease, tweens;
	    function schedule(elapsed) {
	      var delay = transition.delay;
	      timer.t = delay + time;
	      if (delay <= elapsed) return start(elapsed - delay);
	      timer.c = start;
	    }
	    function start(elapsed) {
	      var activeId = lock.active, active = lock[activeId];
	      if (active) {
	        active.timer.c = null;
	        active.timer.t = NaN;
	        --lock.count;
	        delete lock[activeId];
	        active.event && active.event.interrupt.call(node, node.__data__, active.index);
	      }
	      for (var cancelId in lock) {
	        if (+cancelId < id) {
	          var cancel = lock[cancelId];
	          cancel.timer.c = null;
	          cancel.timer.t = NaN;
	          --lock.count;
	          delete lock[cancelId];
	        }
	      }
	      timer.c = tick;
	      d3_timer(function() {
	        if (timer.c && tick(elapsed || 1)) {
	          timer.c = null;
	          timer.t = NaN;
	        }
	        return 1;
	      }, 0, time);
	      lock.active = id;
	      transition.event && transition.event.start.call(node, node.__data__, i);
	      tweens = [];
	      transition.tween.forEach(function(key, value) {
	        if (value = value.call(node, node.__data__, i)) {
	          tweens.push(value);
	        }
	      });
	      ease = transition.ease;
	      duration = transition.duration;
	    }
	    function tick(elapsed) {
	      var t = elapsed / duration, e = ease(t), n = tweens.length;
	      while (n > 0) {
	        tweens[--n].call(node, e);
	      }
	      if (t >= 1) {
	        transition.event && transition.event.end.call(node, node.__data__, i);
	        if (--lock.count) delete lock[id]; else delete node[ns];
	        return 1;
	      }
	    }
	    if (!transition) {
	      time = inherit.time;
	      timer = d3_timer(schedule, 0, time);
	      transition = lock[id] = {
	        tween: new d3_Map(),
	        time: time,
	        timer: timer,
	        delay: inherit.delay,
	        duration: inherit.duration,
	        ease: inherit.ease,
	        index: i
	      };
	      inherit = null;
	      ++lock.count;
	    }
	  }
	  d3.svg.axis = function() {
	    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
	    function axis(g) {
	      g.each(function() {
	        var g = d3.select(this);
	        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
	        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ε), tickExit = d3.transition(tick.exit()).style("opacity", ε).remove(), tickUpdate = d3.transition(tick.order()).style("opacity", 1), tickSpacing = Math.max(innerTickSize, 0) + tickPadding, tickTransform;
	        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
	        d3.transition(path));
	        tickEnter.append("line");
	        tickEnter.append("text");
	        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text"), sign = orient === "top" || orient === "left" ? -1 : 1, x1, x2, y1, y2;
	        if (orient === "bottom" || orient === "top") {
	          tickTransform = d3_svg_axisX, x1 = "x", y1 = "y", x2 = "x2", y2 = "y2";
	          text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
	          pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);
	        } else {
	          tickTransform = d3_svg_axisY, x1 = "y", y1 = "x", x2 = "y2", y2 = "x2";
	          text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
	          pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
	        }
	        lineEnter.attr(y2, sign * innerTickSize);
	        textEnter.attr(y1, sign * tickSpacing);
	        lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
	        textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);
	        if (scale1.rangeBand) {
	          var x = scale1, dx = x.rangeBand() / 2;
	          scale0 = scale1 = function(d) {
	            return x(d) + dx;
	          };
	        } else if (scale0.rangeBand) {
	          scale0 = scale1;
	        } else {
	          tickExit.call(tickTransform, scale1, scale0);
	        }
	        tickEnter.call(tickTransform, scale0, scale1);
	        tickUpdate.call(tickTransform, scale1, scale1);
	      });
	    }
	    axis.scale = function(x) {
	      if (!arguments.length) return scale;
	      scale = x;
	      return axis;
	    };
	    axis.orient = function(x) {
	      if (!arguments.length) return orient;
	      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
	      return axis;
	    };
	    axis.ticks = function() {
	      if (!arguments.length) return tickArguments_;
	      tickArguments_ = d3_array(arguments);
	      return axis;
	    };
	    axis.tickValues = function(x) {
	      if (!arguments.length) return tickValues;
	      tickValues = x;
	      return axis;
	    };
	    axis.tickFormat = function(x) {
	      if (!arguments.length) return tickFormat_;
	      tickFormat_ = x;
	      return axis;
	    };
	    axis.tickSize = function(x) {
	      var n = arguments.length;
	      if (!n) return innerTickSize;
	      innerTickSize = +x;
	      outerTickSize = +arguments[n - 1];
	      return axis;
	    };
	    axis.innerTickSize = function(x) {
	      if (!arguments.length) return innerTickSize;
	      innerTickSize = +x;
	      return axis;
	    };
	    axis.outerTickSize = function(x) {
	      if (!arguments.length) return outerTickSize;
	      outerTickSize = +x;
	      return axis;
	    };
	    axis.tickPadding = function(x) {
	      if (!arguments.length) return tickPadding;
	      tickPadding = +x;
	      return axis;
	    };
	    axis.tickSubdivide = function() {
	      return arguments.length && axis;
	    };
	    return axis;
	  };
	  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
	    top: 1,
	    right: 1,
	    bottom: 1,
	    left: 1
	  };
	  function d3_svg_axisX(selection, x0, x1) {
	    selection.attr("transform", function(d) {
	      var v0 = x0(d);
	      return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)";
	    });
	  }
	  function d3_svg_axisY(selection, y0, y1) {
	    selection.attr("transform", function(d) {
	      var v0 = y0(d);
	      return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")";
	    });
	  }
	  d3.svg.brush = function() {
	    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
	    function brush(g) {
	      g.each(function() {
	        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
	        var background = g.selectAll(".background").data([ 0 ]);
	        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
	        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
	        var resize = g.selectAll(".resize").data(resizes, d3_identity);
	        resize.exit().remove();
	        resize.enter().append("g").attr("class", function(d) {
	          return "resize " + d;
	        }).style("cursor", function(d) {
	          return d3_svg_brushCursor[d];
	        }).append("rect").attr("x", function(d) {
	          return /[ew]$/.test(d) ? -3 : null;
	        }).attr("y", function(d) {
	          return /^[ns]/.test(d) ? -3 : null;
	        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
	        resize.style("display", brush.empty() ? "none" : null);
	        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
	        if (x) {
	          range = d3_scaleRange(x);
	          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
	          redrawX(gUpdate);
	        }
	        if (y) {
	          range = d3_scaleRange(y);
	          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
	          redrawY(gUpdate);
	        }
	        redraw(gUpdate);
	      });
	    }
	    brush.event = function(g) {
	      g.each(function() {
	        var event_ = event.of(this, arguments), extent1 = {
	          x: xExtent,
	          y: yExtent,
	          i: xExtentDomain,
	          j: yExtentDomain
	        }, extent0 = this.__chart__ || extent1;
	        this.__chart__ = extent1;
	        if (d3_transitionInheritId) {
	          d3.select(this).transition().each("start.brush", function() {
	            xExtentDomain = extent0.i;
	            yExtentDomain = extent0.j;
	            xExtent = extent0.x;
	            yExtent = extent0.y;
	            event_({
	              type: "brushstart"
	            });
	          }).tween("brush:brush", function() {
	            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
	            xExtentDomain = yExtentDomain = null;
	            return function(t) {
	              xExtent = extent1.x = xi(t);
	              yExtent = extent1.y = yi(t);
	              event_({
	                type: "brush",
	                mode: "resize"
	              });
	            };
	          }).each("end.brush", function() {
	            xExtentDomain = extent1.i;
	            yExtentDomain = extent1.j;
	            event_({
	              type: "brush",
	              mode: "resize"
	            });
	            event_({
	              type: "brushend"
	            });
	          });
	        } else {
	          event_({
	            type: "brushstart"
	          });
	          event_({
	            type: "brush",
	            mode: "resize"
	          });
	          event_({
	            type: "brushend"
	          });
	        }
	      });
	    };
	    function redraw(g) {
	      g.selectAll(".resize").attr("transform", function(d) {
	        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
	      });
	    }
	    function redrawX(g) {
	      g.select(".extent").attr("x", xExtent[0]);
	      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
	    }
	    function redrawY(g) {
	      g.select(".extent").attr("y", yExtent[0]);
	      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
	    }
	    function brushstart() {
	      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(target), center, origin = d3.mouse(target), offset;
	      var w = d3.select(d3_window(target)).on("keydown.brush", keydown).on("keyup.brush", keyup);
	      if (d3.event.changedTouches) {
	        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
	      } else {
	        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
	      }
	      g.interrupt().selectAll("*").interrupt();
	      if (dragging) {
	        origin[0] = xExtent[0] - origin[0];
	        origin[1] = yExtent[0] - origin[1];
	      } else if (resizing) {
	        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
	        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
	        origin[0] = xExtent[ex];
	        origin[1] = yExtent[ey];
	      } else if (d3.event.altKey) center = origin.slice();
	      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
	      d3.select("body").style("cursor", eventTarget.style("cursor"));
	      event_({
	        type: "brushstart"
	      });
	      brushmove();
	      function keydown() {
	        if (d3.event.keyCode == 32) {
	          if (!dragging) {
	            center = null;
	            origin[0] -= xExtent[1];
	            origin[1] -= yExtent[1];
	            dragging = 2;
	          }
	          d3_eventPreventDefault();
	        }
	      }
	      function keyup() {
	        if (d3.event.keyCode == 32 && dragging == 2) {
	          origin[0] += xExtent[1];
	          origin[1] += yExtent[1];
	          dragging = 0;
	          d3_eventPreventDefault();
	        }
	      }
	      function brushmove() {
	        var point = d3.mouse(target), moved = false;
	        if (offset) {
	          point[0] += offset[0];
	          point[1] += offset[1];
	        }
	        if (!dragging) {
	          if (d3.event.altKey) {
	            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
	            origin[0] = xExtent[+(point[0] < center[0])];
	            origin[1] = yExtent[+(point[1] < center[1])];
	          } else center = null;
	        }
	        if (resizingX && move1(point, x, 0)) {
	          redrawX(g);
	          moved = true;
	        }
	        if (resizingY && move1(point, y, 1)) {
	          redrawY(g);
	          moved = true;
	        }
	        if (moved) {
	          redraw(g);
	          event_({
	            type: "brush",
	            mode: dragging ? "move" : "resize"
	          });
	        }
	      }
	      function move1(point, scale, i) {
	        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
	        if (dragging) {
	          r0 -= position;
	          r1 -= size + position;
	        }
	        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
	        if (dragging) {
	          max = (min += position) + size;
	        } else {
	          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
	          if (position < min) {
	            max = min;
	            min = position;
	          } else {
	            max = position;
	          }
	        }
	        if (extent[0] != min || extent[1] != max) {
	          if (i) yExtentDomain = null; else xExtentDomain = null;
	          extent[0] = min;
	          extent[1] = max;
	          return true;
	        }
	      }
	      function brushend() {
	        brushmove();
	        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
	        d3.select("body").style("cursor", null);
	        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
	        dragRestore();
	        event_({
	          type: "brushend"
	        });
	      }
	    }
	    brush.x = function(z) {
	      if (!arguments.length) return x;
	      x = z;
	      resizes = d3_svg_brushResizes[!x << 1 | !y];
	      return brush;
	    };
	    brush.y = function(z) {
	      if (!arguments.length) return y;
	      y = z;
	      resizes = d3_svg_brushResizes[!x << 1 | !y];
	      return brush;
	    };
	    brush.clamp = function(z) {
	      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
	      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
	      return brush;
	    };
	    brush.extent = function(z) {
	      var x0, x1, y0, y1, t;
	      if (!arguments.length) {
	        if (x) {
	          if (xExtentDomain) {
	            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
	          } else {
	            x0 = xExtent[0], x1 = xExtent[1];
	            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
	            if (x1 < x0) t = x0, x0 = x1, x1 = t;
	          }
	        }
	        if (y) {
	          if (yExtentDomain) {
	            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
	          } else {
	            y0 = yExtent[0], y1 = yExtent[1];
	            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
	            if (y1 < y0) t = y0, y0 = y1, y1 = t;
	          }
	        }
	        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
	      }
	      if (x) {
	        x0 = z[0], x1 = z[1];
	        if (y) x0 = x0[0], x1 = x1[0];
	        xExtentDomain = [ x0, x1 ];
	        if (x.invert) x0 = x(x0), x1 = x(x1);
	        if (x1 < x0) t = x0, x0 = x1, x1 = t;
	        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
	      }
	      if (y) {
	        y0 = z[0], y1 = z[1];
	        if (x) y0 = y0[1], y1 = y1[1];
	        yExtentDomain = [ y0, y1 ];
	        if (y.invert) y0 = y(y0), y1 = y(y1);
	        if (y1 < y0) t = y0, y0 = y1, y1 = t;
	        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
	      }
	      return brush;
	    };
	    brush.clear = function() {
	      if (!brush.empty()) {
	        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
	        xExtentDomain = yExtentDomain = null;
	      }
	      return brush;
	    };
	    brush.empty = function() {
	      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
	    };
	    return d3.rebind(brush, event, "on");
	  };
	  var d3_svg_brushCursor = {
	    n: "ns-resize",
	    e: "ew-resize",
	    s: "ns-resize",
	    w: "ew-resize",
	    nw: "nwse-resize",
	    ne: "nesw-resize",
	    se: "nwse-resize",
	    sw: "nesw-resize"
	  };
	  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
	  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
	  var d3_time_formatUtc = d3_time_format.utc;
	  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
	  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
	  function d3_time_formatIsoNative(date) {
	    return date.toISOString();
	  }
	  d3_time_formatIsoNative.parse = function(string) {
	    var date = new Date(string);
	    return isNaN(date) ? null : date;
	  };
	  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
	  d3_time.second = d3_time_interval(function(date) {
	    return new d3_date(Math.floor(date / 1e3) * 1e3);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
	  }, function(date) {
	    return date.getSeconds();
	  });
	  d3_time.seconds = d3_time.second.range;
	  d3_time.seconds.utc = d3_time.second.utc.range;
	  d3_time.minute = d3_time_interval(function(date) {
	    return new d3_date(Math.floor(date / 6e4) * 6e4);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
	  }, function(date) {
	    return date.getMinutes();
	  });
	  d3_time.minutes = d3_time.minute.range;
	  d3_time.minutes.utc = d3_time.minute.utc.range;
	  d3_time.hour = d3_time_interval(function(date) {
	    var timezone = date.getTimezoneOffset() / 60;
	    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
	  }, function(date) {
	    return date.getHours();
	  });
	  d3_time.hours = d3_time.hour.range;
	  d3_time.hours.utc = d3_time.hour.utc.range;
	  d3_time.month = d3_time_interval(function(date) {
	    date = d3_time.day(date);
	    date.setDate(1);
	    return date;
	  }, function(date, offset) {
	    date.setMonth(date.getMonth() + offset);
	  }, function(date) {
	    return date.getMonth();
	  });
	  d3_time.months = d3_time.month.range;
	  d3_time.months.utc = d3_time.month.utc.range;
	  function d3_time_scale(linear, methods, format) {
	    function scale(x) {
	      return linear(x);
	    }
	    scale.invert = function(x) {
	      return d3_time_scaleDate(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
	      linear.domain(x);
	      return scale;
	    };
	    function tickMethod(extent, count) {
	      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
	      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
	        return d / 31536e6;
	      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
	    }
	    scale.nice = function(interval, skip) {
	      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
	      if (method) interval = method[0], skip = method[1];
	      function skipped(date) {
	        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
	      }
	      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
	        floor: function(date) {
	          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
	          return date;
	        },
	        ceil: function(date) {
	          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
	          return date;
	        }
	      } : interval));
	    };
	    scale.ticks = function(interval, skip) {
	      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
	        range: interval
	      }, skip ];
	      if (method) interval = method[0], skip = method[1];
	      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
	    };
	    scale.tickFormat = function() {
	      return format;
	    };
	    scale.copy = function() {
	      return d3_time_scale(linear.copy(), methods, format);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  function d3_time_scaleDate(t) {
	    return new Date(t);
	  }
	  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
	  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
	  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
	    return d.getMilliseconds();
	  } ], [ ":%S", function(d) {
	    return d.getSeconds();
	  } ], [ "%I:%M", function(d) {
	    return d.getMinutes();
	  } ], [ "%I %p", function(d) {
	    return d.getHours();
	  } ], [ "%a %d", function(d) {
	    return d.getDay() && d.getDate() != 1;
	  } ], [ "%b %d", function(d) {
	    return d.getDate() != 1;
	  } ], [ "%B", function(d) {
	    return d.getMonth();
	  } ], [ "%Y", d3_true ] ]);
	  var d3_time_scaleMilliseconds = {
	    range: function(start, stop, step) {
	      return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
	    },
	    floor: d3_identity,
	    ceil: d3_identity
	  };
	  d3_time_scaleLocalMethods.year = d3_time.year;
	  d3_time.scale = function() {
	    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
	  };
	  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
	    return [ m[0].utc, m[1] ];
	  });
	  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
	    return d.getUTCMilliseconds();
	  } ], [ ":%S", function(d) {
	    return d.getUTCSeconds();
	  } ], [ "%I:%M", function(d) {
	    return d.getUTCMinutes();
	  } ], [ "%I %p", function(d) {
	    return d.getUTCHours();
	  } ], [ "%a %d", function(d) {
	    return d.getUTCDay() && d.getUTCDate() != 1;
	  } ], [ "%b %d", function(d) {
	    return d.getUTCDate() != 1;
	  } ], [ "%B", function(d) {
	    return d.getUTCMonth();
	  } ], [ "%Y", d3_true ] ]);
	  d3_time_scaleUtcMethods.year = d3_time.year.utc;
	  d3_time.scale.utc = function() {
	    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
	  };
	  d3.text = d3_xhrType(function(request) {
	    return request.responseText;
	  });
	  d3.json = function(url, callback) {
	    return d3_xhr(url, "application/json", d3_json, callback);
	  };
	  function d3_json(request) {
	    return JSON.parse(request.responseText);
	  }
	  d3.html = function(url, callback) {
	    return d3_xhr(url, "text/html", d3_html, callback);
	  };
	  function d3_html(request) {
	    var range = d3_document.createRange();
	    range.selectNode(d3_document.body);
	    return range.createContextualFragment(request.responseText);
	  }
	  d3.xml = d3_xhrType(function(request) {
	    return request.responseXML;
	  });
	  if (true) this.d3 = d3, !(__WEBPACK_AMD_DEFINE_FACTORY__ = (d3), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); else if (typeof module === "object" && module.exports) module.exports = d3; else this.d3 = d3;
	}();

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fbielejec
	 */


	// ---MODULE IMPORTS---//

	var colorbrewer = __webpack_require__(11);

	//---MODULE EXPORTS---//

	var exports = module.exports = {};

	var hasTime = false;
	exports.hasTime = hasTime;

	var hasPoints = false;
	exports.hasPoints = hasPoints;

	var hasLines = false;
	exports.hasLines = hasLines;

	var hasAreas = false;
	exports.hasAreas = hasAreas;

	var hasCounts = false;
	exports.hasCounts = hasCounts;

	var hasLocations = false;
	exports.hasLocations = hasLocations;

	//var COUNT = "count";
	//exports.COUNT = COUNT;

	var ORDINAL = "ordinal";
	exports.ORDINAL = ORDINAL;

	var LINEAR = "linear";
	exports.LINEAR = LINEAR;

	var MIN_INDEX = 0;
	exports.MIN_INDEX = MIN_INDEX;

	var MAX_INDEX = 1;
	exports.MAX_INDEX = MAX_INDEX;

	var margin = {
		top : 50,
		right : 0,
		bottom : 50,
		left : 50,
	};
	exports.margin = margin;

	var width = window.innerWidth - margin.left - margin.right;
	exports.width = width;

	var height = window.innerHeight - margin.top - margin.bottom;
	exports.height = height;

	var g;
	exports.g = g;

	var minScaleExtent = 1;
	exports.minScaleExtent = minScaleExtent;
	var maxScaleExtent = 5;
	exports.maxScaleExtent = maxScaleExtent;

	//fixed colors
	var fixedColors = colorbrewer.RdYlBu[11];
	fixedColors.splice(6, 0, "#ffffff");
	fixedColors.push("#000000");
	exports.fixedColors = fixedColors;

	//colors for mappings (paired for better interpolating)
	var pairedSimpleColors = colorbrewer.Paired[12];
	exports.pairedSimpleColors = fixedColors;

	// colors for categorical attributes
	var ordinalColors = d3.scale.category20().range();
	// var ordinalColors = colorbrewer.Set1[9] ;
	exports.ordinalColors = ordinalColors;

	var projection;
	exports.projection = projection;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12);


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
	// JavaScript specs as packaged in the D3 library (d3js.org). Please see license at http://colorbrewer.org/export/LICENSE.txt
	!function() {

	var colorbrewer = {YlGn: {
	3: ["#f7fcb9","#addd8e","#31a354"],
	4: ["#ffffcc","#c2e699","#78c679","#238443"],
	5: ["#ffffcc","#c2e699","#78c679","#31a354","#006837"],
	6: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"],
	7: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
	8: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
	9: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]
	},YlGnBu: {
	3: ["#edf8b1","#7fcdbb","#2c7fb8"],
	4: ["#ffffcc","#a1dab4","#41b6c4","#225ea8"],
	5: ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
	6: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
	7: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
	8: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
	9: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
	},GnBu: {
	3: ["#e0f3db","#a8ddb5","#43a2ca"],
	4: ["#f0f9e8","#bae4bc","#7bccc4","#2b8cbe"],
	5: ["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],
	6: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],
	7: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
	8: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
	9: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]
	},BuGn: {
	3: ["#e5f5f9","#99d8c9","#2ca25f"],
	4: ["#edf8fb","#b2e2e2","#66c2a4","#238b45"],
	5: ["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
	6: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],
	7: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
	8: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
	9: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]
	},PuBuGn: {
	3: ["#ece2f0","#a6bddb","#1c9099"],
	4: ["#f6eff7","#bdc9e1","#67a9cf","#02818a"],
	5: ["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],
	6: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#1c9099","#016c59"],
	7: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
	8: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
	9: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"]
	},PuBu: {
	3: ["#ece7f2","#a6bddb","#2b8cbe"],
	4: ["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],
	5: ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
	6: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],
	7: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
	8: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
	9: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
	},BuPu: {
	3: ["#e0ecf4","#9ebcda","#8856a7"],
	4: ["#edf8fb","#b3cde3","#8c96c6","#88419d"],
	5: ["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],
	6: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8856a7","#810f7c"],
	7: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
	8: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
	9: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"]
	},RdPu: {
	3: ["#fde0dd","#fa9fb5","#c51b8a"],
	4: ["#feebe2","#fbb4b9","#f768a1","#ae017e"],
	5: ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
	6: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],
	7: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
	8: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
	9: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"]
	},PuRd: {
	3: ["#e7e1ef","#c994c7","#dd1c77"],
	4: ["#f1eef6","#d7b5d8","#df65b0","#ce1256"],
	5: ["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],
	6: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#dd1c77","#980043"],
	7: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
	8: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
	9: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"]
	},OrRd: {
	3: ["#fee8c8","#fdbb84","#e34a33"],
	4: ["#fef0d9","#fdcc8a","#fc8d59","#d7301f"],
	5: ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],
	6: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"],
	7: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
	8: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
	9: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]
	},YlOrRd: {
	3: ["#ffeda0","#feb24c","#f03b20"],
	4: ["#ffffb2","#fecc5c","#fd8d3c","#e31a1c"],
	5: ["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],
	6: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"],
	7: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
	8: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
	9: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]
	},YlOrBr: {
	3: ["#fff7bc","#fec44f","#d95f0e"],
	4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
	5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
	6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
	7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
	8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
	9: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
	},Purples: {
	3: ["#efedf5","#bcbddc","#756bb1"],
	4: ["#f2f0f7","#cbc9e2","#9e9ac8","#6a51a3"],
	5: ["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],
	6: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"],
	7: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
	8: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
	9: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]
	},Blues: {
	3: ["#deebf7","#9ecae1","#3182bd"],
	4: ["#eff3ff","#bdd7e7","#6baed6","#2171b5"],
	5: ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
	6: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],
	7: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
	8: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
	9: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
	},Greens: {
	3: ["#e5f5e0","#a1d99b","#31a354"],
	4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
	5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
	6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],
	7: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
	8: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
	9: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]
	},Oranges: {
	3: ["#fee6ce","#fdae6b","#e6550d"],
	4: ["#feedde","#fdbe85","#fd8d3c","#d94701"],
	5: ["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],
	6: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#e6550d","#a63603"],
	7: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
	8: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
	9: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"]
	},Reds: {
	3: ["#fee0d2","#fc9272","#de2d26"],
	4: ["#fee5d9","#fcae91","#fb6a4a","#cb181d"],
	5: ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
	6: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],
	7: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
	8: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
	9: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
	},Greys: {
	3: ["#f0f0f0","#bdbdbd","#636363"],
	4: ["#f7f7f7","#cccccc","#969696","#525252"],
	5: ["#f7f7f7","#cccccc","#969696","#636363","#252525"],
	6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],
	7: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
	8: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
	9: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]
	},PuOr: {
	3: ["#f1a340","#f7f7f7","#998ec3"],
	4: ["#e66101","#fdb863","#b2abd2","#5e3c99"],
	5: ["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],
	6: ["#b35806","#f1a340","#fee0b6","#d8daeb","#998ec3","#542788"],
	7: ["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"],
	8: ["#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788"],
	9: ["#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788"],
	10: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],
	11: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"]
	},BrBG: {
	3: ["#d8b365","#f5f5f5","#5ab4ac"],
	4: ["#a6611a","#dfc27d","#80cdc1","#018571"],
	5: ["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],
	6: ["#8c510a","#d8b365","#f6e8c3","#c7eae5","#5ab4ac","#01665e"],
	7: ["#8c510a","#d8b365","#f6e8c3","#f5f5f5","#c7eae5","#5ab4ac","#01665e"],
	8: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e"],
	9: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e"],
	10: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],
	11: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]
	},PRGn: {
	3: ["#af8dc3","#f7f7f7","#7fbf7b"],
	4: ["#7b3294","#c2a5cf","#a6dba0","#008837"],
	5: ["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],
	6: ["#762a83","#af8dc3","#e7d4e8","#d9f0d3","#7fbf7b","#1b7837"],
	7: ["#762a83","#af8dc3","#e7d4e8","#f7f7f7","#d9f0d3","#7fbf7b","#1b7837"],
	8: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
	9: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
	10: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],
	11: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"]
	},PiYG: {
	3: ["#e9a3c9","#f7f7f7","#a1d76a"],
	4: ["#d01c8b","#f1b6da","#b8e186","#4dac26"],
	5: ["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],
	6: ["#c51b7d","#e9a3c9","#fde0ef","#e6f5d0","#a1d76a","#4d9221"],
	7: ["#c51b7d","#e9a3c9","#fde0ef","#f7f7f7","#e6f5d0","#a1d76a","#4d9221"],
	8: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
	9: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
	10: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],
	11: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"]
	},RdBu: {
	3: ["#ef8a62","#f7f7f7","#67a9cf"],
	4: ["#ca0020","#f4a582","#92c5de","#0571b0"],
	5: ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
	6: ["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],
	7: ["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],
	8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
	9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
	10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],
	11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]
	},RdGy: {
	3: ["#ef8a62","#ffffff","#999999"],
	4: ["#ca0020","#f4a582","#bababa","#404040"],
	5: ["#ca0020","#f4a582","#ffffff","#bababa","#404040"],
	6: ["#b2182b","#ef8a62","#fddbc7","#e0e0e0","#999999","#4d4d4d"],
	7: ["#b2182b","#ef8a62","#fddbc7","#ffffff","#e0e0e0","#999999","#4d4d4d"],
	8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d"],
	9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d"],
	10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],
	11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"]
	},RdYlBu: {
	3: ["#fc8d59","#ffffbf","#91bfdb"],
	4: ["#d7191c","#fdae61","#abd9e9","#2c7bb6"],
	5: ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
	6: ["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],
	7: ["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],
	8: ["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],
	9: ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],
	10: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],
	11: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
	},Spectral: {
	3: ["#fc8d59","#ffffbf","#99d594"],
	4: ["#d7191c","#fdae61","#abdda4","#2b83ba"],
	5: ["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],
	6: ["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"],
	7: ["#d53e4f","#fc8d59","#fee08b","#ffffbf","#e6f598","#99d594","#3288bd"],
	8: ["#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd"],
	9: ["#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd"],
	10: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],
	11: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]
	},RdYlGn: {
	3: ["#fc8d59","#ffffbf","#91cf60"],
	4: ["#d7191c","#fdae61","#a6d96a","#1a9641"],
	5: ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
	6: ["#d73027","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"],
	7: ["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"],
	8: ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
	9: ["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
	10: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],
	11: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]
	},Accent: {
	3: ["#7fc97f","#beaed4","#fdc086"],
	4: ["#7fc97f","#beaed4","#fdc086","#ffff99"],
	5: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0"],
	6: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f"],
	7: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17"],
	8: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]
	},Dark2: {
	3: ["#1b9e77","#d95f02","#7570b3"],
	4: ["#1b9e77","#d95f02","#7570b3","#e7298a"],
	5: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"],
	6: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"],
	7: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d"],
	8: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]
	},Paired: {
	3: ["#a6cee3","#1f78b4","#b2df8a"],
	4: ["#a6cee3","#1f78b4","#b2df8a","#33a02c"],
	5: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],
	6: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"],
	7: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"],
	8: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00"],
	9: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],
	10: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"],
	11: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99"],
	12: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
	},Pastel1: {
	3: ["#fbb4ae","#b3cde3","#ccebc5"],
	4: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4"],
	5: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],
	6: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc"],
	7: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd"],
	8: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec"],
	9: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]
	},Pastel2: {
	3: ["#b3e2cd","#fdcdac","#cbd5e8"],
	4: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4"],
	5: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9"],
	6: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae"],
	7: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc"],
	8: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]
	},Set1: {
	3: ["#e41a1c","#377eb8","#4daf4a"],
	4: ["#e41a1c","#377eb8","#4daf4a","#984ea3"],
	5: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"],
	6: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33"],
	7: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],
	8: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],
	9: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]
	},Set2: {
	3: ["#66c2a5","#fc8d62","#8da0cb"],
	4: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3"],
	5: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],
	6: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"],
	7: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"],
	8: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]
	},Set3: {
	3: ["#8dd3c7","#ffffb3","#bebada"],
	4: ["#8dd3c7","#ffffb3","#bebada","#fb8072"],
	5: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"],
	6: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462"],
	7: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69"],
	8: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"],
	9: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9"],
	10: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd"],
	11: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5"],
	12: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]
	}};

	if (true) {
	    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (colorbrewer), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (typeof module === "object" && module.exports) {
	    module.exports = colorbrewer;
	} else {
	    this.colorbrewer = colorbrewer;
	}

	}();


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---EXPORTS---//
	var exports = module.exports = {};

	exports.formDate = function(dateString) {

		var dateFields = dateString.split("/");
		var year = dateFields[0];
		var month = dateFields[1];
		var day = dateFields[2];

		var date = new Date(year, month, day);
		// var date = Date.UTC(year, month, day);

		return (date);
	}// END: formDate

	exports.map = function(value, fromLow, fromHigh, toLow, toHigh) {
		return (toLow + (toHigh - toLow)
				* ((value - fromLow) / (fromHigh - fromLow)));
	}// END: map

	exports.capitalizeFirstLetter = function(string) {
		return string[0].toUpperCase() + string.slice(1);
	}// END: capitalizeFirstLetter

	exports.getObject = function(objects, key, val) {
		var newObj = false;
		$.each(objects, function() {
			var testObject = this;
			$.each(testObject, function(k, v) {
				// alert(k);
				if (val == v && k == key) {
					newObj = testObject;
				}
			});
		});

		return newObj;
	}// END: getObject

	exports.alternatingColorScale = function() {
		var domain;
		var range;

		function scale(x) {
			return (range[domain.indexOf(x) % range.length]);
		}

		scale.domain = function(x) {
			if (!arguments.length) {
				return (domain);
			}
			domain = x;
			return (scale);
		}

		scale.range = function(x) {
			if (!arguments.length) {
				return (range);
			}

			range = x;
			return scale;
		}

		return scale;
	}// END: alternatingColorScale

	exports.getSimpleColors = function(colors) {
		var simpleColors = [];

		var arrayLength = colors.length;
		for (var i = 0; i < arrayLength; i++) {

			var color = colors[i];
			if (color.charAt(0) === '#') {
				color = color.substr(1);
				simpleColors[i] = color;
			}

		}

		return simpleColors;
	}// END: getSimpleColors

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//
	__webpack_require__(15);
	var d3 = __webpack_require__(9);
	// TODO: require from node_modules
	__webpack_require__(19);
	__webpack_require__(22);
	var utils = __webpack_require__(13);
	var global = __webpack_require__(10);
	var points = __webpack_require__(24);
	var lines = __webpack_require__(31);
	var areas = __webpack_require__(32);
	var counts = __webpack_require__(33);

	// ---MODULE VARIABLES---//

	var sliderSpeed = 100;
	var playing = false;

	var dateFormat;
	var timeSlider;
	var sliderStartValue;
	var sliderEndValue;
	var currentSliderValue;
	var sliderInterval;
	var currentDateDisplay;
	var timeScale;
	var processID;

	// ---MODULE EXPORTS---//

	var exports = module.exports = {};

	exports.initializeTimeSlider = function( timeLine) {

		// initialize module variables
		initializeVariables(timeLine);

		// put slider at the end of timeLine, everything painted
		timeSlider.value( sliderEndValue);
		updateDateDisplay(sliderEndValue);

		// time slider listener
		timeSlider.on('slide', function(evt, value) {

			update(value);
			currentSliderValue = value;

		});// END: slide

		var playPauseButton = d3.select('#playPause').attr("class", "playPause")
				.on(
						"click",
						function() {

							if ( playing) {
								playing = false;
								playPauseButton.classed("playing", playing);

								clearInterval(processID);

							} else {
								playing = true;
								playPauseButton.classed("playing", playing);

								processID = setInterval(function() {

									var sliderValue = currentSliderValue
											+ sliderInterval;
									if (sliderValue > sliderEndValue) {
										sliderValue = sliderStartValue;
									}

									timeSlider.value(sliderValue);
									update(sliderValue);

									currentSliderValue = sliderValue;

								}, 100);

							}// END: playing check

						});

	}// END: initializeTimeSlider

	// ---FUNCTIONS---//

	initializeVariables = function(timeLine) {

		dateFormat = d3.time.format("%Y/%m/%d");

		var startDate = utils.formDate(timeLine.startTime);
		sliderStartValue = startDate.getTime();

		var endDate = utils.formDate(timeLine.endTime);
		sliderEndValue = endDate.getTime();

		currentSliderValue =  sliderStartValue;

		var duration =  sliderEndValue -  sliderStartValue;
		sliderInterval = duration / sliderSpeed;

		// initial value
		currentDateDisplay = d3.select('#currentDate');//.text(dateFormat(startDate));

		 timeScale = d3.time.scale.utc().domain([ startDate, endDate ]).range(
				[ 0, 1 ]);

		timeSlider = d3.slider().scale(timeScale).axis(d3.svg.axis());
		d3.select('#timeSlider').call(timeSlider);

	}// END: generateTime

	function updateDateDisplay(value) {

		var currentDate = timeScale.invert(timeScale(value));
		currentDateDisplay.text(dateFormat(currentDate));

	}// END: updateDateDisplay

	function update(value) {

		updateDateDisplay(value);

	    //---POINTS---//

		if(global.hasPoints) {
		points.updatePointsLayer(value);
		}

		// ---LINES---//

		if(global.hasLines) {
		lines.updateLinesLayer(value);
		}


		// --- AREAS--//
		if(global.hasAreas) {
		areas.updateAreasLayer(value);
		}

		// --- COUNTS--//
		if(global.hasCounts) {
		counts.updateCountsLayer(value);
		}

	}// END: update


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(16);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./time.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./time.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	exports.push([module.id, "#timeSlider {\n\tmargin-left: 80px;\n\tmargin-right: 5%;\n\tmargin-bottom: 2cm;\n\twidth: 90%;\n}\n\n.playPause {\n\tfloat: left;\n\tborder-style: solid;\n\tborder-width: 2px;\n\tborder-color: #CCCCCC;\n\tborder-radius: 5px;\n\twidth: 40px;\n\theight: 40px;\n\t/*  position: absolute; */\n\tbackground: url("+__webpack_require__(17)+");\n}\n\n.playPause.playing {\n\tbackground: url("+__webpack_require__(18)+");\n}\n", ""]);

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAoCAYAAABjPNNTAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPDQI1FpJDjwAAC7JJREFUWMPNWWtsVNUW/vae6cx02k6htS2tAm1FbhXS2rFUeRlzzZVH1RS8oUXQhJYrP0z/XpGEf+olNyTmSkLiDxMTCQYl5MYH6RVfaVppoAJWKXNb6B1EW3lZOjNMz2uvdX+cx5zh4QV/3ZPs2eesffbe31lr7bW+vUcwM/7fryAACCF+T7/FABoA1AOYC6ACQKnTPg3gMoALAMYBJAD8AMC6m0lcBQZvFNzmEgAwe/bs+el0eikzP/bCCy/88Yknnpj14IMPFt17772RWbNmhQoLCyUAzMzM0LVr14yff/5ZO3PmzPWvv/762nvvvfelEGKwpKTk6NTU1Hl32ttO6FecC46Zb1dkY2NjZSQS2dTc3Pzh3r17kyMjIymlFPEdXkopGhkZSe3duzfZ3Nz8YSQS2dTY2FjJzPJ28/ox5QuIwUxOzYKZg5WVlctCodCu3bt3j4+NjWWIiJmIiYmJbijstDnv2I+5NiLisbGxzO7du8dDodCuysrKZcwcZGbhzAn6LZBEDCIC5QCGysvL161Zs+bwkSOfX7ZMk5QiVkoxKcVKKXaf82WKFfnayW0juyZi0zLp88+PXF6zZs3h8vLydcwcuhHob4J0AIarqqqe7+rqOj48PJxSPgCWZd1U1C1kNxXlvOsba3h4ONXV1XW8qqrqeWYO20AJxHQ7kOSCjNTV1W3o7u4eSiQSGcuy2DItNk2LTdNg0zTZME02byi3knlywy8z8sAnEolMd3f3UF1d3QZmjrg4bgNSgZnDS5YsebKtre2zU6dOpbyJDJMNXWdDN1g3dDYMu9YNw7k32NDdorNh6PZ7jsy+t+XuOIZhOKAtPnXqu1RbW9tnS5YseZKZw6TUbRdOcPv27fVlZWVv9vb2XjFMkw3DnlTTdNY1jTVNY03X8p/zis6apt2yTc97R2dd01l3wBqmyf/q7b1SVlb25vbt2+uZOegHKZgZQggwc6yhoeH57u7uV3t6euZKKUXOgQmAgPAFNu+eATuksS11K3bjHcBgCBZ2k3AUI+xYKAAIIUFEvGfPngvvvPPO3xKJxH4hRMpVoHQQh3p6ehaWl5evffrptnuEEIKIwEQgpQBi+57ICVHOPRHA5EUFcpzee8+9JwYx2SvX9ntbpnL9pBDi6ba2e8rLy9f29PQsZOaQG8ulUxcNDAws7ezsjNfV1UeZGIpUbnJmOzQ5A9bU1OC1117D1NQ1p90HnsmJdeTr536Y8p5tcPZ4Stnyuvr6aGdnZ3xgYGApgCI/SJlMJksnJyfjK1eunEUOQFYMRT5tMIHYlqdSKezatQuLFy/C62+8jmseWCchkAIpR1MuWLd4sdgZU9ntiiwQEVauWDFrcnIynkwmS118gpmLtm3b9ifDMP6+Z8+eBa6pyV5VuQzrS6Xl5eWuH3urcOPGjXjllVcwb968/8EaXNdl28sZEFJAQEAGJJiZe3p6zoZCob++/fbbR1xNRhOJxIJly5aXABBunCKlcj7m+Z1dAoEAAoEAgsGgV3/wwQeIx+N4+eWXkUyez3s/r/j91HlWSjk1AYBYvnx5SSKRWAAgCiAqAUSvXr06f8EDC6LMDKVynYgIrMjnUzmQwWAQwWAQBQUFeeXgwYNobV2C9vZ29Pf3+/zP9Vn2Ac2NqRylMDMW3H9/9OrVq/PzQGYymerqqqpwnpMrpzMRFDGU508EKaWnTb9WCwoKEAqFEAqFMDQ0hA0bNmD9c8+hf6DfG4ucRcK+qOAtOFIgZsyZUx3OZDLVeSB1XS+LzSoNEisoVlDuinU6u6HINb2rxVsVF2g4HEY4HMaJEyfw/MaNWLZsGQ4c+MBZXAqk7I/3ACpHCYoQKy0N6rpe5gcZtiyrJBwKSyYGK7a/SOVWo2KfD91g7t8CGw6HEYlEUFhYiCtXrmDHjlexcsUKGywRmJUTlnIhjJkQDoWkZVklAMIAwkEABe6KlkLY4YcJRIDwljWDBQA78Xgg73YrQESIRCIIBALOcy4tSUGAlJBMTmYSAkCBu33gSCSSndE0KiyMBMCw/RGAYPcHdtZxJvw9IKurq7Ft2zY888wzIKWgiAC2zQ0h7PkEwBTAjDZDkUgk62beIACruLg4dW1qSkXC1QECg2AH4lyGFrZWhf3smvROrubmZrz00l8Qf+QRMDFM0/SymZPCwcwISGm7FwhTU1OquLg45W7cggC0ysrKXycnJ42qqqoQnPTHAJiUE8Ntw7Oj1TvR5MMPP4yuri1ojj8CUgRDN2BZyvM7l6awsL9dkR3UwYzJXyaNysrKXwFoLsjrdXV1l8+ePas1NTUVE1wCoMDssp6cySGEF4Ju5XerVq/Gli1bMKdqDogUDF2HshQUk5fBGAywYx3Y4KS0JyNinB07p9XV1V0GcN0FOd3a2vrLsWPHsuvWrWPhEi83DLmmdn/pZnMzM5566im8+OKLqKqqglIKuq5BOb7HzLh5Z0+ej0sOeLyPSPHQ8WPZ1kcf/cXZvyMI4OqmTZtOv/vuuyPnzp2rqK+vL3R1Z6dvggvVlbuaLCoqwrPPPov169ejqKgIlmVB0zRYluW4DNt+J3LcM4fW8XXh3/MLnDs3ro2cOTPyj7feOg3gqgvSjMViE/F4fHxwcLClvr6+UNwQNjwTASgoKEBxcTE6OjrQ3t6OaDQKy7KQzWb9+6SbOIWnNvafODCElL7jB2BwcPB6PB4fj8ViEwBMP5+caG9vH+nr6xtPJpM6hHBYs8gRVd8G6dChQ+js7EQwGEQ2OwNtRoOh67BMMy/vk5sEVO7eTbvsUDs7RgoIIfGfZFLv6+sbb29vHwEwkUd6hRCXVq1a9W1tbe2pL7/4IsXMLKXjnXaM8NKjaRrIzswgez0LTdNgGgZMywS5+d2Jfcw2OSF2crWyx1DETtplCGcLASHBTPzVl1+mamtrT61atepbIcSlG5k5AJzbunXrYP/AwLeDg0evCyEhAwFIIQEhwAwQE0zTgmkYMEwDlmU5GYptQuyRE/Yxehuw8pFnwAUoIYSElAKDR49e7+/v/3br1q2DAM753cUDmclkLjc1NR3v6Oj4/qOPPk6OjY5qUggEAgFIKR2Sm9OqbVL/3odv5ozMIIJvP8Seb3tMSkqMjY5qH338cbKjo+P7pqam45lM5vItQTq+frqrq+uThoaGbz48ePBi8vx53R1MSgkppQMUnkndLYNH83znObkNGXtzCOfD7SKRPJ/UPzx48GJDQ8M3XV1dnwA4fWOwkv6Vlk6nGcCJnTt3HqqoqPjq/ff3Xxw7e1YPuiw8GEAgaLuAu6jY0Q6Rne+JGHBIghvHhHOUJ4MBBIMFHqMfHT2rv79//8WKioqvdu7ceQjAiXQ6fdMppLfvTqVSnrCkpGQ2gMfeeOONP58+fXppW1vbvNbW1igAoZTyWLS3PWWAQfnhxY0QTobyE2UAfOzY8eynn37y46JFi47u2LHjIIDBdDo95faPxWKeBXwgp8FevgFKSkpKALTu27ev/cCBA4taWlqaHn/88eJ58+aGyMctcybND4xC5gAKKRFw6gs//mj09fVlhoaGvuvo6Di9efPmfwI4lk6n0y7jYAClsdKbQU5Pp7yTCNtUArFYiQDQPDIysmLfvn3LRkf//VBLy5K58Xi8sK62NuSuJluTDL9/SyEAKSABEDMnk0njxIkTM8eHhi78YeHCkc2bN3/z0EMP9QM4mUqnGB41/A2QqelpL0+zQN5ZSSwWqwaweGBgYMXhw4cbhoaG5tbU1NQ3NjZGamvnhyoqKgtisZgMRyJCANB0jVPTKbp06ZJ5/vx5Y3h4WJuYmBhvaWm5sHbt2sTy5cv7AfyQSqUm/Uc3dky2JaWltwB5h+z6PgALs9nsA729vU0nT56sGB8fnz0xMRGbnp4uymazEQCIRqNaaWnp9ZqamlR9ff1Uc3Pz5dWrV38XjUbHAIwKIX66m4N98Tv/IokAuA9ADYBKAGUAYgAKnfYZACkAvwK45KS4n1x+eLfXfwGb5tcZUr3ubwAAAABJRU5ErkJggg=="

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPDQM76DFfyQAACsZJREFUWMPNWV1MXNUW/vae6TCMzNCCDLaK7SDtxdaAEEostMZcH6TFh5rciJF6jdBHee816av1oYkPmr4ZH2xqTBtzo7Wh/qcplrT0R5TpXCjcqVWwRaTMDMM5Z2avdR/2PoczLdTq051kc87ZZ52zvrP2Wt9aayOYGf/PvyAACCH+ynNPAGgEUA+gDkANgEpzfwHALIAbAKYApAD8CKD4Z5QwswboXtzjJwBg3bp1G7PZ7A5mfuqVV175+zPPPLP28ccff+Dhhx8Or127NlReXi4BYGlpiW7fvu388ssv1tWrVxe//fbb2x988MHXQojhaDR6bn5+/rqrdlWFrtFcYMy82pBNTU3xcDjc29LScvzIkSPpZDKZUUoR3+dPKUXJZDJz5MiRdEtLy/FwONzb1NQUZ2a5ml4PWwlAYjCTObJg5mA8Hu8IhUJvHT58eGpiYiJHRMxETExMdMdgc8/I6Mvle0TEExMTucOHD0+FQqG34vF4BzMHmVkYnaDVABIxiAi0DC5UXV39wu7du0998cWXs8VCgZQiVkoxKcVKKXavS+cUK/LdJ/ce6SMRF4oF+vLLL2Z37959qrq6+gVmDt0JclWABlxZbW3ty319fRdGR0czyqe8WCzeNdQKc3cNZWR97xodHc309fVdqK2tfZmZyzRIAjGtBJBcgOFEIvFif3//SCqVyhWLRS4WilwoFLlQcLhQKLBTKHDhjrHSnDfv+OecEuCpVCrX398/kkgkXmTmsItjBYAKzFy2ffv2Z7u7uz+/cuVKxlPiFNixbXZsh23HZsfRR9txzLnDju0Omx3H1nJmTp/refc9juMYwEW+cuX7THd39+fbt29/lpnLSKkVgyR44MCB+qqqqrcHBwd/cwoFdhyt0LJsti2LLctiy7ZKr0uGzZZlrXjPLpGx2bZstg1Qp1Dg04ODv1VVVb194MCBemYOugAFM0MIAWaONTY2vtzf3/+vgYGBOimlWHZWAiAgfMTlnTOgKYv1rHtgl88ABkOw0LeEMYrQXCcACCFBRPzOO+/ceO+99w6lUqljQogMM0MapKGBgYEt1dXVe55/vvtBIYQgIjARSCmAWJ8TGRoy50QAkxf9ZBzck3PPiUFMOkK1n+s5tfycFEI83939YHV19Z6BgYEtzBzyUh2AB4aGhna89tprrYlEfYSJoVgBrC0hjEUEgIpoxYrMn8tltbzQ9o1WrCyXzeYgtE2NhY2pZQCJ+vrISy+91Pr+++/vADAJwJEAZDqdrpyZmWndtWvXWiKGIgVWDEU+KzCBWEEIASllyRBCaEu4ZE/3knO51rxTEYgZioogIuzauXPtzMxMazqdrgQgJYDyQ4cOPdnV1dXZ0NAQcQEp31LqpdAvvlOpO1x6+CM5l+cUqWVqIwIpTdINmzdHurq6Og8dOvQkgHIJIJJKpRo6OjqjAISnRKlln+Jl5YFAYMXhlyHiP5Rjn88qpcyRAEB0dnZGU6lUA4BIEEBkbm5uY8PmhggzQynSnAjWEeovfwAEAgFIKUv8yrWyP7pXlWPWEowSVmBmSKkjuuGxxyJzc3MbPYC5XG79+traMjLRyt6LfNWWAMB66QKBwF3OT0QlCleVUwoQQgcKAwxzLgVAgJACDz20viyXy633ANq2XRVbWxkkVlCstBODIExUag7TnxwMBu9SLITQS+ZjydXkiBmCqRScYEBJQBKEIsQqK4O2bVe5AMuKxWK0LFQmmRis2KQ9H6lCGLDat4LB4AoWVMbKAixodTmTxgwbwbxe6yIBloSyUEgWi8UogLIggDUuMUshNMUwgQgQbloAa34jrKiYmaGIDT4CWKwqpwcMF3qmhRQESAnJZDKOEADWBAFwOBzOL1kWlZeHA2BoWgEg2P0DnU2wMkDt/MoTvZecUsp8iFfSA0JofQJgCmDJWqJwOJwHwEEAxYqKiszt+XkVLlsfIGhf0lEpvBwrTNINBoMrAyRX3nRV95Lzosnkd2YEpAQxg0CYn59XFRUVGQDFIAArHo//PjMz49TW1oZ03tXWYlJuQtLXq/igMpwpILxCYDU5Ji4pOdj4nzIRDGbM/DrjxOPx3wFYEsBiIpGYvXbtmsXmC3QyV1757ZI1K+XRh3/oDMGa3Jm9TLKSHLHOUsolalMwmLAGEePaxKSVSCRmASxKAAvt7e2/joyM5ImIhbGZZnoFRZq4dfpjb+nuHC44l0dXlSO3KVMgM9iAAxhEikcunM+3t7f/CmBBApjr7e0dSyaTycnJScufNZgBJjIgteLVLcMl+XhVuTtytr/NBAQmJ6es5NWryd7e3jEAcxJAIRaLTbe2tk4NDw8vwufqXv1mlsNVstLwk/L9yLlZq6QCBjA8PLzY2to6FYvFpgEUXC+e3rt3b/Ldd9+d6ujoiNbV1ZXpald4X+iCPn36NILBoNf5MwOqWITj2Hp5AQSCAS23JgjPZcBQBbUsR5pbpRCQQkAIif+m0/aZM2emXn/99SSAaf/ezC1mvnjy5Mmmr7/6KvHPV199UEohSJgvM2ms4DggUhAysEwoDF06Ke38AADHASkFaUu3H9ABwIRiUXldW0AK/aFCgpn4m6+/zmzatOnKc889d9Fggr/cmNy/f//w2aGhi8PD5xaFkJCBAKTQSpiBQrEAy7KxlM8j746lPGzbRqGoQZFSKDhFWJaN/NIS8vlF5PN5LC7lYVkWisUCmAlC6MpFCAkpBYbPnVs8e/bsxf379w+baloXHcsle262ubn5Qk9Pzw+ffPJpemJ83JJCeP4kDEj4aIdKehVfkLB/Dr7+hb0E5wWRlJgYH7c++fTTdE9Pzw/Nzc0Xcrnc7F0ATSCN9fX1nWxsbPzu+IkTN9PXr9vui7yK2C3nvDbANEBuqebbX1luntiX1YQvsiXS19P28RMnbjY2Nn7X19d3EsCYn9zlcsXHyGazDODSwYMHP66pqfnmww+P3Zy4ds0OmqwQCAYQCOpl9wcQw1jPRCdMwne5SphSSwYDCAbXeKXY+Pg1+8Njx27W1NR8c/DgwY8BXMpmsyU7gV5fnMlkvMloNLoOwFNvvvnmP8bGxnZ0d3c/2t7eHgEglFJeavNaSAYYVLLbJ4Twhp9iDM3w+fMX8p99dvKnbdu2nXvjjTdOABjOZrPz7vOxWKy0cc9kFsAsvKCLRqNRAO1Hjx7d+9FHH21ra2trfvrppysefbQutLwT5u+BS3sDIZfBCSkRMMcbP/3knDlzJjcyMvJ9T0/P2L59+/4N4Hw2m826vS0DqIxVlgJcWMh4OwR6eQRisagA0JJMJncePXq0Y3z8P1vb2rbXtba2lic2bQq5kaMtyPD7sxQCkAISADFzOp12Ll26tHRhZOTG37ZsSe7bt++7rVu3ngVwOZPN6NrGtzlxF8DMwoKvBEfJ/kUsFlsP4ImhoaGdp06dahwZGanbsGFDfVNTU3jTpo2hmpr4mlgsJsvCYSEAWLbFmYUM3bp1q3D9+nVndHTUmp6enmpra7uxZ8+eVGdn51kAP2YymRl/H+NW5ACjsvIOgPe5qf0IgC35fH7z4OBg8+XLl2umpqbWTU9PxxYWFh7I5/NhAIhEIlZlZeXihg0bMvX19fMtLS2zXV1d30cikQkA40KIn+93E138xX9DhAE8AmADgDiAKgAxAOXm/hKADIDfAdwyaetnANafVfQ/js7exNVK/iAAAAAASUVORK5CYII="

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(20)(__webpack_require__(21))

/***/ },
/* 20 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(src) {
		if (typeof execScript === "function")
			execScript(src);
		else
			eval.call(null, src);
	}

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = "/*\r\n    D3.js Slider\r\n    Inspired by jQuery UI Slider\r\n    Copyright (c) 2013, Bjorn Sandvik - http://blog.thematicmapping.org\r\n    BSD license: http://opensource.org/licenses/BSD-3-Clause\r\n*/\r\n(function (root, factory) {\r\n  if (typeof define === 'function' && define.amd) {\r\n    // AMD. Register as an anonymous module.\r\n    define(['d3'], factory);\r\n  } else if (typeof exports === 'object') {\r\n    if (process.browser) {\r\n      // Browserify. Import css too using cssify.\r\n      require('./d3.slider.css');\r\n    }\r\n    // Node. Does not work with strict CommonJS, but\r\n    // only CommonJS-like environments that support module.exports,\r\n    // like Node.\r\n    module.exports = factory(require('d3'));\r\n  } else {\r\n    // Browser globals (root is window)\r\n    root.d3.slider = factory(root.d3);\r\n  }\r\n}(this, function (d3) {\r\nreturn function module() {\r\n  \"use strict\";\r\n\r\n  // Public variables width default settings\r\n  var min = 0,\r\n      max = 100,\r\n      step = 0.01,\r\n      animate = true,\r\n      orientation = \"horizontal\",\r\n      axis = false,\r\n      margin = 50,\r\n      value,\r\n      active = 1,\r\n      snap = false,\r\n      scale;\r\n\r\n  // Private variables\r\n  var axisScale,\r\n      dispatch = d3.dispatch(\"slide\", \"slideend\"),\r\n      formatPercent = d3.format(\".2%\"),\r\n      tickFormat = d3.format(\".0\"),\r\n      handle1,\r\n      handle2 = null,\r\n      divRange,\r\n      sliderLength;\r\n\r\n  function slider(selection) {\r\n    selection.each(function() {\r\n\r\n      // Create scale if not defined by user\r\n      if (!scale) {\r\n        scale = d3.scale.linear().domain([min, max]);\r\n      }\r\n\r\n      // Start value\r\n      value = value || scale.domain()[0];\r\n\r\n      // DIV container\r\n      var div = d3.select(this).classed(\"d3-slider d3-slider-\" + orientation, true);\r\n      \r\n      var drag = d3.behavior.drag();\r\n      drag.on('dragend', function () {\r\n        dispatch.slideend(d3.event, value);\r\n      })\r\n\r\n      // Slider handle\r\n      //if range slider, create two\r\n      // var divRange;\r\n\r\n      if (toType(value) == \"array\" && value.length == 2) {\r\n        handle1 = div.append(\"a\")\r\n          .classed(\"d3-slider-handle\", true)\r\n          .attr(\"xlink:href\", \"#\")\r\n          .attr('id', \"handle-one\")\r\n          .on(\"click\", stopPropagation)\r\n          .call(drag);\r\n        handle2 = div.append(\"a\")\r\n          .classed(\"d3-slider-handle\", true)\r\n          .attr('id', \"handle-two\")\r\n          .attr(\"xlink:href\", \"#\")\r\n          .on(\"click\", stopPropagation)\r\n          .call(drag);\r\n      } else {\r\n        handle1 = div.append(\"a\")\r\n          .classed(\"d3-slider-handle\", true)\r\n          .attr(\"xlink:href\", \"#\")\r\n          .attr('id', \"handle-one\")\r\n          .on(\"click\", stopPropagation)\r\n          .call(drag);\r\n      }\r\n      \r\n      // Horizontal slider\r\n      if (orientation === \"horizontal\") {\r\n\r\n        div.on(\"click\", onClickHorizontal);\r\n        \r\n        if (toType(value) == \"array\" && value.length == 2) {\r\n          divRange = d3.select(this).append('div').classed(\"d3-slider-range\", true);\r\n\r\n          handle1.style(\"left\", formatPercent(scale(value[ 0 ])));\r\n          divRange.style(\"left\", formatPercent(scale(value[ 0 ])));\r\n          drag.on(\"drag\", onDragHorizontal);\r\n\r\n          var width = 100 - parseFloat(formatPercent(scale(value[ 1 ])));\r\n          handle2.style(\"left\", formatPercent(scale(value[ 1 ])));\r\n          divRange.style(\"right\", width+\"%\");\r\n          drag.on(\"drag\", onDragHorizontal);\r\n\r\n        } else {\r\n          handle1.style(\"left\", formatPercent(scale(value)));\r\n          drag.on(\"drag\", onDragHorizontal);\r\n        }\r\n        \r\n        sliderLength = parseInt(div.style(\"width\"), 10);\r\n\r\n      } else { // Vertical\r\n\r\n        div.on(\"click\", onClickVertical);\r\n        drag.on(\"drag\", onDragVertical);\r\n        if (toType(value) == \"array\" && value.length == 2) {\r\n          divRange = d3.select(this).append('div').classed(\"d3-slider-range-vertical\", true);\r\n\r\n          handle1.style(\"bottom\", formatPercent(scale(value[ 0 ])));\r\n          divRange.style(\"bottom\", formatPercent(scale(value[ 0 ])));\r\n          drag.on(\"drag\", onDragVertical);\r\n\r\n          var top = 100 - parseFloat(formatPercent(scale(value[ 1 ])));\r\n          handle2.style(\"bottom\", formatPercent(scale(value[ 1 ])));\r\n          divRange.style(\"top\", top+\"%\");\r\n          drag.on(\"drag\", onDragVertical);\r\n\r\n        } else {\r\n          handle1.style(\"bottom\", formatPercent(scale(value)));\r\n          drag.on(\"drag\", onDragVertical);\r\n        }\r\n        \r\n        sliderLength = parseInt(div.style(\"height\"), 10);\r\n\r\n      }\r\n      \r\n      if (axis) {\r\n        createAxis(div);\r\n      }\r\n\r\n\r\n      function createAxis(dom) {\r\n\r\n        // Create axis if not defined by user\r\n        if (typeof axis === \"boolean\") {\r\n\r\n          axis = d3.svg.axis()\r\n              .ticks(Math.round(sliderLength / 100))\r\n              .tickFormat(tickFormat)\r\n              .orient((orientation === \"horizontal\") ? \"bottom\" :  \"right\");\r\n\r\n        }\r\n\r\n        // Copy slider scale to move from percentages to pixels\r\n        axisScale = scale.ticks ? scale.copy().range([0, sliderLength]) : scale.copy().rangePoints([0, sliderLength], 0.5);\r\n          axis.scale(axisScale);\r\n\r\n          // Create SVG axis container\r\n        var svg = dom.append(\"svg\")\r\n            .classed(\"d3-slider-axis d3-slider-axis-\" + axis.orient(), true)\r\n            .on(\"click\", stopPropagation);\r\n\r\n        var g = svg.append(\"g\");\r\n\r\n        // Horizontal axis\r\n        if (orientation === \"horizontal\") {\r\n\r\n          svg.style(\"margin-left\", -margin + \"px\");\r\n\r\n          svg.attr({\r\n            width: sliderLength + margin * 2,\r\n            height: margin\r\n          });\r\n\r\n          if (axis.orient() === \"top\") {\r\n            svg.style(\"top\", -margin + \"px\");\r\n            g.attr(\"transform\", \"translate(\" + margin + \",\" + margin + \")\");\r\n          } else { // bottom\r\n            g.attr(\"transform\", \"translate(\" + margin + \",0)\");\r\n          }\r\n\r\n        } else { // Vertical\r\n\r\n          svg.style(\"top\", -margin + \"px\");\r\n\r\n          svg.attr({\r\n            width: margin,\r\n            height: sliderLength + margin * 2\r\n          });\r\n\r\n          if (axis.orient() === \"left\") {\r\n            svg.style(\"left\", -margin + \"px\");\r\n            g.attr(\"transform\", \"translate(\" + margin + \",\" + margin + \")\");\r\n          } else { // right          \r\n            g.attr(\"transform\", \"translate(\" + 0 + \",\" + margin + \")\");\r\n          }\r\n\r\n        }\r\n\r\n        g.call(axis);\r\n\r\n      }\r\n\r\n      function onClickHorizontal() {\r\n        if (toType(value) != \"array\") {\r\n          var pos = Math.max(0, Math.min(sliderLength, d3.event.offsetX || d3.event.layerX));\r\n          moveHandle(scale.invert ? \r\n                      stepValue(scale.invert(pos / sliderLength))\r\n                    : nearestTick(pos / sliderLength));\r\n        }\r\n      }\r\n\r\n      function onClickVertical() {\r\n        if (toType(value) != \"array\") {\r\n          var pos = sliderLength - Math.max(0, Math.min(sliderLength, d3.event.offsetY || d3.event.layerY));\r\n          moveHandle(scale.invert ? \r\n                      stepValue(scale.invert(pos / sliderLength))\r\n                    : nearestTick(pos / sliderLength));\r\n        }\r\n      }\r\n\r\n      function onDragHorizontal() {\r\n        if ( d3.event.sourceEvent.target.id === \"handle-one\") {\r\n          active = 1;\r\n        } else if ( d3.event.sourceEvent.target.id == \"handle-two\" ) {\r\n          active = 2;\r\n        }\r\n        var pos = Math.max(0, Math.min(sliderLength, d3.event.x));\r\n        moveHandle(scale.invert ? \r\n                    stepValue(scale.invert(pos / sliderLength))\r\n                  : nearestTick(pos / sliderLength));\r\n      }\r\n\r\n      function onDragVertical() {\r\n        if ( d3.event.sourceEvent.target.id === \"handle-one\") {\r\n          active = 1;\r\n        } else if ( d3.event.sourceEvent.target.id == \"handle-two\" ) {\r\n          active = 2;\r\n        }\r\n        var pos = sliderLength - Math.max(0, Math.min(sliderLength, d3.event.y))\r\n        moveHandle(scale.invert ? \r\n                    stepValue(scale.invert(pos / sliderLength))\r\n                  : nearestTick(pos / sliderLength));\r\n      }\r\n\r\n      function stopPropagation() {\r\n        d3.event.stopPropagation();\r\n      }\r\n\r\n    });\r\n\r\n  }\r\n\r\n  // Move slider handle on click/drag\r\n  function moveHandle(newValue) {\r\n    var currentValue = toType(value) == \"array\"  && value.length == 2 ? value[active - 1]: value,\r\n        oldPos = formatPercent(scale(stepValue(currentValue))),\r\n        newPos = formatPercent(scale(stepValue(newValue))),\r\n        position = (orientation === \"horizontal\") ? \"left\" : \"bottom\";\r\n    if (oldPos !== newPos) {\r\n\r\n      if (toType(value) == \"array\" && value.length == 2) {\r\n        value[ active - 1 ] = newValue;\r\n        if (d3.event) {\r\n          dispatch.slide(d3.event, value );\r\n        };\r\n      } else {\r\n        if (d3.event) {\r\n          dispatch.slide(d3.event.sourceEvent || d3.event, value = newValue);\r\n        };\r\n      }\r\n\r\n      if ( value[ 0 ] >= value[ 1 ] ) return;\r\n      if ( active === 1 ) {\r\n        if (toType(value) == \"array\" && value.length == 2) {\r\n          (position === \"left\") ? divRange.style(\"left\", newPos) : divRange.style(\"bottom\", newPos);\r\n        }\r\n\r\n        if (animate) {\r\n          handle1.transition()\r\n              .styleTween(position, function() { return d3.interpolate(oldPos, newPos); })\r\n              .duration((typeof animate === \"number\") ? animate : 250);\r\n        } else {\r\n          handle1.style(position, newPos);\r\n        }\r\n      } else {\r\n        \r\n        var width = 100 - parseFloat(newPos);\r\n        var top = 100 - parseFloat(newPos);\r\n\r\n        (position === \"left\") ? divRange.style(\"right\", width + \"%\") : divRange.style(\"top\", top + \"%\");\r\n        \r\n        if (animate) {\r\n          handle2.transition()\r\n              .styleTween(position, function() { return d3.interpolate(oldPos, newPos); })\r\n              .duration((typeof animate === \"number\") ? animate : 250);\r\n        } else {\r\n          handle2.style(position, newPos);\r\n        }\r\n      }\r\n    }\r\n  }\r\n\r\n  // Calculate nearest step value\r\n  function stepValue(val) {\r\n\r\n    if (val === scale.domain()[0] || val === scale.domain()[1]) {\r\n      return val;\r\n    }\r\n\r\n    var alignValue = val;\r\n    if (snap) {\r\n      alignValue = nearestTick(scale(val));\r\n    } else{\r\n      var valModStep = (val - scale.domain()[0]) % step;\r\n      alignValue = val - valModStep;\r\n\r\n      if (Math.abs(valModStep) * 2 >= step) {\r\n        alignValue += (valModStep > 0) ? step : -step;\r\n      }\r\n    };\r\n\r\n    return alignValue;\r\n\r\n  }\r\n\r\n  // Find the nearest tick\r\n  function nearestTick(pos) {\r\n    var ticks = scale.ticks ? scale.ticks() : scale.domain();\r\n    var dist = ticks.map(function(d) {return pos - scale(d);});\r\n    var i = -1,\r\n        index = 0,\r\n        r = scale.ticks ? scale.range()[1] : scale.rangeExtent()[1];\r\n    do {\r\n        i++;\r\n        if (Math.abs(dist[i]) < r) {\r\n          r = Math.abs(dist[i]);\r\n          index = i;\r\n        };\r\n    } while (dist[i] > 0 && i < dist.length - 1);\r\n\r\n    return ticks[index];\r\n  };\r\n\r\n  // Return the type of an object\r\n  function toType(v) {\r\n    return ({}).toString.call(v).match(/\\s([a-zA-Z]+)/)[1].toLowerCase();\r\n  };\r\n\r\n  // Getter/setter functions\r\n  slider.min = function(_) {\r\n    if (!arguments.length) return min;\r\n    min = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.max = function(_) {\r\n    if (!arguments.length) return max;\r\n    max = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.step = function(_) {\r\n    if (!arguments.length) return step;\r\n    step = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.animate = function(_) {\r\n    if (!arguments.length) return animate;\r\n    animate = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.orientation = function(_) {\r\n    if (!arguments.length) return orientation;\r\n    orientation = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.axis = function(_) {\r\n    if (!arguments.length) return axis;\r\n    axis = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.margin = function(_) {\r\n    if (!arguments.length) return margin;\r\n    margin = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.value = function(_) {\r\n    if (!arguments.length) return value;\r\n    if (value) {\r\n      moveHandle(stepValue(_));\r\n    };\r\n    value = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.snap = function(_) {\r\n    if (!arguments.length) return snap;\r\n    snap = _;\r\n    return slider;\r\n  };\r\n\r\n  slider.scale = function(_) {\r\n    if (!arguments.length) return scale;\r\n    scale = _;\r\n    return slider;\r\n  };\r\n\r\n  d3.rebind(slider, dispatch, \"on\");\r\n\r\n  return slider;\r\n\r\n}\r\n}));\r\n"

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(23);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./d3.slider.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./d3.slider.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	exports.push([module.id, ".d3-slider {\n    position: relative;\n    font-family: Verdana,Arial,sans-serif;\n    font-size: 1.1em;\n    border: 1px solid #aaaaaa;\n    z-index: 2;\n}\n\n.d3-slider-horizontal {\n    height: .8em;\n}  \n\n.d3-slider-range {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  height: 0.8em;\n  position: absolute;\n}\n\n.d3-slider-range-vertical {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  position: absolute;\n  top:0;\n}\n\n.d3-slider-vertical {\n    width: .8em;\n    height: 100px;\n}      \n\n.d3-slider-handle {\n    position: absolute;\n    width: 1.2em;\n    height: 1.2em;\n    border: 1px solid #d3d3d3;\n    border-radius: 4px;\n    background: #eee;\n    background: linear-gradient(to bottom, #eee 0%, #ddd 100%);\n    z-index: 3;\n}\n\n.d3-slider-handle:hover {\n    border: 1px solid #999999;\n}\n\n.d3-slider-horizontal .d3-slider-handle {\n    top: -.3em;\n    margin-left: -.6em;\n}\n\n.d3-slider-axis {\n    position: relative;\n    z-index: 1;    \n}\n\n.d3-slider-axis-bottom {\n    top: .8em;\n}\n\n.d3-slider-axis-right {\n    left: .8em;\n}\n\n.d3-slider-axis path {\n    stroke-width: 0;\n    fill: none;\n}\n\n.d3-slider-axis line {\n    fill: none;\n    stroke: #aaa;\n    shape-rendering: crispEdges;\n}\n\n.d3-slider-axis text {\n    font-size: 11px;\n}\n\n.d3-slider-vertical .d3-slider-handle {\n    left: -.25em;\n    margin-left: 0;\n    margin-bottom: -.6em;      \n}", ""]);

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//
	__webpack_require__(25);
	var d3 = __webpack_require__(9);
	__webpack_require__(27);

	var utils = __webpack_require__(13);
	var global = __webpack_require__(10);

	// var slider = require('rangeslider.js');
	// require("script!rangeslider.js");

	__webpack_require__(29);

	// import("./jquery.simple-color.js");
	__webpack_require__(30);

	// ---MODULE VARIABLES---//

	var pointsLayer;

	var pointDefaultColorIndex = 6;
	var pointStartColor = global.pairedSimpleColors[0];
	var pointEndColor = global.pairedSimpleColors[global.pairedSimpleColors.length - 1];

	var pointRadius = 2;
	var min_point_radius = 1;
	var max_point_radius = 10;

	var tooltipAttributes = {
	  color: null,
	  radius: null
	}

	d3.kodama
	  .themeRegistry(
	    'nodesTheme', {
	      frame: {
	        padding: '4px',
	        background: 'linear-gradient(to top, rgb(16, 74, 105) 0%, rgb(14, 96, 125) 90%)',
	        'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
	        'border': '1px solid rgb(57, 208, 204)',
	        color: 'rgb(245,240,220)',
	        'border-radius': '4px',
	        'font-size': '12px',
	        'box-shadow': '0px 1px 3px rgba(0,20,40,.5)'
	      },
	      title: {
	        'text-align': 'center',
	        'padding': '4px'
	      },
	      item_title: {
	        'text-align': 'right',
	        'color': 'rgb(220,200,120)'
	      },
	      item_value: {
	        'padding': '1px 2px 1px 10px',
	        'color': 'rgb(234, 224, 184)'
	      }
	    });

	// ---MODULE EXPORTS---//

	var exports = module.exports = {};

	exports.generatePointsLayer = function(nodes, locations, nodeAttributes) {

	    pointsLayer = global.g.append("g").attr("class", "pointsLayer");

	    var points = pointsLayer.selectAll("circle").data(nodes).enter().append(
	        "circle") //
	      .attr("class", "point") //
	      .attr("startTime", function(d) {

	        return (d.startTime);

	      }) //
	      .attr("cx", function(d) {

	        var pointCoordinate = d['coordinate'];
	        if (typeof pointCoordinate == 'undefined') {
	          // discrete
	          var pointLocationId = d.locationId;
	          var pointLocation = utils.getObject(locations, "id", pointLocationId);
	          pointCoordinate = pointLocation.coordinate;
	          d['coordinate'] = pointCoordinate;
	        }

	        var xy = global.projection([pointCoordinate.xCoordinate, // long
	          pointCoordinate.yCoordinate // lat
	        ]);

	        var cx = xy[0]; // long

	        return (cx);
	      }) //
	      .attr(
	        "cy",
	        function(d) {

	          var pointCoordinate = d['coordinate'];
	          if (typeof pointCoordinate == 'undefined') {
	            // discrete
	            var pointLocationId = d.locationId;
	            var pointLocation = utils.getObject(locations, "id", pointLocationId);
	            pointCoordinate = pointLocation.coordinate;
	            d['coordinate'] = pointCoordinate;
	          }

	          var xy = global.projection([pointCoordinate.xCoordinate, // long
	            pointCoordinate.yCoordinate // lat
	          ]);

	          var cy = xy[1]; // lat

	          return (cy);
	        }) //
	      .attr("r", pointRadius) //
	      .attr("fill", global.fixedColors[pointDefaultColorIndex]) //
	      .attr("stroke", "black") //
	      .attr("opacity", 1.0) //
	      .on('mouseover', function(d) {

	        var point = d3.select(this);
	        point.attr('stroke', 'white');

	      }) //
	      .on('mouseout', function(d, i) {

	        var point = d3.select(this);
	        point.attr('stroke', "black");

	      });

	    updateTooltips();

	    // dump attribute values into DOM
	    points[0].forEach(function(d, i) {

	      var thisPoint = d3.select(d);
	      var properties = nodes[i].attributes;

	      for (var property in properties) {
	        if (properties.hasOwnProperty(property)) {

	          thisPoint.attr(property, properties[property]);

	        }
	      } // END: properties loop
	    });

	  } // END: generatePointsLayer

	exports.setupPanels = function(attributes) {

	    setupPointsLayerCheckbox();
	    setupPointFixedColorPanel();
	    setupPointColorAttributePanel(attributes);
	    setupPointFixedRadiusPanel();
	    setupPointRadiusAttributePanel(attributes);

	  } // END: setupPanels

	function setupPointsLayerCheckbox() {

	  $('#layerVisibility')
	    .append(
	      "<input type=\"checkbox\" id=\"pointsLayerCheckbox\"> Points layer<br>");

	  var pointsLayerCheckbox = document.getElementById("pointsLayerCheckbox");
	  // default state is checked
	  pointsLayerCheckbox.checked = true;

	  d3.select(pointsLayerCheckbox).on("change", function() {

	    var visibility = this.checked ? "visible" : "hidden";
	    pointsLayer.selectAll("circle").style("visibility", visibility);
	    // locationsLayer.selectAll("circle").style("visibility", visibility);

	  });

	} // END: setupPointsLayerCheckbox

	exports.updatePointsLayer = function(value) {

	    // ---select points yet to be displayed---//

	    pointsLayer.selectAll(".point") //
	      .filter(
	        function(d) {
	          var point = this;
	          var startDate = utils
	            .formDate(point.attributes.startTime.value).getTime();

	          return (value < startDate);
	        }) //
	      .transition() //
	      .ease("linear") //
	      .attr("visibility", "hidden").attr("opacity", 0);

	    // ---select points displayed now---//

	    pointsLayer.selectAll(".point") //
	      .filter(
	        function(d) {
	          var point = this;
	          var startDate = utils
	            .formDate(point.attributes.startTime.value).getTime();

	          return (value >= startDate);
	        }) //
	      .transition() //
	      .ease("linear") //
	      .attr("visibility", "visible") //
	      .attr("opacity", 1);

	  } // END: updatePointsLayer

	// ---MODULE PRIVATE FUNCTIONS---//

	updatePointColorLegend = function(scale) {

	    var width = 150;
	    var height = 110;

	    var margin = {
	      left: 20,
	      top: 20
	    };

	    $('#pointColorLegend').html('');
	    var svg = d3.select("#pointColorLegend").append('svg').attr("width", width)
	      .attr("height", height);

	    var pointColorLegend = d3.legend.color().scale(scale).shape('circle')
	      .shapeRadius(5).shapePadding(10).cells(5).orient('vertical')

	    svg.append("g").attr("class", "pointColorLegend").attr("transform",
	      "translate(" + (margin.left) + "," + (margin.top) + ")").call(
	      pointColorLegend);

	  } // END: updateColorScale

	updatePointColors = function(scale, colorAttribute) {

	    pointsLayer.selectAll(".point").transition() //
	      .ease("linear") //
	      .attr("fill", function() {

	        var point = d3.select(this);
	        var attributeValue = point.attr(colorAttribute);
	        var color = scale(attributeValue);

	        if (attributeValue == null) {
	          console.log("null found");
	          color = "#000";
	        }

	        return (color);
	      });

	  } // END: updatePointColors

	updateTooltips = function() {

	    pointsLayer
	      .selectAll(".point")
	      .call(
	        d3.kodama
	        .tooltip()
	        .format(
	          function(d, i) {

	            var tooltipItems = [];
	            for (var tooltipAttribute in tooltipAttributes) { //

	              if (tooltipAttributes[tooltipAttribute]) {
	                var element = {};
	                element.title = utils
	                  .capitalizeFirstLetter(tooltipAttribute);
	                element.value = tooltipAttributes[tooltipAttribute] + "=" + d.attributes[tooltipAttributes[tooltipAttribute]];
	                tooltipItems.push(element);
	              } // END: null check

	            } // END: attributes loop

	            return {
	              title: d.attributes.nodeName,
	              items: tooltipItems
	            };

	          }).theme('nodesTheme') //
	      );

	  } // END: updateTooltips

	updatePointFixedColorLegend = function(scale) {

	    var width = 150;
	    var height = 265;

	    var margin = {
	      left: 20,
	      top: 20
	    };

	    $('#pointFixedColorLegend').html('');
	    var svg = d3.select("#pointFixedColorLegend").append('svg').attr("width",
	      width).attr("height", height);

	    var pointFixedColorLegend = d3.legend.color().scale(scale).shape('circle')
	      .shapeRadius(5).shapePadding(10).cells(5).orient('vertical')

	    svg.append("g").attr("class", "pointFixedColorLegend").attr("transform",
	      "translate(" + (margin.left) + "," + (margin.top) + ")").call(
	      pointFixedColorLegend);

	  } // END: updatePointFixedColorLegend

	setupPointFixedColorPanel = function() {

	    var str = ("				<div class=\"panelcollapsed\">") +
	      ("					<h2>Points fixed color<\/h2>") +
	      ("					<div class=\"panelcontent\">") +
	      ("						<select id=\"pointFixedColor\">") +
	      ("						<\/select>") +
	      ("						<div id=\"pointFixedColorLegend\"><\/div>") +
	      ("					<\/div>") +
	      ("				<\/div>");

	    var html = $.parseHTML(str);

	    $(".selectors").append(html);

	    var pointFixedColorSelect = document.getElementById("pointFixedColor");
	    var scale = utils.alternatingColorScale().domain(global.fixedColors).range(
	      global.fixedColors);

	    for (var i = 0; i < global.fixedColors.length; i++) {

	      var option = global.fixedColors[i];
	      var element = document.createElement("option");
	      element.textContent = option;
	      element.value = option;

	      pointFixedColorSelect.appendChild(element);

	    } // END: i loop

	    // select the default
	    pointFixedColorSelect.selectedIndex = pointDefaultColorIndex;

	    // point fixed color listener
	    d3
	      .select(pointFixedColorSelect)
	      .on(
	        'change',
	        function() {

	          var colorSelect = pointFixedColorSelect.options[pointFixedColorSelect.selectedIndex].text;
	          var color = scale(colorSelect);

	          pointsLayer.selectAll(".point") //
	            .transition() //
	            .ease("linear") //
	            .attr("fill", color);

	          // setup legend
	          updatePointFixedColorLegend(scale);

	        });

	    tooltipAttributes['color'] = null;
	    updateTooltips();

	  } // END: setupFixedColorPanel

	setupPointColorAttributePanel = function(attributes) {

	    var str = ("				<div class=\"panelcollapsed\">") +
	      ("					<h2>Points color attribute<\/h2>") +
	      ("					<div class=\"panelcontent\">") +
	      ("						<div id=\"pointStartColor\">") +
	      ("						<\/div>") +
	      ("						<div id=\"pointEndColor\">") +
	      ("						<\/div>") +
	      ("						<h4>Attribute<\/h4>") +
	      ("						<select id=\"pointColorAttribute\">") +
	      ("						<\/select>") +
	      ("						<div id=\"pointColorLegend\"><\/div>") +
	      ("					<\/div>") +
	      ("				<\/div>");

	    var html = $.parseHTML(str);

	    $(".selectors").append(html);

	    // attribute
	    var pointColorAttributeSelect = document
	      .getElementById("pointColorAttribute");

	    for (var i = 0; i < attributes.length; i++) {

	      option = attributes[i].id;
	      // skip points with count attribute
	      if (option == global.COUNT) {
	        continue;
	      }

	      element = document.createElement("option");
	      element.textContent = option;
	      element.value = option;

	      pointColorAttributeSelect.appendChild(element);

	    } // END: i loop

	    // point color attribute listener
	    d3
	      .select(pointColorAttributeSelect)
	      .on(
	        'change',
	        function() {

	          var colorAttribute = pointColorAttributeSelect.options[pointColorAttributeSelect.selectedIndex].text;
	          var attribute = utils.getObject(attributes, "id",
	            colorAttribute);

	          var data;
	          var scale;

	          $('#pointStartColor').html('');
	          $('#pointEndColor').html('');

	          if (attribute.scale == global.ORDINAL) {

	            data = attribute.domain;
	            scale = d3.scale.ordinal().range(
	              global.ordinalColors).domain(data);

	            updatePointColorLegend(scale);

	          } else if (attribute.scale == global.LINEAR) {

	            data = attribute.range;

	            scale = d3.scale.linear().domain(data).range(
	              [pointStartColor, pointEndColor]);

	            updatePointColorLegend(scale);

	            // start color
	            $('#pointStartColor').html("<h4>Start color<\/h4>");
	            $('#pointStartColor').append(
	              "<input class=\"pointStartColor\" \/>");

	            $('.pointStartColor')
	              .simpleColor({
	                cellWidth: 13,
	                cellHeight: 13,
	                columns: 4,
	                displayColorCode: true,
	                colors: utils
	                  .getSimpleColors(global.pairedSimpleColors),

	                onSelect: function(hex,
	                    element) {

	                    pointStartColor = "#" + hex;

	                    scale.range([
	                      pointStartColor,
	                      pointEndColor
	                    ]);
	                    updatePointColorLegend(scale);

	                    // trigger repaint
	                    updatePointColors(scale,
	                      colorAttribute);

	                  } // END: onSelect
	              });

	            $('.pointStartColor').setColor(pointStartColor);

	            // end color
	            $('#pointEndColor').html("<h4>End color<\/h4>");
	            $('#pointEndColor').append(
	              "<input class=\"pointEndColor\" \/>");

	            $('.pointEndColor')
	              .simpleColor({
	                cellWidth: 13,
	                cellHeight: 13,
	                columns: 4,
	                colors: utils
	                  .getSimpleColors(global.pairedSimpleColors),
	                displayColorCode: true,
	                onSelect: function(hex,
	                  element) {

	                  pointEndColor = "#" + hex;

	                  scale.range([
	                    pointStartColor,
	                    pointEndColor
	                  ]);
	                  updatePointColorLegend(scale);

	                  // trigger repaint
	                  updatePointColors(scale,
	                    colorAttribute);
	                }
	              });

	            $('.pointEndColor').setColor(pointEndColor);

	          } else {
	            console
	              .log("Error occured when resolving scale type!");
	          }

	          // trigger repaint
	          updatePointColors(scale, colorAttribute);

	          tooltipAttributes['color'] = colorAttribute;
	          updateTooltips();

	        });

	  } // END: setupPointColorAttributePanel

	setupPointFixedRadiusPanel = function() {

	    var str = ("				<div class=\"panelcollapsed\">") +
	      ("					<h2>Points fixed radius<\/h2>") +
	      ("					<div class=\"panelcontent\">") +
	      ("						<div id=\"pointFixedRadiusSlider\">") +
	      ("						<\/div>") +
	      ("					<\/div>") +
	      ("				<\/div>");

	    var html = $.parseHTML(str);

	    $(".selectors").append(html);

	    $('#pointFixedRadiusSlider').html('<input type="range" class="pointFixedRadiusSlider" step="1" min="' + min_point_radius + '" max="' + max_point_radius + '" value="' + pointRadius + '"  />');
	    $('#pointFixedRadiusSlider').append('<span>' + pointRadius + '</span>');

	    $('.pointFixedRadiusSlider').on("input", function() {

	      pointRadius = $(this).val();

	      $(this).next().html(pointRadius);

	      pointsLayer.selectAll(".point") //
	        .transition() //
	        .ease("linear") //
	        .attr("r", pointRadius);

	    });

	    tooltipAttributes['radius'] = null;
	    updateTooltips();

	  } // END: setupPointFixedAreaPanel

	setupPointRadiusAttributePanel = function(attributes) {

	    var str = ("				<div class=\"panelcollapsed\">") +
	      ("					<h2>Points radius attribute<\/h2>") +
	      ("					<div class=\"panelcontent\">") +
	      ("						<select id=\"pointRadiusAttribute\">") +
	      ("						<\/select>") +
	      ("						  <div id=\"pointRadiusLegend\"  ><\/div>  ") +
	      ("					<\/div>") +
	      ("				<\/div>");

	    var html = $.parseHTML(str);

	    $(".selectors").append(html);

	    var pointRadiusAttributeSelect = document
	      .getElementById("pointRadiusAttribute");

	    for (var i = 0; i < attributes.length; i++) {

	      var option = attributes[i].id;
	      // skip points with count attribute
	      if (option == global.COUNT) {
	        continue;
	      }

	      var element = document.createElement("option");
	      element.textContent = option;
	      element.value = option;

	      pointRadiusAttributeSelect.appendChild(element);

	    } // END: i loop

	    // point area attribute listener
	    d3
	      .select(pointRadiusAttributeSelect)
	      .on(
	        'change',
	        function() {

	          var radiusAttribute = pointRadiusAttributeSelect.options[pointRadiusAttributeSelect.selectedIndex].text;
	          var attribute = utils.getObject(attributes, "id",
	            radiusAttribute);

	          var data;
	          var scale;

	          if (attribute.scale == global.ORDINAL) {

	            data = attribute.domain;

	            // smart range
	            var range = Array.apply(0, Array(data.length)).map(
	              function(x, y) {
	                return y + 1;
	              });
	            scale = d3.scale.ordinal().domain(data)
	              .range(range);

	            updatePointRadiusLegend(scale);

	          } else if (attribute.scale == global.LINEAR) {

	            data = attribute.range;
	            scale = d3.scale.linear().domain(data).range(
	              [min_point_radius, max_point_radius]);

	            updatePointRadiusLegend(scale);

	          } else {
	            console
	              .log("Error occured when resolving point radius scale type!");
	          }

	          pointsLayer
	            .selectAll(".point")
	            .transition()
	            .ease("linear")
	            .attr(
	              "r",
	              function(d) {

	                var attributeValue = d.attributes[radiusAttribute];
	                var radius = scale(attributeValue);

	                if (attributeValue == null) {
	                  console
	                    .log("null point radius attribute value found");
	                  radius = 0.0;
	                }

	                return (radius);
	              });

	          tooltipAttributes['radius'] = radiusAttribute;
	          updateTooltips();

	        });

	  } // END: setupPointAreaAttributePanel

	updatePointRadiusLegend = function(scale) {

	    var width = 150;
	    var height = 200;

	    var margin = {
	      left: 20,
	      top: 20
	    };

	    $('#pointRadiusLegend').html('');
	    var svg = d3.select("#pointRadiusLegend").append('svg')
	      .attr("width", width).attr("height", height);

	    var pointRadiusLegend = d3.legend.size().scale(scale).shape('circle')
	      .shapePadding(15).labelOffset(20).orient('vertical');
	    // .title(capitalizeFirstLetter(sizeAttribute.id));

	    svg.append("g").attr("class", "pointRadiusLegend").attr("transform",
	      "translate(" + (margin.left) + "," + (margin.top) + ")").call(
	      pointRadiusLegend);

	  } // END: updatePointRadiusLegend

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(20)(__webpack_require__(26))

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = "/**\n * kodama.js (v1.4.3)\n *\n * Copyright (c) 2015 Scott Southworth & Contributors\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\"); you may not use this\n * file except in compliance with the License. You may obtain a copy of the License at:\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software distributed under\n * the License is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF\n * ANY KIND, either express or implied. See the License for the specific language\n * governing permissions and limitations under the License.\n *\n * @authors Scott Southworth @DarkMarmot scott.southworth@gmail.com\n *\n */\n\n;(function (root, factory) {\n\n    if (typeof define === 'function' && define.amd) {\n        define(['d3'], factory);\n    } else if (typeof module === 'object' && module.exports) {\n        module.exports = function(d3) {\n            d3.kodama = factory(d3);\n            return d3.kodama;\n        }\n    } else {\n        root.d3.kodama = root.d3.bamboo = factory(root.d3);\n    }\n\n}(this, function (d3) {\n\n    if(d3.kodama) return d3.kodama;\n\n    var kodama = {};\n\n    var validOptions = ['gravity','theme','distance','style','target','by',\n        'fadeInDuration', 'fadeOutDuration', 'holdDuration'];\n\n    var initialized = false;\n    var bodyNode = null; //d3.select('body').node();\n    var baseSel = null;\n    var tipSel = null;\n    var holderSel = null;\n\n\n    var fadingState = \"none\";\n\n    var gravityDefs = {\n\n        northwest: [-1, -1],\n        topleft: [-1, -1],\n        upperleft: [-1, -1],\n        northeast: [1, -1],\n        topright: [1, -1],\n        upperright: [1, -1],\n        southwest: [-1, 1],\n        bottomleft: [-1, 1],\n        lowerleft: [-1, 1],\n        southeast: [1, 1],\n        bottomright: [1, 1],\n        lowerright: [1, 1],\n        north: [0, -1],\n        top: [0, -1],\n        south: [0, 1],\n        bottom: [0, -1],\n        west: [-1, 0],\n        left: [-1, 0],\n        right: [1, 0],\n        east: [1, 0],\n        center: [0, 0]\n\n    };\n\n    function resolveGravity(name) {\n        name = name.split('-').join();\n        return gravityDefs[name];\n    }\n\n    var themesByName = {};\n\n\n    var offsetSwitch = [0, 0];\n    var offsetKey = \"0:0\";\n    var tipDisplayData = null;\n\n    var activated = false; // to display after delay\n\n    var lastSourceDataShown;\n    var lastFormatFuncShown;\n\n    var defaultTarget = null;\n    var defaultHoldDuration = 0;\n    var defaultFadeInDuration = 0;\n    var defaultFadeOutDuration = 500;\n    var defaultThemeName = 'kodama';\n    var defaultGravityDirection = 'top';\n    var defaultByDirection = 'top';\n    var defaultGravity = resolveGravity(defaultGravityDirection);\n    var defaultBy = resolveGravity(defaultByDirection);\n    var defaultDistance = 25;\n\n    var defaultTheme = themesByName[defaultThemeName] = {\n        frame: {\n            padding: '4px',\n            background: 'linear-gradient(to top, rgb(16, 74, 105) 0%, rgb(14, 96, 125) 90%)',\n            'font-family': '\"Helvetica Neue\", Helvetica, Arial, sans-serif',\n            'border': '1px solid rgb(57, 208, 204)',\n            color: 'rgb(245,240,220)',\n            'border-radius': '4px',\n            'font-size': '12px',\n            'box-shadow': '0px 1px 3px rgba(0,20,40,.5)'\n        },\n        title: {'text-align': 'center', 'padding': '4px'},\n        item_title: {'text-align': 'right', 'color': 'rgb(220,200,120)'},\n        item_value: {'padding': '1px 2px 1px 10px', 'color': 'rgb(234, 224, 184)'}\n    };\n\n    kodama.init = function(node){\n\n        bodyNode = node || document.body;\n\n        if(baseSel)\n            baseSel.remove();\n\n        // handles activity, delay into being transitions\n        baseSel = d3.select(bodyNode)\n            .append('div')\n            .style('position', 'absolute')\n            .style('left', 0)\n            .style('top', 0)\n            .style('visibility', 'hidden')\n            .style('pointer-events', 'none')\n            .attr('class','kodama-tooltip')\n            .attr('name', 'kodama');\n\n        // handles mouse position placement and fade out transitions\n        tipSel = baseSel\n            .append('div')\n            .attr('name', 'kodamaTip')\n            .style({'position': 'relative', 'pointer-events': 'none', 'z-index': 9999})\n            .style('opacity', 0);\n\n        // handles screen gravity offset placement and transitions\n        holderSel = tipSel.append('div').style('position', 'relative');\n\n    };\n\n    if(document.readyState === 'loading'){\n        document.addEventListener('DOMContentLoaded', function(){ kodama.init(); });\n    } else {\n        kodama.init();\n    }\n\n    kodama.holdDuration = function(duration){\n        if(arguments.length === 0) return defaultHoldDuration;\n        defaultHoldDuration = duration;\n        return kodama;\n    };\n\n    kodama.fadeInDuration = function(duration){\n        if(arguments.length === 0) return defaultFadeInDuration;\n        defaultFadeInDuration = duration;\n        return kodama;\n    };\n\n    kodama.fadeOutDuration = function(duration){\n        if(arguments.length === 0) return defaultFadeOutDuration;\n        defaultFadeOutDuration = duration;\n        return kodama;\n    };\n\n    kodama.distance = function(distance){\n        if(arguments.length === 0) return defaultDistance;\n        defaultDistance = distance || 25;\n        return kodama;\n    };\n\n    kodama.gravity = function(direction){\n        if(arguments.length === 0) return defaultGravityDirection;\n        defaultGravityDirection = direction || 'top';\n        defaultGravity = resolveGravity(defaultGravityDirection);\n        return kodama;\n    };\n\n    kodama.theme = function(name){\n        if(arguments.length === 0) return defaultThemeName;\n        defaultThemeName = name;\n        defaultTheme = themesByName[defaultThemeName];\n        return kodama;\n    };\n\n    kodama.themeRegistry = function(name, config){\n        if(arguments.length === 1) return themesByName[name];\n        themesByName[name] = config;\n        return kodama;\n    };\n\n    kodama.themeRegistry('white_wolf', {\n        frame: {\n            padding: '5px',\n            background: 'linear-gradient(to top, rgba(220, 230, 240, .6) 0%, rgba(235, 240, 245, .9) 90%, rgba(230, 235, 240, .8) 100%)',\n            'font-family': '\"Helvetica Neue\", Helvetica, Arial, sans-serif',\n            'border': '1px solid rgb(220, 230, 250)',\n            'border-radius': '6px',\n            'font-size': '14px',\n\n            'box-shadow': '0px 1px 3px rgba(0,20,70,.5)'\n        },\n        title: {'text-align': 'center', 'padding': '4px', color: 'rgb(115,130,140)', 'font-size': '15px','text-shadow': '0 -1px 0 rgba(255,255,255,.5)'},\n        item_title: {'text-align': 'right', 'color': 'rgb(80,100,110)','font-size': '14px','text-shadow': '0 -1px 0 rgba(255,255,255,.5)'},\n        item_value: {'padding': '1px 2px 1px 10px', 'color': 'rgb(90, 95, 85)','font-size': '14px','text-shadow': '0 -1px 0 rgba(255,255,255,.5)'}\n    });\n\n\n    // returns a function/object with a config api and accepting a d3 selection to wire handlers\n    kodama.tooltip = function() {\n\n        var _offsets = {};\n        var _options = undefined;\n        var _sourceKey = undefined;\n        var _sourceData = undefined;\n        var _formatFunc = null;\n        var _distance = defaultDistance;\n        var _gravityDirection = defaultGravityDirection;\n        var _gravity = defaultGravity;\n        var _byDirection = defaultByDirection;\n        var _by = defaultBy;\n        var _theme = defaultTheme;\n        var _holdDuration = defaultHoldDuration;\n        var _fadeInDuration = defaultFadeInDuration;\n        var _fadeOutDuration = defaultFadeOutDuration;\n        var _target = defaultTarget;\n\n        var attrs = {};\n        var styles = {};\n\n        var _tooltip = function _tooltip(selection) {\n\n            selection\n                .on('mouseover.tooltip', function (d, i) {\n                    _tooltip.show(d, i);\n                })\n                .on('mousedown.tooltip', function () {\n                    _tooltip.show(null)\n                })\n                .on('mouseup.tooltip', function () {\n                    _tooltip.show(null)\n                })\n                .on('mousemove.tooltip', function () {\n                    _tooltip._update();\n                })\n                .on('mouseout.tooltip', function () {\n                    _tooltip.show(null)\n                });\n\n        };\n\n        _tooltip._build = function _build() {\n\n            if (!tipDisplayData) {\n                _tooltip.fadeOut();\n                return;\n            } else {\n                _tooltip.activateAfter(_holdDuration);\n            }\n\n            holderSel.selectAll('*').remove();\n\n            holderSel\n                .append('div')\n                .attr(attrs)\n                .style(_theme.frame)\n                .datum(tipDisplayData)\n                .each(function (d) {\n\n                    var sel = d3.select(this);\n\n                    if (d.title) {\n                        sel\n                            .append('div')\n                            .style(_theme.title)\n                            .append('span')\n                            .html(d.title);\n                    }\n\n                    if (d.items) {\n\n                        var tbody = sel.append('table').append('tbody');\n\n                        tbody.selectAll('tr').data(d.items)\n                            .enter()\n                            .append('tr')\n                            .each(function (item) {\n\n                                var tr = d3.select(this);\n                                var titleCell = tr.append('td');\n                                var valueCell = tr.append('td');\n                                titleCell.html(item.title + ':').style(_theme.item_title);\n                                valueCell.html(item.value).style(_theme.item_value);\n\n                            });\n\n                    }\n\n                });\n\n            var xOff = holderSel.node().clientWidth / 2;\n            var yOff = holderSel.node().clientHeight / 2;\n\n            for (var i = -1; i <= 1; i++) {\n                for (var j = -1; j <= 1; j++) {\n                    var k = i + \":\" + j;\n                    _offsets[k] = {left: i * (xOff + _distance) + 'px', top: j * (yOff + _distance) + 'px'};\n                }\n            }\n\n            _tooltip._update(true);\n\n        };\n\n        _tooltip._update = function _update(justRebuilt) {\n\n            if (!tipDisplayData) return;\n\n            function getTargetPos(target, by){\n                if(!target) return d3.mouse(bodyNode);\n                var bounds = target.getBoundingClientRect();\n                var xOff = bounds.width / 2;\n                var yOff = bounds.height / 2;\n                return [bounds.left + (by[0] + 1) * xOff, bounds.top + (by[1] + 1) * yOff];\n            }\n\n            //var bounds = _target ? _target.getBoundingClientRect() : null;\n            var pos = getTargetPos(_target, _by); //bounds ? [bounds.left, bounds.top] : d3.mouse(bodyNode);\n\n            var x = pos[0];\n            var y = pos[1];\n\n            var bw = bodyNode.clientWidth;\n            var bh = bodyNode.clientHeight;\n\n            var tw = tipSel.node().clientWidth;\n            var th = tipSel.node().clientHeight;\n\n            var bestKey = null;\n            var bestDiff = 5;\n\n            var xkMax = (x > bw - tw) ? -1 : (x > bw - tw - _distance * 2 ? 0 : 1);\n            var ykMax = (y > bh - th) ? -1 : (y > bh - th - _distance * 2 ? 0 : 1);\n            var xkMin = (x < tw) ? 1 : (x < tw + _distance * 2 ? 0 : -1);\n            var ykMin = (y < th) ? 1 : (y < th + _distance * 2 ? 0 : -1);\n\n            for(var xk = xkMin; xk <= xkMax; xk++){\n                for(var yk = ykMin; yk <= ykMax; yk++){\n                    if(xk === 0 && yk === 0 && _gravity[0] !== 0 && _gravity[1] !== 0) continue; // skip center unless specified\n                    var diff = Math.abs(xk - _gravity[0]) + Math.abs(yk - _gravity[1]);\n                    if(diff < bestDiff) {\n                        bestKey = [xk, yk];\n                        bestDiff = diff;\n                    }\n                }\n            }\n\n            bestKey = bestKey || [0, 0];\n\n            var left = x - tw / 2;\n            var top = y - th / 2;\n\n            tipSel.style({\n                left: left + 'px',\n                top: top + 'px'\n            });\n\n            var k = bestKey[0] + ':' + bestKey[1];\n\n            var moved = Math.max(Math.abs(offsetSwitch[0] - x), Math.abs(offsetSwitch[1] - y));\n\n            if (justRebuilt || (k !== offsetKey && moved > _distance)) {\n\n                offsetKey = k;\n                offsetSwitch = pos;\n\n                var offsetStyle = _offsets[k];\n\n                holderSel\n                    .transition().ease('cubic-out').duration(250)\n                    .style(offsetStyle);\n            }\n        };\n\n        // deprecated\n        _tooltip.attr = function (_x) {\n            if (!arguments.length) return attrs;\n            attrs = _x;\n            return this;\n        };\n\n        // deprecated\n        _tooltip.style = _tooltip.css = function (_x) {\n            if (!arguments.length) return styles;\n            styles = _x;\n            return this;\n        };\n\n\n\n        _tooltip.fadeIn = function(){\n\n            if(fadingState === 'in') {\n                return;\n            }\n\n            fadingState = 'in';\n            var progress = tipSel.style('opacity') / 1.0;\n            var duration = (1.0 - progress) * _fadeInDuration;\n            tipSel.interrupt().transition().duration(duration).style('opacity', 1);\n\n        };\n\n        _tooltip.fadeOut = function(){\n\n            if(fadingState === 'out') {\n                return;\n            }\n\n            fadingState = 'out';\n            var progress = tipSel.style('opacity') / 1.0;\n            var duration = progress * _fadeOutDuration;\n            tipSel.transition().delay(50).duration(duration).style('opacity', 0);\n\n        };\n\n        _tooltip.activate = function(){\n\n            activated = true;\n            _tooltip.fadeIn();\n\n        };\n\n        _tooltip.deactivate = function(){\n\n            lastSourceDataShown = null;\n            activated = false;\n            _tooltip.fadeOut();\n\n        };\n\n        _tooltip.activateAfter = function(){\n\n            baseSel.interrupt().transition();\n\n            if(!activated) {\n\n                baseSel.transition()\n                    .delay(_holdDuration)\n                    .duration(0)\n                    .each('start', _tooltip.activate)\n                    .style('visibility','visible');\n\n            } else {\n                _tooltip.fadeIn();\n            }\n\n        };\n\n        _tooltip.theme = function(name){\n            if(arguments.length === 0) return _theme;\n            _theme = themesByName[name];\n            return this;\n        };\n\n        _tooltip.target = function(target){\n            if(arguments.length === 0) return _target;\n            var node = target;\n            while(node && node.length > 0){\n                node = node[0];\n            }\n            _target = node;\n            return this;\n        };\n\n        _tooltip.holdDuration = function(duration){\n            if(arguments.length === 0) return _holdDuration;\n            _holdDuration = duration;\n            return this;\n        };\n\n        _tooltip.fadeInDuration = function(duration){\n            if(arguments.length === 0) return _fadeInDuration;\n            _fadeInDuration = duration;\n            return this;\n        };\n\n        _tooltip.fadeOutDuration = function(duration){\n            if(arguments.length === 0) return _fadeOutDuration;\n            _fadeOutDuration = duration;\n            return this;\n        };\n\n        _tooltip.distance = function (distance) {\n            if(arguments.length === 0) return _distance;\n            _distance =  distance;\n            return this;\n        };\n\n        _tooltip.gravity = function (direction) {\n            if(arguments.length === 0) return _gravity;\n            _gravityDirection = direction;\n            _gravity = resolveGravity(_gravityDirection);\n            return this;\n        };\n\n        _tooltip.by = function (direction) {\n            if(arguments.length === 0) return _by;\n            _byDirection = direction;\n            _by = resolveGravity(_byDirection);\n            return this;\n        };\n\n        _tooltip.options = function(options) {\n\n            if(arguments.length === 0) return _options;\n            if(!options) return this;\n\n            if(options.theme){ // if a theme is specified\n                _tooltip.theme(options.theme);\n                if(_theme.options){ // apply any options in the theme as defaults if not specified in the options argument\n                    for(var prop2 in _theme.options){\n                        if(!options.hasOwnProperty(prop2))\n                            options[prop2] = _theme.options[prop2];\n                    }\n                }\n            }\n\n            for(var prop in options){\n                if(validOptions.indexOf(prop)===-1) continue;\n                _tooltip[prop](options[prop]);\n            }\n            _options = options;\n            return this;\n\n        };\n\n        _tooltip.format =  _tooltip.prep = _tooltip.data = function(formatFunc) {\n            _formatFunc = formatFunc;\n            return this;\n        };\n\n        _tooltip.show = function(sourceData, sourceKey){\n\n            _sourceData = sourceData;\n            _sourceKey = sourceKey;\n\n            if(_sourceData !== lastSourceDataShown || _formatFunc !== lastFormatFuncShown){\n\n                lastFormatFuncShown = _formatFunc;\n                lastSourceDataShown = _sourceData;\n\n                tipDisplayData = (_formatFunc && _sourceData) ? _formatFunc(_sourceData, _sourceKey) : _sourceData;\n\n                _tooltip.options(tipDisplayData);\n                _tooltip._build();\n\n            }\n\n            _tooltip._update();\n\n        };\n\n        return _tooltip;\n\n    };\n\n    var selector = typeof jQuery !== 'undefined' && jQuery !== null ? jQuery : null;\n    selector = selector || (typeof Zepto !== 'undefined' && Zepto !== null ? Zepto : null);\n    if(selector) {\n        selector.fn.kodama = $.fn.kodama_tooltip = $.fn.bamboo = $.fn.kodama || function(tooltipData){\n\n            var self = this;\n            var els = self.toArray();\n            var arr = d3.range(els.length).map(function(){return tooltipData;});\n            d3.selectAll(els).data(arr).call(d3.kodama.tooltip());\n\n            return this;\n\n        };\n    }\n    return kodama;\n\n}));\n"

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(20)(__webpack_require__(28))

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = "(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\nvar helper = require('./legend');\n\nmodule.exports = function(){\n\n  var scale = d3.scale.linear(),\n    shape = \"rect\",\n    shapeWidth = 15,\n    shapeHeight = 15,\n    shapeRadius = 10,\n    shapePadding = 2,\n    cells = [5],\n    labels = [],\n    classPrefix = \"\",\n    useClass = false,\n    title = \"\",\n    labelFormat = d3.format(\".01f\"),\n    labelOffset = 10,\n    labelAlign = \"middle\",\n    labelDelimiter = \"to\",\n    orient = \"vertical\",\n    ascending = false,\n    path,\n    legendDispatcher = d3.dispatch(\"cellover\", \"cellout\", \"cellclick\");\n\n    function legend(svg){\n\n      var type = helper.d3_calcType(scale, ascending, cells, labels, labelFormat, labelDelimiter),\n        legendG = svg.selectAll('g').data([scale]);\n\n      legendG.enter().append('g').attr('class', classPrefix + 'legendCells');\n\n\n      var cell = legendG.selectAll(\".\" + classPrefix + \"cell\").data(type.data),\n        cellEnter = cell.enter().append(\"g\", \".cell\").attr(\"class\", classPrefix + \"cell\").style(\"opacity\", 1e-6);\n        shapeEnter = cellEnter.append(shape).attr(\"class\", classPrefix + \"swatch\"),\n        shapes = cell.select(\"g.\" + classPrefix + \"cell \" + shape);\n\n      //add event handlers\n      helper.d3_addEvents(cellEnter, legendDispatcher);\n\n      cell.exit().transition().style(\"opacity\", 0).remove();\n\n      helper.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, path);\n\n      helper.d3_addText(legendG, cellEnter, type.labels, classPrefix)\n\n      // sets placement\n      var text = cell.select(\"text\"),\n        shapeSize = shapes[0].map( function(d){ return d.getBBox(); });\n\n      //sets scale\n      //everything is fill except for line which is stroke,\n      if (!useClass){\n        if (shape == \"line\"){\n          shapes.style(\"stroke\", type.feature);\n        } else {\n          shapes.style(\"fill\", type.feature);\n        }\n      } else {\n        shapes.attr(\"class\", function(d){ return classPrefix + \"swatch \" + type.feature(d); });\n      }\n\n      var cellTrans,\n      textTrans,\n      textAlign = (labelAlign == \"start\") ? 0 : (labelAlign == \"middle\") ? 0.5 : 1;\n\n      //positions cells and text\n      if (orient === \"vertical\"){\n        cellTrans = function(d,i) { return \"translate(0, \" + (i * (shapeSize[i].height + shapePadding)) + \")\"; };\n        textTrans = function(d,i) { return \"translate(\" + (shapeSize[i].width + shapeSize[i].x +\n          labelOffset) + \",\" + (shapeSize[i].y + shapeSize[i].height/2 + 5) + \")\"; };\n\n      } else if (orient === \"horizontal\"){\n        cellTrans = function(d,i) { return \"translate(\" + (i * (shapeSize[i].width + shapePadding)) + \",0)\"; }\n        textTrans = function(d,i) { return \"translate(\" + (shapeSize[i].width*textAlign  + shapeSize[i].x) +\n          \",\" + (shapeSize[i].height + shapeSize[i].y + labelOffset + 8) + \")\"; };\n      }\n\n      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);\n      helper.d3_title(svg, legendG, title, classPrefix);\n\n      cell.transition().style(\"opacity\", 1);\n\n    }\n\n\n\n  legend.scale = function(_) {\n    if (!arguments.length) return legend;\n    scale = _;\n    return legend;\n  };\n\n  legend.cells = function(_) {\n    if (!arguments.length) return legend;\n    if (_.length > 1 || _ >= 2 ){\n      cells = _;\n    }\n    return legend;\n  };\n\n  legend.shape = function(_, d) {\n    if (!arguments.length) return legend;\n    if (_ == \"rect\" || _ == \"circle\" || _ == \"line\" || (_ == \"path\" && (typeof d === 'string')) ){\n      shape = _;\n      path = d;\n    }\n    return legend;\n  };\n\n  legend.shapeWidth = function(_) {\n    if (!arguments.length) return legend;\n    shapeWidth = +_;\n    return legend;\n  };\n\n  legend.shapeHeight = function(_) {\n    if (!arguments.length) return legend;\n    shapeHeight = +_;\n    return legend;\n  };\n\n  legend.shapeRadius = function(_) {\n    if (!arguments.length) return legend;\n    shapeRadius = +_;\n    return legend;\n  };\n\n  legend.shapePadding = function(_) {\n    if (!arguments.length) return legend;\n    shapePadding = +_;\n    return legend;\n  };\n\n  legend.labels = function(_) {\n    if (!arguments.length) return legend;\n    labels = _;\n    return legend;\n  };\n\n  legend.labelAlign = function(_) {\n    if (!arguments.length) return legend;\n    if (_ == \"start\" || _ == \"end\" || _ == \"middle\") {\n      labelAlign = _;\n    }\n    return legend;\n  };\n\n  legend.labelFormat = function(_) {\n    if (!arguments.length) return legend;\n    labelFormat = _;\n    return legend;\n  };\n\n  legend.labelOffset = function(_) {\n    if (!arguments.length) return legend;\n    labelOffset = +_;\n    return legend;\n  };\n\n  legend.labelDelimiter = function(_) {\n    if (!arguments.length) return legend;\n    labelDelimiter = _;\n    return legend;\n  };\n\n  legend.useClass = function(_) {\n    if (!arguments.length) return legend;\n    if (_ === true || _ === false){\n      useClass = _;\n    }\n    return legend;\n  };\n\n  legend.orient = function(_){\n    if (!arguments.length) return legend;\n    _ = _.toLowerCase();\n    if (_ == \"horizontal\" || _ == \"vertical\") {\n      orient = _;\n    }\n    return legend;\n  };\n\n  legend.ascending = function(_) {\n    if (!arguments.length) return legend;\n    ascending = !!_;\n    return legend;\n  };\n\n  legend.classPrefix = function(_) {\n    if (!arguments.length) return legend;\n    classPrefix = _;\n    return legend;\n  };\n\n  legend.title = function(_) {\n    if (!arguments.length) return legend;\n    title = _;\n    return legend;\n  };\n\n  d3.rebind(legend, legendDispatcher, \"on\");\n\n  return legend;\n\n};\n\n},{\"./legend\":2}],2:[function(require,module,exports){\nmodule.exports = {\n\n  d3_identity: function (d) {\n    return d;\n  },\n\n  d3_mergeLabels: function (gen, labels) {\n\n      if(labels.length === 0) return gen;\n\n      gen = (gen) ? gen : [];\n\n      var i = labels.length;\n      for (; i < gen.length; i++) {\n        labels.push(gen[i]);\n      }\n      return labels;\n    },\n\n  d3_linearLegend: function (scale, cells, labelFormat) {\n    var data = [];\n\n    if (cells.length > 1){\n      data = cells;\n\n    } else {\n      var domain = scale.domain(),\n      increment = (domain[domain.length - 1] - domain[0])/(cells - 1),\n      i = 0;\n\n      for (; i < cells; i++){\n        data.push(domain[0] + i*increment);\n      }\n    }\n\n    var labels = data.map(labelFormat);\n\n    return {data: data,\n            labels: labels,\n            feature: function(d){ return scale(d); }};\n  },\n\n  d3_quantLegend: function (scale, labelFormat, labelDelimiter) {\n    var labels = scale.range().map(function(d){\n      var invert = scale.invertExtent(d),\n      a = labelFormat(invert[0]),\n      b = labelFormat(invert[1]);\n\n      // if (( (a) && (a.isNan()) && b){\n      //   console.log(\"in initial statement\")\n        return labelFormat(invert[0]) + \" \" + labelDelimiter + \" \" + labelFormat(invert[1]);\n      // } else if (a || b) {\n      //   console.log('in else statement')\n      //   return (a) ? a : b;\n      // }\n\n    });\n\n    return {data: scale.range(),\n            labels: labels,\n            feature: this.d3_identity\n          };\n  },\n\n  d3_ordinalLegend: function (scale) {\n    return {data: scale.domain(),\n            labels: scale.domain(),\n            feature: function(d){ return scale(d); }};\n  },\n\n  d3_drawShapes: function (shape, shapes, shapeHeight, shapeWidth, shapeRadius, path) {\n    if (shape === \"rect\"){\n        shapes.attr(\"height\", shapeHeight).attr(\"width\", shapeWidth);\n\n    } else if (shape === \"circle\") {\n        shapes.attr(\"r\", shapeRadius)//.attr(\"cx\", shapeRadius).attr(\"cy\", shapeRadius);\n\n    } else if (shape === \"line\") {\n        shapes.attr(\"x1\", 0).attr(\"x2\", shapeWidth).attr(\"y1\", 0).attr(\"y2\", 0);\n\n    } else if (shape === \"path\") {\n      shapes.attr(\"d\", path);\n    }\n  },\n\n  d3_addText: function (svg, enter, labels, classPrefix){\n    enter.append(\"text\").attr(\"class\", classPrefix + \"label\");\n    svg.selectAll(\"g.cell text\").data(labels).text(this.d3_identity);\n  },\n\n  d3_calcType: function (scale, ascending, cells, labels, labelFormat, labelDelimiter){\n    var type = scale.ticks ?\n            this.d3_linearLegend(scale, cells, labelFormat) : scale.invertExtent ?\n            this.d3_quantLegend(scale, labelFormat, labelDelimiter) : this.d3_ordinalLegend(scale);\n\n    type.labels = this.d3_mergeLabels(type.labels, labels);\n\n    if (ascending) {\n      type.labels = this.d3_reverse(type.labels);\n      type.data = this.d3_reverse(type.data);\n    }\n\n    return type;\n  },\n\n  d3_reverse: function(arr) {\n    var mirror = [];\n    for (var i = 0, l = arr.length; i < l; i++) {\n      mirror[i] = arr[l-i-1];\n    }\n    return mirror;\n  },\n\n  d3_placement: function (orient, cell, cellTrans, text, textTrans, labelAlign) {\n    cell.attr(\"transform\", cellTrans);\n    text.attr(\"transform\", textTrans);\n    if (orient === \"horizontal\"){\n      text.style(\"text-anchor\", labelAlign);\n    }\n  },\n\n  d3_addEvents: function(cells, dispatcher){\n    var _ = this;\n\n      cells.on(\"mouseover.legend\", function (d) { _.d3_cellOver(dispatcher, d, this); })\n          .on(\"mouseout.legend\", function (d) { _.d3_cellOut(dispatcher, d, this); })\n          .on(\"click.legend\", function (d) { _.d3_cellClick(dispatcher, d, this); });\n  },\n\n  d3_cellOver: function(cellDispatcher, d, obj){\n    cellDispatcher.cellover.call(obj, d);\n  },\n\n  d3_cellOut: function(cellDispatcher, d, obj){\n    cellDispatcher.cellout.call(obj, d);\n  },\n\n  d3_cellClick: function(cellDispatcher, d, obj){\n    cellDispatcher.cellclick.call(obj, d);\n  },\n\n  d3_title: function(svg, cellsSvg, title, classPrefix){\n    if (title !== \"\"){\n\n      var titleText = svg.selectAll('text.' + classPrefix + 'legendTitle');\n\n      titleText.data([title])\n        .enter()\n        .append('text')\n        .attr('class', classPrefix + 'legendTitle');\n\n        svg.selectAll('text.' + classPrefix + 'legendTitle')\n            .text(title)\n\n      var yOffset = svg.select('.' + classPrefix + 'legendTitle')\n          .map(function(d) { return d[0].getBBox().height})[0],\n      xOffset = -cellsSvg.map(function(d) { return d[0].getBBox().x})[0];\n\n      cellsSvg.attr('transform', 'translate(' + xOffset + ',' + (yOffset + 10) + ')');\n\n    }\n  }\n}\n\n},{}],3:[function(require,module,exports){\nvar helper = require('./legend');\n\nmodule.exports =  function(){\n\n  var scale = d3.scale.linear(),\n    shape = \"rect\",\n    shapeWidth = 15,\n    shapePadding = 2,\n    cells = [5],\n    labels = [],\n    useStroke = false,\n    classPrefix = \"\",\n    title = \"\",\n    labelFormat = d3.format(\".01f\"),\n    labelOffset = 10,\n    labelAlign = \"middle\",\n    labelDelimiter = \"to\",\n    orient = \"vertical\",\n    ascending = false,\n    path,\n    legendDispatcher = d3.dispatch(\"cellover\", \"cellout\", \"cellclick\");\n\n    function legend(svg){\n\n      var type = helper.d3_calcType(scale, ascending, cells, labels, labelFormat, labelDelimiter),\n        legendG = svg.selectAll('g').data([scale]);\n\n      legendG.enter().append('g').attr('class', classPrefix + 'legendCells');\n\n\n      var cell = legendG.selectAll(\".\" + classPrefix + \"cell\").data(type.data),\n        cellEnter = cell.enter().append(\"g\", \".cell\").attr(\"class\", classPrefix + \"cell\").style(\"opacity\", 1e-6);\n        shapeEnter = cellEnter.append(shape).attr(\"class\", classPrefix + \"swatch\"),\n        shapes = cell.select(\"g.\" + classPrefix + \"cell \" + shape);\n\n      //add event handlers\n      helper.d3_addEvents(cellEnter, legendDispatcher);\n\n      cell.exit().transition().style(\"opacity\", 0).remove();\n\n      //creates shape\n      if (shape === \"line\"){\n        helper.d3_drawShapes(shape, shapes, 0, shapeWidth);\n        shapes.attr(\"stroke-width\", type.feature);\n      } else {\n        helper.d3_drawShapes(shape, shapes, type.feature, type.feature, type.feature, path);\n      }\n\n      helper.d3_addText(legendG, cellEnter, type.labels, classPrefix)\n\n      //sets placement\n      var text = cell.select(\"text\"),\n        shapeSize = shapes[0].map(\n          function(d, i){\n            var bbox = d.getBBox()\n            var stroke = scale(type.data[i]);\n\n            if (shape === \"line\" && orient === \"horizontal\") {\n              bbox.height = bbox.height + stroke;\n            } else if (shape === \"line\" && orient === \"vertical\"){\n              bbox.width = bbox.width;\n            }\n\n            return bbox;\n        });\n\n      var maxH = d3.max(shapeSize, function(d){ return d.height + d.y; }),\n      maxW = d3.max(shapeSize, function(d){ return d.width + d.x; });\n\n      var cellTrans,\n      textTrans,\n      textAlign = (labelAlign == \"start\") ? 0 : (labelAlign == \"middle\") ? 0.5 : 1;\n\n      //positions cells and text\n      if (orient === \"vertical\"){\n\n        cellTrans = function(d,i) {\n            var height = d3.sum(shapeSize.slice(0, i + 1 ), function(d){ return d.height; });\n            return \"translate(0, \" + (height + i*shapePadding) + \")\"; };\n\n        textTrans = function(d,i) { return \"translate(\" + (maxW + labelOffset) + \",\" +\n          (shapeSize[i].y + shapeSize[i].height/2 + 5) + \")\"; };\n\n      } else if (orient === \"horizontal\"){\n        cellTrans = function(d,i) {\n            var width = d3.sum(shapeSize.slice(0, i + 1 ), function(d){ return d.width; });\n            return \"translate(\" + (width + i*shapePadding) + \",0)\"; };\n\n        textTrans = function(d,i) { return \"translate(\" + (shapeSize[i].width*textAlign  + shapeSize[i].x) + \",\" +\n              (maxH + labelOffset ) + \")\"; };\n      }\n\n      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);\n      helper.d3_title(svg, legendG, title, classPrefix);\n\n      cell.transition().style(\"opacity\", 1);\n\n    }\n\n  legend.scale = function(_) {\n    if (!arguments.length) return legend;\n    scale = _;\n    return legend;\n  };\n\n  legend.cells = function(_) {\n    if (!arguments.length) return legend;\n    if (_.length > 1 || _ >= 2 ){\n      cells = _;\n    }\n    return legend;\n  };\n\n\n  legend.shape = function(_, d) {\n    if (!arguments.length) return legend;\n    if (_ == \"rect\" || _ == \"circle\" || _ == \"line\" ){\n      shape = _;\n      path = d;\n    }\n    return legend;\n  };\n\n  legend.shapeWidth = function(_) {\n    if (!arguments.length) return legend;\n    shapeWidth = +_;\n    return legend;\n  };\n\n  legend.shapePadding = function(_) {\n    if (!arguments.length) return legend;\n    shapePadding = +_;\n    return legend;\n  };\n\n  legend.labels = function(_) {\n    if (!arguments.length) return legend;\n    labels = _;\n    return legend;\n  };\n\n  legend.labelAlign = function(_) {\n    if (!arguments.length) return legend;\n    if (_ == \"start\" || _ == \"end\" || _ == \"middle\") {\n      labelAlign = _;\n    }\n    return legend;\n  };\n\n  legend.labelFormat = function(_) {\n    if (!arguments.length) return legend;\n    labelFormat = _;\n    return legend;\n  };\n\n  legend.labelOffset = function(_) {\n    if (!arguments.length) return legend;\n    labelOffset = +_;\n    return legend;\n  };\n\n  legend.labelDelimiter = function(_) {\n    if (!arguments.length) return legend;\n    labelDelimiter = _;\n    return legend;\n  };\n\n  legend.orient = function(_){\n    if (!arguments.length) return legend;\n    _ = _.toLowerCase();\n    if (_ == \"horizontal\" || _ == \"vertical\") {\n      orient = _;\n    }\n    return legend;\n  };\n\n  legend.ascending = function(_) {\n    if (!arguments.length) return legend;\n    ascending = !!_;\n    return legend;\n  };\n\n  legend.classPrefix = function(_) {\n    if (!arguments.length) return legend;\n    classPrefix = _;\n    return legend;\n  };\n\n  legend.title = function(_) {\n    if (!arguments.length) return legend;\n    title = _;\n    return legend;\n  };\n\n  d3.rebind(legend, legendDispatcher, \"on\");\n\n  return legend;\n\n};\n\n},{\"./legend\":2}],4:[function(require,module,exports){\nvar helper = require('./legend');\n\nmodule.exports = function(){\n\n  var scale = d3.scale.linear(),\n    shape = \"path\",\n    shapeWidth = 15,\n    shapeHeight = 15,\n    shapeRadius = 10,\n    shapePadding = 5,\n    cells = [5],\n    labels = [],\n    classPrefix = \"\",\n    useClass = false,\n    title = \"\",\n    labelFormat = d3.format(\".01f\"),\n    labelAlign = \"middle\",\n    labelOffset = 10,\n    labelDelimiter = \"to\",\n    orient = \"vertical\",\n    ascending = false,\n    legendDispatcher = d3.dispatch(\"cellover\", \"cellout\", \"cellclick\");\n\n    function legend(svg){\n\n      var type = helper.d3_calcType(scale, ascending, cells, labels, labelFormat, labelDelimiter),\n        legendG = svg.selectAll('g').data([scale]);\n\n      legendG.enter().append('g').attr('class', classPrefix + 'legendCells');\n\n      var cell = legendG.selectAll(\".\" + classPrefix + \"cell\").data(type.data),\n        cellEnter = cell.enter().append(\"g\", \".cell\").attr(\"class\", classPrefix + \"cell\").style(\"opacity\", 1e-6);\n        shapeEnter = cellEnter.append(shape).attr(\"class\", classPrefix + \"swatch\"),\n        shapes = cell.select(\"g.\" + classPrefix + \"cell \" + shape);\n\n      //add event handlers\n      helper.d3_addEvents(cellEnter, legendDispatcher);\n\n      //remove old shapes\n      cell.exit().transition().style(\"opacity\", 0).remove();\n\n      helper.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, type.feature);\n      helper.d3_addText(legendG, cellEnter, type.labels, classPrefix)\n\n      // sets placement\n      var text = cell.select(\"text\"),\n        shapeSize = shapes[0].map( function(d){ return d.getBBox(); });\n\n      var maxH = d3.max(shapeSize, function(d){ return d.height; }),\n      maxW = d3.max(shapeSize, function(d){ return d.width; });\n\n      var cellTrans,\n      textTrans,\n      textAlign = (labelAlign == \"start\") ? 0 : (labelAlign == \"middle\") ? 0.5 : 1;\n\n      //positions cells and text\n      if (orient === \"vertical\"){\n        cellTrans = function(d,i) { return \"translate(0, \" + (i * (maxH + shapePadding)) + \")\"; };\n        textTrans = function(d,i) { return \"translate(\" + (maxW + labelOffset) + \",\" +\n              (shapeSize[i].y + shapeSize[i].height/2 + 5) + \")\"; };\n\n      } else if (orient === \"horizontal\"){\n        cellTrans = function(d,i) { return \"translate(\" + (i * (maxW + shapePadding)) + \",0)\"; };\n        textTrans = function(d,i) { return \"translate(\" + (shapeSize[i].width*textAlign  + shapeSize[i].x) + \",\" +\n              (maxH + labelOffset ) + \")\"; };\n      }\n\n      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);\n      helper.d3_title(svg, legendG, title, classPrefix);\n      cell.transition().style(\"opacity\", 1);\n\n    }\n\n\n  legend.scale = function(_) {\n    if (!arguments.length) return legend;\n    scale = _;\n    return legend;\n  };\n\n  legend.cells = function(_) {\n    if (!arguments.length) return legend;\n    if (_.length > 1 || _ >= 2 ){\n      cells = _;\n    }\n    return legend;\n  };\n\n  legend.shapePadding = function(_) {\n    if (!arguments.length) return legend;\n    shapePadding = +_;\n    return legend;\n  };\n\n  legend.labels = function(_) {\n    if (!arguments.length) return legend;\n    labels = _;\n    return legend;\n  };\n\n  legend.labelAlign = function(_) {\n    if (!arguments.length) return legend;\n    if (_ == \"start\" || _ == \"end\" || _ == \"middle\") {\n      labelAlign = _;\n    }\n    return legend;\n  };\n\n  legend.labelFormat = function(_) {\n    if (!arguments.length) return legend;\n    labelFormat = _;\n    return legend;\n  };\n\n  legend.labelOffset = function(_) {\n    if (!arguments.length) return legend;\n    labelOffset = +_;\n    return legend;\n  };\n\n  legend.labelDelimiter = function(_) {\n    if (!arguments.length) return legend;\n    labelDelimiter = _;\n    return legend;\n  };\n\n  legend.orient = function(_){\n    if (!arguments.length) return legend;\n    _ = _.toLowerCase();\n    if (_ == \"horizontal\" || _ == \"vertical\") {\n      orient = _;\n    }\n    return legend;\n  };\n\n  legend.ascending = function(_) {\n    if (!arguments.length) return legend;\n    ascending = !!_;\n    return legend;\n  };\n\n  legend.classPrefix = function(_) {\n    if (!arguments.length) return legend;\n    classPrefix = _;\n    return legend;\n  };\n\n  legend.title = function(_) {\n    if (!arguments.length) return legend;\n    title = _;\n    return legend;\n  };\n\n  d3.rebind(legend, legendDispatcher, \"on\");\n\n  return legend;\n\n};\n\n},{\"./legend\":2}],5:[function(require,module,exports){\nd3.legend = {\n  color: require('./color'),\n  size: require('./size'),\n  symbol: require('./symbol')\n};\n},{\"./color\":1,\"./size\":3,\"./symbol\":4}]},{},[5]);\n"

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*** IMPORTS FROM imports-loader ***/
	var $ = __webpack_require__(1);

	/*! rangeslider.js - v2.1.1 | (c) 2016 @andreruffert | MIT license | https://github.com/andreruffert/rangeslider.js */
	(function(factory) {
	    'use strict';

	    if (true) {
	        // AMD. Register as an anonymous module.
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === 'object') {
	        // CommonJS
	        module.exports = factory(require('jquery'));
	    } else {
	        // Browser globals
	        factory(jQuery);
	    }
	}(function($) {
	    'use strict';

	    // Polyfill Number.isNaN(value)
	    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
	    Number.isNaN = Number.isNaN || function(value) {
	        return typeof value === 'number' && value !== value;
	    };

	    /**
	     * Range feature detection
	     * @return {Boolean}
	     */
	    function supportsRange() {
	        var input = document.createElement('input');
	        input.setAttribute('type', 'range');
	        return input.type !== 'text';
	    }

	    var pluginName = 'rangeslider',
	        pluginIdentifier = 0,
	        hasInputRangeSupport = supportsRange(),
	        defaults = {
	            polyfill: true,
	            orientation: 'horizontal',
	            rangeClass: 'rangeslider',
	            disabledClass: 'rangeslider--disabled',
	            horizontalClass: 'rangeslider--horizontal',
	            verticalClass: 'rangeslider--vertical',
	            fillClass: 'rangeslider__fill',
	            handleClass: 'rangeslider__handle',
	            startEvent: ['mousedown', 'touchstart', 'pointerdown'],
	            moveEvent: ['mousemove', 'touchmove', 'pointermove'],
	            endEvent: ['mouseup', 'touchend', 'pointerup']
	        },
	        constants = {
	            orientation: {
	                horizontal: {
	                    dimension: 'width',
	                    direction: 'left',
	                    directionStyle: 'left',
	                    coordinate: 'x'
	                },
	                vertical: {
	                    dimension: 'height',
	                    direction: 'top',
	                    directionStyle: 'bottom',
	                    coordinate: 'y'
	                }
	            }
	        };

	    /**
	     * Delays a function for the given number of milliseconds, and then calls
	     * it with the arguments supplied.
	     *
	     * @param  {Function} fn   [description]
	     * @param  {Number}   wait [description]
	     * @return {Function}
	     */
	    function delay(fn, wait) {
	        var args = Array.prototype.slice.call(arguments, 2);
	        return setTimeout(function(){ return fn.apply(null, args); }, wait);
	    }

	    /**
	     * Returns a debounced function that will make sure the given
	     * function is not triggered too much.
	     *
	     * @param  {Function} fn Function to debounce.
	     * @param  {Number}   debounceDuration OPTIONAL. The amount of time in milliseconds for which we will debounce the function. (defaults to 100ms)
	     * @return {Function}
	     */
	    function debounce(fn, debounceDuration) {
	        debounceDuration = debounceDuration || 100;
	        return function() {
	            if (!fn.debouncing) {
	                var args = Array.prototype.slice.apply(arguments);
	                fn.lastReturnVal = fn.apply(window, args);
	                fn.debouncing = true;
	            }
	            clearTimeout(fn.debounceTimeout);
	            fn.debounceTimeout = setTimeout(function(){
	                fn.debouncing = false;
	            }, debounceDuration);
	            return fn.lastReturnVal;
	        };
	    }

	    /**
	     * Check if a `element` is visible in the DOM
	     *
	     * @param  {Element}  element
	     * @return {Boolean}
	     */
	    function isHidden(element) {
	        return (
	            element && (
	                element.offsetWidth === 0 ||
	                element.offsetHeight === 0 ||
	                // Also Consider native `<details>` elements.
	                element.open === false
	            )
	        );
	    }

	    /**
	     * Get hidden parentNodes of an `element`
	     *
	     * @param  {Element} element
	     * @return {[type]}
	     */
	    function getHiddenParentNodes(element) {
	        var parents = [],
	            node    = element.parentNode;

	        while (isHidden(node)) {
	            parents.push(node);
	            node = node.parentNode;
	        }
	        return parents;
	    }

	    /**
	     * Returns dimensions for an element even if it is not visible in the DOM.
	     *
	     * @param  {Element} element
	     * @param  {String}  key     (e.g. offsetWidth …)
	     * @return {Number}
	     */
	    function getDimension(element, key) {
	        var hiddenParentNodes       = getHiddenParentNodes(element),
	            hiddenParentNodesLength = hiddenParentNodes.length,
	            inlineStyle             = [],
	            dimension               = element[key];

	        // Used for native `<details>` elements
	        function toggleOpenProperty(element) {
	            if (typeof element.open !== 'undefined') {
	                element.open = (element.open) ? false : true;
	            }
	        }

	        if (hiddenParentNodesLength) {
	            for (var i = 0; i < hiddenParentNodesLength; i++) {

	                // Cache style attribute to restore it later.
	                inlineStyle[i] = hiddenParentNodes[i].style.cssText;

	                // visually hide
	                if (hiddenParentNodes[i].style.setProperty) {
	                    hiddenParentNodes[i].style.setProperty('display', 'block', 'important');
	                } else {
	                    hiddenParentNodes[i].style.cssText += ';display: block !important';
	                }
	                hiddenParentNodes[i].style.height = '0';
	                hiddenParentNodes[i].style.overflow = 'hidden';
	                hiddenParentNodes[i].style.visibility = 'hidden';
	                toggleOpenProperty(hiddenParentNodes[i]);
	            }

	            // Update dimension
	            dimension = element[key];

	            for (var j = 0; j < hiddenParentNodesLength; j++) {

	                // Restore the style attribute
	                hiddenParentNodes[j].style.cssText = inlineStyle[j];
	                toggleOpenProperty(hiddenParentNodes[j]);
	            }
	        }
	        return dimension;
	    }

	    /**
	     * Returns the parsed float or the default if it failed.
	     *
	     * @param  {String}  str
	     * @param  {Number}  defaultValue
	     * @return {Number}
	     */
	    function tryParseFloat(str, defaultValue) {
	        var value = parseFloat(str);
	        return Number.isNaN(value) ? defaultValue : value;
	    }

	    /**
	     * Capitalize the first letter of string
	     *
	     * @param  {String} str
	     * @return {String}
	     */
	    function ucfirst(str) {
	        return str.charAt(0).toUpperCase() + str.substr(1);
	    }

	    /**
	     * Plugin
	     * @param {String} element
	     * @param {Object} options
	     */
	    function Plugin(element, options) {
	        this.$window            = $(window);
	        this.$document          = $(document);
	        this.$element           = $(element);
	        this.options            = $.extend( {}, defaults, options );
	        this.polyfill           = this.options.polyfill;
	        this.orientation        = this.$element[0].getAttribute('data-orientation') || this.options.orientation;
	        this.onInit             = this.options.onInit;
	        this.onSlide            = this.options.onSlide;
	        this.onSlideEnd         = this.options.onSlideEnd;
	        this.DIMENSION          = constants.orientation[this.orientation].dimension;
	        this.DIRECTION          = constants.orientation[this.orientation].direction;
	        this.DIRECTION_STYLE    = constants.orientation[this.orientation].directionStyle;
	        this.COORDINATE         = constants.orientation[this.orientation].coordinate;

	        // Plugin should only be used as a polyfill
	        if (this.polyfill) {
	            // Input range support?
	            if (hasInputRangeSupport) { return false; }
	        }

	        this.identifier = 'js-' + pluginName + '-' +(pluginIdentifier++);
	        this.startEvent = this.options.startEvent.join('.' + this.identifier + ' ') + '.' + this.identifier;
	        this.moveEvent  = this.options.moveEvent.join('.' + this.identifier + ' ') + '.' + this.identifier;
	        this.endEvent   = this.options.endEvent.join('.' + this.identifier + ' ') + '.' + this.identifier;
	        this.toFixed    = (this.step + '').replace('.', '').length - 1;
	        this.$fill      = $('<div class="' + this.options.fillClass + '" />');
	        this.$handle    = $('<div class="' + this.options.handleClass + '" />');
	        this.$range     = $('<div class="' + this.options.rangeClass + ' ' + this.options[this.orientation + 'Class'] + '" id="' + this.identifier + '" />').insertAfter(this.$element).prepend(this.$fill, this.$handle);

	        // visually hide the input
	        this.$element.css({
	            'position': 'absolute',
	            'width': '1px',
	            'height': '1px',
	            'overflow': 'hidden',
	            'opacity': '0'
	        });

	        // Store context
	        this.handleDown = $.proxy(this.handleDown, this);
	        this.handleMove = $.proxy(this.handleMove, this);
	        this.handleEnd  = $.proxy(this.handleEnd, this);

	        this.init();

	        // Attach Events
	        var _this = this;
	        this.$window.on('resize.' + this.identifier, debounce(function() {
	            // Simulate resizeEnd event.
	            delay(function() { _this.update(false, false); }, 300);
	        }, 20));

	        this.$document.on(this.startEvent, '#' + this.identifier + ':not(.' + this.options.disabledClass + ')', this.handleDown);

	        // Listen to programmatic value changes
	        this.$element.on('change.' + this.identifier, function(e, data) {
	            if (data && data.origin === _this.identifier) {
	                return;
	            }

	            var value = e.target.value,
	                pos = _this.getPositionFromValue(value);
	            _this.setPosition(pos);
	        });
	    }

	    Plugin.prototype.init = function() {
	        this.update(true, false);

	        if (this.onInit && typeof this.onInit === 'function') {
	            this.onInit();
	        }
	    };

	    Plugin.prototype.update = function(updateAttributes, triggerSlide) {
	        updateAttributes = updateAttributes || false;

	        if (updateAttributes) {
	            this.min    = tryParseFloat(this.$element[0].getAttribute('min'), 0);
	            this.max    = tryParseFloat(this.$element[0].getAttribute('max'), 100);
	            this.value  = tryParseFloat(this.$element[0].value, Math.round(this.min + (this.max-this.min)/2));
	            this.step   = tryParseFloat(this.$element[0].getAttribute('step'), 1);
	        }

	        this.handleDimension    = getDimension(this.$handle[0], 'offset' + ucfirst(this.DIMENSION));
	        this.rangeDimension     = getDimension(this.$range[0], 'offset' + ucfirst(this.DIMENSION));
	        this.maxHandlePos       = this.rangeDimension - this.handleDimension;
	        this.grabPos            = this.handleDimension / 2;
	        this.position           = this.getPositionFromValue(this.value);

	        // Consider disabled state
	        if (this.$element[0].disabled) {
	            this.$range.addClass(this.options.disabledClass);
	        } else {
	            this.$range.removeClass(this.options.disabledClass);
	        }

	        this.setPosition(this.position, triggerSlide);
	    };

	    Plugin.prototype.handleDown = function(e) {
	        this.$document.on(this.moveEvent, this.handleMove);
	        this.$document.on(this.endEvent, this.handleEnd);

	        // If we click on the handle don't set the new position
	        if ((' ' + e.target.className + ' ').replace(/[\n\t]/g, ' ').indexOf(this.options.handleClass) > -1) {
	            return;
	        }

	        var pos         = this.getRelativePosition(e),
	            rangePos    = this.$range[0].getBoundingClientRect()[this.DIRECTION],
	            handlePos   = this.getPositionFromNode(this.$handle[0]) - rangePos,
	            setPos      = (this.orientation === 'vertical') ? (this.maxHandlePos - (pos - this.grabPos)) : (pos - this.grabPos);

	        this.setPosition(setPos);

	        if (pos >= handlePos && pos < handlePos + this.handleDimension) {
	            this.grabPos = pos - handlePos;
	        }
	    };

	    Plugin.prototype.handleMove = function(e) {
	        e.preventDefault();
	        var pos = this.getRelativePosition(e);
	        var setPos = (this.orientation === 'vertical') ? (this.maxHandlePos - (pos - this.grabPos)) : (pos - this.grabPos);
	        this.setPosition(setPos);
	    };

	    Plugin.prototype.handleEnd = function(e) {
	        e.preventDefault();
	        this.$document.off(this.moveEvent, this.handleMove);
	        this.$document.off(this.endEvent, this.handleEnd);

	        // Ok we're done fire the change event
	        this.$element.trigger('change', { origin: this.identifier });

	        if (this.onSlideEnd && typeof this.onSlideEnd === 'function') {
	            this.onSlideEnd(this.position, this.value);
	        }
	    };

	    Plugin.prototype.cap = function(pos, min, max) {
	        if (pos < min) { return min; }
	        if (pos > max) { return max; }
	        return pos;
	    };

	    Plugin.prototype.setPosition = function(pos, triggerSlide) {
	        var value, newPos;

	        if (triggerSlide === undefined) {
	            triggerSlide = true;
	        }

	        // Snapping steps
	        value = this.getValueFromPosition(this.cap(pos, 0, this.maxHandlePos));
	        newPos = this.getPositionFromValue(value);

	        // Update ui
	        this.$fill[0].style[this.DIMENSION] = (newPos + this.grabPos) + 'px';
	        this.$handle[0].style[this.DIRECTION_STYLE] = newPos + 'px';
	        this.setValue(value);

	        // Update globals
	        this.position = newPos;
	        this.value = value;

	        if (triggerSlide && this.onSlide && typeof this.onSlide === 'function') {
	            this.onSlide(newPos, value);
	        }
	    };

	    // Returns element position relative to the parent
	    Plugin.prototype.getPositionFromNode = function(node) {
	        var i = 0;
	        while (node !== null) {
	            i += node.offsetLeft;
	            node = node.offsetParent;
	        }
	        return i;
	    };

	    Plugin.prototype.getRelativePosition = function(e) {
	        // Get the offset DIRECTION relative to the viewport
	        var ucCoordinate = ucfirst(this.COORDINATE),
	            rangePos = this.$range[0].getBoundingClientRect()[this.DIRECTION],
	            pageCoordinate = 0;

	        if (typeof e['page' + ucCoordinate] !== 'undefined') {
	            pageCoordinate = e['client' + ucCoordinate];
	        }
	        else if (typeof e.originalEvent['client' + ucCoordinate] !== 'undefined') {
	            pageCoordinate = e.originalEvent['client' + ucCoordinate];
	        }
	        else if (e.originalEvent.touches && e.originalEvent.touches[0] && typeof e.originalEvent.touches[0]['client' + ucCoordinate] !== 'undefined') {
	            pageCoordinate = e.originalEvent.touches[0]['client' + ucCoordinate];
	        }
	        else if(e.currentPoint && typeof e.currentPoint[this.COORDINATE] !== 'undefined') {
	            pageCoordinate = e.currentPoint[this.COORDINATE];
	        }

	        return pageCoordinate - rangePos;
	    };

	    Plugin.prototype.getPositionFromValue = function(value) {
	        var percentage, pos;
	        percentage = (value - this.min)/(this.max - this.min);
	        pos = (!Number.isNaN(percentage)) ? percentage * this.maxHandlePos : 0;
	        return pos;
	    };

	    Plugin.prototype.getValueFromPosition = function(pos) {
	        var percentage, value;
	        percentage = ((pos) / (this.maxHandlePos || 1));
	        value = this.step * Math.round(percentage * (this.max - this.min) / this.step) + this.min;
	        return Number((value).toFixed(this.toFixed));
	    };

	    Plugin.prototype.setValue = function(value) {
	        if (value === this.value && this.$element[0].value !== '') {
	            return;
	        }

	        // Set the new value and fire the `input` event
	        this.$element
	            .val(value)
	            .trigger('input', { origin: this.identifier });
	    };

	    Plugin.prototype.destroy = function() {
	        this.$document.off('.' + this.identifier);
	        this.$window.off('.' + this.identifier);

	        this.$element
	            .off('.' + this.identifier)
	            .removeAttr('style')
	            .removeData('plugin_' + pluginName);

	        // Remove the generated markup
	        if (this.$range && this.$range.length) {
	            this.$range[0].parentNode.removeChild(this.$range[0]);
	        }
	    };

	    // A really lightweight plugin wrapper around the constructor,
	    // preventing against multiple instantiations
	    $.fn[pluginName] = function(options) {
	        var args = Array.prototype.slice.call(arguments, 1);

	        return this.each(function() {
	            var $this = $(this),
	                data  = $this.data('plugin_' + pluginName);

	            // Create a new instance.
	            if (!data) {
	                $this.data('plugin_' + pluginName, (data = new Plugin(this, options)));
	            }

	            // Make it possible to access methods from public.
	            // e.g `$element.rangeslider('method');`
	            if (typeof options === 'string') {
	                data[options].apply(data, args);
	            }
	        });
	    };

	    return 'rangeslider.js is available in jQuery context e.g $(selector).rangeslider(options);';

	}));



/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*** IMPORTS FROM imports-loader ***/
	var $ = __webpack_require__(1);

	/*
	 * jQuery simple-color plugin
	 * @requires jQuery v1.4.2 or later
	 *
	 * See https://github.com/recurser/jquery-simple-color
	 *
	 * Licensed under the MIT license:
	 *   http://www.opensource.org/licenses/mit-license.php
	 *
	 * Version: 1.2.1 (Sun, 05 Jan 2014 05:14:47 GMT)
	 */
	 (function($) {
	/**
	 * simpleColor() provides a mechanism for displaying simple color-choosers.
	 *
	 * If an options Object is provided, the following attributes are supported:
	 *
	 *  defaultColor:       Default (initially selected) color.
	 *                      Default value: '#FFF'
	 *
	 *  cellWidth:          Width of each individual color cell.
	 *                      Default value: 10
	 *
	 *  cellHeight:         Height of each individual color cell.
	 *                      Default value: 10
	 *
	 *  cellMargin:         Margin of each individual color cell.
	 *                      Default value: 1
	 *
	 *  boxWidth:           Width of the color display box.
	 *                      Default value: 115px
	 *
	 *  boxHeight:          Height of the color display box.
	 *                      Default value: 20px
	 *
	 *  columns:            Number of columns to display. Color order may look strange if this is altered.
	 *                      Default value: 16
	 *
	 *  insert:             The position to insert the color chooser. 'before' or 'after'.
	 *                      Default value: 'after'
	 *
	 *  colors:             An array of colors to display, if you want to customize the default color set.
	 *                      Default value: default color set - see 'defaultColors' below.
	 *
	 *  displayColorCode:   Display the color code (eg #333333) as text inside the button. true or false.
	 *                      Default value: false
	 *
	 *  colorCodeAlign:     Text alignment used to display the color code inside the button. Only used if
	 *                      'displayColorCode' is true. 'left', 'center' or 'right'
	 *                      Default value: 'center'
	 *
	 *  colorCodeColor:     Text color of the color code inside the button. Only used if 'displayColorCode'
	 *                      is true.
	 *                      Default value: '#FFF'
	 *
	 *  onSelect:           Callback function to call after a color has been chosen. The callback
	 *                      function will be passed two arguments - the hex code of the selected color,
	 *                      and the input element that triggered the chooser.
	 *                      Default value: null
	 *                      Returns:       hex value
	 *
	 *  onCellEnter:        Callback function that excecutes when the mouse enters a cell. The callback
	 *                      function will be passed two arguments - the hex code of the current color,
	 *                      and the input element that triggered the chooser.
	 *                      Default value: null
	 *                      Returns:       hex value
	 *
	 *  onClose:            Callback function that executes when the chooser is closed. The callback
	 *                      function will be passed one argument - the input element that triggered
	 *                      the chooser.
	 *                      Default value: null
	 *
	 *  livePreview:        The color display will change to show the color of the hovered color cell.
	 *                      The display will revert if no color is selected.
	 *                      Default value: false
	 *
	 *  chooserCSS:         An associative array of CSS properties that will be applied to the pop-up
	 *                      color chooser.
	 *                      Default value: see options.chooserCSS in the source
	 *
	 *  displayCSS:         An associative array of CSS properties that will be applied to the color
	 *                      display box.
	 *                      Default value: see options.displayCSS in the source
	 */
	  $.fn.simpleColor = function(options) {

	    var element = this;

	    var defaultColors = [
	      '990033', 'ff3366', 'cc0033', 'ff0033', 'ff9999', 'cc3366', 'ffccff', 'cc6699',
	      '993366', '660033', 'cc3399', 'ff99cc', 'ff66cc', 'ff99ff', 'ff6699', 'cc0066',
	      'ff0066', 'ff3399', 'ff0099', 'ff33cc', 'ff00cc', 'ff66ff', 'ff33ff', 'ff00ff',
	      'cc0099', '990066', 'cc66cc', 'cc33cc', 'cc99ff', 'cc66ff', 'cc33ff', '993399',
	      'cc00cc', 'cc00ff', '9900cc', '990099', 'cc99cc', '996699', '663366', '660099',
	      '9933cc', '660066', '9900ff', '9933ff', '9966cc', '330033', '663399', '6633cc',
	      '6600cc', '9966ff', '330066', '6600ff', '6633ff', 'ccccff', '9999ff', '9999cc',
	      '6666cc', '6666ff', '666699', '333366', '333399', '330099', '3300cc', '3300ff',
	      '3333ff', '3333cc', '0066ff', '0033ff', '3366ff', '3366cc', '000066', '000033',
	      '0000ff', '000099', '0033cc', '0000cc', '336699', '0066cc', '99ccff', '6699ff',
	      '003366', '6699cc', '006699', '3399cc', '0099cc', '66ccff', '3399ff', '003399',
	      '0099ff', '33ccff', '00ccff', '99ffff', '66ffff', '33ffff', '00ffff', '00cccc',
	      '009999', '669999', '99cccc', 'ccffff', '33cccc', '66cccc', '339999', '336666',
	      '006666', '003333', '00ffcc', '33ffcc', '33cc99', '00cc99', '66ffcc', '99ffcc',
	      '00ff99', '339966', '006633', '336633', '669966', '66cc66', '99ff99', '66ff66',
	      '339933', '99cc99', '66ff99', '33ff99', '33cc66', '00cc66', '66cc99', '009966',
	      '009933', '33ff66', '00ff66', 'ccffcc', 'ccff99', '99ff66', '99ff33', '00ff33',
	      '33ff33', '00cc33', '33cc33', '66ff33', '00ff00', '66cc33', '006600', '003300',
	      '009900', '33ff00', '66ff00', '99ff00', '66cc00', '00cc00', '33cc00', '339900',
	      '99cc66', '669933', '99cc33', '336600', '669900', '99cc00', 'ccff66', 'ccff33',
	      'ccff00', '999900', 'cccc00', 'cccc33', '333300', '666600', '999933', 'cccc66',
	      '666633', '999966', 'cccc99', 'ffffcc', 'ffff99', 'ffff66', 'ffff33', 'ffff00',
	      'ffcc00', 'ffcc66', 'ffcc33', 'cc9933', '996600', 'cc9900', 'ff9900', 'cc6600',
	      '993300', 'cc6633', '663300', 'ff9966', 'ff6633', 'ff9933', 'ff6600', 'cc3300',
	      '996633', '330000', '663333', '996666', 'cc9999', '993333', 'cc6666', 'ffcccc',
	      'ff3333', 'cc3333', 'ff6666', '660000', '990000', 'cc0000', 'ff0000', 'ff3300',
	      'cc9966', 'ffcc99', 'ffffff', 'cccccc', '999999', '666666', '333333', '000000',
	      '000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000'
	    ];

	    // Option defaults
	    options = $.extend({
	      defaultColor:     this.attr('defaultColor') || '#FFF',
	      cellWidth:        this.attr('cellWidth') || 10,
	      cellHeight:       this.attr('cellHeight') || 10,
	      cellMargin:       this.attr('cellMargin') || 1,
	      boxWidth:         this.attr('boxWidth') || '115px',
	      boxHeight:        this.attr('boxHeight') || '20px',
	      columns:          this.attr('columns') || 16,
	      insert:           this.attr('insert') || 'after',
	      colors:           this.attr('colors') || defaultColors,
	      displayColorCode: this.attr('displayColorCode') || false,
	      colorCodeAlign:   this.attr('colorCodeAlign') || 'center',
	      colorCodeColor:   this.attr('colorCodeColor') || '#FFF',
	      onSelect:         null,
	      onCellEnter:      null,
	      onClose:          null,
	      livePreview:      false
	    }, options || {});

	    // Figure out the cell dimensions
	    options.totalWidth = options.columns * (options.cellWidth + (2 * options.cellMargin));

	    // Custom CSS for the chooser, which relies on previously defined options.
	    options.chooserCSS = $.extend({
	      'border':           '1px solid #000',
	      'margin':           '0 0 0 5px',
	      'width':            options.totalWidth,
	      'height':           options.totalHeight,
	      'top':              0,
	      'left':             options.boxWidth,
	      'position':         'absolute',
	      'background-color': '#fff'
	    }, options.chooserCSS || {});

	    // Custom CSS for the display box, which relies on previously defined options.
	    options.displayCSS = $.extend({
	      'background-color': options.defaultColor,
	      'border':           '1px solid #000',
	      'width':            options.boxWidth,
	      'height':           options.boxHeight,
	      'line-height':      options.boxHeight + 'px',
	      'cursor':           'pointer'
	    }, options.displayCSS || {});

	    // Hide the input
	    this.hide();

	    // this should probably do feature detection - I don't know why we need +2 for IE
	    // but this works for jQuery 1.9.1
	    if (navigator.userAgent.indexOf("MSIE")!=-1){
	      options.totalWidth += 2;
	    }

	    options.totalHeight = Math.ceil(options.colors.length / options.columns) * (options.cellHeight + (2 * options.cellMargin));

	    // Store these options so they'll be available to the other functions
	    // TODO - must be a better way to do this, not sure what the 'official'
	    // jQuery method is. Ideally i want to pass these as a parameter to the
	    // each() function but i'm not sure how
	    $.simpleColorOptions = options;

	    function buildChooser(index) {
	      options = $.simpleColorOptions;

	      // Create a container to hold everything
	      var container = $("<div class='simpleColorContainer' />");

	      // Absolutely positioned child elements now 'work'.
				container.css('position', 'relative');

	      // Create the color display box
	      var defaultColor = (this.value && this.value != '') ? this.value : options.defaultColor;

	      var displayBox = $("<div class='simpleColorDisplay' />");
	      displayBox.css($.extend(options.displayCSS, { 'background-color': defaultColor }));
	      displayBox.data('color', defaultColor);
	      container.append(displayBox);

	      // If 'displayColorCode' is turned on, display the currently selected color code as text inside the button.
	      if (options.displayColorCode) {
	        displayBox.data('displayColorCode', true);
	        displayBox.text(this.value);
	        displayBox.css({
	          'color':     options.colorCodeColor,
	          'textAlign': options.colorCodeAlign
	        });
	      }

	      var selectCallback = function (event) {
	        // Bind and namespace the click listener only when the chooser is
	        // displayed. Unbind when the chooser is closed.
	        $('html').bind("click.simpleColorDisplay", function(e) {
	          $('html').unbind("click.simpleColorDisplay");
	          $('.simpleColorChooser').hide();

	          // If the user has not selected a new color, then revert the display.
	          // Makes sure the selected cell is within the current color chooser.
	          var target = $(e.target);
	          if (target.is('.simpleColorCell') === false || $.contains( $(event.target).closest('.simpleColorContainer')[0], target[0]) === false) {
	            displayBox.css('background-color', displayBox.data('color'));
	            if (options.displayColorCode) {
	              displayBox.text(displayBox.data('color'));
	            }
	          }
	          // Execute onClose callback whenever the color chooser is closed.
	          if (options.onClose) {
	            options.onClose(element);
	          }
	        });

	        // Use an existing chooser if there is one
	        if (event.data.container.chooser) {
	          event.data.container.chooser.toggle();

	        // Build the chooser.
	        } else {
	          // Make a chooser div to hold the cells
	          var chooser = $("<div class='simpleColorChooser'/>");
	          chooser.css(options.chooserCSS);

	          event.data.container.chooser = chooser;
	          event.data.container.append(chooser);

	          // Create the cells
	          for (var i=0; i<options.colors.length; i++) {
	            var cell = $("<div class='simpleColorCell' id='" + options.colors[i] + "'/>");
	            cell.css({
	              'width':            options.cellWidth + 'px',
	              'height':           options.cellHeight + 'px',
	              'margin':           options.cellMargin + 'px',
	              'cursor':           'pointer',
	              'lineHeight':       options.cellHeight + 'px',
	              'fontSize':         '1px',
	              'float':            'left',
	              'background-color': '#'+options.colors[i]
	            });
	            chooser.append(cell);
	            if (options.onCellEnter || options.livePreview) {
	              cell.bind('mouseenter', function(event) {
	                if (options.onCellEnter) {
	                  options.onCellEnter(this.id, element);
	                }
	                if (options.livePreview) {
	                  displayBox.css('background-color', '#' + this.id);
	                  if (options.displayColorCode) {
	                    displayBox.text('#' + this.id);
	                  }
	                }
	              });
	            }
	            cell.bind('click', {
	              input: event.data.input,
	              chooser: chooser,
	              displayBox: displayBox
	            },
	            function(event) {
	              var color = '#' + this.id
	              event.data.input.value = color;
	              $(event.data.input).change();
	              $(event.data.displayBox).data('color', color);
	              event.data.displayBox.css('background-color', color);
	              event.data.chooser.hide();

	              // If 'displayColorCode' is turned on, display the currently selected color code as text inside the button.
	              if (options.displayColorCode) {
	                event.data.displayBox.text(color);
	              }

	              // If an onSelect callback function is defined then excecute it.
	              if (options.onSelect) {
	                options.onSelect(this.id, element);
	              }
	            });
	          }
	        }
	      };

	      // Also bind the display box button to display the chooser.
	      var callbackParams = {
	        input:      this,
	        container:  container,
	        displayBox: displayBox
	      };
	      displayBox.bind('click', callbackParams, selectCallback);

	      $(this).after(container);
	      $(this).data('container', container);
	    };

	    this.each(buildChooser);

	    $('.simpleColorDisplay').each(function() {
	      $(this).click(function(e){
	        e.stopPropagation();
	      });
	    });

	    return this;
	  };

	  /*
	   * Close the given color choosers.
	   */
	  $.fn.closeChooser = function() {
	    this.each( function(index) {
	      $(this).data('container').find('.simpleColorChooser').hide();
	    });

	    return this;
	  };

	  /*
	   * Set the color of the given color choosers.
	   */
	  $.fn.setColor = function(color) {
	    this.each( function(index) {
	      var displayBox = $(this).data('container').find('.simpleColorDisplay');
	      displayBox.css('background-color', color).data('color', color);
	      if (displayBox.data('displayColorCode') === true) {
	        displayBox.text(color);
	      }
	    });

	    return this;
	  };

	})(jQuery);


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//
	// require("script!kodama");
	var d3 = __webpack_require__(9);
	__webpack_require__(27);
	var utils = __webpack_require__(13);
	var global = __webpack_require__(10);
	__webpack_require__(30);

	// ---MODULE VARIABLES---//
	var linesLayer;
	var linesLayerCheckbox;

	var lineDefaultColorIndex = 12;
	var lineStartColor = global.pairedSimpleColors[0];
	var lineEndColor = global.pairedSimpleColors[global.pairedSimpleColors.length - 1];
	var lineWidth = 2;
	var min_line_width = 0.5;
	var max_line_width = 5;

	var lineOpacity = 1.0;
	var min_line_opacity = 0.1;
	var max_line_opacity = 1;

	var lineCurvature = 0.1;
	var min_line_curvature = 0.0;
	var max_line_curvature = 0.3;//1.0;

	// ---MODULE EXPORTS---//

	var exports = module.exports = {};

	exports.generateLinesLayer = function(branches, nodes, locations, branchAttributes) {

	    linesLayer = global.g.append("g").attr("class", "linesLayer");

	    var lines = linesLayer.selectAll("path").data(branches).enter().append(
	        "path") //
	      .attr("class", "line") //
	      .attr(
	        "d",
	        function(d, i) {

	          var line = d;

	          var startCoordinate = line['startCoordinate'];
	          if (typeof startCoordinate == 'undefined') {

	            var startPointId = line.startPointId;
	            var startPoint = utils.getObject(nodes, "id", startPointId);

	            var startLocationId = startPoint.locationId;
	            if (typeof startLocationId != 'undefined') {

	              // discrete
	              var startLocation = utils.getObject(locations, "id", startLocationId);
	              startCoordinate = startLocation.coordinate;
	              line['startCoordinate'] = startCoordinate;

	            } else {
	              // continuous
	              startCoordinate = startPoint.coordinate;
	              line['startCoordinate'] = startCoordinate;

	            }

	          } //END: start coord check

	          var endCoordinate = line['endCoordinate'];
	          if (typeof endCoordinate == 'undefined') {

	            var endPointId = line.endPointId;
	            var endPoint = utils.getObject(nodes, "id", endPointId);

	            var endLocationId = endPoint.locationId;
	            if (typeof endLocationId != 'undefined') {

	              // discrete
	              var endLocation = utils.getObject(locations, "id", endLocationId);
	              endCoordinate = endLocation.coordinate;
	              line['endCoordinate'] = endCoordinate;

	            } else {
	              // continuous
	              endCoordinate = endPoint.coordinate;
	              line['endCoordinate'] = endCoordinate;

	            }

	          } //END: end coord check

	          var startY = startCoordinate.yCoordinate;
	          var startX = startCoordinate.xCoordinate;

	          var endY = endCoordinate.yCoordinate;
	          var endX = endCoordinate.xCoordinate;

	          var sourceXY = global.projection([startX, // long
	            startY // lat
	          ]);

	          var targetXY = global.projection([endX, // long
	            endY // lat
	          ]);

	          var sourceX = sourceXY[0]; // long
	          var sourceY = sourceXY[1]; // lat

	          var targetX = targetXY[0]; // long
	          var targetY = targetXY[1]; // lat

	          // store for referencing in curvature listener
	          line['targetX'] = targetX;
	          line['targetY'] = targetY;
	          line['sourceX'] = sourceX;
	          line['sourceY'] = sourceY;

	          var dx = targetX - sourceX;
	          var dy = targetY - sourceY;

	          var dr = Math.sqrt(dx * dx + dy * dy) * Math.log(lineCurvature);

	          var bearing = "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;

	          return (bearing);
	        }) //
	      .attr("fill", "none") //
	      .attr("stroke-width", lineWidth + "px") //
	      .attr("stroke-linejoin", "round") //
	      .attr("stroke", global.fixedColors[lineDefaultColorIndex]) //
	      .attr("startTime", function(d) {
	        return (d.startTime);
	      }) //
	      .attr("endTime", function(d) {
	        return (d.endTime);
	      }) //
	      .attr("stroke-dasharray", function(d) {

	        var totalLength = d3.select(this).node().getTotalLength();
	        return (totalLength + " " + totalLength);
	      }) //
	      .attr("stroke-dashoffset", 0) //
	      .attr("opacity", lineOpacity);

	    // dump attribute values into DOM
	    lines[0].forEach(function(d, i) {

	      var thisLine = d3.select(d);
	      var properties = branches[i].attributes;

	      for (var property in properties) {
	        if (properties.hasOwnProperty(property)) {

	          thisLine.attr(property, properties[property]);

	        }
	      } // END: properties loop
	    });

	  } // END: generateLinesLayer

	exports.setupPanels = function(attributes) {

	    setupLinesLayerCheckbox();
	    setupLineFixedColorPanel();
	    setupLineColorAttributePanel(attributes);
	    setupLineFixedOpacityPanel();
	    setupLineFixedCurvaturePanel();
	    setupLineFixedWidthPanel();
	    setupLineCutoffPanel(attributes);

	  } // END: setupPanels

	function setupLinesLayerCheckbox() {

	  $('#layerVisibility')
	    .append(
	      "<input type=\"checkbox\" id=\"linesLayerCheckbox\"> Lines layer<br>");

	  linesLayerCheckbox = document.getElementById("linesLayerCheckbox");
	  // default state is checked
	  linesLayerCheckbox.checked = true;

	  d3.select(linesLayerCheckbox).on("change", function() {

	    if (this.checked) {
	      // remove style, then visibility is driven by the time-based
	      // selections
	      linesLayer.selectAll("path").style("visibility", null);
	    } else {
	      // style is superior to attribute, make them hidden
	      linesLayer.selectAll("path").style("visibility", "hidden");
	    }

	  });

	} // END: setupLinesVisibility

	function setupLineFixedColorPanel() {

	  var str =
	    ("				<div class=\"panelcollapsed\">") +
	    ("					<h2>Lines fixed color<\/h2>") +
	    ("					<div class=\"panelcontent\">") +
	    ("						<select id=\"lineFixedColor\">") +
	    ("						<\/select>") +
	    ("						<div id=\"lineFixedColorLegend\"><\/div>") +
	    ("					<\/div>") +
	    ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  var lineFixedColorSelect = document.getElementById("lineFixedColor");
	  var scale = utils.alternatingColorScale().domain(global.fixedColors).range(
	    global.fixedColors);

	  for (var i = 0; i < global.fixedColors.length; i++) {

	    var option = global.fixedColors[i];
	    var element = document.createElement("option");
	    element.textContent = option;
	    element.value = option;

	    lineFixedColorSelect.appendChild(element);

	  } // END: i loop

	  // select the default
	  lineFixedColorSelect.selectedIndex = lineDefaultColorIndex;

	  // line fixed color listener
	  d3
	    .select(lineFixedColorSelect)
	    .on(
	      'change',
	      function() {

	        var colorSelect = lineFixedColorSelect.options[lineFixedColorSelect.selectedIndex].text;
	        var color = scale(colorSelect);

	        linesLayer.selectAll(".line") //
	          .transition() //
	          .ease("linear") //
	          .attr("stroke", color);

	        // setup legend
	        updateLineFixedColorLegend(scale);

	      });

	} // END: setupLineFixedColorPanel

	updateLineFixedColorLegend = function(scale) {

	    var width = 150;
	    var height = 230;

	    var margin = {
	      left: 20,
	      top: 20
	    };

	    $('#lineFixedColorLegend').html('');
	    var svg = d3.select("#lineFixedColorLegend").append('svg').attr("width",
	      width).attr("height", height);

	    var lineFixedColorLegend = d3.legend.color().scale(scale).shape('line')
	      .shapeWidth(20).shapePadding(15).cells(5).orient('vertical')

	    svg.append("g").attr("class", "lineFixedColorLegend").attr("transform",
	      "translate(" + (margin.left) + "," + (margin.top) + ")").call(
	      lineFixedColorLegend);

	  } // END: updateLineFixedColorLegend

	function setupLineColorAttributePanel(attributes) {

	  var str = ("				<div class=\"panelcollapsed\">") +
	    ("					<h2>Lines color attribute<\/h2>") +
	    ("					<div class=\"panelcontent\">") +
	    ("						<div id=\"lineStartColor\">") +
	    ("						<\/div>") +
	    ("						<div id=\"lineEndColor\">") +
	    ("						<\/div>") +
	    ("						<h4>Attribute<\/h4>") +
	    ("						<select id=\"lineColorAttribute\">") +
	    ("						<\/select>") +
	    ("						<div id=\"lineColorLegend\"><\/div>") +
	    ("					<\/div>") +
	    ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  var lineColorAttributeSelect = document
	    .getElementById("lineColorAttribute");

	  for (var i = 0; i < attributes.length; i++) {

	    var option = attributes[i].id;
	    var element = document.createElement("option");
	    element.textContent = option;
	    element.value = option;

	    lineColorAttributeSelect.appendChild(element);
	  } // END: i loop

	  // line color attribute listener
	  d3
	    .select(lineColorAttributeSelect)
	    .on(
	      'change',
	      function() {

	        var colorAttribute = lineColorAttributeSelect.options[lineColorAttributeSelect.selectedIndex].text;
	        var attribute = utils.getObject(attributes, "id",
	          colorAttribute);

	        var data;
	        var scale;

	        $('#lineStartColor').html('');
	        $('#lineEndColor').html('');

	        if (attribute.scale == global.ORDINAL) {

	          data = attribute.domain;
	          scale = d3.scale.ordinal().range(
	            global.ordinalColors).domain(data);

	          updateLineColorLegend(scale);

	        } else if (attribute.scale == global.LINEAR) {

	          data = attribute.range;
	          scale = d3.scale.linear().domain(data).range(
	            [lineStartColor, lineEndColor]);

	          updateLineColorLegend(scale);

	          // start color
	          $('#lineStartColor').html("<h4>Start color<\/h4>");
	          $('#lineStartColor').append(
	            "<input class=\"lineStartColor\" \/>");

	          $('.lineStartColor')
	            .simpleColor({
	              cellWidth: 13,
	              cellHeight: 13,
	              columns: 4,
	              displayColorCode: true,
	              colors: utils
	                .getSimpleColors(global.pairedSimpleColors),

	              onSelect: function(hex,
	                  element) {

	                  lineStartColor = "#" + hex;
	                  scale.range([
	                    lineStartColor,
	                    lineEndColor
	                  ]);

	                  updateLineColorLegend(scale);

	                  // trigger repaint
	                  updateLineColors(scale,
	                    colorAttribute);

	                } // END: onSelect
	            });

	          $('.lineStartColor').setColor(lineStartColor);

	          // end color
	          $('#lineEndColor').html("<h4>End color<\/h4>");
	          $('#lineEndColor').append(
	            "<input class=\"lineEndColor\" \/>");

	          $('.lineEndColor')
	            .simpleColor({
	              cellWidth: 13,
	              cellHeight: 13,
	              columns: 4,
	              colors: utils
	                .getSimpleColors(global.pairedSimpleColors),
	              displayColorCode: true,
	              onSelect: function(hex,
	                  element) {

	                  lineEndColor = "#" + hex;
	                  scale.range([
	                    lineStartColor,
	                    lineEndColor
	                  ]);

	                  updateLineColorLegend(scale);

	                  // trigger repaint
	                  updateLineColors(scale,
	                    colorAttribute);
	                } // END: onSelect
	            });

	          $('.lineEndColor').setColor(lineEndColor);

	        } else {
	          console
	            .log("Error occured when resolving scale type!");
	        }

	        // trigger repaint
	        updateLineColors(scale, colorAttribute);
	      });

	} // END: setupLineColorAttributePanel

	function updateLineColorLegend(scale) {

	  var width = 150;
	  var height = 230;

	  var margin = {
	    left: 20,
	    top: 20
	  };

	  $('#lineColorLegend').html('');
	  var svg = d3.select("#lineColorLegend").append('svg').attr("width", width)
	    .attr("height", height);

	  var lineColorLegend = d3.legend.color().scale(scale).shape('line')
	    .shapeWidth(20).shapePadding(15).cells(5).orient('vertical');

	  svg.append("g").attr("class", "lineColorLegend").attr("transform",
	    "translate(" + (margin.left) + "," + (margin.top) + ")").call(
	    lineColorLegend);

	} // END:updateLineColorLegend

	function updateLineColors(scale, colorAttribute) {

	  linesLayer.selectAll(".line") //
	    .transition() //
	    .ease("linear") //
	    .attr("stroke", function() {

	      var line = d3.select(this);
	      var attributeValue = line.attr(colorAttribute);
	      var color = scale(attributeValue);

	      if (attributeValue == null) {
	        console.log("null attribute value found for line color attribute");
	        color = "#000";
	      }

	      return (color);
	    });

	} // END: updateLineColors

	function setupLineFixedOpacityPanel() {

	  var str = ("                <div class=\"panelcollapsed\">") +
	    ("                    <h2>Lines opacity<\/h2>") +
	    ("                    <div class=\"panelcontent\">") +
	    ("                            <div id=\"lineFixedOpacitySlider\"><\/div>") +
	    ("                    <\/div>") +
	    ("                <\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  $('#lineFixedOpacitySlider').html('<input type="range" class="lineFixedOpacitySlider" step="0.1" min="' + min_line_opacity + '" max="' + max_line_opacity + '" value="' + lineOpacity + '"  />');
	  $('#lineFixedOpacitySlider').append('<span>' + lineOpacity + '</span>');

	  $('.lineFixedOpacitySlider').on("input", function() {

	    lineOpacity = $(this).val();

	    $(this).next().html(lineOpacity);

	    // fill-opacity / stroke-opacity / opacity
	    linesLayer.selectAll(".line") //
	      .transition() //
	      .ease("linear") //
	      .attr("opacity", lineOpacity);

	  });

	} // END: setupLineFixedOpacityPanel

	function setupLineFixedCurvaturePanel() {

	  var str = (" <div class=\"panelcollapsed\">") +
	    (" <h2>Lines curvature<\/h2>") +
	    (" <div class=\"panelcontent\">") +
	    (" <div id=\"lineFixedCurvatureSlider\"><\/div>") +
	    (" <\/div>") +
	    (" <\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  $('#lineFixedCurvatureSlider').html('<input type="range" class="lineFixedCurvatureSlider" step="0.1" min="' + min_line_curvature + '" max="' + max_line_curvature + '" value="' + lineCurvature + '"  />');
	  // $('#lineFixedCurvatureSlider').append('<span>' + lineCurvature + '</span>');

	  $('.lineFixedCurvatureSlider').on("input", function() {

	    value = $(this).val();

	    //  $(this).next().html(value);

	    if (value == 0) {
	      lineCurvature = 0;
	    } else if (value == 1) {
	      lineCurvature = 0.1;
	    } else {
	      lineCurvature = (1 - value);
	    }

	    linesLayer.selectAll(".line").transition().ease("linear") //
	      .attr(
	        "d",
	        function(d) {

	          var line = d;

	          // console.log(Date.parse(line.startTime));
	          // var curvature = lineCurvature;

	          var targetX = line.targetX;
	          var targetY = line.targetY;
	          var sourceX = line.sourceX;
	          var sourceY = line.sourceY;

	          var dx = targetX - sourceX;
	          var dy = targetY - sourceY;
	          var dr = Math.sqrt(dx * dx + dy * dy) * lineCurvature;

	          var bearing = "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;

	          return (bearing);

	        }) //
	      .attr("stroke-dasharray", function(d) {

	        var totalLength = d3.select(this).node().getTotalLength();
	        return (totalLength + " " + totalLength);

	      });

	  });

	} // END: setupLineFixedCurvaturePanel

	function setupLineFixedWidthPanel() {

	  var str = ("				<div class=\"panelcollapsed\">") +
	    ("					<h2>Lines width<\/h2>") +
	    ("					<div class=\"panelcontent\">") +
	    ("							<div id=\"lineFixedWidthSlider\"><\/div>") +
	    ("					<\/div>") +
	    ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  $('#lineFixedWidthSlider').html('<input type="range" class="lineFixedWidthSlider" step="0.5" min="' + min_line_width + '" max="' + max_line_width + '" value="' + lineWidth + '"  />');
	  $('#lineFixedWidthSlider').append('<span>' + lineWidth + '</span>');

	  $('.lineFixedWidthSlider').on("input", function() {

	    lineWidth = $(this).val();

	    $(this).next().html(lineWidth);

	    linesLayer.selectAll(".line").transition().ease("linear") //
	      .attr("stroke-width", lineWidth + "px");

	  });

	} // END: setupLineFixedWidthPanel

	function setupLineCutoffPanel(attributes) {

	  var str = ("				<div class=\"panelcollapsed\">") +
	    ("					<h2>Lines cut-off<\/h2>") +
	    ("					<div class=\"panelcontent\">") +
	    ("						<select id=\"lineCutoffAttribute\">") +
	    ("						<\/select>") +
	    ("						<\/br>") +
	    ("						<\/br>") +
	    ("						<\/br>") +
	    ("					<div class=\"wrapper\">") +
	    ("							<div id=\"lineCutoffSlider\"><\/div>") +
	    ("					<\/div>") +
	    ("					<\/div>") +
	    ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  var lineCutoffAttributeSelect = document
	    .getElementById("lineCutoffAttribute");

	  for (var i = 0; i < attributes.length; i++) {

	    // TODO: discrete attributes
	    if (attributes[i].scale == global.LINEAR) {
	      var option = attributes[i].id;
	      var element = document.createElement("option");
	      element.textContent = option;
	      element.value = option;
	      lineCutoffAttributeSelect.appendChild(element);
	    }

	  } // END: i loop

	  // listener
	  d3
	    .select(lineCutoffAttributeSelect)
	    .on(
	      'change',
	      function() {

	        // clean-up
	        $('#lineCutoffSlider').html('');
	        // linesLayer.selectAll("path").style("visibility",
	        // null);

	        var cutoffAttribute = lineCutoffAttributeSelect.options[lineCutoffAttributeSelect.selectedIndex].text;
	        var attribute = utils.getObject(attributes, "id",
	          cutoffAttribute);

	        // slider
	        // TODO: discrete too
	        if (attribute.scale == global.LINEAR) {

	          var minValue = Math
	            .floor(attribute.range[global.MIN_INDEX]);
	          var maxValue = Math
	            .ceil(attribute.range[global.MAX_INDEX]);
	          var step = (maxValue - minValue) / 10;

	          var lineCutoffSlider = d3.slider().axis(
	              d3.svg.axis().orient("top")).min(minValue)
	            .max(maxValue).step(step).value(minValue);

	          d3.select('#lineCutoffSlider').call(
	            lineCutoffSlider);

	          lineCutoffSlider
	            .on(
	              "slide",
	              function(evt, value) {

	                linesLayer
	                  .selectAll("path")
	                  .style(
	                    "visibility",
	                    function(d) {

	                      var sliderValue = value;

	                      var line = d3
	                        .select(this);
	                      var attributeValue = line
	                        .attr(attribute.id);

	                      var visibility = "visible";

	                      if (attributeValue < sliderValue || !linesLayerCheckbox.checked) {
	                        visibility = "hidden";
	                      }

	                      return (visibility);
	                    });

	              });

	        } // END: scale check

	      } // END: function
	    );

	} // END: setupLineCutoffPanel

	exports.updateLinesLayer = function(value) {

	    // ---select lines painting now---//

	    linesLayer.selectAll("path.line")
	      //
	      .filter(
	        function(d) {

	          var linePath = this;
	          var lineStartDate = utils.formDate(
	            linePath.attributes.startTime.value).getTime();
	          var lineEndDate = utils.formDate(
	            linePath.attributes.endTime.value).getTime();

	          return (lineStartDate <= value && value <= lineEndDate);
	        })
	      //
	      .transition()
	      //
	      .ease("linear")
	      //
	      .attr(
	        "stroke-dashoffset",
	        function(d, i) {

	          var linePath = this;
	          var totalLength = linePath.getTotalLength();

	          var lineStartDate = utils.formDate(
	            linePath.attributes.startTime.value).getTime();
	          var lineEndDate = utils.formDate(
	            linePath.attributes.endTime.value).getTime();
	          var duration = lineEndDate - lineStartDate;
	          var timePassed = value - lineStartDate;

	          var offset = totalLength;
	          if (duration == 0) {

	            offset = 0;

	          } else {

	            offset = utils.map(timePassed, 0, duration, 0,
	              totalLength);

	            offset = totalLength - offset;

	          } // END: instantaneous line check

	          return (offset);
	        }) //
	      .attr("visibility", "visible");

	    // ---select lines yet to be painted---//

	    linesLayer.selectAll("path.line") //
	      .filter(
	        function(d) {
	          var linePath = this;
	          var lineStartDate = utils.formDate(
	            linePath.attributes.startTime.value).getTime();

	          return (lineStartDate > value);
	        }) //
	      .attr("stroke-dashoffset", function(d, i) {
	        var linePath = this;
	        var totalLength = linePath.getTotalLength();

	        return (totalLength);
	      }) //
	      .attr("visibility", "hidden");

	    // ---select lines already painted---//

	    linesLayer.selectAll("path.line") //
	      .filter(
	        function(d) {
	          var linePath = this;
	          var lineEndDate = utils.formDate(
	            linePath.attributes.endTime.value).getTime();

	          return (lineEndDate < value);
	        }) //
	      .attr("stroke-dashoffset", 0) //
	      .attr("visibility", "visible");

	  } // END: updateLinesLayer

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//
	var d3 = __webpack_require__(9);
	__webpack_require__(27);

	var utils = __webpack_require__(13);
	var global = __webpack_require__(10);

	__webpack_require__(30);

	// ---MODULE VARIABLES---//

	var areasLayer;

	var areaDefaultColorIndex = 1;
	var areaStartColor = global.pairedSimpleColors[0];
	var areaEndColor = global.pairedSimpleColors[global.pairedSimpleColors.length - 1];
	var polygonOpacity = 0.3;
	var min_polygon_opacity = 0.1;
	var max_polygon_opacity = 1;

	// ---MODULE EXPORTS---//

	var exports = module.exports = {};

	exports.generateAreasLayer = function(areas_, areaAttributes) {

		areasLayer = global.g.append("g").attr("class", "areasLayer");

		var areas = areasLayer.selectAll("area").data(areas_).enter().append(
				"polygon") //
		.attr("class", "area") //
		.attr("startTime", function(d) {

			return (d.startTime);

		}) //
		.attr("points", function(d) {

			var polygon = d.polygon;
			return polygon.coordinates.map(function(d) {

				xy = global.projection([ d.xCoordinate, // long
				d.yCoordinate // lat
				]);

				return [ xy[0], // long
				xy[1] // lat
				].join(",");

			}).join(" ");
		}) //
		.attr("fill", global.fixedColors[areaDefaultColorIndex]) //
		.attr("fill-opacity", polygonOpacity) //
		.attr("visibility", "visible") //
		.on('mouseover', function(d) {

			var area = d3.select(this);
			area.attr('stroke', '#000').attr("stroke-width", "0.5px") //

		}) //
		.on('mouseout', function(d, i) {

			var area = d3.select(this);
			area.attr('stroke', null).attr("stroke-width", null) //
		});

		// dump attribute values into DOM
		areas[0].forEach(function(d, i) {

			var thisArea = d3.select(d);

			var properties = areas_[i].attributes;
			for ( var property in properties) {
				if (properties.hasOwnProperty(property)) {

					thisArea.attr(property, properties[property]);

				}
			}// END: properties loop
		});

	}// END: generateAreasLayer

	exports.updateAreasLayer = function(value) {

		// ---select areas yet to be displayed---//

		areasLayer.selectAll(".area") //
		.filter(
				function(d) {
					var polygon = this;
					var startDate = utils.formDate(
							polygon.attributes.startTime.value).getTime();

					return (value < startDate);
				}) //
		.transition() //
		.ease("linear") //
		.attr("visibility", "hidden");

		// ---select polygons displayed now---//

		areasLayer.selectAll(".area") //
		.filter(
				function(d) {
					var polygon = this;
					var startDate = utils.formDate(
							polygon.attributes.startTime.value).getTime();

					return (value >= startDate);
				}) //
		.transition() //
		.ease("linear") //
		.attr("visibility", "visible");

	}// END: updateAreasLayer

	exports.setupPanels = function(attributes) {

		setupAreasLayerCheckbox();
		setupAreaFixedColorPanel();
		setupAreaColorAttributePanel(attributes);
		setupAreaFixedOpacityPanel();
	  setupAreaOpacityAttributePanel(attributes);

	}// END: setupPanels

	setupAreaOpacityAttributePanel = function(attributes) {

	// TODO : two sliders
	var str = ("				<div class=\"panelcollapsed\">")+
	("					<h2>Polygons opacity attribute<\/h2>")+
	("					<div class=\"panelcontent\">")+
	("						<div id='areaStartOpacitySlider'>")+
	("						<\/div>")+
	("						<div id='areaEndOpacitySlider'>")+
	("						<\/div>")+
	("						<h4>Attribute<\/h4>")+
	("						<select id=\"areaOpacityAttribute\">")+
	("						<\/select>")+
	// ("						<div id=\"areaColorLegend\" ><\/div>")+
	("					<\/div>")+
	("				<\/div>");

	var html = $.parseHTML(str);

	$(".selectors").append(html);

	// attribute
	var areaOpacityAttributeSelect = document
			.getElementById("areaOpacityAttribute");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		// skip points with count attribute
		if (option == global.COUNT) {
			continue;
		}

		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		areaOpacityAttributeSelect.appendChild(element);

	}// END: i loop

	// area opacity attribute listener
	d3
			.select(areaOpacityAttribute)
			.on(
					'change',
					function() {

						var opacityAttribute = areaOpacityAttributeSelect.options[areaOpacityAttributeSelect.selectedIndex].text;
						var attribute = utils.getObject(attributes, "id",
								opacityAttribute);

						var data;
						var scale;

						// $('#areaStartOpacitySlider').html('');
						// $('#areaEndOpacitySlider').html('');

						if (attribute.scale == global.ORDINAL) {

							data = attribute.domain;
							scale = d3.scale.ordinal().range(
									global.ordinalColors).domain(data);

							// updatePolygonOpacityLegend(scale);

						} else if (attribute.scale == global.LINEAR) {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									// [ min_polygon_opacity, max_polygon_opacity ]
	                   [0.1, 0.2]
								);

		// updatePolygonOpacityLegend(scale);

		// $('#areaStartOpacitySlider').html('<input type="range" class="areaFixedOpacitySlider" step="0.1" min="' + min_polygon_opacity + '" max="' + max_polygon_opacity + '" value="'+polygonOpacity+'"  />');
		// $('#areaStartOpacitySlider').append('<span>' + min_polygon_opacity + '</span>');

						} else {

							console
									.log("Error occured when resolving scale type!");
						}

						// trigger repaint
						updatePolygonOpacity(scale, opacityAttribute);

						// tooltipAttributes['color'] = colorAttribute;
						// updateTooltips();

	} );



	}//END: setupAreaOpacityAttributePanel

	updatePolygonOpacity = function(scale, opacityAttribute) {

	// TODO

		areasLayer.selectAll(".area").transition() //
		.ease("linear") //
		.attr("fill-opacity", function() {

			var polygon = d3.select(this);
			var attributeValue = polygon.attr(opacityAttribute);
			var opacity = scale(attributeValue);

			if (attributeValue == null) {
				console.log("null found");
				opacity = 0.0;
			}

			return (opacity);
		});

	}// END: updatePolygonOpacity

	setupAreaFixedOpacityPanel = function() {

	  var str = ("				<div class=\"panelcollapsed\">")+
	   ("					<h2>Polygons opacity<\/h2>")+
	   ("					<div class=\"panelcontent\">")+
	   ("							<div id=\"areaFixedOpacitySlider\"><\/div>")+
	 ("					<\/div>")+
	   ("				<\/div>");

		 var html = $.parseHTML(str);

		 $(".selectors").append(html);

		$('#areaFixedOpacitySlider').html('<input type="range" class="areaFixedOpacitySlider" step="0.1" min="' + min_polygon_opacity + '" max="' + max_polygon_opacity + '" value="'+polygonOpacity+'"  />');
		$('#areaFixedOpacitySlider').append('<span>' + polygonOpacity + '</span>');

		$('.areaFixedOpacitySlider').on("input", function() {

		polygonOpacity = $(this).val();

		 $(this).next().html(polygonOpacity);

		// fill-opacity / stroke-opacity / opacity
		areasLayer.selectAll(".area") //
		.transition() //
		.ease("linear") //
		.attr("fill-opacity", polygonOpacity);

			});

	}//END: setupAreaFixedOpacityPanel

	setupAreaColorAttributePanel = function(attributes) {

	  var str = ("				<div class=\"panelcollapsed\">")+
	  ("					<h2>Polygons color attribute<\/h2>")+
	  ("					<div class=\"panelcontent\">")+
	  ("						<div id='areaStartColor'>")+
	  ("						<\/div>")+
	  ("						<div id='areaEndColor'>")+
	  ("						<\/div>")+
	  ("						<h4>Attribute<\/h4>")+
	  ("						<select id=\"areaColorAttribute\">")+
	  ("						<\/select>")+
	  ("						<div id=\"areaColorLegend\" ><\/div>")+
	  ("					<\/div>")+
	  ("				<\/div>");

		var html = $.parseHTML(str);

		$(".selectors").append(html);

		// attribute
		var areaColorAttributeSelect = document
				.getElementById("areaColorAttribute");

		for (var i = 0; i < attributes.length; i++) {

			var option = attributes[i].id;
			// skip points with count attribute
			if (option == global.COUNT) {
				continue;
			}

			var element = document.createElement("option");
			element.textContent = option;
			element.value = option;

			areaColorAttributeSelect.appendChild(element);

		}// END: i loop

		// area color listener
		d3
				.select(areaColorAttributeSelect)
				.on(
						'change',
						function() {

							var colorAttribute = areaColorAttributeSelect.options[areaColorAttributeSelect.selectedIndex].text;

							var attribute = utils.getObject(attributes, "id",
									colorAttribute);

							var data;
							var scale;

							$('#areaStartColor').html('');
							$('#areaEndColor').html('');

							if (attribute.scale == global.ORDINAL) {

								data = attribute.domain;
								scale = d3.scale.ordinal().range(
										global.ordinalColors).domain(data);

								updateAreaColorLegend(scale);

							} else if (attribute.scale == global.LINEAR) {

								data = attribute.range;
								scale = d3.scale.linear().domain(data).range(
										[ areaStartColor, areaEndColor ]);

								updateAreaColorLegend(scale);

								// start color
								$('#areaStartColor').html("<h4>Start color<\/h4>");
								$('#areaStartColor').append(
										"<input class=\"areaStartColor\" \/>");

								$('.areaStartColor')
										.simpleColor(
												{
													cellWidth : 13,
													cellHeight : 13,
													columns : 4,
													displayColorCode : true,
													colors : utils
															.getSimpleColors(global.pairedSimpleColors),

													onSelect : function(hex,
															element) {

														areaStartColor = "#" + hex;

														scale.range([
																areaStartColor,
																areaEndColor ]);

														updateAreaColorLegend(scale);

														// trigger repaint
														updateAreaColors(scale,
																colorAttribute);

													}// END: onSelect
												});

								$('.areaStartColor').setColor(areaStartColor);

								// end color
								$('#areaEndColor').html("<h4>End color<\/h4>");
								$('#areaEndColor').append(
										"<input class=\"areaEndColor\" \/>");

								$('.areaEndColor')
										.simpleColor(
												{
													cellWidth : 13,
													cellHeight : 13,
													columns : 4,
													colors : utils
															.getSimpleColors(global.pairedSimpleColors),
													displayColorCode : true,
													onSelect : function(hex,
															element) {

														areaEndColor = "#" + hex;

														scale.range([
																areaStartColor,
																areaEndColor ]);

														updateAreaColorLegend(scale);

														// trigger repaint
														updateAreaColors(scale,
																colorAttribute);
													}
												});

								$('.areaEndColor').setColor(areaEndColor);

							} else {

								console
										.log("Error occured when resolving scale type!");

							}// END: range/domain check

							// trigger repaint
							updateAreaColors(scale, colorAttribute);

						});

	}// END: setupAreaColorAttributePanel

	updateAreaColorLegend = function(scale) {

		var width = 150;
		var height = 110;

		var margin = {
			left : 20,
			top : 20
		};

		$('#areaColorLegend').html('');
		var svg = d3.select("#areaColorLegend").append('svg').attr("width", width)
				.attr("height", height);

		// polygonal shape
		var stringShape = "M1,2 8,2 10,9 3,11z";

		var areaColorLegend = d3.legend.color().scale(scale)//
		.shape("path", stringShape).shapeRadius(5).shapePadding(10).cells(5)
				.orient('vertical');

		svg.append("g").attr("class", "areaColorLegend").attr("transform",
				"translate(" + (margin.left) + "," + (margin.top) + ")").call(
				areaColorLegend);

	}// END: updateAreaColorLegend

	updateAreaColors = function(scale, colorAttribute) {

		console.log(scale.range());
		console.log(scale.domain());
		console.log("ca: " + colorAttribute);

		areasLayer.selectAll(".area").transition() //
		.ease("linear") //
		.attr("fill", function() {

			var area = d3.select(this);
			var attributeValue = area.attr(colorAttribute);

			// console.log(attributeValue);

			var color = scale(attributeValue);

			if (attributeValue == null) {
				console.log("null found");
				color = "#000";
			}

			return (color);
		});

	}// END: updateAreaColors

	setupAreaFixedColorPanel = function() {

	  var str = ("				<div class=\"panelcollapsed\">") +
	  ("					<h2>Polygons fixed color<\/h2>") +
	  ("					<div class=\"panelcontent\">") +
	  ("						<select id=\"areaFixedColor\">") +
	  ("						<\/select>") +
	  ("						<div id=\"areaFixedColorLegend\"><\/div>") +
	  ("					<\/div>") +
	  ("				<\/div>");

		var html = $.parseHTML(str);

		$(".selectors").append(html);

		var areaFixedColorSelect = document.getElementById("areaFixedColor");
		var scale = utils.alternatingColorScale().domain(global.fixedColors).range(
				global.fixedColors);

		for (var i = 0; i < global.fixedColors.length; i++) {

			var option = global.fixedColors[i];
			var element = document.createElement("option");
			element.textContent = option;
			element.value = option;

			areaFixedColorSelect.appendChild(element);

		}// END: i loop

		// select the default
		areaFixedColorSelect.selectedIndex = areaDefaultColorIndex;

		// area fixed color listener
		d3
				.select(areaFixedColorSelect)
				.on(
						'change',
						function() {

							var colorSelect = areaFixedColorSelect.options[areaFixedColorSelect.selectedIndex].text;
							var color = scale(colorSelect);

							areasLayer.selectAll(".area") //
							.transition() //
							.ease("linear") //
							.attr("fill", color);

							// setup legend
							updateAreaFixedColorLegend(scale);

						});

	}// END: setupAreaFixedColorPanel

	updateAreaFixedColorLegend = function(scale) {

		var width = 150;
		var height = 265;

		var margin = {
			left : 20,
			top : 20
		};

		$('#areaFixedColorLegend').html('');
		var svg = d3.select("#areaFixedColorLegend").append('svg').attr("width",
				width).attr("height", height);

		// polygonal shape
		var stringShape = "M1,2 8,2 10,9 3,11z";

		var areaFixedColorLegend = d3.legend.color().scale(scale)//
		.shape("path", stringShape).shapeRadius(5).shapePadding(10).cells(5)
				.orient('vertical');

		svg.append("g").attr("class", "areaFixedColorLegend").attr("transform",
				"translate(" + (margin.left) + "," + (margin.top) + ")").call(
				areaFixedColorLegend);

	}// END: updateAreaFixedColorLegend

	setupAreasLayerCheckbox = function() {

		$('#layerVisibility')
				.append(
						"<input type=\"checkbox\" id=\"areasLayerCheckbox\"> Polygons layer<br>");

		var areasLayerCheckbox = document.getElementById("areasLayerCheckbox");
		// default state is checked
		areasLayerCheckbox.checked = true;

		d3.select(areasLayerCheckbox).on("change", function() {

			if (this.checked) {
				// remove style, then visibility is driven by the time-based
				// selections
				areasLayer.selectAll(".area").style("visibility", null);
			} else {
				// style is superior to attribute, make them hidden
				areasLayer.selectAll(".area").style("visibility", "hidden");
			}

		});

	}// END: setupAreasLayerCheckbox

	// ---MODULE PRIVATE FUNCTIONS---//

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//
	__webpack_require__(25);
	var d3 = __webpack_require__(9);
	__webpack_require__(27);
	var utils = __webpack_require__(13);
	var global = __webpack_require__(10);
	// require("imports?$=jquery!./jquery.simple-color.js");

	// ---MODULE VARIABLES---//

	var countsLayer;
	var countDefaultColorIndex = 1;
	var countOpacity = 0.3;
	var min_count_opacity = 0.1;
	var max_count_opacity = 1;

	d3.kodama
	  .themeRegistry(
	    'countsTheme', {
	      frame: {
	        padding: '4px',
	        background: 'linear-gradient(to top, rgb(177, 68, 68) 0%, rgb(188, 95, 95) 90%)',
	        'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
	        'border': '1px solid rgb(57, 208, 204)',
	        color: 'rgb(245,240,220)',
	        'border-radius': '4px',
	        'font-size': '12px',
	        'box-shadow': '0px 1px 3px rgba(0,20,40,.5)'
	      },
	      title: {
	        'text-align': 'center',
	        'padding': '4px'
	      },
	      item_title: {
	        'text-align': 'right',
	        'color': 'rgb(220,200,120)'
	      },
	      item_value: {
	        'padding': '1px 2px 1px 10px',
	        'color': 'rgb(234, 224, 184)'
	      }
	    });

	// ---MODULE EXPORTS---//

	var exports = module.exports = {};

	exports.generateCountsLayer = function(counts_, locations, countAttribute) {

	    var min_area = 1000;
	    var max_area = 10000;
	    var scale = d3.scale.linear().domain(countAttribute.range).range(
	      [min_area, max_area]);

	    countsLayer = global.g.append("g").attr("class", "countsLayer");

	    var counts = countsLayer.selectAll("circle").data(counts_).enter() //
	      .append("circle") //
	      .attr("class", "count") //
	      .attr("startTime", function(d) {

	        return (d.startTime);

	      }) //
	      .attr("endTime", function(d) {

	        return (d.endTime);

	      }) //
	      .attr("cx", function(d) {

	        var count = d;

	        var countCoordinate = count['coordinate'];
	        if (typeof countCoordinate == 'undefined') {
	          // always discrete
	          var countLocationId = count.locationId;
	          var countLocation = utils.getObject(locations, "id", countLocationId);
	          countCoordinate = countLocation.coordinate;
	          count['coordinate'] = countCoordinate;
	        }

	        var xy = global.projection([countCoordinate.xCoordinate, // long
	          countCoordinate.yCoordinate // lat
	        ]);

	        var cx = xy[0]; // long

	        return (cx);
	      }) //
	      .attr("cy", function(d) {

	        var count = d;

	        var countCoordinate = count['coordinate'];
	        if (typeof countCoordinate == 'undefined') {
	          // always discrete
	          var countLocationId = count.locationId;
	          var countLocation = utils.getObject(locations, "id", countLocationId);
	          countCoordinate = countLocation.coordinate;
	          count['coordinate'] = countCoordinate;
	        }

	        var xy = global.projection([countCoordinate.xCoordinate, // long
	          countCoordinate.yCoordinate // lat
	        ]);

	        var cy = xy[1]; // lat

	        return (cy);
	      }) //
	      .attr("r", function(d) {

	        var count = d.attributes.count;
	        var area = scale(count);
	        var radius = Math.sqrt(area / Math.PI);

	        return (radius);

	      }) //
	      .attr("fill", global.fixedColors[countDefaultColorIndex]) //
	      .attr("stroke-width", "0.5px") //
	      .attr("fill-opacity", countOpacity) //
	      .attr("visibility", "visible") //
	      .on('mouseover', function(d) {

	        var point = d3.select(this);
	        point.attr('stroke', '#000');

	      }) //
	      .on('mouseout', function(d, i) {

	        var point = d3.select(this);
	        point.attr('stroke', null);

	      }) //
	      .call(d3.kodama.tooltip().format(function(d, i) {

	          return {
	            title: d.locationId,
	            items: [{
	              title: 'Date',
	              value: d.startTime
	            }, {
	              title: 'Count',
	              value: d.attributes.count
	            }]
	          };

	        }) //
	        .theme('countsTheme'));

	    // dump attribute values into DOM
	    counts[0].forEach(function(d, i) {

	      var thisArea = d3.select(d);

	      var properties = counts_[i].attributes;
	      for (var property in properties) {
	        if (properties.hasOwnProperty(property)) {

	          thisArea.attr(property, properties[property]);

	        }
	      } // END: properties loop
	    });

	  } // END: generateCountsLayer

	exports.updateCountsLayer = function(value) {

	    // ---select counts yet to be displayed or already displayed---//

	    countsLayer.selectAll(".count") //
	      .filter(
	        function(d) {
	          var point = this;
	          var startDate = utils
	            .formDate(point.attributes.startTime.value).getTime();
	          var endDate = utils.formDate(point.attributes.endTime.value)
	            .getTime();

	          return (value < startDate || value > endDate);
	        }) //
	      .transition() //
	      .ease("linear") //
	      .attr("visibility", "hidden");

	    // ---select counts displayed now---//

	    countsLayer.selectAll(".count") //
	      .filter(
	        function() {
	          var point = this;
	          var startDate = utils
	            .formDate(point.attributes.startTime.value).getTime();
	          var endDate = utils.formDate(point.attributes.endTime.value)
	            .getTime();

	          return (value > startDate && value < endDate);
	        }) //
	      .transition() //
	      .ease("linear") //
	      .attr("visibility", "visible");

	  } // END: updateCountsLayer

	exports.setupPanels = function(attributes) {

	    setupCountsLayerCheckbox();
	    setupCountsFixedColorPanel();
	    setupCountsFixedOpacityPanel();
	  } // END: setupPanels

	function setupCountsFixedOpacityPanel() {

	  var str = (" <div class=\"panelcollapsed\">") +
	    (" <h2>Counts opacity<\/h2>") +
	    (" <div class=\"panelcontent\">") +
	    (" <div id=\"countFixedOpacitySlider\"><\/div>") +
	    (" <\/div>") +
	    (" <\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  $('#countFixedOpacitySlider').html('<input type="range" class="countFixedOpacitySlider" step="0.1" min="' + min_count_opacity + '" max="' + max_count_opacity + '" value="' + countOpacity + '"  />');
	  $('#countFixedOpacitySlider').append('<span>' + countOpacity + '</span>');

	  $('.countFixedOpacitySlider').on("input", function() {

	    countOpacity = $(this).val();

	    $(this).next().html(countOpacity);

	    // fill-opacity / stroke-opacity / opacity
	    countsLayer.selectAll(".count") //
	      .transition() //
	      .ease("linear") //
	      .attr("fill-opacity", countOpacity);

	  });

	} // END: setupCountsFixedOpacityPanel

	function setupCountsFixedColorPanel() {

	  var str = (" <div class=\"panelcollapsed\">") +
	    (" <h2>Counts fixed color<\/h2>") +
	    (" <div class=\"panelcontent\">") +
	    (" <select id=\"countFixedColor\">") +
	    (" <\/select>") +
	    (" <div id=\"countFixedColorLegend\"><\/div>") +
	    (" <\/div>") +
	    (" <\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

	  var countFixedColorSelect = document.getElementById("countFixedColor");
	  var scale = utils.alternatingColorScale().domain(global.fixedColors).range(
	    global.fixedColors);

	  for (var i = 0; i < global.fixedColors.length; i++) {

	    var option = global.fixedColors[i];
	    var element = document.createElement("option");
	    element.textContent = option;
	    element.value = option;

	    countFixedColorSelect.appendChild(element);

	  } // END: i loop

	  // select the default
	  countFixedColorSelect.selectedIndex = countDefaultColorIndex;

	  // counts fixed color listener
	  d3
	    .select(countFixedColorSelect)
	    .on(
	      'change',
	      function() {

	        var colorSelect = countFixedColorSelect.options[countFixedColorSelect.selectedIndex].text;
	        var color = scale(colorSelect);

	        countsLayer.selectAll(".count") //
	          .transition() //
	          .ease("linear") //
	          .attr("fill", color);

	        // setup legend
	        updateCountFixedColorLegend(scale);

	      });

	} // END: setupCountsFixedColorPanel

	function updateCountFixedColorLegend(scale) {

	  var width = 150;
	  var height = 265;

	  var margin = {
	    left: 20,
	    top: 20
	  };

	  $('#countFixedColorLegend').html('');
	  var svg = d3.select("#countFixedColorLegend").append('svg').attr("width",
	    width).attr("height", height);

	  var countFixedColorLegend = d3.legend.color().scale(scale).shape('circle')
	    .shapeRadius(5).shapePadding(10).cells(5).orient('vertical')

	  svg.append("g").attr("class", "countFixedColorLegend").attr("transform",
	    "translate(" + (margin.left) + "," + (margin.top) + ")").call(
	    countFixedColorLegend);

	} // END:updateCountFixedColorLegend

	function setupCountsLayerCheckbox() {

	  $('#layerVisibility')
	    .append(
	      "<input type=\"checkbox\" id=\"countsLayerCheckbox\"> Counts layer<br>");

	  var countsLayerCheckbox = document.getElementById("countsLayerCheckbox");
	  // default state is checked
	  countsLayerCheckbox.checked = true;

	  d3.select(countsLayerCheckbox).on("change", function() {

	    if (this.checked) {
	      // remove style, then visibility is driven by the time-based
	      // selections
	      countsLayer.selectAll("circle").style("visibility", null);
	    } else {
	      // style is superior to attribute, make them hidden
	      countsLayer.selectAll("circle").style("visibility", "hidden");
	    }

	  });

	} // END:setupCountsLayerCheckbox

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//

	__webpack_require__(35);
	var d3 = __webpack_require__(9);
	__webpack_require__(27);
	__webpack_require__(30);
	var utils = __webpack_require__(13);
	var global = __webpack_require__(10);

	// ---MODULE VARIABLES---//

	var topoLayer;
	var equatorLayer ;

	var mapDefaultColorIndex = 6;
	var mapStartColor = global.pairedSimpleColors[0];
	var mapEndColor = global.pairedSimpleColors[global.pairedSimpleColors.length - 1];

	var mapFixedOpacity = 0.5;
	var min_map_opacity = 0.1;
	var max_map_opacity = 1;

	var backgroundColors =	[ "#ffffff", "#000000", "#ddd", "#8cc5ff" ];
	var backgrounDefaultColorIndex = 0; //0

	// ---MODULE EXPORTS---//

	var exports = module.exports = {};

	exports.generateTopoLayer = function(geojson) {

		// equatorLayer = g.append("g");
		topoLayer = global.g.append("g");

		var basicScale = (global.width / 2 / Math.PI);

		// first guess for the projection
		var center = d3.geo.centroid(geojson);

		var projectionScale = basicScale;
		var offset = [ global.width / 2, global.height / 2 ];

		global.projection = d3.geo.mercator().scale(projectionScale).center(center)
				.translate(offset);

		var path = d3.geo.path().projection(global.projection);

		// determine the bounds
		var bounds = path.bounds(geojson);
		var hscale = projectionScale * global.width / (bounds[1][0] - bounds[0][0]);
		var vscale = projectionScale * global.height
				/ (bounds[1][1] - bounds[0][1]);
		projectionScale = (hscale < vscale) ? hscale : vscale;
		var offset = [ global.width - (bounds[0][0] + bounds[1][0]) / 2,
				global.height - (bounds[0][1] + bounds[1][1]) / 2 ];

		// new projection
		global.projection = d3.geo.mercator().center(center).scale(projectionScale)
				.translate(offset);

		// if it failed stick to basics
		if (projectionScale < basicScale) {
			projectionScale = (global.width / 2 / Math.PI);
			var offset = [ (global.width / 2), (global.height / 2) ];

			global.projection = d3.geo.mercator() //
			.scale(projectionScale) //
			.translate(offset);
		}

		// new path
		path = path.projection(global.projection);

		// add graticule
		// svg.append("path").datum( d3.geo.graticule()).attr("class", "graticule").attr("d",
		// path);
		//
		// // apply inline style
		// svg.selectAll('.graticule').style({
		// 'stroke' : '#bbb',
		// 'fill' : 'none',
		// 'stroke-width' : '.5px',
		// 'stroke-opacity' : '.5'
		// });
		//
		// // add equator
		// equatorLayer.append("path").datum(
		// {
		// type : "LineString",
		// coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
		// [ 180, 0 ] ]
		// }).attr("class", "equator").attr("d", path);
		//
		// // apply inline style
		// equatorLayer.selectAll('.equator').style({
		// 'stroke' : '#ccc',
		// 'fill' : 'none',
		// 'stroke-width' : '1px',
		// });

		var features = geojson.features;
		var topo = topoLayer.selectAll("path").data(features).enter()
				.append("path") //
				.attr("class", "topo") //
				.attr('d', path) //
				.attr("fill", global.fixedColors[mapDefaultColorIndex]) //
				.attr("stroke", "black") //
				.attr("fill-opacity", mapFixedOpacity) //
				.style("stroke-width", 0.5);

		// dump attribute values into DOM
		topo[0].forEach(function(d, i) {

			var thisTopo = d3.select(d);
			var properties = geojson.features[i].properties;

			for ( var property in properties) {
				if (properties.hasOwnProperty(property)) {

					thisTopo.attr(property, properties[property]);

				}
			}// END: properties loop
		});

	updateMapBackground(backgroundColors[backgrounDefaultColorIndex]);
	}// END: generateTopoLayer

	exports.generateEmptyTopoLayer = function(pointAttributes, axisAttributes) {

		//console.log("generateEmptyLayer");

		var xlim = utils.getObject(pointAttributes, "id",
				axisAttributes.xCoordinate).range;
		var ylim = utils.getObject(pointAttributes, "id",
				axisAttributes.yCoordinate).range;

		/*console.log("width: " + global.width);
		console.log("height: " + global.height);
		console.log("xlim: " + xlim);
		console.log("ylim: " + ylim);*/

		// reversed because coordinates come as lat (y), long (x)
		var bounds = [ ylim, xlim ];

		/*console.log("bounds: " + bounds);
	    console.log("bounds[0][0] = " + bounds[0][0]);
	    console.log("bounds[0][1] = " + bounds[0][1]);
	    console.log("bounds[1][0] = " + bounds[1][0]);
	    console.log("bounds[1][1] = " + bounds[1][1]);*/

	    var vscale = global.height / (bounds[0][1] - bounds[0][0]);
	    var hscale = global.width / (bounds[1][1] - bounds[1][0]);

		//console.log("hscale: " + hscale);
		//console.log("vscale: " + vscale);

		var projectionScale = (hscale < vscale) ? hscale : vscale;
	    projectionScale = projectionScale * 100;

	    //console.log("projectionScale: " + projectionScale);

		// define null projection
		var zeroProjection = d3.geo.projection(function(x, y) {
			return [ x, y ];
		});

		var currentXDifference = zeroProjection([ 1, 1 ])[0]
				- zeroProjection([ 0, 0 ])[0];
		var currentYDifference = zeroProjection([ 1, 1 ])[1]
				- zeroProjection([ 0, 0 ])[1];

		projectionScale = global.minScaleExtent * projectionScale
				/ currentXDifference;

		global.projection = zeroProjection.scale(projectionScale);

		currentXDifference = zeroProjection([ 1, 1 ])[0]
				- zeroProjection([ 0, 0 ])[0];
		currentYDifference = zeroProjection([ 1, 1 ])[1]
				- zeroProjection([ 0, 0 ])[1];

	    //console.log("currentXDifference: " + currentXDifference);
	    //console.log("currentYDifference: " + currentYDifference);

		global.projection = zeroProjection.translate(
				[
						global.width / 2 + (bounds[1][0] + bounds[1][1]) / 2
								* currentYDifference,

						global.height / 2 + (bounds[0][0] + bounds[0][1]) / 2
								* currentXDifference ] //
		).scale(projectionScale);

	    // test projection
	    /*console.log("global.projection([xlim[0],ylim[0])[0]: " + global.projection([xlim[0],ylim[0]])[0]);
	    console.log("global.projection([xlim[0],ylim[0])[1]: " + global.projection([xlim[0],ylim[0]])[1]);
	    console.log("global.projection([xlim[1],ylim[1])[0]: " + global.projection([xlim[1],ylim[1]])[0]);
	    console.log("global.projection([xlim[1],ylim[1])[1]: " + global.projection([xlim[1],ylim[1]])[1]);*/
	    /*console.log("global.projection([0,0])[0]: " + global.projection([0,0])[0]);
	    console.log("global.projection([0,0])[1]: " + global.projection([0,0])[1]);
	    console.log("global.projection([1,1])[0]: " + global.projection([1,1])[0]);
	    console.log("global.projection([1,1])[1]: " + global.projection([1,1])[1]);*/

	    var xOffset = global.projection([xlim[1],ylim[1]])[0] - global.projection([xlim[0],ylim[0]])[0];
	    var yOffset = global.projection([xlim[0],ylim[0]])[1] - global.projection([xlim[1],ylim[1]])[1];

	    var addedXAxis = global.margin.left/currentXDifference;
	    var addedYAxis = -global.margin.bottom/currentYDifference;
	    //console.log("addedXAxis: " + addedXAxis);
	    //console.log("addedYAxis: " + addedYAxis);

	    // x axis
	    //var xScale = d3.scale.linear().domain(xlim).nice().range([ 0, global.width ]);
	    //var xScale = d3.scale.linear().domain(xlim).range([ global.projection([xlim[0],ylim[0]])[0], global.projection([ xlim[1], ylim[1] ])[0] ]);

	    //try the xScale below to make the axes intersect
	    var xScale = d3.scale.linear().domain([xlim[0]-addedXAxis,xlim[1]+addedXAxis]).range([ global.projection([xlim[0]-addedXAxis,ylim[0]])[0]-0, global.projection([ xlim[1]+addedXAxis, ylim[1] ])[0]+0]);

	    // x axis
	    //var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(
	    //    -global.height).outerTickSize(0).ticks(xlim[1]-xlim[0]);
	    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(
	        -yOffset - 2*global.margin.bottom).outerTickSize(0).ticks(xlim[1]-xlim[0]);

	    // add the x axis
	    var xAxisLayer = global.g.append("g").attr("class", "x axis");
	    //xAxisLayer.attr("transform", "translate(0," + global.height + ")").call(xAxis);
	    xAxisLayer.attr("transform", "translate(0," + (global.projection([xlim[0],ylim[0]])[1] + global.margin.bottom) + ")").call(xAxis);

	    // x axis title
	    global.g.append("text").attr("class", "x label").attr("text-anchor",
	        "middle").attr("x", global.width / 2).attr("y",
	        (global.projection([xlim[0],ylim[0]])[1] + global.margin.bottom) + global.margin.bottom - 20).style("font-size",
	        "18px") //
	        .style({
	            'stroke' : 'Black',
	            'fill' : 'Black',
	            'stroke-width' : '0.5px'
	        }).text(utils.capitalizeFirstLetter(axisAttributes.xCoordinate));

	    // y axis
	    //var yScale = d3.scale.linear().domain(ylim).nice().range([ global.height, 0 ]);
	    //var yScale = d3.scale.linear().domain(ylim).range([ global.projection([xlim[0],ylim[0]])[1], global.projection([ xlim[1], ylim[1] ])[1] ]);

	    //try the yScale below to make the axes intersect
	    var yScale = d3.scale.linear().domain([ylim[0]-addedYAxis,ylim[1]+addedYAxis]).range([ global.projection([xlim[0],ylim[0]-addedYAxis])[1]-0, global.projection([ xlim[1], ylim[1]+addedYAxis ])[1]+0]);

	    //var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(
	    //    -global.width).outerTickSize(0).ticks(ylim[1]-ylim[0]);
	    var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(
	        -xOffset - 2*global.margin.left).outerTickSize(0).ticks(ylim[1]-ylim[0]);

	    var yAxisLayer = global.g.append("g").attr("class", "y axis");
	    //yAxisLayer.attr("transform", "translate(" + (global.margin.left + 20) + ",0)").call(yAxis);
	    yAxisLayer.attr("transform", "translate(" + (global.projection([xlim[0],ylim[0]])[0] - global.margin.left) + ",0)").call(yAxis);

	    // y axis title
	    global.g.append("text").attr("class", "y label") //
	        .attr("text-anchor", "middle") //
	        .attr("transform", "translate(" + ((global.projection([xlim[0],ylim[0]])[0] - global.margin.left - 20)) + "," + (global.height / 2) + ")rotate(-90)") //
	        .style("font-size", "18px") //
	        .style({
	            'stroke' : 'Black',
	            'fill' : 'Black',
	            'stroke-width' : '0.5px'
	        }) //
	        .text(utils.capitalizeFirstLetter(axisAttributes.yCoordinate));

	    updateMapBackground(backgroundColors[backgrounDefaultColorIndex]);

	}// END: generateEmptyLayer

	exports.setupPanels = function(attributes) {

		setupTopoLayerCheckbox();
		setupTopoFixedColorPanel();
		setupTopoColorAttributePanel(attributes);
		setupTopoFixedOpacityPanel();
		setupTopoBackgroundPanel();

	}// END: setupPanels

	// ---FUNCTIONS---//

	setupTopoBackgroundPanel = function() {

	  var str = ("				<div class=\"panelcollapsed\">")+
	   ("					<h2>Background color<\/h2>")+
	  ("					<div class=\"panelcontent\">")+
	  ("						<select id=\"mapbackground\">")+
	  ("						<\/select>")+
	  ("					 <div id=\"mapBackgroundLegend\" class=\"legend\"><\/div>")+
	  ("					<\/div>")+
	  ("				<\/div>");

		var html = $.parseHTML(str);

		$(".selectors").append(html);

		var mapBackgroundSelect = document.getElementById("mapbackground");

		// var domain = [ "white", "black", "grey", "light blue" ];
		var scale = utils.alternatingColorScale().domain(backgroundColors).range(
				backgroundColors);

		for (var i = 0; i < backgroundColors.length; i++) {

			var option = backgroundColors[i];
			var element = document.createElement("option");
			element.textContent = option;
			element.value = option;

			mapBackgroundSelect.appendChild(element);

		}// END: i loop

		// map background listener
		d3
				.select(mapBackgroundSelect)
				.on(
						'change',
						function() {

							var colorSelect = mapBackgroundSelect.options[mapBackgroundSelect.selectedIndex].text;
							var color = scale(colorSelect);

							// d3.select('.container').style("background", color);
	            updateMapBackground(color);

							// setup legend
							updateMapBackgroundLegend(scale);

						});

	}// END:setupTopoBackgroundPanel

	updateMapBackground = function(color) {

		// d3.select('.container').style("background", color);
		// d3.select('.svg').style("background", color);

		d3.select('.svg').style({
			// "fill": color,
		 //  "color" :color,
	     "background" : color
		});


	}//END: updateMapBackground

	updateMapBackgroundLegend = function(scale) {

		var width = 150;
		var height = 100;

		var margin = {
			left : 20,
			top : 20
		};

		$('#mapBackgroundLegend').html('');
		var svg = d3.select("#mapBackgroundLegend").append('svg').attr("width",
				width).attr("height", height);

		var mapBackgroundLegend = d3.legend.color().scale(scale).shape('rect')
				.shapeHeight(10).shapeWidth(10).shapePadding(10).cells(5).orient(
						'vertical')

		svg.append("g").attr("class", "mapBackgroundLegend").attr("transform",
				"translate(" + (margin.left) + "," + (margin.top) + ")").call(
				mapBackgroundLegend);

	}// END:updateMapBackgroundLegend

	setupTopoFixedOpacityPanel = function() {

	  var str = ("				<div class=\"panelcollapsed\">")+
	   ("					<h2>Map fixed opacity<\/h2>")+
	   ("					<div class=\"panelcontent\">")+
	   ("							<div id=\"mapFixedOpacitySlider\"><\/div>")+
	   ("					<\/div>")+
	   ("				<\/div>");

		 var html = $.parseHTML(str);

		 $(".selectors").append(html);

		$('#mapFixedOpacitySlider').html('<input type="range" class="mapFixedOpacitySlider" step="0.1" min="' + min_map_opacity + '" max="' + max_map_opacity + '" value="'+mapFixedOpacity+'"  />');
		$('#mapFixedOpacitySlider').append('<span>' + mapFixedOpacity + '</span>');

		$('.mapFixedOpacitySlider').on("input", function() {

		mapFixedOpacity = $(this).val();

		 $(this).next().html(mapFixedOpacity);

		 	// fill-opacity / stroke-opacity / opacity
	 		topoLayer.selectAll(".topo") //
	 		.transition() //
	 		.ease("linear") //
	 		.attr("fill-opacity", mapFixedOpacity);

			});

	}// END:setupTopoFixedOpacityPanel

	setupTopoColorAttributePanel = function(attributes) {

	  var str = ("				<div class=\"panelcollapsed\">") +
	  ("					<h2>Map color attribute<\/h2>") +
	   ("					<div class=\"panelcontent\">") +
	   ("						<div id='mapStartColor'>") +
	   ("						<\/div>") +
	   ("						<div id='mapEndColor'>") +
	   ("						<\/div>") +
	   ("						<h4>Attribute<\/h4>")+
	   ("						<select id=\"mapColorAttribute\">")+
	   ("						<\/select>") +
	   ("						<div id=\"mapColorLegend\"><\/div>")+
	   ("					<\/div>")+
	   ("				<\/div>");

		 var html = $.parseHTML(str);

		 $(".selectors").append(html);

		// attribute
		var mapColorAttributeSelect = document.getElementById("mapColorAttribute");

		for (var i = 0; i < attributes.length; i++) {

			var option = attributes[i].id;
			var element = document.createElement("option");
			element.textContent = option;
			element.value = option;

			mapColorAttributeSelect.appendChild(element);

		}// END: i loop

		// map color listener
		d3
				.select(mapColorAttributeSelect)
				.on(
						'change',
						function() {

							var colorAttribute = mapColorAttributeSelect.options[mapColorAttributeSelect.selectedIndex].text;

							var attribute = utils.getObject(attributes, "id",
									colorAttribute);

							var data;
							var scale;

							$('#mapStartColor').html('');
							$('#mapEndColor').html('');

							if (attribute.scale == global.ORDINAL) {

								data = attribute.domain;
								scale = d3.scale.ordinal().range(
										global.ordinalColors).domain(data);

								updateMapColorLegend(scale);

							} else if (attribute.scale == LINEAR) {

								data = attribute.range;
								scale = d3.scale.linear().domain(data).range(
										[ mapStartColor, mapEndColor ]);

								updateMapColorLegend(scale);

								// start color
								$('#mapStartColor').html("<h4>Start color<\/h4>");
								$('#mapStartColor').append(
										"<input class=\"mapStartColor\" \/>");

								$('.mapStartColor')
										.simpleColor(
												{
													cellWidth : 13,
													cellHeight : 13,
													columns : 4,
													displayColorCode : true,
													colors : utils
															.getSimpleColors(global.pairedSimpleColors),

													onSelect : function(hex,
															element) {

														mapStartColor = "#" + hex;

														scale.range([
																mapStartColor,
																mapEndColor ]);

														updateMapColorLegend(scale);

														// trigger repaint
														updateMapColors(scale,
																colorAttribute);

													}// END: onSelect
												});

								$('.mapStartColor').setColor(mapStartColor);

								// end color
								$('#mapEndColor').html("<h4>End color<\/h4>");
								$('#mapEndColor').append(
										"<input class=\"mapEndColor\" \/>");

								$('.mapEndColor')
										.simpleColor(
												{
													cellWidth : 13,
													cellHeight : 13,
													columns : 4,
													colors : utils
															.getSimpleColors(global.pairedSimpleColors),
													displayColorCode : true,
													onSelect : function(hex,
															element) {

														mapEndColor = "#" + hex;

														scale.range([
																mapStartColor,
																mapEndColor ]);

														updateMapColorLegend(scale);

														// trigger repaint
														updateMapColors(scale,
																colorAttribute);
													}// END: onSelect
												});

								$('.mapEndColor').setColor(mapEndColor);

							} else {

								console
										.log("Error occured when resolving scale type!");

							}

							// trigger repaint
							updateMapColors(scale, colorAttribute);

						});

	}// END: setupTopoColorAttributePanel

	updateMapColorLegend = function(scale) {

		var width = 150;
		var height = 250;

		var margin = {
			left : 20,
			top : 20
		};

		$('#mapColorLegend').html('');
		var svg = d3.select("#mapColorLegend").append('svg').attr("width", width)
				.attr("height", height);

		var mapColorLegend = d3.legend.color().scale(scale).shape('rect')
				.shapeHeight(10).shapeWidth(10).shapePadding(5).cells(5).orient(
						'vertical')

		svg.append("g").attr("class", "mapColorLegend").attr("transform",
				"translate(" + (margin.left) + "," + (margin.top) + ")").call(
				mapColorLegend);

	}// END:updateMapColorLegend

	updateMapColors = function(scale, colorAttribute) {

		d3.selectAll(".topo") //
		.transition() //
		.ease("linear") //
		.attr("fill", function() {

			var topo = d3.select(this);
			var attributeValue = topo.attr(colorAttribute);
			var color = scale(attributeValue);

			return (color);
		});

	}// END:updateMapColors

	setupTopoFixedColorPanel = function() {

	 var str = ("				<div class=\"panelcollapsed\">")+
	 ("					<h2>Map color<\/h2>")+
	 ("					<div class=\"panelcontent\">")+
	 ("						<select id=\"mapFixedColor\">")+
	 ("						<\/select>")+
	 ("						<div id=\"mapFixedColorLegend\" ><\/div>")+
	   ("					<\/div>")+
	   ("				<\/div>");

	  var html = $.parseHTML(str);

	  $(".selectors").append(html);

		var mapFixedColorSelect = document.getElementById("mapFixedColor");
		var scale = utils.alternatingColorScale().domain(global.fixedColors).range(
				global.fixedColors);

		for (var i = 0; i < global.fixedColors.length; i++) {

			var option = global.fixedColors[i];
			var element = document.createElement("option");
			element.textContent = option;
			element.value = option;

			mapFixedColorSelect.appendChild(element);

		}// END: i loop

		// select the default
		mapFixedColorSelect.selectedIndex = mapDefaultColorIndex;

		// map fixed color listener
		d3
				.select(mapFixedColorSelect)
				.on(
						'change',
						function() {

							var colorSelect = mapFixedColorSelect.options[mapFixedColorSelect.selectedIndex].text;
							var color = scale(colorSelect);

							d3.selectAll(".topo") //
							.transition() //
							.ease("linear") //
							.attr("fill", color);

							// setup legend
							updateMapFixedColorLegend(scale);

						});

	}// END: setupTopoFixedColorPanel

	updateMapFixedColorLegend = function(scale) {

		var width = 150;
		var height = 230;

		var margin = {
			left : 20,
			top : 20
		};

		$('#mapFixedColorLegend').html('');
		var svg = d3.select("#mapFixedColorLegend").append('svg').attr("width",
				width).attr("height", height);

		var mapFixedColorLegend = d3.legend.color().scale(scale).shape('rect')
				.shapeHeight(10).shapeWidth(10).shapePadding(5).cells(5).orient(
						'vertical')

		svg.append("g").attr("class", "mapFixedColorLegend").attr("transform",
				"translate(" + (margin.left) + "," + (margin.top) + ")").call(
				mapFixedColorLegend);

	}// END: updateMapFixedColorLegend

	setupTopoLayerCheckbox = function() {

		$('#layerVisibility').append(
				"<input type=\"checkbox\" id=\"mapLayerCheckbox\"> Map layer<br>");

		var mapLayerCheckbox = document.getElementById("mapLayerCheckbox");
		// default state is checked
		mapLayerCheckbox.checked = true;

		d3.select(mapLayerCheckbox).on("change", function() {

			var visibility = this.checked ? "visible" : "hidden";
			topoLayer.selectAll("path").style("visibility", visibility);

		});

	}// END: setupTopoLayerCheckbox

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(36);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./topo.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./topo.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	exports.push([module.id, ".axis path, .axis line {\n\tfill: none;\n\tstroke: black;\n}\n\n.tick text {\n\tfont-size: 12px;\n}\n\n.tick line {\n\topacity: 0.1;\n}", ""]);

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @fbielejec
	 */

	// ---MODULE IMPORTS---//
	var d3 = __webpack_require__(9);
	var utils = __webpack_require__(13);
	var global = __webpack_require__(10);

	// ---MODULE VARIABLES---//

	var locationsLayer;
	var locationsColors =  [ "#000000", "#ffffff" ]
	var locationsColorIndex = 0;




	// ---MODULE EXPORTS---//

	var exports = module.exports = {};

	exports.generateLocationsLayer = function(locations_) {

		locationsLayer = global.g.append("g").attr("class", "locationsLayer");

		var locations = locationsLayer.selectAll("circle").data(locations_).enter()
				.append("circle") //
				.attr("class", "location") //
				.attr("cx", function(d) {

					var xy = global.projection([ d.coordinate.xCoordinate, // long
					d.coordinate.yCoordinate // lat
					]);

					var cx = xy[0]; // long

					return (cx);
				}) //
				.attr("cy", function(d) {

					var xy = global.projection([ d.coordinate.xCoordinate, // long
					d.coordinate.yCoordinate // lat
					]);

					var cy = xy[1]; // lat

					return (cy);
				}) //
				.attr("r", ".1px") //
				.attr("fill", locationsColors[locationsColorIndex]) //
				.attr("stroke", "black");

	}// END: generateLocationsLayer

	exports.generateLabels = function(locations_) {

		var labels = locationsLayer.selectAll("text").data(locations_).enter().append("text") //
		.attr("class", "label") //
		.attr(
				"x",
				function(d) {

					var xy = global.projection([ d.coordinate.xCoordinate, // long
							d.coordinate.yCoordinate // lat
							]);

					var x = xy[0]; // long

					return (x);
				}) //
		.attr(
				"y",
				function(d) {

					var xy = global.projection([ d.coordinate.xCoordinate, // long
							d.coordinate.yCoordinate // lat
							]);

					var y = xy[1]; // lat

					return (y);
				}) //
		.text(function(d) {

			return (d.id);
		}) //
		.attr("font-family", "sans-serif")//
		.attr("font-size", "10px")//
		.attr("fill", "black") //
		;

	}// END: generateLocationsLayer

	exports.setupPanels = function() {

		setupLocationsLayerCheckbox();
		setupLocationsFixedColorPanel();

	}//END: setupPanels

	function setupLocationsLayerCheckbox() {

		$('#layerVisibility')
		.append(
				"<input type=\"checkbox\" id=\"locationsLayerCheckbox\"> Locations layer<br>");

		var locationsLayerCheckbox = document.getElementById("locationsLayerCheckbox");
		// default state is checked
		locationsLayerCheckbox.checked = true;

		d3.select(locationsLayerCheckbox).on("change", function() {

			var visibility = this.checked ? "visible" : "hidden";
			locationsLayer.selectAll("text").style("visibility", visibility);
			locationsLayer.selectAll("circle").style("visibility", visibility);

		});


	}//END: setupLocationsLayerCheckbox

	function setupLocationsFixedColorPanel() {

		var str = (" <div class=\"panelcollapsed\">")+
		 (" <h2>Labels color<\/h2>")+
		 (" <div class=\"panelcontent\">")+
		 (" <select id=\"labelcolor\">")+
		 (" <\/select>")+
		 (" <div id=\"labelColorLegend\"><\/div>")+
		 (" <\/div>")+
		 (" <\/div>");

		 var html = $.parseHTML(str);

		 $(".selectors").append(html);

		var labelColorSelect = document.getElementById("labelcolor");

		var domain = [ "black", "white" ];
		var scale = utils.alternatingColorScale().domain(domain).range(
				locationsColors);

		for (var i = 0; i < domain.length; i++) {

			var option = domain[i];
			var element = document.createElement("option");
			element.textContent = option;
			element.value = option;

			labelColorSelect.appendChild(element);

		}// END: i loop

		// select the default
		labelColorSelect.selectedIndex = locationsColorIndex;


		// label color listener
		d3
				.select(labelColorSelect)
				.on(
						'change',
						function() {

							var colorSelect = labelColorSelect.options[labelColorSelect.selectedIndex].text;
							var color = scale(colorSelect);

							d3.selectAll(".label") //
							.transition() //
							.ease("linear") //
							.attr("fill", color);

							// setup legend
							updateLocationsFixedColorLegend(scale);

						});


	}//END: setupLocationsFixedColorPanel

	function updateLocationsFixedColorLegend(scale) {

		var width = 150;
		var height = 50;

		var margin = {
			left : 20,
			top : 20
		};

		$('#labelColorLegend').html('');
		var svg = d3.select("#labelColorLegend").append('svg').attr("width",
				width).attr("height", height);

		var labelColorLegend = d3.legend.color().scale(scale).shape('circle')
				.shapeRadius(5).shapePadding(10).cells(locationsColors.length).orient('vertical')

		svg.append("g").attr("class", "labelColorLegend").attr("transform",
				"translate(" + (margin.left) + "," + (margin.top) + ")").call(
						labelColorLegend);


	}//END:updateLocationsFixedColorLegend

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }
/******/ ]);