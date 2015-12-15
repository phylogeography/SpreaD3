d3.kodama
		.themeRegistry(
				'linesTheme',
				{
					frame : {
						padding : '4px',
						background : 'linear-gradient(to top, rgb(16, 74, 105) 0%, rgb(14, 96, 125) 90%)',
						'font-family' : '"Helvetica Neue", Helvetica, Arial, sans-serif',
						'border' : '1px solid rgb(57, 208, 204)',
						color : 'rgb(245,240,220)',
						'border-radius' : '4px',
						'font-size' : '12px',
						'box-shadow' : '0px 1px 3px rgba(0,20,40,.5)'
					},
					title : {
						'text-align' : 'center',
						'padding' : '4px'
					},
					item_title : {
						'text-align' : 'right',
						'color' : 'rgb(220,200,120)'
					},
					item_value : {
						'padding' : '1px 2px 1px 10px',
						'color' : 'rgb(234, 224, 184)'
					}
				});

// ---GENERATE LINES--//

function generateLines(data, points) {

	// TODO : voronoi hover
	// http://bl.ocks.org/mbostock/8033015
	// var voronoi = d3.geom.voronoi() //
	// .x(function(d) {
	// return x(d.date);
	// }) //
	// .y(function(d) {
	// return y(d.value);
	// }) //
	// .clipExtent([ [ 0, 0 ], [ width, height ] ]);

	// bend values in [0,1]
	// 0 gives straight lines, closer to 1 results in more bent lines
	var scale = d3.scale.linear().domain([ sliderEndValue, sliderStartValue ])
			.range([ 0, 1 ]);

	var lines = linesLayer
			.selectAll("path")
			.data(data)
			.enter()
			.append("path")
			//
			.attr("class", "line")
			//
			.attr(
					"d",
					function(d, i) {

						var line = d;

						var startPointId = line.startPointId;
						var startPoint = getObject(points, "id", startPointId);
						line['startPoint'] = startPoint;

						var startCoordinate;
						var startLocation = startPoint.location;
						if (typeof startLocation != 'undefined') {

							startCoordinate = startLocation.coordinate;

						} else {

							startCoordinate = startPoint.coordinate;

						}
						// line['startCoordinate'] = startCoordinate;

						var endPointId = line.endPointId;
						var endPoint = getObject(points, "id", endPointId);
						line['endPoint'] = endPoint;

						var endCoordinate;
						var endLocation = endPoint.location;
						if (typeof startLocation != 'undefined') {

							endCoordinate = endLocation.coordinate;

						} else {

							endCoordinate = endPoint.coordinate;

						}
						// line['endCoordinate'] = endCoordinate;

						// line bend
						var curvature;
						var startTime = line.startTime;
						if (typeof startTime != "undefined") {

							curvature = scale(formDate(line.startTime));

						} else {
							curvature = lineMaxCurvature;
						}

						var startLatitude = startCoordinate.xCoordinate;
						var startLongitude = startCoordinate.yCoordinate;

						var endLatitude = endCoordinate.xCoordinate;
						var endLongitude = endCoordinate.yCoordinate;

						var sourceXY = projection([ startLongitude,
								startLatitude ]);
						var targetXY = projection([ endLongitude, endLatitude ]);

						var sourceX = sourceXY[0]; // lat
						var sourceY = sourceXY[1]; // long

						var targetX = targetXY[0];
						var targetY = targetXY[1];

//						console.log(curvature)
						
						var dx = targetX - sourceX;
						var dy = targetY - sourceY;
						var dr = Math.sqrt(dx * dx + dy * dy) * curvature;

						var westofsource = (targetX - sourceX) < 0;
						line['westofsource'] = westofsource;
						line['targetX'] = targetX;
						line['targetY'] = targetY;
						line['sourceX'] = sourceX;
						line['sourceY'] = sourceY;

						var bearing;
						if (westofsource) {
							bearing = "M" + targetX + "," + targetY + "A" + dr
									+ "," + dr + " 0 0,1 " + sourceX + ","
									+ sourceY;

						} else {

							bearing = "M" + sourceX + "," + sourceY + "A" + dr
									+ "," + dr + " 0 0,1 " + targetX + ","
									+ targetY;

						}

						return (bearing);

					})
			//
			.attr("fill", "none")
			//
			.attr("stroke-width", lineWidth + "px")
			//
			.attr("stroke-linejoin", "round")
			//
			.attr("stroke", fixedColors[lineDefaultColorIndex])
			//
			.attr("startTime", function(d) {
				return (d.startTime);
			})
			//
			.attr("endTime", function(d) {
				return (d.endTime);
			})
			//
			.attr("stroke-dasharray", function(d) {

				var totalLength = d3.select(this).node().getTotalLength();
				return (totalLength + " " + totalLength);
			})
			//
			.attr("stroke-dashoffset", 0)
			//
			.attr("opacity", 1)
			.on('mouseover', function(d) {

				var line = d3.select(this);
				line.classed("hover", true);

				// bring line to the front
//				this.parentNode.parentNode.appendChild(this.parentNode);

			})
			//
			.on('mouseout', function(d, i) {

				var line = d3.select(this);
				line.classed("hover", false);

			})
			.call(
					d3.kodama
							.tooltip()
							.format(
									function(d, i) {

										return {
											// title : "FOO",
											items : [
													{
														title : 'From',
														value : typeof (d.startPoint.location) == 'undefined' ? (d3
																.round(
																		d.startPoint.coordinate.xCoordinate,
																		2)
																+ ', ' + d3
																.round(
																		d.startPoint.coordinate.yCoordinate,
																		2))
																: d.startPoint.location.id
													},
													{
														title : 'To',
														value : typeof (d.endPoint.location) == 'undefined' ? (d3
																.round(
																		d.endPoint.coordinate.xCoordinate,
																		2)
																+ ', ' + d3
																.round(
																		d.endPoint.coordinate.yCoordinate,
																		2))
																: d.endPoint.location.id
													} ]
										};

									}).theme('linesTheme')

			);

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
