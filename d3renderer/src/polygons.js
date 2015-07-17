// ---POPULATE POLYGON MAPS---//

function populatePolygonMaps(polygons) {

	var factorValue = 1.0;
	polygons.forEach(function(polygon) {

		var attributes = polygon.attributes;
		for ( var property in attributes) {

			// process values
			var value = attributes[property].id;
			if (!(value in polygonValueMap)) {

				if (isNumeric(value)) {

					polygonValueMap[value] = {
						value : value,
					};

				} else {

					polygonValueMap[value] = {
						value : factorValue,
					};

					factorValue++;

				}// END: isNumeric check

			} // END: contains check

			// get min max values
			if (!(property in polygonMinMaxMap)) {

				polygonMinMaxMap[property] = {
					min : polygonValueMap[value].value,
					max : polygonValueMap[value].value
				};

			} else {

				var min = polygonMinMaxMap[property].min;
				var candidateMin = polygonValueMap[value].value;

				if (candidateMin < min) {
					polygonMinMaxMap[property].min = candidateMin;
				}// END: min check

				var max = polygonMinMaxMap[property].max;
				var candidateMax = polygonValueMap[value].value;

				if (candidateMax > max) {
					polygonMinMaxMap[property].max = candidateMax;
				}// END: max check

			}// END: key check

		}// END: attributes loop

	});// END: polygons loop

	// printMap(polygonValueMap);
	// printMap(polygonMinMaxMap);

	var i;
	var option;
	var element;
	var keys = Object.keys(polygonMinMaxMap);

	polygonAreaSelect = document.getElementById("selectPolygonAreaAttribute");
	for (i = 0; i < keys.length; i++) {

		option = keys[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		polygonAreaSelect.appendChild(element);

	}// END: i loop

	polygonColorSelect = document.getElementById("selectPolygonColorAttribute");
	for (i = 0; i < keys.length; i++) {

		option = keys[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		polygonColorSelect.appendChild(element);

	}// END: i loop

}// END: populatePolygonMaps

// ---GENERATE POLYGONS---//

function generatePolygons(polygons, locations, locationIds) {

	// area maping
	var areaAttribute = polygonAreaSelect.options[polygonAreaSelect.selectedIndex].text;

	var minArea = 1;
	var maxArea = 100;

	var areaScale = d3.scale.linear() //
	.domain(
			[ polygonMinMaxMap[areaAttribute].min,
					polygonMinMaxMap[areaAttribute].max ]) //
	.range([ minArea, maxArea ]);

	// color mapping
	var colorAttribute = polygonColorSelect.options[polygonColorSelect.selectedIndex].text;

	var numC = 9;
	var cbMap;

	cbMap = colorbrewer["Reds"];
	// TODO: min/max should be chosen from a pallete by the user
	var minRed = cbMap[numC][0];
	var maxRed = cbMap[numC][numC - 1];
	var redScale = d3.scale.linear().domain(
			[ polygonMinMaxMap[colorAttribute].min,
					polygonMinMaxMap[colorAttribute].max ]) //
	.range([ minRed, maxRed ]);

	cbMap = colorbrewer["Greens"];
	var minGreen = cbMap[numC][0];
	var maxGreen = cbMap[numC][numC - 1];
	var greenScale = d3.scale.linear().domain(
			[ polygonMinMaxMap[colorAttribute].min,
					polygonMinMaxMap[colorAttribute].max ]) //
	.range([ minGreen, maxGreen ]);

	cbMap = colorbrewer["Blues"];
	var minBlue = cbMap[numC][0];
	var maxBlue = cbMap[numC][numC - 1];
	var blueScale = d3.scale.linear().domain(
			[ polygonMinMaxMap[colorAttribute].min,
					polygonMinMaxMap[colorAttribute].max ]) //
	.range([ minBlue, maxBlue ]);

	var attribute;
	var value;
	polygons.forEach(function(polygon) {

		attribute = polygon.attributes[areaAttribute].id;
		value = polygonValueMap[attribute].value;
		var area = areaScale(value);

		attribute = polygon.attributes[colorAttribute].id;
		value = polygonValueMap[attribute].value;
		var red = d3.rgb(redScale(value)).r;
		var green = d3.rgb(greenScale(value)).g;
		var blue = d3.rgb(blueScale(value)).b;

		generatePolygon(polygon, locations, locationIds, //
		area, //
		red, green, blue //
		);

	});

}// END: generatePolygons

// ---GENERATE POLYGON---//

function generatePolygon(polygon, locations, locationIds, area, red, green,
		blue) {

	if (polygon.hasLocation) {

		var locationId = polygon.location;
		var index = locationIds.indexOf(locationId);

		var location = locations[index];
		var coordinate = location.coordinate;

		var latitude = coordinate.yCoordinate;
		var longitude = coordinate.xCoordinate;

		var x = projection([ latitude, longitude ])[0];
		var y = projection([ latitude, longitude ])[1];

		var radius = Math.sqrt(area / Math.PI);

		// console.log("rgb(" +red + "," +green + "," + blue + ")");

		g.append("circle") //
		.attr("class", "polygon") //
		.attr("cx", x) //
		.attr("cy", y) //
		.attr("r", radius + "px") //
		.attr("fill", "rgb(" + red + "," + green + "," + blue + ")");

	} else {

		// TODO

	}// END: hasLocation check

}// END: generatePolygon