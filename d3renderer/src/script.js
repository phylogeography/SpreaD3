/**
 * @fbielejec
 */

// ////////////////////////
// ---GLOBAL VARIABLES---//
// ////////////////////////
var width = document.getElementById('container').offsetWidth;
var height = width / 2;

var sliceCount = 10;

var topo;
var projection;
var path;
var svg;
var g;

var throttleTimer;

var graticule = d3.geo.graticule();

var tooltip = d3.select("#container").append("div").attr("class",
		"tooltip hidden");

var polygonValueMap = [];
var polygonMinMaxMap = [];
var polygonAreaSelect;
var polygonColorSelect;

var lineValueMap = [];
var lineMinMaxMap = [];
var lineWidthSelect;
var lineColorSelect;

// /////////////////
// ---FUNCTIONS---//
// /////////////////

// ---SETUP---//
function setup(width, height) {

	projection = d3.geo.mercator() //

	.translate([ (width / 2), (height / 2) ]) //
	.scale(width / 2 / Math.PI);

	path = d3.geo.path().projection(projection);

	svg = d3.select("#container").append("svg") //
	.attr("width", width) //
	.attr("height", height) //
	.call(zoom) //
	.on("click", click) //
	.append("g");

	g = svg.append("g");

}// END: setup

// ---DRAW---//

function draw(topo) {

	svg.append("path") //
	.datum(graticule) //
	.attr("class", "graticule") //
	.attr("d", path);

	g.append("path") //
	.datum(
			{
				type : "LineString",
				coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
						[ 180, 0 ] ]
			}) //
	.attr("class", "equator") //
	.attr("d", path);

	var country = g.selectAll(".country").data(topo);

	country.enter().insert("path") //
	.attr("class", "country") //
	.attr("d", path) //
	.attr("id", function(d, i) {
		return d.id;
	}) //
	.attr("title", function(d, i) {
		return d.properties.name;
	}) //
	.style("fill", "rgb(194, 178, 128)") //
	.style("stroke", "rgb(0, 0, 0)") //
	;

	// offsets for tooltips
	var offsetL = document.getElementById('container').offsetLeft + 20;
	var offsetT = document.getElementById('container').offsetTop + 10;

	// tooltips
	country.on(
			"mouseover",
			function(d, i) {

				var mouse = d3.mouse(svg.node()).map(function(d) {
					return parseInt(d);
				});

				tooltip.classed("hidden", false) //
				.attr(
						"style",
						"left:" + (mouse[0] + offsetL) + "px;top:"
								+ (mouse[1] + offsetT) + "px") //
				.html(d.properties.name);

				d3.select(this).style("fill", "rgb(250, 250, 250)");

			}) //
	.on("mouseout", function(d, i) {

		tooltip.classed("hidden", true);

		d3.select(this).style("fill", "rgb(194, 178, 128)");

	});

}// END: draw

// ---REDRAW---//

function redraw() {

	width = document.getElementById('container').offsetWidth;
	height = width / 2;
	d3.select('svg').remove();
	setup(width, height);
	draw(topo);

}// END: redraw

// ---MOVE---//

function move() {

	var t = d3.event.translate;
	var s = d3.event.scale;
	zscale = s;
	var h = height / 4;

	t[0] = Math.min((width / height) * (s - 1), //
	Math.max(width * (1 - s), t[0]) //
	);

	t[1] = Math.min(h * (s - 1) + h * s, //
	Math.max(height * (1 - s) - h * s, t[1]) //
	);

	zoom.translate(t);
	g.attr("transform", "translate(" + t + ")scale(" + s + ")");

	// adjust the country hover stroke width based on zoom level
	d3.selectAll(".country") //
	.style("stroke-width", 1.5 / s) //
	;

}// END: move

// ---THROTTLE---//

function throttle() {

	window.clearTimeout(throttleTimer);

	throttleTimer = window.setTimeout(function() {
		redraw();
	}, 200);

}// END: throttle

// ---CLICK---//

function click() {
	/* Geo translation on mouse click on map */
	projection.invert(d3.mouse(this));
}// END: click

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
		// TODO: fancy koda labels
		// var label = location.id;

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

// ---POPULATE LINE MAPS---//

function populateLineMaps(lines) {

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

			// lines have start and end attributes
			property = property.replace(START_PREFIX, '').replace(END_PREFIX,
					'');

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
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		lineWidthSelect.appendChild(element);

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

	// color scale
	// var colorAttribute =
	// lineColorSelect.options[lineColorSelect.selectedIndex].text;
	var colorAttribute = lineColorSelect.options[2].text;

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

	var startAttribute;
	var endAttribute;
	lines.forEach(function(line) {

		var locationId = line.startLocation;
		var index = locationIds.indexOf(locationId);
		var location = locations[index];
		var startCoordinate = location.coordinate;

		locationId = line.endLocation;
		index = locationIds.indexOf(locationId);
		location = locations[index];
		endCoordinate = location.coordinate;

		// get start attribute value
		startAttribute = line.attributes[colorAttribute];
		if (!startAttribute) {

			// colorAttribute = START_STRING + colorAttribute;
			startAttribute = line.attributes[START_STRING + colorAttribute].id;

		}// END: null check

		value = lineValueMap[startAttribute].value;

		// map start value to colors
		var startRed = d3.rgb(redScale(value)).r;
		var startGreen = d3.rgb(greenScale(value)).g;
		var startBlue = d3.rgb(blueScale(value)).b;

		// get end attribute value
		endAttribute = line.attributes[colorAttribute];
		if (!endAttribute) {

			endAttribute = line.attributes[END_STRING + colorAttribute].id;

		}// END: null check

		value = lineValueMap[endAttribute].value;
		var endRed = d3.rgb(redScale(value)).r;
		var endGreen = d3.rgb(greenScale(value)).g;
		var endBlue = d3.rgb(blueScale(value)).b;

		// console.log("start: " + startAttribute+ " " + startRed +","
		// +startGreen +"," + startBlue + " end: " +endAttribute +" " +endRed
		// +"," + endGreen +"," + endBlue );

		generateLine(line, startCoordinate, endCoordinate, startRed,
				startGreen, startBlue, endRed, endGreen, endBlue);

	});

}// END: generateLines

// ---GENERATE LINE--//

function generateLine(line, startCoordinate, endCoordinate, startRed,
		startGreen, startBlue, endRed, endGreen, endBlue) {

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

//		console.log(segmentRed+", "+segmentGreen + ", "+segmentBlue);
		
		generateLineSegment(segmentStartLongitude, segmentStartLatitude,
				segmentEndLongitude, segmentEndLatitude, segmentRed,
				segmentGreen, segmentBlue, "0.3px");

	}// END: slices loop

}// END: generateLine

function generateLineSegment(startLongitude, startLatitude, endLongitude,
		endLatitude, segmentRed, segmentGreen, segmentBlue, width) {

//	segmentRed = 50; 
//	segmentGreen = 50; 
//	segmentBlue = 250;
	
	g.append("path").datum(
			{
				type : "LineString",
				coordinates : [ [ startLongitude, startLatitude ],
						[ endLongitude, endLatitude ] ]
			}) //
	.attr("d", path).attr("fill", "none") //
	.attr("class", "arc") //
	.attr("stroke",
			"rgb(" + segmentRed + "," + segmentGreen + "," + segmentBlue + ")") //
	.attr("stroke-width", width);

}// END: generateLineSegment

// /////////////////
// ---RENDERING---//
// /////////////////

// ---MAP BACKGROUND---//

d3.select(window).on("resize", throttle);

var zoom = d3.behavior.zoom() //
.scaleExtent([ 1, 9 ]) //
.on("zoom", move);

setup(width, height);

d3.json("data/world-topo-min.json", function(error, world) {

	topo = topojson.feature(world, world.objects.countries).features;
	draw(topo);

});

// ---DRAW DATA---//

d3.json("data/test_discrete.json", function(json) {

	var locations = json.locations;
	var locationIds = [];
	locations.forEach(function(location) {

		locationIds.push(location.id);

	});

	var polygons = null;
	var lines = null;
	var layers = json.layers;
	layers.forEach(function(layer) {

		polygons = layer.polygons;
		populatePolygonMaps(polygons);
		generatePolygons(polygons, locations, locationIds);

		lines = layer.lines;
		populateLineMaps(lines);
		generateLines(lines, locations, locationIds);

	});

	d3.select(polygonAreaSelect).on('change', function() {

		g.selectAll(".polygon").remove();
		generatePolygons(polygons, locations, locationIds);

	});

	d3.select(polygonColorSelect).on('change', function() {

		g.selectAll(".polygon").remove();
		generatePolygons(polygons, locations, locationIds);

	});

});

// ///////

