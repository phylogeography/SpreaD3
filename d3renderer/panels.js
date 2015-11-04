// ---POPULATE PANELS---//

function populateExportPanel() {

	saveSVGButton = document.getElementById("saveSVG");
	d3
			.select(saveSVGButton)
			.on(
					'click',
					function() {

						var tmp = document.getElementById("container");
						var svg = tmp.getElementsByTagName("svg")[0];

						// Extract the data as SVG text string
						var svg_xml = (new XMLSerializer)
								.serializeToString(svg);

						window.open().document.write(svg_xml);

						var html = d3.select("svg").attr("title", "test2")
								.attr("version", 1.1).attr("xmlns",
										"http://www.w3.org/2000/svg").node().parentNode.innerHTML;

						d3
								.select("body")
								.append("div")
								.attr("id", "download")
								// .style("top", event.clientY+20+"px")
								// .style("left", event.clientX+"px")
								.html(
										"Right-click on this preview and choose Save as<br />Left-Click to dismiss<br />")
								.append("img").attr(
										"src",
										"data:image/svg+xml;base64,"
												+ btoa(html));

						d3.select("#download").on(
								"click",
								function() {
									if (event.button == 0) {
										d3.select(this).transition().style(
												"opacity", 0).remove();
									}
								}).transition().duration(500).style("opacity",
								1);

						// var form = document.getElementById("svgform");
						//						
						// form['output_format'].value = "svg";
						// form['data'].value = svg_xml ;
						// form.submit();

					});

}// END: populateExportPanel

function populateMapBackground() {

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

}// END: populateMapBackground

function populateMapPanels(attributes) {

	populateMapBackground();

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

						d3.selectAll(".topo") //
						.transition() //
						.ease("linear") //
						.attr("fill", function() {

							var topo = d3.select(this);
							var attributeValue = topo.attr(colorAttribute);
							var color = scale(attributeValue);

							return (color);
						});

					});

}// END: populateMapPanels

function populateLocationPanels() {

	// --- LABEL COLOR---//

	labelColorSelect = document.getElementById("labelcolor");

	var domain = [ "black", "white" ];
	var scale = alternatingColorScale().domain(domain).range(
			[ "#000000", "#ffffff" ]);

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

						d3.selectAll(".label") //
						.transition() //
						.ease("linear") //
						.attr("fill", color);

					});

}// END: populateLabelPanels

function populatePointPanels(attributes) {

	// ---COLOR---//

	pointColorSelect = document.getElementById("pointcolor");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		// skip points with count attribute
		if (option == COUNT) {
			continue;
		}

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

							colorlegend("#pointsColorLegend", scale, "linear",
									{
										title : "",
										boxHeight : 20,
										boxWidth : 6,
										vertical : true
									});

						}

						pointsLayer.selectAll(".point").transition() //
						.ease("linear") //
						.attr("fill", function() {

							var point = d3.select(this);
							var attributeValue = point.attr(colorAttribute);
							var color = scale(attributeValue);

							return (color);
						});

					});

	// ---AREA---//

	pointAreaSelect = document.getElementById("pointarea");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		// skip points with count attribute
		if (option == COUNT) {
			continue;
		}

		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		pointAreaSelect.appendChild(element);

	}// END: i loop

	// point area listener
	d3
			.select(pointAreaSelect)
			.on(
					'change',
					function() {

						var min_area = 10;
						var max_area = 100;

						var areaAttribute = pointAreaSelect.options[pointAreaSelect.selectedIndex].text;

						var scale;
						var attribute = getObject(attributes, "id",
								areaAttribute);
						if (attribute.scale == ORDINAL) {

							scale = d3.scale.category20().domain(
									attribute.domain);

						} else {

							scale = d3.scale.linear().domain(attribute.range)
									.range([ min_area, max_area ]);

						}

						pointsLayer.selectAll(".point") //
						.transition() //
						.ease("linear") //
						.attr("r", function(d) {

							var attributeValue = d.attributes[areaAttribute];

							// TODO: the null's (for the lulz :) )

							var area = scale(attributeValue);
							var radius = Math.sqrt(area / Math.PI);

							return (radius);
						});
					});

}// END: populateNodePanels

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

						linesLayer.selectAll(".line") //
						.transition() //
						.ease("linear") //
						.attr("stroke", function() {

							var line = d3.select(this);
							var attributeValue = line.attr(colorAttribute);
							var color = scale(attributeValue);

							return (color);
						});

					});

	// line bend listener

	var maxCurvatureSlider = d3.slider().axis(d3.svg.axis().orient("top")).min(0.0)
			.max(1.0).step(0.1).value(MAX_BEND);
	d3.select('#maxCurvatureSlider').call(maxCurvatureSlider);

	maxCurvatureSlider.on("slide", function(evt, value) {

		MAX_BEND = value;
		var scale = d3.scale.linear().domain(
				[ sliderStartValue, sliderEndValue ]).range(
				[ MIN_BEND, MAX_BEND ]);

		linesLayer.selectAll(".line").transition().ease("linear") //
		.attr(
				"d",
				function(d) {

					var line = d;

					// line bend
					var curvature = scale(Date.parse(line.startTime));

					var westofsource = line.westofsource;
					var targetX = line.targetX;
					var targetY = line.targetY;
					var sourceX = line.sourceX;
					var sourceY = line.sourceY;

					var dx = targetX - sourceX;
					var dy = targetY - sourceY;
					var dr = Math.sqrt(dx * dx + dy * dy) * curvature;

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

				}) //
		.attr("stroke-dasharray", function(d) {

			var totalLength = d3.select(this).node().getTotalLength();
			return (totalLength + " " + totalLength);

		});

	});

}// END: populateDataPanels

