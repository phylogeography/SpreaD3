function generateLocations(locations) {

	// TODO: color choosers for stroke and fill, solid colors from a palette

	locationsLayer.selectAll("circle").data(locations).enter().append("circle")
			.attr(
					"cx",
					function(d) {

						var xy = projection([ d.coordinate.yCoordinate,
								d.coordinate.xCoordinate ]);
						var cx = xy[0]; // lat

						return (cx);
					}) //
			.attr(
					"cy",
					function(d) {

						var xy = projection([ d.coordinate.yCoordinate,
								d.coordinate.xCoordinate ]);
						var cy = xy[1]; // long

						return (cy);
					}) //
			.attr("r", "3px") //
			.attr("fill", "red") //
			.attr("stroke", "black");

}// END: generateLocations

function generateLabels(locations) {

	labelsLayer.selectAll("text").data(locations).enter().append("text") //
	.attr(
			"x",
			function(d) {

				var xy = projection([ d.coordinate.yCoordinate,
						d.coordinate.xCoordinate ]);
				var x = xy[0]; // lat

				return (x);
			}) //
	.attr(
			"y",
			function(d) {

				var xy = projection([ d.coordinate.yCoordinate,
						d.coordinate.xCoordinate ]);
				var y = xy[1]; // long

				return (y);
			}) //
	.attr("text", function(d) {
		return (d.id);
	}) //
	.attr("font-family", "sans-serif")//
	.attr("font-size", "11px")//
	.attr("fill", "white") //
	.attr("stroke", "black") //
	;

	// .attr("r", "3px") //
	// .attr("fill", "red") //
	// .attr("stroke", "black")

}// END: generateLocations
