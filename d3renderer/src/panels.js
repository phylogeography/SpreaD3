// ---POPULATE PANELS---//

function populateMapPanels(attributes) {

	// --- MAP BACKGROUND---//

	mapBackgroundSelect = document.getElementById("mapbackground");

	var domain = [ "white", "black", "grey", "light blue" ];
	var scale = alternatingColorScale().domain(domain).range(
			[ "#ffffff", "#000000", "#ddd", "#8cc5ff" ]);

	for (var i = 0; i < domain.length; i++) {

		option = domain[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		mapBackgroundSelect.appendChild(element);

	}// END: i loop

	colorlegend("#mapBackgroundLegend", scale, "ordinal", {
		title : "",
		boxHeight : 20,
		boxWidth : 6,
		vertical : true
	});

	// map background listener
	d3
			.select(mapBackgroundSelect)
			.on(
					'change',
					function() {

						var colorSelect = mapBackgroundSelect.options[mapBackgroundSelect.selectedIndex].text;
						var color = scale(colorSelect);
						d3.select('#container').style("background", color);

					});

	// --- MAP FILL---//

	mapColorSelect = document.getElementById("mapcolor");
	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		mapColorSelect.appendChild(element);

	}// END: i loop

	// map color listener
	d3
			.select(mapColorSelect)
			.on(
					'change',
					function() {

						var colorAttribute = mapColorSelect.options[mapColorSelect.selectedIndex].text;

						var attribute = getObject(attributes, "id",
								colorAttribute);

						var data;
						var scale;

						$('#mapColorLegend').html('');

						if (attribute.scale == ORDINAL) {

							data = attribute.domain;
							scale = d3.scale.category20().domain(data);

							colorlegend("#mapColorLegend", scale, "ordinal", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						} else {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									[ "rgb(0, 0, 255)", "rgb( 255, 0, 0)" ]);

							colorlegend("#mapColorLegend", scale, "linear", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						}

						d3.selectAll(".topo").each(
								function(d, i) {

									var topo = d3.select(this);
									var attributeValue = topo
											.attr(colorAttribute);
									var color = scale(attributeValue);
									topo.transition().delay(100).ease("linear")
											.style("fill", color);

								});

					});

}// END: populateMapPanels


function populateLocationPanels() {

	// --- LABEL COLOR---//

	labelColorSelect = document.getElementById("labelcolor");

	var domain = [ "black", "white" ];
	var scale = alternatingColorScale().domain(domain).range(
			[ "#000000", "#ffffff"  ]);

	for (var i = 0; i < domain.length; i++) {

		option = domain[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		labelColorSelect.appendChild(element);

	}// END: i loop

	colorlegend("#labelColorLegend", scale, "ordinal", {
		title : "",
		boxHeight : 20,
		boxWidth : 6,
		vertical : true
	});

	// label color listener
	d3
			.select(labelColorSelect)
			.on(
					'change',
					function() {

						var colorSelect = labelColorSelect.options[labelColorSelect.selectedIndex].text;
						var color = scale(colorSelect);

						d3.selectAll(".label").each(
								function(d, i) {

									var label = d3.select(this);

									label.transition().delay(100).ease("linear")
											.style("fill", color);

								});
						
					});
	
	
}// END: populateLabelPanels


function populatePointPanels(attributes) {
	
	pointColorSelect = document.getElementById("pointcolor");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		pointColorSelect.appendChild(element);

	}// END: i loop
	
	// point color listener
	d3
	.select(pointColorSelect)
	.on(
			'change',
			function() {

				var colorAttribute = pointColorSelect.options[pointColorSelect.selectedIndex].text;

				var attribute = getObject(attributes, "id",
						colorAttribute);

				var data;
				var scale;

				$('#pointsColorLegend').html('');

				if (attribute.scale == ORDINAL) {

					data = attribute.domain;
					scale = d3.scale.category20().domain(data);

					colorlegend("#pointsColorLegend", scale, "ordinal",
							{
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

				} else {

					data = attribute.range;
					scale = d3.scale.linear().domain(data).range(
							[ "rgb(0, 0, 255)", "rgb( 255, 0, 0)" ]);

					colorlegend("#pointsColorLegend", scale, "linear", {
						title : "",
						boxHeight : 20,
						boxWidth : 6,
						vertical : true
					});

				}

//				d3.selectAll(".point") //
				pointsLayer.selectAll(".point")
				.each(
						function(d, i) {

							var point = d3.select(this);
							var attributeValue = point
									.attr(colorAttribute);
							var color = scale(attributeValue);

							// console.log(color);

							point.transition().delay(100).ease("linear")
									.style("fill", color);

						});

			});
	
	
	
}//END: populateNodePanels

function populateLinePanels(attributes) {

	lineColorSelect = document.getElementById("linecolor");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		lineColorSelect.appendChild(element);

	}// END: i loop

	// line color listener
	d3
			.select(lineColorSelect)
			.on(
					'change',
					function() {

						var colorAttribute = lineColorSelect.options[lineColorSelect.selectedIndex].text;

						var attribute = getObject(attributes, "id",
								colorAttribute);

						var data;
						var scale;

						$('#linesColorLegend').html('');

						if (attribute.scale == ORDINAL) {

							data = attribute.domain;
							scale = d3.scale.category20().domain(data);

							colorlegend("#linesColorLegend", scale, "ordinal",
									{
										title : "",
										boxHeight : 20,
										boxWidth : 6,
										vertical : true
									});

						} else {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									[ "rgb(0, 0, 255)", "rgb( 255, 0, 0)" ]);

							colorlegend("#linesColorLegend", scale, "linear", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						}

						d3.selectAll(".line").each(
								function(d, i) {

									var line = d3.select(this);
									var attributeValue = line
											.attr(colorAttribute);
									var color = scale(attributeValue);

									// console.log(color);

									line.transition().delay(100).ease("linear")
											.style("stroke", color);

								});

					});


}// END: populateDataPanels

