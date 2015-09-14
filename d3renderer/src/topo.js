// ---GENERATE TOPO LAYER---//

function generateTopoLayer(topo) {

	// first guess for the projection
	var center = d3.geo.centroid(topo);
	
//	console.log(center);
	
	var scale = 150;
	var offset = [ width / 2, height / 2 ];
	projection = d3.geo.mercator().scale(scale).center(center)
			.translate(offset);
	path = d3.geo.path().projection(projection);

	// projection = projection.center(center);
	// path = path.projection(projection);

	// determine the bounds
	var bounds = path.bounds(topo);
	var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
	var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
	var scale = (hscale < vscale) ? hscale : vscale;
	var offset = [ width - (bounds[0][0] + bounds[1][0]) / 2,
			height - (bounds[0][1] + bounds[1][1]) / 2 ];

	// new projection
	projection = d3.geo.mercator().center(center).scale(scale)
			.translate(offset);
	// new path
	path = path.projection(projection);

	// add graticule
	svg.append("path").datum(graticule).attr("class", "graticule").attr("d",
			path);

	// add equator
	equatorLayer.append("path").datum(
			{
				type : "LineString",
				coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
						[ 180, 0 ] ]
			}).attr("class", "equator").attr("d", path);

	// add map data
	topoLayer.append("path") //
	.datum(topo) //
	.attr("class", "topo") //
	.attr('d', path) //
	.style("stroke-width", .5) //
	;

}// END: generateTopoLayer





//function generateWorldLayer(topo) {
//
//	projection = d3.geo.mercator() //
//	.translate([ (width / 2), (height / 2) ]) //
//	.scale(width / 2 / Math.PI);
//
//	path = d3.geo.path().projection(projection);
//	
//	svg.append("path") //
//	.datum(graticule) //
//	.attr("class", "graticule") //
//	.attr("d", path);
//
//	equatorLayer.append("path") //
//	.datum(
//			{
//				type : "LineString",
//				coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
//						[ 180, 0 ] ]
//			}) //
//	.attr("class", "equator") //
//	.attr("d", path);
//
//	var country = topoLayer.selectAll(".topo").data(topo);
//
//	country.enter().insert("path") //
//	.attr("class", "topo") //
//	.attr("d", path) //
//	;
//
//}// END: draw


