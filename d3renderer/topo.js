// ---GENERATE TOPO LAYER---//

function generateTopoLayer(geojson) {

    //console.log("generateTopoLayer");

	var basicScale = (width / 2 / Math.PI);
	
	// first guess for the projection
	var center = d3.geo.centroid(geojson);

	scale = basicScale;
	var offset = [ width / 2, height / 2 ];

	projection = 
		d3.geo.mercator()
//	d3.geo.equirectangular()
	.scale(scale).center(center)
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

	// apply inline style
	svg.selectAll('.graticule').style({
		'stroke' : '#bbb',
		'fill' : 'none',
		'stroke-width' : '.5px',
			'stroke-opacity' : '.5'
	});
	
	// add equator
	equatorLayer.append("path").datum(
			{
				type : "LineString",
				coordinates : [ [ -180, 0 ], [ -90, 0 ], [ 0, 0 ], [ 90, 0 ],
						[ 180, 0 ] ]
			}).attr("class", "equator").attr("d", path);

	// apply inline style
	equatorLayer.selectAll('.equator').style({
		'stroke' : '#ccc',
		'fill' : 'none',
		'stroke-width' : '1px',
	});
	
	var features = geojson.features;
	var topo = topoLayer.selectAll("path").data(features).enter()
			.append("path") //
			.attr("class", "topo") //
			.attr('d', path) //
			.attr("fill", fixedColors[mapDefaultColorIndex]) //
			.attr("stroke", "black") //
			.attr("fill-opacity", mapFillOpacity) //
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

    console.log("bounds: " + bounds);

	// initial scale based on X-axis
	//scale = width / (bounds[0][1] - bounds[0][0]);

	var hscale = height / (bounds[0][1] - bounds[0][0]);
	var vscale = width / (bounds[1][1] - bounds[1][0]);

    console.log("hscale: " + hscale);
    console.log("vscale: " + vscale);

	scale = (hscale < vscale) ? hscale : vscale;
    scale = scale * 150;
	// still need to correct the scaling, not too happy about this ...
    //if (scale > 2*width) {
    //    scale = 2*width;
    //}
	//scale = minScaleExtent * scale;

    console.log("minScaleExtent: " + minScaleExtent);
    console.log("scale: " + scale);

    //var manualScale = 500.0;
    //console.log("manually set scale: " + manualScale);
    //scale = manualScale;

	//var offset = [ width / 2 / (bounds[0][1] - bounds[0][0]),
			//(height / 2) + (bounds[1][1] - bounds[1][0]) / 2 ];

    //var offset = [ width/2 - (bounds[0][1] - bounds[0][0])/2, height/2 - (bounds[1][1] - bounds[1][0])/2 ];

    //var offset = [ width/8 - 150*(bounds[0][1] - bounds[0][0]), height/2 + (bounds[1][1] - bounds[1][0]) ];

    //console.log("offset: " + offset);

    //define our own projection
    var zeroProjection = d3.geo.projection(function(x,y) {
       return [x,y];
    });

    //test projection
    console.log("test projection [0,0]: " + zeroProjection([0,0]));
    console.log("test projection [0,1]: " + zeroProjection([0,1]));
    console.log("test projection [1,0]: " + zeroProjection([1,0]));
    console.log("test projection [1,1]: " + zeroProjection([1,1]));

    //console.log("center: (" + (bounds[1][1] + bounds[1][0])/2 + " , " + (bounds[0][1] + bounds[0][0])/2 + ")");

    var currentXDifference = zeroProjection([1,1])[0] - zeroProjection([0,0])[0];
    var currentYDifference = zeroProjection([1,1])[1] - zeroProjection([0,0])[1];
    console.log("current X difference: " + currentXDifference);
    console.log("current Y difference: " + currentYDifference);

    scale = minScaleExtent*scale/currentXDifference;
    console.log("scale: " + scale);

	// projection
	//projection = d3.geo.mercator().scale(scale).translate(offset);
    //projection = zeroProjection.center([(bounds[0][1] + bounds[0][0])/2,(bounds[1][1] + bounds[1][0])/2]).scale(500);

    //projection = zeroProjection.center([(bounds[1][1] + bounds[1][0])/2,(bounds[0][1] + bounds[0][0])/2]).scale(500);

    //projection = zeroProjection.scale(150);

    /*projection = zeroProjection.translate([width/2 + (bounds[1][0]+bounds[1][1])/2*currentYDifference,height/2 + (bounds[0][0]+bounds[0][1])/2*currentXDifference]).scale(150);

    //test projection
    console.log("test projection [0,0]: " + zeroProjection([0,0]));
    console.log("test projection [0,1]: " + zeroProjection([0,1]));
    console.log("test projection [1,0]: " + zeroProjection([1,0]));
    console.log("test projection [1,1]: " + zeroProjection([1,1]));

    projection = zeroProjection.scale(500);

    //test projection
    console.log("test projection [0,0]: " + zeroProjection([0,0]));
    console.log("test projection [0,1]: " + zeroProjection([0,1]));
    console.log("test projection [1,0]: " + zeroProjection([1,0]));
    console.log("test projection [1,1]: " + zeroProjection([1,1]));

    currentXDifference = zeroProjection([1,1])[0] - zeroProjection([0,0])[0];
    currentYDifference = zeroProjection([1,1])[1] - zeroProjection([0,0])[1];
    console.log("current X difference: " + currentXDifference);
    console.log("current Y difference: " + currentYDifference);

    projection = zeroProjection.translate([width/2 + (bounds[1][0]+bounds[1][1])/2*currentYDifference,height/2 + (bounds[0][0]+bounds[0][1])/2*currentXDifference]).scale(500);
*/
    projection = zeroProjection.scale(scale);

    currentXDifference = zeroProjection([1,1])[0] - zeroProjection([0,0])[0];
    currentYDifference = zeroProjection([1,1])[1] - zeroProjection([0,0])[1];
    console.log("current X difference: " + currentXDifference);
    console.log("current Y difference: " + currentYDifference);

    projection = zeroProjection.translate([width/2 + (bounds[1][0]+bounds[1][1])/2*currentYDifference,height/2 + (bounds[0][0]+bounds[0][1])/2*currentXDifference]).scale(scale);
    //console.log("translate: " + (width/2 + (bounds[1][0]+bounds[1][1])/2*currentYDifference) + " , " + (height/2 + (bounds[0][0]+bounds[0][1])/2*currentXDifference));

    //projection = zeroProjection.translate([width/2,height/2 + 32.19*currentXDifference]).scale(500);

	//no more need for a path
	//path = d3.geo.path().projection(projection);

	//and no more need to add graticule
	//svg.append("path").datum(graticule).attr("class", "graticule").attr("d",
	//		path);

}// END: generateEmptyLayer

