// ---POPULATE PANELS---//

function populateMapPanels(attributes) {

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

function populateDataPanels(attributes) {

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

	// d3.select(lineColorSelect).call('change');

}// END: populateDataPanels

