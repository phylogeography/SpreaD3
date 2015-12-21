///////////////////
//---VARIABLES---//
///////////////////

//var START_STRING = "start";
//var END_STRING = "end";
//var START_PREFIX = /^start/;
//var END_PREFIX = /^end/;

var ORDINAL = "ordinal";
var LINEAR = "linear";

var MIN_INDEX = 0;
var MAX_INDEX = 1;

var MAP = "map";
var TREE = "tree";
var COUNTS = "counts";

var COUNT = "count";

// /////////////////
// ---FUNCTIONS---//
// /////////////////

function map(value, fromLow, fromHigh, toLow, toHigh) {
	/**
	 * maps a single value from its range into another interval
	 * 
	 * @param value -
	 *            value to be mapped
	 * @param fromLow -
	 *            range of value
	 * @param fromHigh -
	 *            range of value
	 * @param toLow -
	 *            interval
	 * @param toHigh -
	 *            interval
	 * @return the mapped value
	 */

	return (toLow + (toHigh - toLow)
			* ((value - fromLow) / (fromHigh - fromLow)));
}// END: map

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}// END: isNumeric

function getSimpleColors(colors) {
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

function printMap(map) {

	for ( var x in map) {

		var message = ("Key: " + x + " [ ");

		var value = map[x];
		for ( var y in value) {
			message += (y + "=" + value[y] + " ");
		}

		console.log(message + "]");
	}

}// END: printMap

function getObject(obj, key, val) {
	var newObj = false;
	$.each(obj, function() {
		var testObject = this;
		$.each(testObject, function(k, v) {
			// alert(k);
			if (val == v && k == key) {
				newObj = testObject;
			}
		});
	});

	return newObj;
}

function alternatingColorScale() {
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

// //////////////////////
// ---MONKEY PATCHES---//
// //////////////////////

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
}

d3.selection.prototype.first = function() {
	return d3.select(this[0][0]);
};

d3.selection.prototype.last = function() {
	var last = this.size() - 1;
	return d3.select(this[0][last]);
};