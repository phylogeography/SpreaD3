/**
 * @fbielejec
 */

// ////////////////////////
// ---GLOBAL VARIABLES---//
// ////////////////////////
var width = document.getElementById('container').offsetWidth;
var height = width / 2;

var sliceCount = 5;

var topo;
var projection;
var path;
var svg;
var g;

var throttleTimer;

var graticule = d3.geo.graticule();

var tooltip = d3.select("#container").append("div").attr("class",
		"tooltip hidden");

var locations;

var polygonsMap = [];
var currentPolygons = null;
// var polygonsMap = {};
var polygonAttributeValues = [];
var polygonAttributeMinMax = [];
var polygonAreaSelect;
var polygonColorSelect;

var lines;
// var lineSegmentsMap = {};
var lineValueMap = [];
var lineMinMaxMap = [];
var lineWidthSelect;
var lineColorSelect;

// /////////////////
// ---FUNCTIONS---//
// /////////////////


//find the top left and bottom right of current projection
function mercatorBounds(projection, maxlat) {
 
	var yaw = projection.rotate()[0],
     xymax = projection([-yaw+180-1e-6,-maxlat]),
     xymin = projection([-yaw-180+1e-6, maxlat]);
 
 return [xymin,xymax];

}

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
	.on("click", click);

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

// TODO

var tlast = [0, 0];

// set up the scale extent and initial scale for the projection
var b = mercatorBounds(projection, maxlat);
var s = width / (b[1][0] - b[0][0]);
var scaleExtent = [s, 10 * s];

//////////

function redraw() {
	
	width = document.getElementById('container').offsetWidth;
	height = width / 2;
	d3.select('svg').remove();
	setup(width, height);
	
	
	//TODO
		
	var t = d3.event.translate;      
	
	
	var dx = t[0] - tlast[0];
	var dy = t[1] - tlast[1];
	var yaw = projection.rotate()[0];
	var tp = projection.translate();
	
	// use x translation to rotate based on current scale
    projection.rotate([yaw + 360.0 * dx / width * scaleExtent[0] / scale, 0, 0]);
	
	 tlast = t;
	
	////////////
	
	
	draw(topo);
	
}// END: redraw

// ---MOVE---//

function move() {

	var t = d3.event.translate;
	var s = d3.event.scale;
	// zscale = s;
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

	// paint all, then manipulate visibility according to dates

	var timeLine = json.timeLine;
	var startDate = new Date(timeLine.startTime);
	var endDate = new Date(timeLine.endTime);

	// initial value
	var currentDateDisplay = d3.select('#currentDate').text(
			dateFormat(startDate));

	var timeScale = d3.time.scale.utc().domain([ startDate, endDate ]).range(
			[ 0, 1 ]);
	var timeSlider = d3.slider().scale(timeScale).axis(d3.svg.axis());
	d3.select('#timeSlider').call(timeSlider);

	locations = json.locations;
	var locationIds = [];
	locations.forEach(function(location) {

		locationIds.push(location.id);

	});

	var layers = json.layers;
	var polygons = null;
	var lines = null;
	layers.forEach(function(layer) {

		polygons = layer.polygons;
		populatePolygonMaps(polygons);
		generatePolygons(polygons, locations, locationIds);

		lines = layer.lines;
		populateLineMaps(lines);
		generateLines(lines, locations, locationIds);

	});

	// polygon area listener
	d3.select(polygonAreaSelect).on('change', function() {
		
		// TODO: listeners should also 'rewind time', or set the visibility to
		// current setting on the slider
		
		g.selectAll(".polygon").remove();
		generatePolygons(polygons, locations, locationIds);

	});

	// polygon color listener
	d3.select(polygonColorSelect).on('change', function() {

		g.selectAll(".polygon").remove();
		generatePolygons(polygons, locations, locationIds);

	});

	// line color listener
	d3.select(lineColorSelect).on('change', function() {

		g.selectAll(".line").remove();
		generateLines(lines, locations, locationIds);

	});

	// time slider listener
	timeSlider.on('slide', function(evt, value) {

		var currentDate = timeScale.invert(timeScale(value));
		currentDateDisplay.text(dateFormat(currentDate));

		// set transparency (opacity) on elements up to current date

		// polygons
		d3.selectAll(".polygon")[0]
				.filter(function(polygon) {

					var polygonStartDate = new Date(
							polygon.attributes.startTime.value);
					if (polygonStartDate <= value) {

						d3.select(polygon) //
						.transition() //
						.duration(750) //
						.attr("opacity", 1);

					} else {

						d3.select(polygon).attr("opacity", 0);
						
//						polygon.setAttribute('opacity', 0);

					}// END: date check

				});// END: filter

		// lines
		d3.selectAll(".line")[0].filter(function(line) {

			var lineStartDate = new Date(line.attributes.startTime.value);
			if (lineStartDate <= value) {

				d3.select(line) //
				.transition() //
				.duration(750) //
				.attr("opacity", 1);

			} else {

				d3.select(line).attr("opacity", 0);
				
//				line.setAttribute('opacity', 0);

			}// END: date check

		});// END: filter

	});// END: slide

});
