/**
 * @fbielejec
 */

// console.log("Slider:" + dateFormat(new Date(value)));
// console.log(line.attributes.startTime.value);
// ///////////////////
// --- VARIABLES ---//
// ///////////////////
//
// ---MAP---//
//
var width = document.getElementById('container').offsetWidth; // 600;
var height = width / 2; // 400;
var graticule = d3.geo.graticule();

//
// ---DATA---//
//

var attributes;
var lines;
// var lineValueMap = [];
// var lineMinMaxMap = [];

// /////////////////
// ---FUNCTIONS---//
// /////////////////

function move() {

	var t = d3.event.translate;
	var s = d3.event.scale;
	var h = height / 4;

	t[0] = Math
			.min((width / height) * (s - 1), Math.max(width * (1 - s), t[0]));

	t[1] = Math.min(h * (s - 1) + h * s, Math.max(height * (1 - s) - h * s,
			t[1]));

	zoom.translate(t);
	g.attr("transform", "translate(" + t + ")scale(" + s + ")");

	// fit the paths to the zoom level
	d3.selectAll(".country").style("stroke-width", 1.0 / s);
	d3.selectAll(".line").style("stroke-width", 1.0 / s);

}// END: move

// /////////////////
// ---RENDERING---//
// /////////////////

// ---DRAW MAP BACKGROUND---//

var zoom = d3.behavior.zoom().scaleExtent([ 1, 9 ]).on("zoom", move);

var svg = d3.select("#container").append('svg').attr('width', width).attr(
		'height', height).call(zoom);

var g = svg.append("g");
var equatorLayer = g.append("g");
var topoLayer = g.append("g");

var pointsLayer = g.append("g");
var areasLayer = g.append("g");
var linesLayer = g.append("g");

var projection = d3.geo.mercator();

d3.json("data/ebov_discrete.json", function ready(error, json) {

	// -- TIME-- //
	
	var dateFormat = d3.time.format("%Y-%m-%d");
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
	
	// ---ATTRIBUTES---//

	attributes = json.uniqueAttributes;
	populatePanels(attributes);
	
	// ---LAYERS---//

	var layers = json.layers;
	var mapRendered = false;
	
	// First render a map layer
	layers.forEach(function(layer) {
		
		var type = layer.type
		if (type == MAP) {

			var topo = layer.geojson;
			generateTopoLayer(topo );
			mapRendered = true;
		} 	

	});
	
	if(!mapRendered) {
		//TODO: generate world map
	}
	
	// Then render data layers
	layers.forEach(function(layer) {
		
		var type = layer.type
		if (type == DATA) {

			points = layer.points;
			lines = layer.lines;
			 generateLines(lines, points );
			
		} 	

	});
	
	

} // END: function
);



//d3.json("data/combined.topojson", function ready(error, map) {
//
//	var topo = topojson.feature(map, map.objects.collection);
//
//	// first guess for the projection
//	var center = d3.geo.centroid(topo);
//	var scale = 150;
//	var offset = [ width / 2, height / 2 ];
//	projection = d3.geo.mercator().scale(scale).center(center)
//			.translate(offset);
//	path = d3.geo.path().projection(projection);
//
//	// determine the bounds
//	var bounds = path.bounds(topo);
//	var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
//	var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
//	var scale = (hscale < vscale) ? hscale : vscale;
//	var offset = [ width - (bounds[0][0] + bounds[1][0]) / 2,
//			height - (bounds[0][1] + bounds[1][1]) / 2 ];
//
//	// new projection
//	projection = d3.geo.mercator().center(center).scale(scale)
//			.translate(offset);
//	// new path
//	path = path.projection(projection);
//
//	// add a rectangle to see the bound of the svg
////	svg.append("rect").attr('width', width).attr('height', height).style(
////			'stroke', 'white').style('fill', 'none');
//
//	// add graticule
//	svg.append("path").datum(graticule).attr("class", "graticule").attr("d",
//			path);
//
//	// add equator
//	equatorLayer.append("path").datum(
//			{
//				type : "LineString",
//				coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
//						[ 180, 0 ] ]
//			}).attr("class", "equator").attr("d", path);
//
//	// add map data
//	topoLayer.append("path").datum(topo).attr("class", "country").attr('d',
//			path).style("stroke-width", .5).style("fill", "#282828").style(
//			"stroke", "#C0C0C0");
//
//});


//d3.json("data/ebov_discrete.json", function(json) {
//
//	// -- DATA-- //
//
//	// locations = json.locations;
//	// var locationIds = [];
//	// locations.forEach(function(location) {
//	//
//	// locationIds.push(location.id);
//	//
//	// });
//
//	// -- TIME-- //
//	var dateFormat = d3.time.format("%Y-%m-%d");
//	var timeLine = json.timeLine;
//	var startDate = new Date(timeLine.startTime);
//	var endDate = new Date(timeLine.endTime);
//
//	// initial value
//	var currentDateDisplay = d3.select('#currentDate').text(
//			dateFormat(startDate));
//
//	var timeScale = d3.time.scale.utc().domain([ startDate, endDate ]).range(
//			[ 0, 1 ]);
//	var timeSlider = d3.slider().scale(timeScale).axis(d3.svg.axis());
//	d3.select('#timeSlider').call(timeSlider);
//
//	// ---ATTRIBUTES---//
//
//	attributes = json.uniqueAttributes;
//	populatePanels(attributes);
//
//	// console.log(attributes);
//
//	// ---LAYERS---//
//
//	var layers = json.layers;
//	layers.forEach(function(layer) {
//
//		points = layer.points;
//		lines = layer.lines;
//
//		 generateLines(lines, points);
//
//	});
//
//	// ---LISTENERS---//
//
//	// time slider listener
//	timeSlider.on('slide', function(evt, value) {
//
//		var currentDate = timeScale.invert(timeScale(value));
//		currentDateDisplay.text(dateFormat(currentDate));
//
//		// TODO:
//		// animation begins at the startTime, ends at the endTime
//		d3.selectAll(".line")[0]
//				.filter(function(line) {
//
//					var linePath = d3.select(line)
//					var totalLength = linePath.node().getTotalLength();
//
//					var lineStartDate = new Date(
//							linePath.node().attributes.startTime.value);
//					var lineEndDate = new Date(
//							linePath.node().attributes.endTime.value);
//
//					if (lineEndDate <= value) {
//
//						linePath.attr("stroke-dasharray",
//								totalLength + " " + totalLength) //
//						.attr("stroke-dashoffset", totalLength) //
//						.attr("opacity", 0)//
//						.transition() //
//						.duration(750) //
//						.ease("linear") //
//						.attr("stroke-dashoffset", 0) //
//						.attr("opacity", 1);
//
//					} else {
//
//						linePath.attr("stroke-dasharray",
//								totalLength + " " + totalLength) //
//						.attr("stroke-dashoffset", totalLength) //
//						.attr("opacity", 0);
//
//					}// END: date check
//
//				});// END: filter
//
//	});// END: slide
//
//});
