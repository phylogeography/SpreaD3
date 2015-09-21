// ---GENERATE TOPO LAYER---//

function generateTopoLayer(geojson) {

	// first guess for the projection
	var center = d3.geo.centroid(geojson);

	var scale = 150;
	var offset = [ width / 2, height / 2 ];
	projection = d3.geo.mercator().scale(scale).center(center)
			.translate(offset);
	path = d3.geo.path().projection(projection);

	// determine the bounds
	var bounds = path.bounds(geojson);
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

	var features = geojson.features;
	var topo = topoLayer.selectAll("path").data(features).enter()
			.append("path") //
			.attr("class", "topo") //
			.attr('d', path) //
			.attr("fill", "white") //
			.attr("opacity", 0.55)//
			.style("stroke-width", .5);

	// dump attribute values into DOM
	topo[0].forEach(function(d, i) {

		var thisTopo = d3.select(d);
		var properties = geojson.features[i].properties;

		for ( var property in properties) {
			if (properties.hasOwnProperty(property)) {

				thisTopo.attr(property, properties[property]);

			}
		}// END: properties loop
	});

}// END: generateTopoLayer

// ---GENERATE WORLD LAYER---//

function generateWorldLayer(world) {

	// first guess for the projection
	var center = d3.geo.centroid(world);

	// console.log(center);

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

