function generatePoints(data) {

	var points = pointsLayer.selectAll("circle").data(data).enter().append(
			"circle") //
	.attr("class", "point") //
	.attr("startTime", function(d) {

		return (d.startTime);

	}) //
	.attr(
			"cx",
			function(d) {

				var xy = projection([ d.location.coordinate.yCoordinate,
						d.location.coordinate.xCoordinate ]);
				var cx = xy[0]; // lat

				return (cx);
			}) //
	.attr(
			"cy",
			function(d) {

				var xy = projection([ d.location.coordinate.yCoordinate,
						d.location.coordinate.xCoordinate ]);
				var cy = xy[1]; // long

				return (cy);
			}) //
	.attr("r", "5px") //
	.attr("fill", "white") //
	.attr("stroke", "black");

	// dump attribute values into DOM
	points[0].forEach(function(d, i) {

		var thisPoint = d3.select(d);
		var properties = data[i].attributes;

		for ( var property in properties) {
			if (properties.hasOwnProperty(property)) {

				thisPoint.attr(property, properties[property]);

			}
		}// END: properties loop
	});

}// END: generatePoints
