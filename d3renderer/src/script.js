/**
 * @fbielejec
 */

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

	/*
	 * Geo translation on mouse click in map
	 */

	var latlon = projection.invert(d3.mouse(this));
	// console.log(latlon);
}// END: click

// ///////////////////////
// ---GLOBAL VARIABLES---//
// ///////////////////////

// size
var width = document.getElementById('container').offsetWidth;
var height = width / 2;

// var topo;
var projection;
var path;
var svg;
var g;

var throttleTimer;

var graticule = d3.geo.graticule();

var tooltip = d3.select("#container").append("div").attr("class",
		"tooltip hidden");

// //////////////////////
// ---MAP BACKGROUND---//
// //////////////////////

d3.select(window).on("resize", throttle);

var zoom = d3.behavior.zoom() //
.scaleExtent([ 1, 9 ]) //
.on("zoom", move);

setup(width, height);

d3.json("data/world-topo-min.json", function(error, world) {

	var countries = topojson.feature(world, world.objects.countries).features;

	// topo = countries;
	draw(countries);

});

// /////////////////
// ---RENDERING---//
// /////////////////

// TODO populate menus, get min-max maps

d3.json("data/test_discrete.json", function(json) {

	var layers = json.layers;
	layers.forEach(function(layer) {

		var polygons = layer.polygons;
		populateMenus(polygons);

	});

});

// https://sunfishempire.wordpress.com/2014/08/19/5-ways-to-use-a-javascript-hashmap/
function populateMenus(polygons) {

	var minmaxMap = [];

	polygons.forEach(function(polygon) {

		var attributes = polygon.attributes;
		for ( var property in attributes) {

			if (!(property in minmaxMap)) {

				minmaxMap[property] = {
					min : attributes[property].id,
					max : attributes[property].id
				};

			} else {

				var min = minmaxMap[property].min;
				var candidateMin = attributes[property].id;

				if (candidateMin < min) {
					minmaxMap[property].min = candidateMin;
				}

				var max = minmaxMap[property].max;
				var candidateMax = attributes[property].id;

				if (candidateMax > max) {
					minmaxMap[property].max = candidateMax;
				}

			}// END: key check

		}// END: attributes loop

	});// END: polygons loop

	// printMap(minmaxMap);
	var keys = Object.keys(minmaxMap);

	var select = document.getElementById("selectAreaAttribute");
	for (var i = 0; i < keys.length; i++) {
		var opt = keys[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	}// END: i loop

}//END: 










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

		// TODO: generate lines

	});

});

function generatePolygons(polygons, locations, locationIds) {

	// var areaAttributes = [];
	polygons.forEach(function(polygon) {

		generatePolygon(polygon, locations, locationIds);

		// var attributes = polygon.attributes;
		// for ( var property in attributes) {
		// if (attributes.hasOwnProperty(property)) {
		//
		// if (jQuery.inArray(property, areaAttributes) == -1) {
		//
		// areaAttributes.push(property);
		//
		// }//END: contains check
		//
		// }// END: property check
		// }// END: attributes loop

	});

}// END: generatePolygons

function generatePolygon(polygon, locations, locationIds) {

	// TODO
	// different shapes
	// area
	// color
	// opacity

	var minAreaMapping = 1;
	var maxAreaMapping = 100;

	var areaScale = d3.scale.linear() //
	// TODO: max and min
	.domain([ 1, 16 ]) //
	.range([ minAreaMapping, maxAreaMapping ]);

	// console.log(polygon.attributes.count.id);

	if (polygon.hasLocation) {

		var locationId = polygon.location;
		var index = locationIds.indexOf(locationId);

		var location = locations[index];
		var coordinate = location.coordinate;

		var latitude = coordinate.yCoordinate;
		var longitude = coordinate.xCoordinate;
		var label = location.id;

		var x = projection([ latitude, longitude ])[0];
		var y = projection([ latitude, longitude ])[1];

		// TODO: scales for r, color, opacity
		var area = areaScale(polygon.attributes.count.id);
		var radius = Math.sqrt(area / Math.PI);

		g.append("circle") //
		.attr("cx", x) //
		.attr("cy", y) //
		.attr("r", radius + "px")//
		.attr("fill", "red");

	} else {

		// TODO

	}// END: hasLocation check

}// END: generatePolygon

// function generateLocation(location) {
//
// var coordinate = location.coordinate;
//
// var latitude = coordinate.yCoordinate;
// var longitude = coordinate.xCoordinate;
// var label = location.id;
//
// var x = projection([ latitude, longitude ])[0];
// var y = projection([ latitude, longitude ])[1];
//
// var gpoint = g.append("g").attr("class", "gpoint");
//
// gpoint.append("svg:circle").attr("cx", x).attr("cy", y).attr("class",
// "point").attr("r", 1.5);
//
// gpoint.append("text").attr("x", x + 2).attr("y", y + 2).attr("class",
// "text").text(label);
//
// }//END: generateLocation

