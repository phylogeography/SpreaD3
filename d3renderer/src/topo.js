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
//	topoLayer.append("path") //
//	.datum(topo) //
//	.attr("class", "topo") //
//		.attr("fill", function(d,i) {
//		
//		console.log("FUBAR");//  .properties.ISO);
//		
//		
//	})
//	.attr('d', path) //
//	.style("stroke-width", .5) //
//
//	;

//	console.log(topo);
	
	var scale = d3.scale.category20().domain(["GIN","SLE","LBR"]);
	
	
	topoLayer. selectAll("path").data(topo.features).enter().append("path")
	.attr("class", "topo") //
	.attr('d', path) //
//	.attr("fill", "blue")
	.attr("fill", function(d,i) {
		
var value=d.properties.ISO;
	
var color = scale(value) ;

return(color);
		
	})
	.attr("opacity", 0.55)
	.style("stroke-width", .5) //

	
	;
	
	
	
//	topoLayer.append("path") //
//	.datum(topo) //
//	.attr("class", "topo") //
//	.attr('d', path) //
//	.style("stroke-width", .5) //
//	;

	
//	topoLayer.selectAll(path)
	
}// END: generateTopoLayer



//---GENERATE WORLD LAYER---//

function generateWorldLayer(world) {

	// first guess for the projection
	var center = d3.geo.centroid(world);
	
//	console.log(center);
	
	var scale = 150;
	var offset = [ width / 2, height / 2 ];
	projection = d3.geo.mercator().scale(scale).center(center)
			.translate(offset);
	path = d3.geo.path().projection(projection);

	// projection = projection.center(center);
	// path = path.projection(projection);

	// determine the bounds
	var bounds = path.bounds(world);
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

	
	
	topoLayer.append("path") //
	.datum(world) //
	.attr("class", "topo") //
	.attr('d', path) //
	.style("stroke-width", .5) //
	;
	
}// END: generateWorldLayer


