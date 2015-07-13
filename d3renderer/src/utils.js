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
