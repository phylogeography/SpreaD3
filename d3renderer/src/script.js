/**
 * @fbielejec
 */

// ///////////////////
// --- VARIABLES ---//
// ///////////////////

//---MAP---//

var width = document.getElementById('container').offsetWidth;
var height = width / 2;
var rotate = 60;
var maxlat = 83;

var projection = d3.geo.mercator() //
.rotate([ rotate, 0 ]) //
.scale(1) //
.translate([ width / 2, height / 2 ]);

// set up the scale extent and initial scale for the projection
var b = mercatorBounds(projection, maxlat);
var s = width / (b[1][0] - b[0][0]);
var scaleExtent = [ s, 10 * s ];

var tlast = [ 0, 0 ];
var slast = null;

var zoom = d3.behavior.zoom() //
.scaleExtent(scaleExtent) //
//.scale(projection.scale()) //
//.translate([ 0, 0 ]) //
.on("zoom", redraw);

//var topo;
var path;
var svg;
var g;

var graticule = d3.geo.graticule();

var throttleTimer;

//---DATA---//

var sliceCount = 5;

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

function mercatorBounds(projection, maxlat) {

	var yaw = projection.rotate()[0];
	var xymax = projection([ -yaw + 180 - 1e-6, -maxlat ]);
	var xymin = projection([ -yaw - 180 + 1e-6, maxlat ]);

	return [ xymin, xymax ];
}// END: mercatorBounds

function click() {
	projection.invert(d3.mouse(this));
}// END: click

function throttle() {

	window.clearTimeout(throttleTimer);
	throttleTimer = window.setTimeout(function() {
		redraw();
	}, 200);

}// END: throttle

function setup(width, height) {

	 path = d3.geo.path().projection(projection);

	 svg = d3.select("#container").append("svg") //
	.attr("width", width) //
	.attr("height", height) //
	.call(zoom) //
	 .on("click", click);

	 g = svg.append("g");

}// END: setup

function redraw(topo) {

	if (d3.event) {

		var scale = d3.event.scale;
		var t = d3.event.translate;

		if (scale != slast) {

			projection.scale(scale);

		} else {

			var dx = t[0] - tlast[0], dy = t[1] - tlast[1];
			var yaw = projection.rotate()[0];
			var tp = projection.translate();

			// use x translation to rotate based on current scale
			projection.rotate([
					yaw + 360. * dx / width * scaleExtent[0] / scale, 0, 0 ]);
			// use y translation to translate projection, clamped by min/max
			var b = mercatorBounds(projection, maxlat);

			if (b[0][1] + dy > 0) {

				dy = -b[0][1];

			} else if (b[1][1] + dy < height) {

				dy = height - b[1][1];

			}

			projection.translate([ tp[0], tp[1] + dy ]);
		}

		// save last values. resetting zoom.translate() and scale() would
		// seem equivalent but doesn't seem to work reliably?
		slast = scale;
		tlast = t;

	}

	// grid of longitude and latitude lines
	svg.append("path") //
	.datum(graticule) //
	.attr("class", "graticule") //
	.attr("d", path);

	// equator
	g.append("path") //
	.datum(
			{
				type : "LineString",
				coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
						[ 180, 0 ] ]
			}) //
	.attr("class", "equator") //
	.attr("d", path);

	// re-project path data
	var country = g.selectAll(".country").data(topo);

	country.enter().insert("path") //
	.attr("class", "country") //
	.attr("d", path) //
	 .style("fill", "rgb(194, 178, 128)") //
	 .style("stroke", "rgb(0, 0, 0)")
	 ;
	
	// adjust the country hover stroke width based on zoom level
	d3.selectAll(".country") //
	.style("stroke-width", 1.5 / slast) ;
	
	// re-project path data
//	 svg.selectAll('path') //
//	 .attr("class", "country") //
//	 .attr('d', path) //
//	 .style("fill", "rgb(194, 178, 128)") //
//	 .style("stroke", "rgb(0, 0, 0)");

}// END: redraw

// /////////////////
// ---RENDERING---//
// /////////////////

// ---DRAW MAP BACKGROUND---//

d3.select(window).on("resize", throttle);

projection.scale(scaleExtent[0]);

setup(width, height);

d3.json("data/world-topo-min.json", function(error, world) {

	 topo = topojson.feature(world, world.objects.countries).features;

//	 svg.selectAll('path') //
//	 .data(topo) //
//	 .enter() //
//	 .append('path');

	redraw(topo);

});

//---DRAW DATA---//

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
