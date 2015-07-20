// ---POPULATE LINE MAPS---//

function populateLineMaps(lines) {

	var attributeInclude = [];
	var factorValue = 1.0;

	lines.forEach(function(line) {

		var attributes = line.attributes;
		for ( var property in attributes) {

			// process values
			var value = attributes[property].id;
			if (!(value in lineValueMap)) {

				if (isNumeric(value)) {

					lineValueMap[value] = {
						value : value,
					};

				} else {

					lineValueMap[value] = {
						value : factorValue,
					};

					factorValue++;

				}// END: isNumeric check

			} // END: contains check

			// process includes and attribute names for choosers
			var include = true;
			if (property.startsWith(START_STRING)
					|| property.startsWith(END_STRING)) {

				// lines have start and end attributes, but we keep only the
				// core name
				property = property.replace(START_PREFIX, '').replace(
						END_PREFIX, '');

				// attributes with no start/end cannot be used with some
				// aesthetics
				include = false;

			} else {

				include = true;

			}// END: prefix check

			attributeInclude[property] = {
				include : include
			};

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

	// printMap(lineValueMap);
	// printMap(lineMinMaxMap);

	var i;
	var option;
	var element;
	var keys = Object.keys(lineMinMaxMap);

	lineWidthSelect = document.getElementById("selectLineWidthAttribute");
	for (i = 0; i < keys.length; i++) {

		option = keys[i];
		if (attributeInclude[option].include) {
			element = document.createElement("option");
			element.textContent = option;
			element.value = option;

			lineWidthSelect.appendChild(element);
		}

	}// END: i loop

	lineColorSelect = document.getElementById("selectLineColorAttribute");
	for (i = 0; i < keys.length; i++) {

		option = keys[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		lineColorSelect.appendChild(element);

	}// END: i loop

}// END: populateLineMaps

// ---GENERATE LINES--//

function generateLines(lines, locations, locationIds) {

	// width maping
	var widthAttribute = lineWidthSelect.options[lineWidthSelect.selectedIndex].text;

	var minWidth = 0.1;
	var maxWidth = 0.5;

	var widthScale = d3.scale.linear() //
	.domain(
			[ lineMinMaxMap[widthAttribute].min,
					lineMinMaxMap[widthAttribute].max ]) //
	.range([ minWidth, maxWidth ]);

	// color maping
	var colorAttribute = lineColorSelect.options[lineColorSelect.selectedIndex].text;

	var numC = 9;
	var cbMap;

	cbMap = colorbrewer["Reds"];
	var minRed = cbMap[numC][0];
	var maxRed = cbMap[numC][numC - 0];
	var redScale = d3.scale.linear().domain(
			[ lineMinMaxMap[colorAttribute].min,
					lineMinMaxMap[colorAttribute].max ]) //
	.range([ minRed, maxRed ]);

	cbMap = colorbrewer["Greens"];
	var minGreen = cbMap[numC][0];
	var maxGreen = cbMap[numC][numC - 1];
	var greenScale = d3.scale.linear().domain(
			[ lineMinMaxMap[colorAttribute].min,
					lineMinMaxMap[colorAttribute].max ]) //
	.range([ minGreen, maxGreen ]);

	cbMap = colorbrewer["Blues"];
	var minBlue = cbMap[numC][0];
	var maxBlue = cbMap[numC][numC - 0];
	var blueScale = d3.scale.linear().domain(
			[ lineMinMaxMap[colorAttribute].min,
					lineMinMaxMap[colorAttribute].max ]) //
	.range([ minBlue, maxBlue ]);

	var attribute;
	var value;
	lines.forEach(function(line) {

		var locationId = line.startLocation;
		var index = locationIds.indexOf(locationId);
		var location = locations[index];
		var startCoordinate = location.coordinate;

		locationId = line.endLocation;
		index = locationIds.indexOf(locationId);
		location = locations[index];
		var endCoordinate = location.coordinate;

		// get width attribute value
		attribute = line.attributes[widthAttribute].id;
		value = lineValueMap[attribute].value;
		var width = widthScale(value);

		// get start color attribute value
		attribute = line.attributes[colorAttribute];

		if (!attribute) {

			attribute = line.attributes[START_STRING + colorAttribute];

		}// END: null check

		value = lineValueMap[attribute.id].value;

		// map start value to colors
		var startRed = d3.rgb(redScale(value)).r;
		var startGreen = d3.rgb(greenScale(value)).g;
		var startBlue = d3.rgb(blueScale(value)).b;

		// get end color attribute value
		attribute = line.attributes[colorAttribute];
		if (!attribute) {

			attribute = line.attributes[END_STRING + colorAttribute];

		}// END: null check

		value = lineValueMap[attribute.id].value;

		// get colors from scale
		var endRed = d3.rgb(redScale(value)).r;
		var endGreen = d3.rgb(greenScale(value)).g;
		var endBlue = d3.rgb(blueScale(value)).b;

		// console.log("start: " + startAttribute+ " " + startRed +","
		// +startGreen +"," + startBlue + " end: " +endAttribute +" "
		// +endRed
		// +"," + endGreen +"," + endBlue );

		generateLine(line, startCoordinate, endCoordinate, startRed,
				startGreen, startBlue, endRed, endGreen, endBlue, width);

	});

}// END: generateLines

// ---GENERATE LINE--//

function generateLine(line, startCoordinate, endCoordinate, startRed,
		startGreen, startBlue, endRed, endGreen, endBlue, width) {

	var startLatitude = startCoordinate.xCoordinate;
	var startLongitude = startCoordinate.yCoordinate;

	var endLatitude = endCoordinate.xCoordinate;
	var endLongitude = endCoordinate.yCoordinate;
	var coords = getIntermediateCoords(startLongitude, startLatitude,
			endLongitude, endLatitude, sliceCount);

	var redStep = (endRed - startRed) / sliceCount;
	var greenStep = (endGreen - startGreen) / sliceCount;
	var blueStep = (endBlue - startBlue) / sliceCount;

	// TODO: time and duration for animation

	for (var i = 0; i < sliceCount; i++) {

		var segmentStartLongitude = coords[i][LONGITUDE];
		var segmentStartLatitude = coords[i][LATITUDE];

		var segmentEndLongitude = coords[i + 1][LONGITUDE];
		var segmentEndLatitude = coords[i + 1][LATITUDE];

		var segmentRed = Math.round(startRed + redStep * i);
		var segmentGreen = Math.round(startGreen + greenStep * i);
		var segmentBlue = Math.round(startBlue + blueStep * i);

		var segmentWidth = width;

		generateLineSegment(segmentStartLongitude, segmentStartLatitude,
				segmentEndLongitude, segmentEndLatitude, segmentRed,
				segmentGreen, segmentBlue, segmentWidth);

	}// END: slices loop

}// END: generateLine

function generateLineSegment(startLongitude, startLatitude, endLongitude,
		endLatitude, segmentRed, segmentGreen, segmentBlue, segmentWidth) {

	g.append("path").datum(
			{
				type : "LineString",
				coordinates : [ [ startLongitude, startLatitude ],
						[ endLongitude, endLatitude ] ]
			}) //
	.attr("d", path).attr("fill", "none") //
	.attr("class", "line") //
	.attr("stroke",
			"rgb(" + segmentRed + "," + segmentGreen + "," + segmentBlue + ")") //
	.attr("stroke-width", segmentWidth + "px");

}// END: generateLineSegment


function paintLineSegments(lineSegmentsMap) {
	
	
	
	
}
