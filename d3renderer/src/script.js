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
var width = document.getElementById('container').offsetWidth; 
var height = width / 2; 
var graticule = d3.geo.graticule();

//
// ---DATA---//
//

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

function initializeLayers(layers) {

	// ---DATA LAYER---//

	layers.forEach(function(layer) {

		var type = layer.type
		if (type == DATA) {

			points = layer.points;
			var lines = layer.lines;
			generateLines(lines, points);

		}

	});

}// END: initializeLayers

function update(value, timeScale, currentDateDisplay, dateFormat) {

	var currentDate = timeScale.invert(timeScale(value));
	currentDateDisplay.text(dateFormat(currentDate));

	//---select travelling lines---//
	linesLayer.selectAll("path.line") //
	.filter(function(d) {

		var linePath = this;
		var lineStartDate = Date.parse(linePath.attributes.startTime.value);
		var lineEndDate = Date.parse(linePath.attributes.endTime.value)

		return (lineStartDate <= value && value <= lineEndDate);
	}) //
	.transition() //
	.ease("linear") //
	.attr("stroke-dashoffset", function(d, i) {
		
		var linePath = this;
		var totalLength = linePath.getTotalLength();
		
		var lineStartDate = Date.parse(linePath.attributes.startTime.value);
		var lineEndDate = Date.parse(linePath.attributes.endTime.value);
		var duration = lineEndDate - lineStartDate;
		var timePassed = value - lineStartDate;

		var offset = totalLength;
		if(duration == 0) {
			
			offset = 0;
			
		} else {
			
		offset = map(timePassed, 0, duration, 0, totalLength);
		offset = totalLength - offset;
		
		}// END: instantaneous line check
		
		return (offset);
	}) //
	.attr("opacity", 1)
	;
	
	
	//---select lines yet to be painted---//
	linesLayer.selectAll("path.line") //
	.filter(function(d) {
		var linePath = this;
		var lineStartDate = Date.parse(linePath.attributes.startTime.value);

		return (lineStartDate > value);
	}) //
	.attr("stroke-dashoffset", function(d, i) {
		var linePath = this;
		var totalLength = linePath.getTotalLength();
		
		return (totalLength);
	}) //
	.attr("opacity", 0)
	;

	
	//---select lines already painted---//
	linesLayer.selectAll("path.line") //
	.filter(function(d) {
		var linePath = this;
		var lineEndDate = Date.parse(linePath.attributes.endTime.value)

		return (lineEndDate < value);
	}) //
	.attr("stroke-dashoffset", 0) //
	.attr("opacity", 1)
	;
	
	

}// END: update

function initializeTimeSlider(timeSlider, timeScale, currentDateDisplay,
		dateFormat) {

	// time slider listener
	timeSlider.on('slide', function(evt, value) {

		update(value, timeScale, currentDateDisplay, dateFormat);
		currentSliderValue = value;

	});// END: slide

}// END: initializeTimeSlider

// /////////////////
// ---RENDERING---//
// /////////////////

// ---DRAW MAP BACKGROUND---//

var zoom = d3.behavior.zoom().scaleExtent([ 1, 9 ]).on("zoom", move);

// layers
var svg = d3.select("#container").append('svg').attr('width', width).attr(
		'height', height).call(zoom);

var g = svg.append("g");
var equatorLayer = g.append("g");
var topoLayer = g.append("g");

//var pointsLayer = g.append("g");
//var areasLayer = g.append("g");
var linesLayer = g.append("g");
var locationsLayer = g.append("g");
var labelsLayer = g.append("g");

var projection;

// time slider
var playing = false;
var processID;
var currentSliderValue;
var sliderInterval = 86400000;
var sliderStartValue;
var sliderEndValue;

d3.json("data/ebov_discrete.json", function ready(error, json) {

	// -- TIME LINE-- //

	var dateFormat = d3.time.format("%Y-%m-%d");
	var timeLine = json.timeLine;

	var startDate = new Date(timeLine.startTime);
	var endDate = new Date(timeLine.endTime);

	 sliderStartValue = Date.parse(timeLine.startTime);
	 sliderEndValue = Date.parse(timeLine.endTime);
	 currentSliderValue = sliderStartValue;

	// initial value
	var currentDateDisplay = d3.select('#currentDate').text(
			dateFormat(startDate));

	var timeScale = d3.time.scale.utc().domain([ startDate, endDate ]).range(
			[ 0, 1 ]);
	var timeSlider = d3.slider().scale(timeScale).axis(d3.svg.axis());
	d3.select('#timeSlider').call(timeSlider);

	// ---ATTRIBUTES---//

	var attributes = json.uniqueAttributes;
	populatePanels(attributes);

	
	
	// ---LAYERS---//

	var layers = json.layers;
	var mapRendered = false;

	// ---MAP LAYER---//

	layers.forEach(function(layer) {

		var type = layer.type
		if (type == MAP) {

			var topo = layer.geojson;
			generateTopoLayer(topo);
			mapRendered = true;

		}

	});

	// if no geojson layer render world map
	if (!mapRendered) {

		function readynow(error, world) {

			generateWorldLayer(world);
			// mapRendered = true;

			// ---DATA LAYERS---//

			initializeTimeSlider(timeSlider, timeScale, currentDateDisplay,
					dateFormat);
			initializeLayers(layers);

		}

		queue().defer(d3.json, "data/world.geojson").await(readynow);

	} else {

		// ---TIME SLIDER---//

		initializeTimeSlider(timeSlider, timeScale, currentDateDisplay,
				dateFormat);
		// put slider at the end of timeLine, everything painted
        timeSlider.value(sliderEndValue);
		
		var playPauseButton = d3.select('#playPause')
				.attr("class", "playPause").on(
						"click",
						function() {

							if (playing) {
								playing = false;
								playPauseButton.classed("playing", playing);

								clearInterval(processID);

							} else {
								playing = true;
								playPauseButton.classed("playing", playing);

								processID = setInterval(function() {
								
									var sliderValue = currentSliderValue + sliderInterval;
									if (sliderValue > sliderEndValue) {
										sliderValue = sliderStartValue;
									}

									timeSlider.value(sliderValue);
									update(sliderValue, timeScale, currentDateDisplay, dateFormat);

									currentSliderValue = sliderValue;

								}, 100);

							}// END: playing check

						});

		// ---DATA LAYERS---//

		initializeLayers(layers);

		// ---LOCATIONS---//
		// TODO
		var locations = json.locations;
		generateLocations(locations);
		generateLabels(locations);
		
		
//		console.log(locations);
		
		
		
		
		
	}// END: mapRendered check

} // END: function
);
