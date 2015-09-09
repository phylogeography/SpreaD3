// ---POPULATE PANELS---//

function populatePanels(attributes) {

	lineColorSelect = document.getElementById("linecolor");
	for (i = 0; i < attributes.length; i++) {

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

						if (attribute.scale == ORDINAL) {

							 data = attribute.domain;
							 scale = d3.scale.category20().domain(data);

							$('#linesColorLegend').html('');

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

							$('#linesColorLegend').html('');

							colorlegend("#linesColorLegend", scale, "linear", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						}

						d3.select('#linesColorLegend .colorlegend-title').style('font-size', '20px')
						
					});


//	d3.select(lineColorSelect).call('change');

	
}// END: populatePanels

