///////////////////
//---VARIABLES---//
///////////////////

var START_STRING = "start";
var END_STRING = "end";
var START_PREFIX = /^start/;
var END_PREFIX = /^end/;

// /////////////////
// ---FUNCTIONS---//
// /////////////////

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}// END: isNumeric

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

// //////////////////////
// ---MONKEY PATCHES---//
// //////////////////////

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
}