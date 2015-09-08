
// ---POPULATE PANELS---//

function populatePanels(lines) {

	var factorValue = 1.0;
	
	lines.forEach(function(line) {

		var attributes = line.attributes;
	
		for ( var property in attributes) {

			// process values
			var value = attributes[property].id;
			
			
			if (!(value in lineValueMap)) {

				if (isNumeric(value)) {

					lineValueMap[value] = {
						value : value
					};

				} else {

					lineValueMap[value] = {
						value : factorValue
					};

					factorValue++;

				}// END: isNumeric check

			} // END: contains check

			// process attribute names for choosers
			if (property.startsWith(START_STRING)
					|| property.startsWith(END_STRING)) {

				// lines have start and end attributes, but we keep only the
				// core name
				property = property.replace(START_PREFIX, '').replace(
						END_PREFIX, '');

			}// END: prefix check

			// get min max values
			if (!(property in lineMinMaxMap)) {

				lineMinMaxMap[property] = {
					min : lineValueMap[value].value,
					max : lineValueMap[value].value
				};

			} else {

				var min = lineMinMaxMap[property].min;
				var candidateMin = lineValueMap[value].value;

				if (candidateMin < min) {
					lineMinMaxMap[property].min = candidateMin;
				}// END: min check

				var max = lineMinMaxMap[property].max;
				var candidateMax = lineValueMap[value].value;

				if (candidateMax > max) {
					lineMinMaxMap[property].max = candidateMax;
				}// END: max check

			}// END: key check

		}// END: attributes loop

	});// END: polygons loop

	var i;
	var option;
	var element;
	var keys = Object.keys(lineMinMaxMap);

	lineColorSelect = document.getElementById("linecolor");
	for (i = 0; i < keys.length; i++) {

		option = keys[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		lineColorSelect.appendChild(element);

	}// END: i loop

}// END: populateLineMaps
