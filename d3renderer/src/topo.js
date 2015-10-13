// ---GENERATE TOPO LAYER---//

function generateTopoLayer(geojson) {

	// first guess for the projection
	var center = d3.geo.centroid(geojson);

    //console.log(center);

	scale = 150;
	var offset = [ width / 2, height / 2 ];

    //console.log(scale);
    //console.log(offset);

	projection = d3.geo.mercator().scale(scale).center(center)
			.translate(offset);
	path = d3.geo.path().projection(projection);

	// determine the bounds
	var bounds = path.bounds(geojson);
	var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
	var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
	scale = (hscale < vscale) ? hscale : vscale;
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
			.attr("stroke", "black") //
			.attr("fill-opacity", 0.5) //
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

// ---GENERATE EMPTY LAYER---//

function generateEmptyLayer(pointAttributes) {

	var ylim = getObject(pointAttributes, "id", "antigenic1").range;
	var xlim = getObject(pointAttributes, "id", "antigenic2").range;
	var bounds = [ xlim, ylim ];

	//didn't understand this, will define initial scale based on X-axis
    //scale = (width / 4 / Math.PI);
    scale = width / (bounds[0][1] - bounds[0][0]);

	var hscale = scale * width / (bounds[0][1] - bounds[0][0]);
	var vscale = scale * height / (bounds[1][1] - bounds[1][0]);

	scale = (hscale < vscale) ? hscale : vscale;
    //still need to correct the scaling, not too happy about this ...
    scale = 0.70 * scale;

    //	scale = 2000;
	
	// var offset = [ (bounds[0][1] - bounds[0][0]) / 2,
	// (bounds[1][1] - bounds[1][0]) / 2
	// ];

    //used to be: var offset = [ (bounds[0][1] - bounds[0][0]) * 8,
    // (height / 2) + (bounds[1][1] - bounds[1][0]) / 2 ];

	var offset = [ width / 2 / (bounds[0][1] - bounds[0][0]),
        (height / 2) + (bounds[1][1] - bounds[1][0]) / 2 ];

    // projection
	projection = d3.geo.mercator().scale(scale).translate(offset);

	// path
	path = d3.geo.path().projection(projection);

	// add graticule
	svg.append("path").datum(graticule).attr("class", "graticule").attr("d",
			path);

}// END: generateEmptyLayer

//function generateWorldLayer(world) {
//
//	scale = (width / 2 / Math.PI);
//	var offset = [ (width / 2), (height / 2) ];
//
//	// new projection
//	projection = d3.geo.mercator() //
//	.scale(scale) //
//	.translate(offset);
//
//	path = d3.geo.path().projection(projection);
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
//	var features = world.features;
//	var topo = topoLayer.selectAll("path").data(features).enter()
//			.append("path") //
//			.attr("class", "topo") //
//			.attr('d', path) //
//			.attr("fill", "white") //
//			.attr("stroke", "black") //
//			.attr("fill-opacity", 0.5) //
//			.style("stroke-width", .5);
//
//	// dump attribute values into DOM
//	topo[0].forEach(function(d, i) {
//
//		var thisTopo = d3.select(d);
//		var properties = world.features[i].properties;
//
//		for ( var property in properties) {
//			if (properties.hasOwnProperty(property)) {
//
//				thisTopo.attr(property, properties[property]);
//
//			}
//		}// END: properties loop
//	});
//
//}// END: generateWorldLayer