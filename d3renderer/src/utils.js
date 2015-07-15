///////////////////
//---VARIABLES---//
///////////////////

var START_STRING = "start";
var END_STRING = "end";
var START_PREFIX = /^start/;
var END_PREFIX = /^end/;
var EARTH_RADIUS = 6371.0;
var LONGITUDE = 0;
var LATITUDE = 1;

// /////////////////
// ---FUNCTIONS---//
// /////////////////

function getIntermediateCoords(startLongitude, startLatitude, endLongitude,
		endLatitude, sliceCount) {

	var coords = [];

	var distance = rhumbDistance(startLongitude, startLatitude, endLongitude,
			endLatitude);
	var distanceSlice = distance / sliceCount;

	var rlon1 = longNormalise(Math.toRadians(startLongitude));
	var rlat1 = Math.toRadians(startLatitude);
	var rlon2 = longNormalise(Math.toRadians(endLongitude));
	var rlat2 = Math.toRadians(endLatitude);

	coords.push([ startLongitude, startLatitude ]);
	for (var i = 1; i < sliceCount; i++) {

		distance = distanceSlice;
		var rDist = distance / EARTH_RADIUS;

		var bearing = rhumbBearing(rlon1, rlat1, rlon2, rlat2);

		// use the bearing and the start point to find the destination
		var newLonRad = longNormalise(rlon1
				+ Math.atan2(Math.sin(bearing) * Math.sin(rDist)
						* Math.cos(rlat1), Math.cos(rDist) - Math.sin(rlat1)
						* Math.sin(rlat2)));

		var newLatRad = Math.asin(Math.sin(rlat1) * Math.cos(rDist)
				+ Math.cos(rlat1) * Math.sin(rDist) * Math.cos(bearing));

		// Convert from radians to degrees
		var newLat = Math.toDegrees(newLatRad);
		var newLon = Math.toDegrees(newLonRad);

		// Coordinate newCoord = new Coordinate(newLat, newLon);
		// coords.add(i, newCoord);
		coords.push([ newLon, newLat ]);

		// This updates the input to calculate new bearing
		rlon1 = newLonRad;
		rlat1 = newLatRad;

		distance = rhumbDistance(newLon, newLat, endLongitude, endLatitude);

		distanceSlice = distance / (sliceCount - i);

	}// END: sliceCount loop
	coords.push([ endLongitude, endLatitude ]);

	return coords;
}// END: getIntermediateCoords

function rhumbDistance(startLongitude, startLatitude, endLongitude, endLatitude) {

	var rlon1 = Math.toRadians(startLongitude);
	var rlat1 = Math.toRadians(startLatitude);
	var rlon2 = Math.toRadians(endLongitude);
	var rlat2 = Math.toRadians(endLatitude);

	var dLat = (rlat2 - rlat1);
	var dLon = Math.abs(rlon2 - rlon1);

	var dPhi = Math.log(Math.tan(rlat2 / 2 + Math.PI / 4)
			/ Math.tan(rlat1 / 2 + Math.PI / 4));
	var q = (isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(rlat1);

	if (dLon > Math.PI) {
		dLon = 2 * Math.PI - dLon;
	}

	var distance = Math.sqrt(dLat * dLat + q * q * dLon * dLon) * EARTH_RADIUS;

	return distance;
}// END: rhumbDistance

function rhumbBearing(rlon1, rlat1, rlon2, rlat2) {
	var dLon = (rlon2 - rlon1);

	var dPhi = Math.log(Math.tan(rlat2 / 2 + Math.PI / 4)
			/ Math.tan(rlat1 / 2 + Math.PI / 4));

	if (Math.abs(dLon) > Math.PI) {
		dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
	}

	var brng = Math.atan2(dLon, dPhi);

	return Math.toRadians((Math.toDegrees(brng) + 360) % 360);
}// END: rhumbBearing

function longNormalise(lon) {
	return (lon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
}// END: longNormalise

Math.toRadians = function(degrees) {
	return degrees * Math.PI / 180;
};// END: toRadians

Math.toDegrees = function(radians) {
	return radians * 180 / Math.PI;
};// END: toDegrees

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

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}// END: isNumeric

// //////////////////////
// ---MONKEY PATCHES---//
// //////////////////////

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
}
