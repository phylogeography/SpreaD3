// ---LINES---//

function populateLinePanels(attributes) {

	// ---LINE FIXED COLOR---//

	var lineFixedColorSelect = document.getElementById("lineFixedColor");
	var scale = alternatingColorScale().domain(fixedColors).range(fixedColors);

	for (var i = 0; i < fixedColors.length; i++) {

		option = fixedColors[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		lineFixedColorSelect.appendChild(element);

	}// END: i loop

	// select the default
	lineFixedColorSelect.selectedIndex = lineDefaultColorIndex;

	colorlegend("#lineFixedColorLegend", scale, "ordinal", {
		title : "",
		boxHeight : 20,
		boxWidth : 6,
		vertical : true
	});

	// line fixed color listener
	d3
			.select(lineFixedColorSelect)
			.on(
					'change',
					function() {

						var colorSelect = lineFixedColorSelect.options[lineFixedColorSelect.selectedIndex].text;
						var color = scale(colorSelect);

						linesLayer.selectAll(".line") //
						.transition() //
						.ease("linear") //
						.attr("stroke", color);

					});

	// ---LINE COLOR ATTRIBUTE---//

	// start color
	$('.lineStartColor').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		displayColorCode : true,
		colors : getSimpleColors(pairedSimpleColors),

		onSelect : function(hex, element) {

			lineStartColor = "#" + hex;
			// console.log(hex + " selected" + " for input "
			// + element.attr('class'));
		}

	});
	$('.lineStartColor').setColor(lineStartColor);

	// end color
	$('.lineEndColor').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		colors : getSimpleColors(pairedSimpleColors),
		displayColorCode : true,
		onSelect : function(hex, element) {

			lineEndColor = "#" + hex;
			// console.log(hex + " selected" + " for input "
			// + element.attr('class'));
		}
	});
	$('.lineEndColor').setColor(lineEndColor);

	// attribute
	lineColorAttributeSelect = document.getElementById("lineColorAttribute");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		lineColorAttributeSelect.appendChild(element);
	}// END: i loop

	// line color attribute listener
	d3
			.select(lineColorAttributeSelect)
			.on(
					'change',
					function() {

						var colorAttribute = lineColorAttributeSelect.options[lineColorAttributeSelect.selectedIndex].text;
						var attribute = getObject(attributes, "id",
								colorAttribute);

						var data;
						var scale;

						$('#lineColorLegend').html('');

						if (attribute.scale == ORDINAL) {

							data = attribute.domain;
							scale = d3.scale.ordinal().range(ordinalColors)
									.domain(data);

							colorlegend("#lineColorLegend", scale, "ordinal", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						} else {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									[ lineStartColor, lineEndColor ]);

							colorlegend("#lineColorLegend", scale, "linear", {
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

							if (attributeValue == null) {
								console.log("null found");
								color = "#000";
							}

							return (color);
						});

					});

	// ---LINE FIXED OPACITY---//

	var lineFixedOpacitySlider = d3.slider().axis(d3.svg.axis().orient("top"))
			.min(0.0).max(1.0).step(0.1).value(lineOpacity);

	d3.select('#lineFixedOpacitySlider').call(lineFixedOpacitySlider);

	// line fixed opacity listener
	lineFixedOpacitySlider.on("slide", function(evt, value) {

		lineOpacity = value;

		// fill-opacity / stroke-opacity / opacity
		linesLayer.selectAll(".line") //
		.transition() //
		.ease("linear") //
		.attr("stroke-opacity", lineOpacity);

	});

	// ---LINE CURVATURE---//

	var maxCurvatureSlider = d3.slider().axis(d3.svg.axis().orient("top")).min(
			0.0).max(1.0).step(0.1).value(lineMaxCurvature);

	d3.select('#maxCurvatureSlider').call(maxCurvatureSlider);

	// line curvature listener
	maxCurvatureSlider.on("slide", function(evt, value) {

		lineMaxCurvature = value;
		var scale = d3.scale.linear().domain(
				[ sliderStartValue, sliderEndValue ]).range(
				[ 0, lineMaxCurvature ]);

		linesLayer.selectAll(".line").transition().ease("linear") //
		.attr(
				"d",
				function(d) {

					var line = d;

					// TODO: NaN when negative dates?
					// console.log(Date.parse(line.startTime));

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

		// update(currentSliderValue, timeScale,
		// currentDateDisplay, dateFormat);

	});

	// ---LINE WIDTH---//

	var lineWidthSlider = d3.slider().axis(d3.svg.axis().orient("top"))
			.min(0.5).max(5.0).step(0.5).value(lineWidth);

	d3.select('#lineWidthSlider').call(lineWidthSlider);

	// line width listener
	lineWidthSlider.on("slide", function(evt, value) {

		lineWidth = value;

		linesLayer.selectAll(".line").transition().ease("linear") //
		.attr("stroke-width", lineWidth + "px");

	});

	// ---LINE CUT OFF---//
	
	// attribute selector
	lineCutoffAttributeSelect = document.getElementById("lineCutoffAttribute");
	for (var i = 0; i < attributes.length; i++) {

		// TODO: discrete too
		if (attributes[i].scale == LINEAR) {
			option = attributes[i].id;
			element = document.createElement("option");
			element.textContent = option;
			element.value = option;
			lineCutoffAttributeSelect.appendChild(element);
		}

	}// END: i loop

	// listener
	d3
			.select(lineCutoffAttributeSelect)
			.on(
					'change',
					function() {

						// clean-up
						$('#lineCutoffSlider').html('');
//						linesLayer.selectAll("path").style("visibility", null); 
						
						var cutoffAttribute = lineCutoffAttributeSelect.options[lineCutoffAttributeSelect.selectedIndex].text;
						var attribute = getObject(attributes, "id",
								cutoffAttribute);

						// slider
						// TODO: discrete too
						if (attribute.scale == LINEAR) {

							var minValue = Math.floor(attribute.range[MIN_INDEX]);
							var maxValue = Math.ceil(attribute.range[MAX_INDEX]);
							var step = (maxValue - minValue) / 10;

							var lineCutoffSlider = d3.slider().axis(
									d3.svg.axis().orient("top")).min(minValue)
									.max(maxValue).step(step).value(minValue);
							
							d3.select('#lineCutoffSlider').call(
									lineCutoffSlider);

							lineCutoffSlider.on("slide", function(evt, value) {

								linesLayer.selectAll("path").style("visibility", function(d) {

									var sliderValue = value;
									
									var line = d3.select(this);
									var attributeValue = line.attr(attribute.id);
									
									var visibility = "visible";
									if(attributeValue < sliderValue  || !linesLayerCheckbox.checked) {
										visibility = "hidden";
									}
									
									return (visibility);
								});
								
							});
							
						}//END: scale check

					}// END: function
			);

}// END: populateLinePanels

// ---POINTS---//

function populatePointPanels(attributes) {

	// ---POINT FIXED COLOR---//

	var pointFixedColorSelect = document.getElementById("pointFixedColor");
	var scale = alternatingColorScale().domain(fixedColors).range(fixedColors);

	for (var i = 0; i < fixedColors.length; i++) {

		option = fixedColors[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		pointFixedColorSelect.appendChild(element);

	}// END: i loop

	// select the default
	pointFixedColorSelect.selectedIndex = pointDefaultColorIndex;

	colorlegend("#pointFixedColorLegend", scale, "ordinal", {
		title : "",
		boxHeight : 20,
		boxWidth : 6,
		vertical : true
	});

	// point fixed color listener
	d3
			.select(pointFixedColorSelect)
			.on(
					'change',
					function() {

						var colorSelect = pointFixedColorSelect.options[pointFixedColorSelect.selectedIndex].text;
						var color = scale(colorSelect);

						pointsLayer.selectAll(".point") //
						.transition() //
						.ease("linear") //
						.attr("fill", color);

					});

	// ---POINT COLOR ATTRIBUTE---//

	// start color
	$('.pointStartColor').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		displayColorCode : true,
		colors : getSimpleColors(pairedSimpleColors),

		onSelect : function(hex, element) {

			pointStartColor = "#" + hex;
			// console.log(hex + " selected" + " for input "
			// + element.attr('class'));
		}

	});
	$('.pointStartColor').setColor(pointStartColor);

	// end color
	$('.pointEndColor').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		colors : getSimpleColors(pairedSimpleColors),
		displayColorCode : true,
		onSelect : function(hex, element) {

			pointEndColor = "#" + hex;
			// console.log(hex + " selected" + " for input "
			// + element.attr('class'));
		}
	});
	$('.pointEndColor').setColor(pointEndColor);

	// attribute
	pointColorAttributeSelect = document.getElementById("pointColorAttribute");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		// skip points with count attribute
		if (option == COUNT) {
			continue;
		}

		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		pointColorAttributeSelect.appendChild(element);

	}// END: i loop

	// point color attribute listener
	d3
			.select(pointColorAttributeSelect)
			.on(
					'change',
					function() {

						var colorAttribute = pointColorAttributeSelect.options[pointColorAttributeSelect.selectedIndex].text;

						var attribute = getObject(attributes, "id",
								colorAttribute);

						var data;
						var scale;

						$('#pointColorLegend').html('');

						if (attribute.scale == ORDINAL) {

							data = attribute.domain;
							scale =
							d3.scale.ordinal().range(ordinalColors)
									.domain(data);

							colorlegend("#pointColorLegend", scale, "ordinal",
									{
										title : "",
										boxHeight : 20,
										boxWidth : 6,
										vertical : true
									});

						} else {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									[ pointStartColor, pointEndColor ]);

							colorlegend("#pointColorLegend", scale, "linear", {
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

							if (attributeValue == null) {
								console.log("null found");
								color = "#000";
							}

							return (color);
						});

					});

	// ---POINT FIXED AREA---//

	var pointFixedAreaSlider = d3.slider().axis(d3.svg.axis().orient("top"))
			.min(1.0).max(10.0).step(0.5).value(pointArea);

	d3.select('#pointFixedAreaSlider').call(pointFixedAreaSlider);

	// point fixed area listener
	pointFixedAreaSlider.on("slide", function(evt, value) {

		pointArea = value;

		pointsLayer.selectAll(".point")//
		.transition()//
		.ease("linear") //
		.attr("r", pointArea);

	});

	// ---POINT AREA ATTRIBUTE---//

	pointAreaAttributeSelect = document.getElementById("pointAreaAttribute");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		// skip points with count attribute
		if (option == COUNT) {
			continue;
		}

		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		pointAreaAttributeSelect.appendChild(element);

	}// END: i loop

	// point area attribute listener
	d3
			.select(pointAreaAttributeSelect)
			.on(
					'change',
					function() {

						var min_area = 10;
						var max_area = 100;

						var areaAttribute = pointAreaAttributeSelect.options[pointAreaAttributeSelect.selectedIndex].text;

						var scale;
						var attribute = getObject(attributes, "id",
								areaAttribute);
						if (attribute.scale == ORDINAL) {

							data = attribute.domain;
							scale =
							// d3.scale.category20().domain(data);
							d3.scale.ordinal().range(ordinalColors)
									.domain(data);

						} else {

							scale = d3.scale.linear().domain(attribute.range)
									.range([ min_area, max_area ]);

						}

						pointsLayer.selectAll(".point") //
						.transition() //
						.ease("linear") //
						.attr("r", function(d) {

							var attributeValue = d.attributes[areaAttribute];

							var area = scale(attributeValue);
							var radius = Math.sqrt(area / Math.PI);

							if (attributeValue == null) {
								console.log("null found");
								radius = 0.0;
							}

							return (radius);
						});
					});

	// ---MULTIPLY POINT AREA---//

	var pointAreaMultiplierSlider = d3.slider().axis(
			d3.svg.axis().orient("top")).min(0.1).max(3.0).step(0.1).value(1.0);

	d3.select('#pointAreaMultiplierSlider').call(pointAreaMultiplierSlider);

	// point area multiplier listener
	pointAreaMultiplierSlider.on("slide", function(evt, value) {

		pointsLayer.selectAll(".point") //
		.transition() //
		.ease("linear") //
		.attr("r", function(d) {

			var point = d3.select(this);
			var r = point.attr("r");
			var radius = r * value;

			return (radius);
		});

	});

}// END: populatePointPanels

// ---AREAS---//

function populateAreaPanels(attributes) {

	// ---AREA FIXED COLOR---//

	var areaFixedColorSelect = document.getElementById("areaFixedColor");
	var scale = alternatingColorScale().domain(fixedColors).range(fixedColors);

	for (var i = 0; i < fixedColors.length; i++) {

		option = fixedColors[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		areaFixedColorSelect.appendChild(element);

	}// END: i loop

	// select the default
	areaFixedColorSelect.selectedIndex = areaDefaultColorIndex;

	colorlegend("#areaFixedColorLegend", scale, "ordinal", {
		title : "",
		boxHeight : 20,
		boxWidth : 6,
		vertical : true
	});

	// area fixed color listener
	d3
			.select(areaFixedColorSelect)
			.on(
					'change',
					function() {

						var colorSelect = areaFixedColorSelect.options[areaFixedColorSelect.selectedIndex].text;
						var color = scale(colorSelect);

						areasLayer.selectAll(".area") //
						.transition() //
						.ease("linear") //
						.attr("fill", color);

					});

	// ---AREA COLOR ATTRIBUTE---//

	// start color
	$('.areaStartColor').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		displayColorCode : true,
		colors : getSimpleColors(pairedSimpleColors),

		onSelect : function(hex, element) {

			areaStartColor = "#" + hex;

		}

	});
	$('.areaStartColor').setColor(areaStartColor);

	// end color
	$('.areaEndColor').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		colors : getSimpleColors(pairedSimpleColors),
		displayColorCode : true,
		onSelect : function(hex, element) {

			areaEndColor = "#" + hex;

		}
	});
	$('.areaEndColor').setColor(areaEndColor);

	// attribute
	areaColorAttributeSelect = document.getElementById("areaColorAttribute");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		// skip points with count attribute
		if (option == COUNT) {
			continue;
		}

		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		areaColorAttributeSelect.appendChild(element);

	}// END: i loop

	// area color listener
	d3
			.select(areaColorAttributeSelect)
			.on(
					'change',
					function() {

						var colorAttribute = areaColorAttributeSelect.options[areaColorAttributeSelect.selectedIndex].text;

						var attribute = getObject(attributes, "id",
								colorAttribute);

						var data;
						var scale;

						$('#areaColorLegend').html('');

						if (attribute.scale == ORDINAL) {

							data = attribute.domain;
							scale = d3.scale.ordinal().range(ordinalColors)
									.domain(data);

							colorlegend("#areaColorLegend", scale, "ordinal", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						} else {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									[ areaStartColor, areaEndColor ]);

							colorlegend("#areaColorLegend", scale, "linear", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						}// END: range/domain check

						areasLayer.selectAll(".area").transition() //
						.ease("linear") //
						.attr("fill", function() {

							var area = d3.select(this);
							var attributeValue = area.attr(colorAttribute);
							var color = scale(attributeValue);

							if (attributeValue == null) {
								console.log("null found");
								color = "#000";
							}

							return (color);
						});

					});

	// ---AREA FIXED OPACITY---//

	var areaFixedOpacitySlider = d3.slider().axis(d3.svg.axis().orient("top"))
			.min(0.0).max(1.0).step(0.1).value(polygonOpacity);

	d3.select('#areaFixedOpacitySlider').call(areaFixedOpacitySlider);

	// map fixed opacity listener
	areaFixedOpacitySlider.on("slide", function(evt, value) {

		areaOpacity = value;

		// fill-opacity / stroke-opacity / opacity
		areasLayer.selectAll(".area") //
		.transition() //
		.ease("linear") //
		.attr("fill-opacity", areaOpacity);

	});

}// END: populateAreaPanels

function populateCountPanels() {

	// ---COUNT FIXED COLOR---//

	var countFixedColorSelect = document.getElementById("countFixedColor");
	var scale = alternatingColorScale().domain(fixedColors).range(fixedColors);

	for (var i = 0; i < fixedColors.length; i++) {

		option = fixedColors[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		countFixedColorSelect.appendChild(element);

	}// END: i loop

	// select the default
	countFixedColorSelect.selectedIndex = countDefaultColorIndex;

	colorlegend("#countFixedColorLegend", scale, "ordinal", {
		title : "",
		boxHeight : 20,
		boxWidth : 6,
		vertical : true
	});

	// count fixed color listener
	d3
			.select(countFixedColorSelect)
			.on(
					'change',
					function() {

						var colorSelect = countFixedColorSelect.options[countFixedColorSelect.selectedIndex].text;
						var color = scale(colorSelect);

						areasLayer.selectAll(".count") //
						.transition() //
						.ease("linear") //
						.attr("fill", color);

					});

	// ---COUNT FIXED OPACITY---//

	var countFixedOpacitySlider = d3.slider().axis(d3.svg.axis().orient("top"))
			.min(0.0).max(1.0).step(0.1).value(polygonOpacity);

	d3.select('#countFixedOpacitySlider').call(countFixedOpacitySlider);

	// map fixed opacity listener
	countFixedOpacitySlider.on("slide", function(evt, value) {

		countOpacity = value;

		// fill-opacity / stroke-opacity / opacity
		areasLayer.selectAll(".count") //
		.transition() //
		.ease("linear") //
		.attr("fill-opacity", countOpacity);

	});

}// END: populateCountPanels

// ---MAP---//

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

	// --- MAP FIXED FILL---//

	var mapFixedFillSelect = document.getElementById("mapFixedFill");
	var scale = alternatingColorScale().domain(fixedColors).range(fixedColors);

	for (var i = 0; i < fixedColors.length; i++) {

		option = fixedColors[i];
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		mapFixedFill.appendChild(element);

	}// END: i loop

	// select the default
	mapFixedFillSelect.selectedIndex = mapDefaultColorIndex;

	colorlegend("#mapFixedFillLegend", scale, "ordinal", {
		title : "",
		boxHeight : 20,
		boxWidth : 6,
		vertical : true
	});

	// line fixed color listener
	d3
			.select(mapFixedFillSelect)
			.on(
					'change',
					function() {

						var colorSelect = mapFixedFillSelect.options[mapFixedFillSelect.selectedIndex].text;
						var color = scale(colorSelect);

						d3.selectAll(".topo") //
						.transition() //
						.ease("linear") //
						.attr("fill", color);

					});

	// ---MAP FILL ATTRIBUTE---//

	// start color
	$('.mapStartFill').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		displayColorCode : true,
		colors : getSimpleColors(pairedSimpleColors),
		onSelect : function(hex, element) {

			mapStartFill = "#" + hex;

		}

	});
	$('.mapStartFill').setColor(mapStartFill);

	// end color
	$('.mapEndFill').simpleColor({
		cellWidth : 13,
		cellHeight : 13,
		columns : 4,
		colors : getSimpleColors(pairedSimpleColors),
		displayColorCode : true,
		onSelect : function(hex, element) {

			mapEndFill = "#" + hex;
			// console.log(hex + " selected" + " for input "
			// + element.attr('class'));
		}
	});
	$('.mapEndFill').setColor(mapEndFill);

	// attribute
	mapFillAttributeSelect = document.getElementById("mapFillAttribute");

	for (var i = 0; i < attributes.length; i++) {

		option = attributes[i].id;
		element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		mapFillAttributeSelect.appendChild(element);

	}// END: i loop

	// map color listener
	d3
			.select(mapFillAttributeSelect)
			.on(
					'change',
					function() {

						var colorAttribute = mapFillAttributeSelect.options[mapFillAttributeSelect.selectedIndex].text;

						var attribute = getObject(attributes, "id",
								colorAttribute);

						var data;
						var scale;

						$('#mapFillLegend').html('');

						if (attribute.scale == ORDINAL) {

							data = attribute.domain;
							scale = d3.scale.ordinal().range(ordinalColors)
									.domain(data);

							colorlegend("#mapFillLegend", scale, "ordinal", {
								title : "",
								boxHeight : 20,
								boxWidth : 6,
								vertical : true
							});

						} else {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									[ mapStartFill, mapEndFill ]);

							colorlegend("#mapFillLegend", scale, "linear", {
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

	// ---MAP FIXED OPACITY---//

	var mapFixedOpacitySlider = d3.slider().axis(d3.svg.axis().orient("top"))
			.min(0.0).max(1.0).step(0.1).value(polygonOpacity);

	d3.select('#mapFixedOpacitySlider').call(mapFixedOpacitySlider);

	// map fixed opacity listener
	mapFixedOpacitySlider.on("slide", function(evt, value) {

		mapFillOpacity = value;

		// fill-opacity / stroke-opacity / opacity
		topoLayer.selectAll(".topo") //
		.transition() //
		.ease("linear") //
		.attr("fill-opacity", mapFillOpacity);

	});

}// END: populateMapPanels

function populateExportPanel() {

	saveSVGButton = document.getElementById("saveSVG");
	d3.select(saveSVGButton).on('click', function() {

		var tmp = document.getElementById("container");
		var svg = tmp.getElementsByTagName("svg")[0];

		// Extract the data as SVG text string
		var svg_xml = (new XMLSerializer).serializeToString(svg);

		window.open().document.write(svg_xml);

		// var html = d3.select("svg").attr("title", "image")
		// .attr("version", 1.1).attr("xmlns",
		// "http://www.w3.org/2000/svg").node().parentNode.innerHTML;

		// http://nesterko.com/blog/2012/01/30/measuring-homophily-in-network-data-and-how-to-export-from-d3-js-to-pdf/

		// var html = d3.select("#container")
		// .attr("title", "test2")
		// .attr("version", 1.1)
		// .attr("xmlns", "http://www.w3.org/2000/svg")
		// .node().parentNode.innerHTML;
		// d3.select("body").append("div")
		// .attr("id", "download")
		// .html("Right-click on this preview and choose Save as<br />Left-Click
		// to dismiss<br />")
		// .append("img")
		// .attr("src", "data:image/svg+xml;base64,"+ btoa(html));

	});

}// END: populateExportPanel

function populateLocationPanels() {

	// --- LABEL COLOR---//

	var labelColorSelect = document.getElementById("labelcolor");

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

function populateToggleLayers() {

	// ---MAP VISIBILITY---//

	var mapLayerCheckbox = document.getElementById("mapLayerCheckbox");
	// default state is checked
	mapLayerCheckbox.checked = true;

	d3.select(mapLayerCheckbox).on("change", function() {

		var visibility = this.checked ? "visible" : "hidden";
		topoLayer.selectAll("path").style("visibility", visibility);

	});

	// ---POLYGONS VISIBILITY---//

	var areasLayerCheckbox = document.getElementById("areasLayerCheckbox");
	// default state is checked
	areasLayerCheckbox.checked = true;

	d3.select(areasLayerCheckbox).on("change", function() {

		if (this.checked) {
			// remove style, then visibility is driven by the time-based
			// selections
			areasLayer.selectAll(".count").style("visibility", null);
			areasLayer.selectAll(".area").style("visibility", null);
		} else {
			// style is superior to attribute, make them hidden
			areasLayer.selectAll(".count").style("visibility", "hidden");
			areasLayer.selectAll(".area").style("visibility", "hidden");
		}

	});

	// ---POINTS VISIBILITY---//

	var pointsLayerCheckbox = document.getElementById("pointsLayerCheckbox");
	// default state is checked
	pointsLayerCheckbox.checked = true;

	d3.select(pointsLayerCheckbox).on("change", function() {

		var visibility = this.checked ? "visible" : "hidden";
		pointsLayer.selectAll("circle").style("visibility", visibility);
		locationsLayer.selectAll("circle").style("visibility", visibility);

	});

	// ---LABELS VISIBILITY---//

	var labelsLayerCheckbox = document.getElementById("labelsLayerCheckbox");
	// default state is checked
	labelsLayerCheckbox.checked = true;

	d3.select(labelsLayerCheckbox).on("change", function() {

		var visibility = this.checked ? "visible" : "hidden";
		labelsLayer.selectAll("text").style("visibility", visibility);

	});

	// ---LINES VISIBILITY---//

	var linesLayerCheckbox = document.getElementById("linesLayerCheckbox");
	// default state is checked
	linesLayerCheckbox.checked = true;

	d3.select(linesLayerCheckbox).on("change", function() {

		if (this.checked) {
			// remove style, then visibility is driven by the time-based
			// selections
			linesLayer.selectAll("path").style("visibility", null);
		} else {
			// style is superior to attribute, make them hidden
			linesLayer.selectAll("path").style("visibility", "hidden");
//			areasLayer.selectAll("area").style("visibility", "hidden");
		}

	});

}// END: populateToggleLayers
