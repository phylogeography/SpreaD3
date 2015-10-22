function generateLocations(locations) {

	locationsLayer.selectAll("circle").data(locations).enter().append("circle") //
	.attr("class", "location") //
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
	.attr("r", ".1px") //
	.attr("fill", "black") //
	.attr("stroke", "black");

}// END: generateLocations

function generateLabels(locations) {

	labelsLayer.selectAll("text").data(locations).enter().append("text") //
		.attr("class", "label") //
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
	.text(function(d) {
		return (d.id);
	}) //
	.attr("font-family", "sans-serif")//
	.attr("font-size", "10px")//
	.attr("fill", "black") //
	;

}// END: generateLocations
