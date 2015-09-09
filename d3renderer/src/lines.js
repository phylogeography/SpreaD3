
// ---GENERATE LINES--//

function generateLines(lines, points) {

	lines.forEach(function(line) {

		var startNodeId = line.startNodeId;
		var startPoint = getObject(points, "id", startNodeId);
		line['startPoint'] = startPoint;
		var startCoordinate = startPoint.location.coordinate;
		
		var endNodeId = line.endNodeId;
		var endPoint = getObject(points, "id", endNodeId);
		line['endPoint'] = endPoint;
		var endCoordinate = line.endPoint.location.coordinate;
		
		generateLine(line, startCoordinate, endCoordinate);

	});
}

//---GENERATE LINE--//

function generateLine(line, startCoordinate, endCoordinate) {

	bend = 1;

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
	var bearing;
	if (west_of_source) {
		bearing = "M" + targetX + "," + targetY + "A" + dr + "," + dr
				+ " 0 0,1 " + sourceX + "," + sourceY;
	} else {

		bearing = "M" + sourceX + "," + sourceY + "A" + dr + "," + dr
				+ " 0 0,1 " + targetX + "," + targetY;
	}

	var startTime = line.startTime;
	var endTime = line.endTime;

	g.append("path") //
	.attr("class", "line") //
	.attr("d", bearing) //
	.attr("fill", "none") //
	.attr("stroke-width", 1 + "px") //
	.attr("stroke", "rgb(" + 0 + "," + 0 + "," + 0 + ")") //
	.attr("startTime", startTime) //
	.attr("endTime", endTime) //
	.attr("opacity", 1);

}
