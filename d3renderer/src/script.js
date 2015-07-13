/**
 * @fbielejec
 */

// ////////////////////////
// ---GLOBAL VARIABLES---//
// ////////////////////////
var width = document.getElementById('container').offsetWidth;
var height = width / 2;

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

				// console.log("FUBAR");

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
	draw(countries);

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
	d3.selectAll(".country")//
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

	var keys = Object.keys(polygonMinMaxMap);

	polygonAreaSelect = document.getElementById("selectPolygonAreaAttribute");
	for (var i = 0; i < keys.length; i++) {

		var option = keys[i];
		var element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		polygonAreaSelect.appendChild(element);

	}// END: i loop

	polygonColorSelect = document.getElementById("selectPolygonColorAttribute");
	for (var i = 0; i < keys.length; i++) {

		var option = keys[i];
		var element = document.createElement("option");
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

	// TODO : discrete attributes
	// var colorAttribute = polygonColorSelect.options[1].text;

	var numC = 9;
	var cbMap;

	cbMap = colorbrewer["Reds"];
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

function generatePolygon(polygon, locations, locationIds, //
area, // 
red, green, blue//
) {

	if (polygon.hasLocation) {

		var locationId = polygon.location;
		var index = locationIds.indexOf(locationId);

		var location = locations[index];
		var coordinate = location.coordinate;

		var latitude = coordinate.yCoordinate;
		var longitude = coordinate.xCoordinate;
		// TODO: fancy koda labels
		var label = location.id;

		var x = projection([ latitude, longitude ])[0];
		var y = projection([ latitude, longitude ])[1];

		var radius = Math.sqrt(area / Math.PI);

		// console.log("rgb(" +red + "," +green + "," + blue + ")");

		g.append("circle") //
		.attr("cx", x) //
		.attr("cy", y) //
		.attr("r", radius + "px")//
		.attr("fill", "rgb(" + red + "," + green + "," + blue + ")");

	} else {

		// TODO

	}// END: hasLocation check

}// END: generatePolygon

// ---GENERATE LINES--//

function generateLines(lines, locations, locationIds) {

	lines.forEach(function(line) {

		var locationId = line.startLocation;
		var index = locationIds.indexOf(locationId);
		var location = locations[index];
		var startCoordinate = location.coordinate;

		locationId = line.endLocation;
		index = locationIds.indexOf(locationId);
		location = locations[index];
		endCoordinate = location.coordinate;

		generateLine(line, startCoordinate, endCoordinate);

	});

}// END: generateLines

// ---GENERATE LINE--//

function generateLine(line, startCoordinate, endCoordinate) {

	var startLatitude = startCoordinate.xCoordinate;
	var startLongitude = startCoordinate.yCoordinate;

	var endLatitude = endCoordinate.xCoordinate;
	var endLongitude = endCoordinate.yCoordinate;

	g.append("path").datum(
			{
				type : "LineString",
				coordinates : [ [ startLongitude, startLatitude ],
						[ endLongitude, endLatitude ] ]
			}).attr("class", "arc").attr("d", path).attr("fill", "none").attr(
			"stroke", "red").attr("stroke-width", "3px");

}// END: generateLine

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

// populate menus, get min-max maps
d3.json("data/test_discrete.json", function(json) {

	var layers = json.layers;
	layers.forEach(function(layer) {

		var polygons = layer.polygons;
		populatePolygonMaps(polygons);

	});

});

// ---DRAW DATA---//

d3.json("data/test_discrete.json", function(json) {

	var locations = json.locations;
	var locationIds = [];
	locations.forEach(function(location) {

		locationIds.push(location.id);

	});

	var layers = json.layers;
	layers.forEach(function(layer) {

		var polygons = layer.polygons;
		generatePolygons(polygons, locations, locationIds);

		var lines = layer.lines;
		// generateLines(lines, locations, locationIds);

	});

});
