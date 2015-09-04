/**
 * @fbielejec
 */

// ///////////////////
// --- VARIABLES ---//
// ///////////////////
//
// ---MAP---//
//
var width = document.getElementById('container').offsetWidth; // 600;
var height = width / 2; // 400;

var projection = d3.geo.mercator().translate([ (width / 2), (height / 2) ])
		.scale(width / 2 / Math.PI);

var graticule = d3.geo.graticule();

// /////////////////
// ---FUNCTIONS---//
// /////////////////

function draw() {

	// project path data
	g.selectAll('path.country').attr("class", "country").attr('d', path).style(
			"stroke-width", .5).style("fill", "rgb(194, 178, 128)").style(
			"stroke", "rgb(0, 0, 0)");

}// END: draw

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

	// fit the path to the zoom level
	d3.selectAll(".country").style("stroke-width", 1.0 / s);

}// END: move

// /////////////////
// ---RENDERING---//
// /////////////////

// ---DRAW MAP BACKGROUND---//

var zoom = d3.behavior.zoom().scaleExtent([ 1, 9 ]).on("zoom", move);

var path = d3.geo.path().projection(projection);

var svg = d3.select("#container").append('svg').attr('width', width).attr(
		'height', height).call(zoom);

var g = svg.append("g");

d3.json("data/world-topo-min.json", function ready(error, world) {

	svg.append("path").datum(graticule).attr("class", "graticule").attr("d",
			path);

	g.append("path").datum(
			{
				type : "LineString",
				coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
						[ 180, 0 ] ]
			}).attr("class", "equator").attr("d", path);

	g.selectAll('path').data(
			topojson.feature(world, world.objects.countries).features).enter()
			.append('path').attr("class", "country");

	// draw path data
	draw();
});

// //////////////////////////////////
// --TODO: experiments with arcs---//
// //////////////////////////////////


d3.json("data/test_discrete.json", function(json) {

	// -- DATA-- //
	
	locations = json.locations;
	var locationIds = [];
	locations.forEach(function(location) {

		locationIds.push(location.id);

	});

	var layers = json.layers;
	var lines = null;
	layers.forEach(function(layer) {

		lines = layer.lines;
		generateLines(lines, locations, locationIds);

	});

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

	
	
	// time slider listener
	timeSlider.on('slide', function(evt, value) {

		var currentDate = timeScale.invert(timeScale(value));
		currentDateDisplay.text(dateFormat(currentDate));

		// TODO: animate travel
		
		
		// lines
		d3.selectAll(".line")[0].filter(function(line) {

			var lineEndDate = new Date(line.attributes.endTime.value);
			
			if (lineEndDate <= value) {

				var linePath = d3.select(line);
			    var totalLength = linePath.node().getTotalLength();
				
//			    http://bl.ocks.org/duopixel/4063326
			    
			    linePath
			    .attr("stroke-dasharray", totalLength + " " + totalLength)
			      .attr("stroke-dashoffset", totalLength)
			      .transition()
			        .duration(750)
			        .ease("linear")
			        .attr("stroke-dashoffset", 1);
			    
				
			} else {
				
//				d3.select(line).attr("opacity", 0);
				
			}// END: date check

		});// END: filter

	});// END: slide
	
});

function tweenDash() {

    return function(t) {
        // In original version of this post the next two lines of JS were
        // outside this return which led to odd behavior on zoom
        // Thanks to Martin Raifer for the suggested fix.

        //total length of path (single value)
        var l = linePath.node().getTotalLength(); 
        interpolate = d3.interpolateString("0," + l, l + "," + l); 

        //t is fraction of time 0-1 since transition began
        var marker = d3.select("#marker");
        
        // p is the point on the line (coordinates) at a given length
        // along the line. In this case if l=50 and we're midway through
        // the time then this would 25.
        var p = linePath.node().getPointAtLength(t * l);

        //Move the marker to that point
        marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
        return interpolate(t);
    }
}

function generateLines(lines, locations, locationIds) {

	lines.forEach(function(line) {

		var locationId = line.startLocation;
		var index = locationIds.indexOf(locationId);
		var location = locations[index];
		var startCoordinate = location.coordinate;

		locationId = line.endLocation;
		index = locationIds.indexOf(locationId);
		location = locations[index];
		var endCoordinate = location.coordinate;

		generateLine(line, startCoordinate, endCoordinate);

	});
}

function generateLine(line, startCoordinate, endCoordinate) {

	bend = 1;

	var startLatitude = startCoordinate.xCoordinate;
	var startLongitude = startCoordinate.yCoordinate;

	var endLatitude = endCoordinate.xCoordinate;
	var endLongitude = endCoordinate.yCoordinate;

	var sourceXY = projection([ startLongitude, startLatitude ]);
	var targetXY = projection([ endLongitude, endLatitude ]);

	var sourceX = sourceXY[0]; // lat
	var sourceY = sourceXY[1]; // long

	var targetX = targetXY[0];
	var targetY = targetXY[1];

	var dx = targetX - sourceX;
	var dy = targetY - sourceY;
	var dr = Math.sqrt(dx * dx + dy * dy) * bend;

	var west_of_source = (targetX - sourceX) < 0;
	var bearing;
	if (west_of_source) {
		bearing = "M" + targetX + "," + targetY + "A" + dr + "," + dr
				+ " 0 0,1 " + sourceX + "," + sourceY;
	} else {

		bearing = "M" + sourceX + "," + sourceY + "A" + dr + "," + dr
				+ " 0 0,1 " + targetX + "," + targetY;
	}

	var startTime = line.startTime;
	var endTime = line.endTime;
	
//	 var line = d3.svg.line()
//     .interpolate("cardinal")
//     .x(function(d,i) {return x(i);})
//     .y(function(d) {return y(d);})
	
	g.append("path") //
	.attr("class", "line") //
	.attr("d", bearing) //
	.attr("fill", "none") //
	.attr("stroke-width", 1 + "px") //
	.attr("stroke", "rgb(" + 0 + "," + 0 + "," + 0 + ")") //
	.attr("startTime", startTime) //
	.attr("endTime", endTime) //
	.attr("opacity", 1);

}
