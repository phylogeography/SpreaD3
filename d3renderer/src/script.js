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
//var polygonsMap = {};
var polygonAttributeValues = [];
var polygonAttributeMinMax = [];
var polygonAreaSelect;
var polygonColorSelect;

var lines;
//var lineSegmentsMap = {};
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
	
	var dateFormat = d3.time.format("%Y-%m-%d");
	
	var timeLine = json.timeLine;
	var startDate = new Date(timeLine.startTime);
	var endDate = new Date(timeLine.endTime);

	// initial value
	var currentDateDisplay = d3.select('#currentDate').text(dateFormat(startDate));

	var timeScale = d3.time.scale().domain([ startDate, endDate ]).range([0,1]);
	var timeSlider = d3.slider().scale(timeScale).axis(d3.svg.axis());
	d3.select('#timeSlider').call(timeSlider);
	
	locations = json.locations;
	var locationIds = [];
	locations.forEach(function(location) {

		locationIds.push(location.id);

	});

	var layers = json.layers;
	var polygons=null ;
	layers.forEach(function(layer) {

		polygons = layer.polygons;
		populatePolygonMaps(polygons);
		generatePolygons(polygons, locations, locationIds);
		
		currentPolygons = polygonsMap;
        paintPolygons(currentPolygons);
		
		
		
//		lines = layer.lines;
//		populateLineMaps(lines);
//		generateLines(lines, locations, locationIds);

	});
	
	
	// polygon area listener
	d3.select(polygonAreaSelect).on('change', function() {
	
			generatePolygons(polygons, locations, locationIds);
			paintPolygons(currentPolygons);
			 
		});
	
	// polygon color listener
		d3.select(polygonColorSelect).on('change', function() {
	
			generatePolygons(polygons, locations, locationIds);
			paintPolygons(currentPolygons);
			 
		});
	
	    // time slider listener
		timeSlider.on('slide', function(evt, value) {

			var currentDate = timeScale.invert(timeScale(value));
			currentDateDisplay.text(dateFormat(currentDate));

			// paint polygons up to current date		
			var layers = json.layers;
			layers.forEach(function(layer) {
				
				currentPolygons = polygonsMap.filter(
						function(polygon) { 
							
							var polygonStartDate = new Date(polygon.startTime);
							if(polygonStartDate <= value) {
								return polygon;
							}
							
						}
						) ;
				
			});
			
			 paintPolygons(currentPolygons);
			
		});
	
	
});

//d3.json("data/test_discrete.json", function(json) {
//
//	var dateFormat = d3.time.format("%Y-%m-%d");
//
//	var timeLine = json.timeLine;
//	var startDate = new Date(timeLine.startTime);
//	var endDate = new Date(timeLine.endTime);
//
//	// initial value
//	var currentDateDisplay = d3.select('#currentDate').text(dateFormat(startDate));
//
//	var timeScale = d3.time.scale().domain([ startDate, endDate ]).range([0,1]);
//	var timeSlider = d3.slider().scale(timeScale).axis(d3.svg.axis());
//	d3.select('#timeSlider').call(timeSlider);
//
////	time slider listener
//	timeSlider.on('slide', function(evt, value) {
//
//		var currentDate = timeScale.invert(timeScale(value));
//		currentDateDisplay.text(dateFormat(currentDate));
//
////		console.log(currentDate);
//		
//		// TODO: paint polygons up to current date		
//		var layers = json.layers;
//		var poly2=null;
//		layers.forEach(function(layer) {
//			
//			var poly = layer.polygons;
//			
//			 poly2 = poly.filter(
//					function(d) { 
//						
//						var polygonStartDate = new Date(d.startTime);
//						if(polygonStartDate <= value) {
//							return d;
//						}
//						
//					}
//					) ;
//			
//		});
//		
//		console.log(poly2);
//		
//	});
//
//	
//	
//	
//	
//	
//	
//	
//	
//	
//	
//	
//	locations = json.locations;
//	var locationIds = [];
//	locations.forEach(function(location) {
//
//		locationIds.push(location.id);
//
//	});
//
//	var layers = json.layers;
//	layers.forEach(function(layer) {
//
//		polygons = layer.polygons;
//		populatePolygonMaps(polygons);
//		generatePolygons(polygons, locations, locationIds);
//
//		lines = layer.lines;
//		populateLineMaps(lines);
//		generateLines(lines, locations, locationIds);
//
//	});
//
//	d3.select(polygonAreaSelect).on('change', function() {
//
//		g.selectAll(".polygon").remove();
//		generatePolygons(polygons, locations, locationIds);
//
//	});
//
//	d3.select(polygonColorSelect).on('change', function() {
//
//		g.selectAll(".polygon").remove();
//		generatePolygons(polygons, locations, locationIds);
//
//	});
//
//	d3.select(lineColorSelect).on('change', function() {
//
//		g.selectAll(".line").remove();
//		generateLines(lines, locations, locationIds);
//
//	});
//
//});


