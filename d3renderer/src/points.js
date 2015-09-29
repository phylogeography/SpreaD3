var COUNT_OPACITY = 0.5;
//var MIN_AREA = 1000;
//var MAX_AREA = 10000;

function generateCounts(data, countAttribute) {

	var counts = areasLayer.selectAll("circle").data(data).enter().append(
			"circle") //
	.attr("class", "point") //
	.attr("startTime", function(d) {

		return (d.startTime);

	}) //
	.attr("endTime", function(d) {

		return (d.endTime);

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
	.attr(
			"r",
			function(d) {

				var count = d.attributes.count;

				var min_area = 1000;//scale;
				var max_area = 10000;//scale * 10;
				
				// map them
				var area = map(count, // 
						countAttribute.range[0], //
						countAttribute.range[1], //
						min_area, //
						max_area //
						);
				var radius = Math.sqrt(area / Math.PI);

				return (radius);

			}) //
	.attr("fill", "brown") //
	.attr("opacity", COUNT_OPACITY) //
	.attr("stroke", "#fff") //
	.attr("stroke-width", "0.5px").on('mouseover', function(d) {

		var point = d3.select(this);
		point.attr('stroke', '#000');

		// point.transition().duration(500)
		// .attr("r", point.attr("r") * 2 );

	}).on('mouseout', function(d, i) {

		var point = d3.select(this);
		point.attr('stroke', '#fff');

		// point.transition().duration(500)
		// .attr("r", point.attr("r") / 2 );

	})

	.call(d3.kodama.tooltip().format(function(d, i) {

		// TODO: filter

		// console.log(d3.select(this));

		if (1 == 1) {

			return {
				title : d.location.id,
				items : [ {
					title : 'Date',
					value : d.startTime
				}, {
					title : 'Count',
					value : d.attributes.count
				} ]
			};

		} else {

			return null;

		}

	}));

}// END: generateCounts

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
