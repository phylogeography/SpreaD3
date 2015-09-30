// ---GENERATE LINES--//

function generateLines(data, points) {

	var lines = linesLayer.selectAll("path").data(data).enter().append("path") //
	.attr("class", "line") //
	.attr(
			"d",
			function(d, i) {

				var line = d;

				var startNodeId = line.startNodeId;
				var startPoint = getObject(points, "id", startNodeId);
				line['startPoint'] = startPoint;
				var startCoordinate = line.startPoint.location.coordinate;

				var endNodeId = line.endNodeId;
				var endPoint = getObject(points, "id", endNodeId);
				line['endPoint'] = endPoint;
				var endCoordinate = line.endPoint.location.coordinate;

				// jitter
				var bend = map(Date.parse(line.startTime), sliderStartValue,
						sliderEndValue, 1, 0);

				var startLatitude = startCoordinate.xCoordinate;
				var startLongitude = startCoordinate.yCoordinate;

				var endLatitude = endCoordinate.xCoordinate;
				var endLongitude = endCoordinate.yCoordinate;

				var sourceXY = projection([ startLongitude, startLatitude ]);
				var targetXY = projection([ endLongitude, endLatitude ]);

				var sourceX = sourceXY[0]; // lat
				var sourceY = sourceXY[1]; // long

				var targetX = targetXY[0];
				var targetY = targetXY[1];

				var dx = targetX - sourceX;
				var dy = targetY - sourceY;
				var dr = Math.sqrt(dx * dx + dy * dy) * bend;

				var west_of_source = (targetX - sourceX) < 0;
				line['westofsource'] = west_of_source;
				
				var bearing;
				if (west_of_source) {
					bearing = "M" + targetX + "," + targetY + "A" + dr + ","
							+ dr + " 0 0,1 " + sourceX + "," + sourceY;
				} else {

					bearing = "M" + sourceX + "," + sourceY + "A" + dr + ","
							+ dr + " 0 0,1 " + targetX + "," + targetY;
				}

				return (bearing);

			}) //
	.attr("fill", "none") //
	.attr("stroke-width", 1 + "px") //
	.attr("stroke-linejoin", "round") //
	.attr("stroke", "black") //
	.attr("startTime", function(d) {
		return (d.startTime);
	}) //
	.attr("endTime", function(d) {
		return (d.endTime);
	}) //
	.attr("stroke-dasharray", function(d) {

		var totalLength = d3.select(this).node().getTotalLength();
		return (totalLength + " " + totalLength);
	}) //
	.attr("stroke-dashoffset", 0) //
	.attr("opacity", 1);

	// dump attribute values into DOM
	lines[0].forEach(function(d, i) {

		var thisLine = d3.select(d);
		var properties = data[i].attributes;

		for ( var property in properties) {
			if (properties.hasOwnProperty(property)) {

				thisLine.attr(property, properties[property]);

			}
		}// END: properties loop
	});

}// END: generateLines
