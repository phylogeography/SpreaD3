// ---GENERATE TOPO LAYER---//

function generateTopoLayer(geojson) {

    //console.log("generateTopoLayer");

	var basicScale = (width / 2 / Math.PI);
	
	// first guess for the projection
	var center = d3.geo.centroid(geojson);

	scale = basicScale;
	var offset = [ width / 2, height / 2 ];

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

	// if it failed stick to basics
	if (scale < basicScale) {

		scale = (width / 2 / Math.PI);
		var offset = [ (width / 2), (height / 2) ];

		projection = d3.geo.mercator() //
		.scale(scale) //
		.translate(offset);

	}

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

function generateEmptyLayer(pointAttributes, axisAttributes) {

    console.log("generateEmptyLayer");

	var xlim = getObject(pointAttributes, "id", axisAttributes.xCoordinate).range;
	var ylim = getObject(pointAttributes, "id", axisAttributes.yCoordinate).range;

    console.log("width: " + width);
    console.log("height: " + height);

	console.log("xlim: " + xlim);
	console.log("ylim: " + ylim);

	var bounds = [ xlim, ylim ];

	// initial scale based on X-axis
	scale = width / (bounds[0][1] - bounds[0][0]);

	var hscale = scale * width / (bounds[0][1] - bounds[0][0]);
	var vscale = scale * height / (bounds[1][1] - bounds[1][0]);

    console.log("hscale: " + hscale);
    console.log("vscale: " + vscale);

	scale = (hscale < vscale) ? hscale : vscale;
	// still need to correct the scaling, not too happy about this ...
    if (scale > 2*width) {
        scale = 2*width;
    }
	//scale = minScaleExtent * scale;

    console.log("minScaleExtent: " + minScaleExtent);

    console.log("scale: " + scale);

    //var manualScale = 500.0;
    //console.log("manually set scale: " + manualScale);
    //scale = manualScale;

	//var offset = [ width / 2 / (bounds[0][1] - bounds[0][0]),
			//(height / 2) + (bounds[1][1] - bounds[1][0]) / 2 ];

    var offset = [ width/2 - (bounds[0][1] - bounds[0][0])/2 - scale*minScaleExtent, height/2 - (bounds[1][1] - bounds[1][0])/2 ];

    //var offset = [ width/8 - 150*(bounds[0][1] - bounds[0][0]), height/2 + (bounds[1][1] - bounds[1][0]) ];

    console.log("offset: " + offset);

	// projection
	projection = d3.geo.mercator().scale(scale).translate(offset);

	// path
	path = d3.geo.path().projection(projection);

	// add graticule
	svg.append("path").datum(graticule).attr("class", "graticule").attr("d",
			path);

}// END: generateEmptyLayer

