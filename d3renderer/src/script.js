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
			"stroke-width", .5)//
	.style("fill", "rgb(194, 178, 128)").style("stroke", "rgb(0, 0, 0)");

}// END: draw

function move() {

	var t = d3.event.translate;
	var s = d3.event.scale;
	var h = height / 4;

	t[0] = Math.min((width / height) * (s - 1), //
	Math.max(width * (1 - s), t[0]) //
	);

	t[1] = Math.min(h * (s - 1) + h * s, //
	Math.max(height * (1 - s) - h * s, t[1]) //
	);

	zoom.translate(t);
	g.attr("transform", "translate(" + t + ")scale(" + s + ")");

	// fit the path to the zoom level
	d3.selectAll(".country").style("stroke-width", 1.0 / s);

}// END: move

// /////////////////
// ---RENDERING---//
// /////////////////

// ---DRAW MAP BACKGROUND---//

var zoom = d3.behavior.zoom() //
.scaleExtent([ 1, 9 ]) //
.on("zoom", move);

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
