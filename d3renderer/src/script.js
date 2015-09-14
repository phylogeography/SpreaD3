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

//var projection;
var projection = d3.geo.mercator();

var doneOnce = false;

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

	// ---MAP LAYER---//

	layers.forEach(function(layer) {

		var type = layer.type
		if (type == MAP) {

//			var topo = layer.geojson;
//			generateTopoLayer(topo);
//			mapRendered = true;

		}

	});

	if (!mapRendered) {
		d3.json("data/world.geojson", function ready(error, topo) {
			
			generateTopoLayer(topo);
//			mapRendered = true;
			
		});
	}// END: mapRendered check

	// ---DATA LAYER---//

	layers.forEach(function(layer) {

		var type = layer.type
		if (type == DATA) {

			points = layer.points;
			lines = layer.lines;
			generateLines(lines, points);

		}

	});

	// ---LISTENERS---//

	// time slider listener
	timeSlider.on('slide', function(evt, value) {

		var currentDate = timeScale.invert(timeScale(value));
		currentDateDisplay.text(dateFormat(currentDate));

		// TODO: hook up slider and offsets for travelling paths animation
		d3.selectAll(".line")[0]
				.forEach(function(line) {

					var linePath = d3.select(line)
					var totalLength = linePath.node().getTotalLength();

					var lineStartDate = new Date(
							linePath.node().attributes.startTime.value);
					var lineEndDate = new Date(
							linePath.node().attributes.endTime.value);

					if (lineEndDate <= value) {

						linePath.attr("stroke-dasharray",
								totalLength + " " + totalLength) //
						.attr("stroke-dashoffset", totalLength) //
						.attr("opacity", 0)//
						.transition() //
						.duration(750) //
						.ease("linear") //
						.attr("stroke-dashoffset", 0) //
						.attr("opacity", 1);

					} else {

						linePath.attr("stroke-dasharray",
								totalLength + " " + totalLength) //
						.attr("stroke-dashoffset", totalLength) //
						.attr("opacity", 0);

					}// END: date check

				});// END: filter

	});// END: slide

} // END: function
);
