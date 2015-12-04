
d3.kodama
		.themeRegistry(
				'countsTheme',
				{
					frame : {
						padding : '4px',
						background : 'linear-gradient(to top, rgb(177, 68, 68) 0%, rgb(188, 95, 95) 90%)',
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

function generateAreas(data) {

	var areas = areasLayer.selectAll("area").data(data).enter().append(
			"polygon") //
	.attr("class", "area") //
	.attr("startTime", function(d) {

		return (d.startTime);

	}) //
	.attr("points", function(d) {

		var polygon = d.polygon;
		return polygon.coordinates.map(function(d) {

			xy = projection([ d.yCoordinate, d.xCoordinate ]);

			return [ xy[0], // lat
			xy[1] // long
			].join(",");

		}).join(" ");
	}) //
	.attr("fill", fixedColors[areaDefaultColorIndex]) //
//	.attr("stroke", "#fff") //
	.attr("stroke-width", "0.5px") //
	.attr("fill-opacity", polygonOpacity) //
	.attr("visibility", "visible") //
	.on('mouseover', function(d) {

		var area = d3.select(this);
		area.attr('stroke', '#000');

	}) //
	.on('mouseout', function(d, i) {

		var area = d3.select(this);
//		area.attr('stroke', '#fff');
		area.attr('stroke', null);

	}) //
	.call(d3.kodama.tooltip().format(function(d, i) {

		return {
			// title : d.location.id,
			items : [ {
				title : 'Date',
				value : d.startTime
			} ]
		};

	}) //
	.theme('countsTheme'));

	// dump attribute values into DOM
	areas[0].forEach(function(d, i) {

		var thisArea = d3.select(d);

		var properties = data[i].attributes;
		for ( var property in properties) {
			if (properties.hasOwnProperty(property)) {

				thisArea.attr(property, properties[property]);

			}
		}// END: properties loop
	});

}// END: generateAreas

function generateCounts(data, countAttribute) {

	var min_area = 1000; // scale;
	var max_area = 10000; // scale * 10;
	var scale = d3.scale.linear().domain(countAttribute.range).range(
			[ min_area, max_area ]);

	areasLayer.selectAll("circle").data(data).enter() //
	.append("circle") //
	.attr("class", "count") //
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
	.attr("r", function(d) {

		var count = d.attributes.count;
		var area = scale(count);
		var radius = Math.sqrt(area / Math.PI);

		return (radius);

	}) //
	.attr("fill", fixedColors[areaDefaultColorIndex]) //
//	.attr("stroke", "#fff") //
	.attr("stroke-width", "0.5px") //
	.attr("fill-opacity", polygonOpacity) //
	.attr("visibility", "visible") //
	.on('mouseover', function(d) {

		var point = d3.select(this);
		point.attr('stroke', '#000');

	}) //
	.on('mouseout', function(d, i) {

		var point = d3.select(this);
//		point.attr('stroke', '#fff');
		point.attr('stroke', null);
		
	}) //
	.call(d3.kodama.tooltip().format(function(d, i) {

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

	}) //
	.theme('countsTheme'));

}// END: generateCounts
