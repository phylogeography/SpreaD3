package renderers.kml;

import java.awt.Color;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Reader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import kmlframework.kml.AltitudeModeEnum;
import kmlframework.kml.Document;
import kmlframework.kml.Feature;
import kmlframework.kml.Folder;
import kmlframework.kml.Kml;
import kmlframework.kml.KmlException;
import kmlframework.kml.LineString;
import kmlframework.kml.LineStyle;
import kmlframework.kml.LinearRing;
import kmlframework.kml.Placemark;
import kmlframework.kml.PolyStyle;
import kmlframework.kml.StyleSelector;
import kmlframework.kml.TimeSpan;

import org.joda.time.DateTime;
import org.joda.time.Duration;
import org.joda.time.Interval;
import org.joda.time.LocalDate;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import exceptions.AnalysisException;
import parsers.DiscreteColorsParser;
import parsers.DiscreteTreeParser;
import renderers.Renderer;
import settings.rendering.KmlRendererSettings;
import structure.data.Attribute;
import structure.data.Layer;
import structure.data.Location;
import structure.data.SpreadData;
import structure.data.attributable.Area;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import structure.data.primitive.Coordinate;
import utils.Utils;

public class KmlRenderer implements Renderer {

	private static final String ORDINAL = "ordinal";
	private static final String LINEAR = "linear";

	private SpreadData data;
	private KmlRendererSettings settings;

	private DateTimeFormatter formatter;

	// Points: area, color, alpha
	private Map<Object, Double> pointAreaMap = new LinkedHashMap<Object, Double>();
	private Map<Object, Color> pointColorMap = new LinkedHashMap<Object, Color>();
	private Map<Object, Integer> pointAlphaMap = new LinkedHashMap<Object, Integer>();

	// Lines: color, alpha, altitude, width
	private Map<Object, Color> lineColorMap = new LinkedHashMap<Object, Color>();
	private Map<Object, Integer> lineAlphaMap = new LinkedHashMap<Object, Integer>();
	private Map<Object, Double> lineAltitudeMap = new LinkedHashMap<Object, Double>();
	// private Map<Object, Double> lineWidthMap = new LinkedHashMap<Object,
	// Double>();

	// Areas: color
	private Map<Object, Color> areaColorMap = new LinkedHashMap<Object, Color>();
	
	// Cunts: area
	private Map<Object, Double> countAreaMap = new LinkedHashMap<Object, Double>();

	private List<StyleSelector> styles = new ArrayList<StyleSelector>();

	public KmlRenderer(
	// SpreadData data,
			KmlRendererSettings settings) {

		// this.data = data;
		this.settings = settings;
		this.formatter = DateTimeFormat.forPattern("yyyy/MM/dd");

	}// END: Constructor

	public void render() throws KmlException, IOException, AnalysisException {

		Reader reader = new FileReader(settings.jsonFilename);
		Gson gson = new GsonBuilder().create();
		SpreadData data = gson.fromJson(reader, SpreadData.class);
		this.data = data;

		PrintWriter writer = new PrintWriter(new File(settings.outputFilename));

		// create a new KML Document
		Kml kml = new Kml();
		kml.setXmlIndent(true);
		kml.setGenerateObjectIds(false);

		Document document = new Document();
		document.setStyleSelectors(styles);

		// add a document to the kml
		kml.setFeature(document);

		// locations go on top
		if (data.getLocations() != null) {
			document.addFeature(generateLocations(data.getLocations()));
		}

		// then layers
		for (Layer layer : data.getLayers()) {

			if (layer.getType().equalsIgnoreCase(Layer.Type.map.toString())) {
				continue;
			}// END: map layer check

			document.addFeature(generateLayer(layer));

		}

		kml.createKml(writer);
	}// END: render

	// /////////////////
	// ---LOCATIONS---//
	// /////////////////

	public Feature generateLocations(List<Location> locations)
			throws AnalysisException {

		Folder folder = new Folder();
		folder.setName("locations");

		for (Location location : locations) {

			folder.addFeature(generateLocation(location));

		} // EMD: locations list

		return folder;
	}// END: generateLocations

	private Placemark generateLocation(Location location)
			throws AnalysisException {

		Placemark placemark = new Placemark();
		placemark.setName(location.getId());
		placemark.setGeometry(generatePoint(location.getCoordinate()));

		return placemark;
	}// END: generateLocation

	// ---KML POINT---//

	private kmlframework.kml.Point generatePoint(Coordinate coordinate)
			throws AnalysisException {

		kmlframework.kml.Point point = new kmlframework.kml.Point();
		point.setAltitudeMode(AltitudeModeEnum.relativeToGround);
		point.setAltitude(coordinate.getAltitude());
		point.setLatitude(coordinate.getXCoordinate());
		point.setLongitude(coordinate.getYCoordinate());

		return point;
	}// END: generatePoint

	// //////////////
	// ---LAYERS---//
	// //////////////

	private Feature generateLayer(Layer layer) throws IOException,
			AnalysisException {

		Folder folder = new Folder();

		folder.setName(layer.getId());
		folder.setDescription(layer.getDescription());

		if (layer.getType().equalsIgnoreCase(Layer.Type.tree.toString())) {

			if (layer.hasPoints()) {

				List<Point> points = layer.getPoints();
				folder.addFeature(generatePoints(points));

				List<Line> lines = layer.getLines();
				folder.addFeature(generateLines(lines, points));

			}

			if (layer.hasAreas()) {
				folder.addFeature(generateAreas(layer.getAreas()));
			}

		} else if (layer.getType().equalsIgnoreCase(
				Layer.Type.counts.toString())) {

			if (layer.hasPoints()) {
				folder.addFeature(generateCounts(layer.getPoints()));
			}

		} else {
			//
		} // END: type check

		return folder;
	}// END: generateLayer

	// ---LINES---//

	public Feature generateLines(List<Line> lines, List<Point> points)
			throws IOException, AnalysisException {

		Folder folder = new Folder();
		folder.setName("lines");

		// read the supplied colors and create map
		if (settings.lineColors != null) {
			DiscreteColorsParser colorsParser = new DiscreteColorsParser(
					settings.lineColors);
			lineColorMap = colorsParser.parseColors();
		}

		// color, alpha, altitude, width attributes
		Attribute colorAttribute = null;
		if (this.settings.lineColorMapping != null) {
			colorAttribute = getAttribute(data.getLineAttributes(),
					settings.lineColorMapping);
		}

		Attribute altitudeAttribute = null;
		if (this.settings.lineAltitudeMapping != null) {
			altitudeAttribute = getAttribute(data.getLineAttributes(),
					settings.lineAltitudeMapping);
		}

		Attribute widthAttribute = null;
		if (this.settings.lineWidthMapping != null) {
			widthAttribute = getAttribute(data.getLineAttributes(),
					settings.lineWidthMapping);
		}

		for (Line line : lines) {
			Feature feature = generateLine(line, points, colorAttribute,
					altitudeAttribute, widthAttribute);
			folder.addFeature(feature);
		} // END: points loop

		return folder;
	}// END: generateLines

	private Feature generateLine(Line line, List<Point> points,
			Attribute colorAttribute, Attribute altitudeAttribute,
			Attribute widthAttribute) throws AnalysisException {

		// TODO: process includes (subsets)

		int sliceCount = 20;

		Folder folder = new Folder();
		String name = "";
		String label = "";

		Point startPoint = getPoint(points, line.getStartPointId());
		Coordinate startCoordinate = getCoordinate(startPoint);

		Point endPoint = getPoint(points, line.getEndPointId());
		Coordinate endCoordinate = getCoordinate(endPoint);

		if (startPoint.hasLocation() && endPoint.hasLocation()) {
			name += startPoint.getLocation().getId() + " to "
					+ endPoint.getLocation().getId();
		}

		// ---COLOR---//

		int red = (int) settings.lineColor[KmlRendererSettings.R];
		int green = (int) settings.lineColor[KmlRendererSettings.G];
		int blue = (int) settings.lineColor[KmlRendererSettings.B];
		// TODO: alpha mapping
		int alpha = (int) settings.lineAlpha;

		Color color = new Color(red, green, blue, alpha);

		if (colorAttribute != null) {

			Object colorAttributeValue = line.getAttributes().get(
					settings.lineColorMapping);

			if (lineColorMap.containsKey(colorAttributeValue)) { // get

				color = lineColorMap.get(colorAttributeValue);

			} else { // map it

				if (colorAttribute.getScale().equalsIgnoreCase(LINEAR)) {

					// value is value
					double value = (Double) colorAttributeValue;
					double minValue = colorAttribute.getRange()[0];
					double maxValue = colorAttribute.getRange()[1];

					red = (int) map(value, minValue, maxValue,
							settings.minLineRed, settings.maxLineRed);
					green = (int) map(value, minValue, maxValue,
							settings.minLineGreen, settings.maxLineGreen);
					blue = (int) map(value, minValue, maxValue,
							settings.minLineBlue, settings.maxLineBlue);

				} else if (colorAttribute.getScale().equalsIgnoreCase(ORDINAL)) {

					// value is index
					double value = (double) getIndex(
							colorAttribute.getDomain(), colorAttributeValue);
					double minValue = 0;
					double maxValue = colorAttribute.getDomain().size();

					red = (int) map(value, minValue, maxValue,
							settings.minLineRed, settings.maxLineRed);
					green = (int) map(value, minValue, maxValue,
							settings.minLineGreen, settings.maxLineGreen);
					blue = (int) map(value, minValue, maxValue,
							settings.minLineBlue, settings.maxLineBlue);

				} else {
					//
				} // END: scale check

				red = (int) limitValue(red, 0, 255);
				green = (int) limitValue(green, 0, 255);
				blue = (int) limitValue(blue, 0, 255);
				
				// store it for future reference
				color = new Color(red, green, blue, alpha);
				lineColorMap.put(colorAttributeValue, color);

			} // END: key check

			label += ", color[" + settings.lineColorMapping + "="
					+ colorAttributeValue.toString() + "]";

		} // END: mapping check

		// --- ALTITUDE---//

		Double altitude = settings.lineAltitude;

		if (altitudeAttribute != null) {

			Object altitudeAttributeValue = line.getAttributes().get(
					settings.lineAltitudeMapping);

			if (lineAltitudeMap.containsKey(altitudeAttributeValue)) { // get it

				altitude = lineAltitudeMap.get(altitudeAttributeValue);

			} else { // map it

				if (altitudeAttribute.getScale().equalsIgnoreCase(LINEAR)) {

					// value is value
					double value = (Double) altitudeAttributeValue;
					double minValue = altitudeAttribute.getRange()[0];
					double maxValue = altitudeAttribute.getRange()[1];

					altitude = map(value, minValue, maxValue,
							settings.minLineAltitude, settings.maxLineAltitude);

				} else if (altitudeAttribute.getScale().equalsIgnoreCase(
						ORDINAL)) {

					// value is index
					double value = (double) getIndex(
							altitudeAttribute.getDomain(),
							altitudeAttributeValue);
					double minValue = 0;
					double maxValue = altitudeAttribute.getDomain().size();

					altitude = map(value, minValue, maxValue,
							settings.minLineAltitude, settings.maxLineAltitude);

				} else {
					//
				} // END: scale check

				// store for future reference
				lineAltitudeMap.put(altitudeAttributeValue, altitude);

			} // END: key check

			label = ("altitude[" + settings.lineAltitudeMapping + ":"
					+ altitudeAttributeValue.toString() + "]");

		} // END: mapping check

		// --- WIDTH---//

		Double width = settings.lineWidth;

		// ---CUT INTO LINE SEGMENTS---//

		double a = -2 * altitude / (Math.pow(sliceCount, 2) - sliceCount);
		double b = 2 * altitude / (sliceCount - 1);

		LinkedList<Coordinate> coords = getIntermediateCoords(startCoordinate,
				endCoordinate, sliceCount);

		DateTime startDate = new DateTime();
		if (line.hasTime()) {
			String startTime = line.getStartTime();
			startDate = formatter.parseDateTime(startTime);
		}

		DateTime endDate = new DateTime();
		if (line.hasTime()) {
			String endTime = line.getEndTime();
			endDate = formatter.parseDateTime(endTime);
		}

		Interval interval = new Interval(startDate, endDate);
		long millis = interval.toDurationMillis();
		long segmentMillis = millis / (sliceCount - 1);

		for (int i = 0; i < sliceCount; i++) {

			Duration duration = new Duration(segmentMillis * i);
			LocalDate segmentDate = new LocalDate(startDate.plus(duration));
			String segmentStartTime = segmentDate.toString();

			double segmentStartAltitude = a * Math.pow((double) i, 2) + b
					* (double) i;

			double segmentEndAltitude = a * Math.pow((double) (i + 1), 2) + b
					* (double) (i + 1);

			Coordinate segmentStartCoordinate = coords.get(i);
			segmentStartCoordinate.setAltitude(segmentStartAltitude);

			Coordinate segmentEndCoordinate = coords.get(i + 1);
			segmentEndCoordinate.setAltitude(segmentEndAltitude);

			KmlStyle segmentStyle = new KmlStyle(color, width);
			segmentStyle.setId(segmentStyle.toString());

			if (!styles.contains(segmentStyle)) {
				styles.add(segmentStyle);
			}

			Placemark lineSegment = generateLineSegment(segmentStartCoordinate,
					segmentEndCoordinate, segmentStartTime, segmentStyle);
			folder.addFeature(lineSegment);

		}// END: i loop

		folder.setName(name);
		folder.setDescription(label);

		return folder;
	}// END: generateLine

	private Placemark generateLineSegment(Coordinate startCoordinate, //
			Coordinate endCoordinate, //
			String startTime, //
			KmlStyle style //
	) throws AnalysisException {

		Placemark placemark = new Placemark();

		LineStyle lineStyle = new LineStyle();
		lineStyle.setColor(getKMLColor(style.getStrokeColor()));
		lineStyle.setWidth(style.getStrokeWidth());

		style.setLineStyle(lineStyle);

		placemark.setStyleUrl(style.getId());

		// set time
		TimeSpan timeSpan = new TimeSpan();
		timeSpan.setBegin(startTime);
		placemark.setTimePrimitive(timeSpan);

		LineString lineString = new LineString();
		lineString.setTessellate(true);
		lineString.setAltitudeMode(AltitudeModeEnum.relativeToGround);

		List<kmlframework.kml.Point> points = new ArrayList<kmlframework.kml.Point>();
		points.add(generatePoint(startCoordinate));
		points.add(generatePoint(endCoordinate));

		lineString.setCoordinates(points);
		placemark.setGeometry(lineString);

		return placemark;
	}// END: generateLineSegment

	// ---POINTS---//

	private Feature generatePoints(List<Point> points) throws IOException,
			AnalysisException {

		Folder folder = new Folder();
		folder.setName("points");

		// read the supplied colors and create map
		if (settings.pointColors != null) {
			DiscreteColorsParser colorsParser = new DiscreteColorsParser(
					settings.pointColors);
			pointColorMap = colorsParser.parseColors();
		}

		Attribute areaAttribute = null;
		if (this.settings.pointAreaMapping != null) {
			areaAttribute = getAttribute(data.getPointAttributes(),
					settings.pointAreaMapping);
		}

		Attribute colorAttribute = null;
		if (this.settings.pointColorMapping != null) {
			colorAttribute = getAttribute(data.getPointAttributes(),
					settings.pointColorMapping);
		}

		for (Point point : points) {
			Feature feature = generatePoint(point, areaAttribute,
					colorAttribute);
			folder.addFeature(feature);
		} // END: points loop

		return folder;
	}// END: generatePoints

	private Feature generatePoint(Point point, Attribute areaAttribute,
			Attribute colorAttribute) throws AnalysisException {

		// TODO: process includes (subsets)

		int numPoints = 36;

		Placemark placemark = new Placemark();
		LinearRing linearRing = new LinearRing();
		List<kmlframework.kml.Point> points = new ArrayList<kmlframework.kml.Point>();
		String name = "";
		String label = "";

		// ---AREA---//

		Double area = settings.pointArea;
		if (areaAttribute != null) {

			
			
			Object areaAttributeValue = point.getAttributes().get(
					settings.pointAreaMapping);

			//TODO: null pointers
			System.out.println(areaAttributeValue);
			
			
			if (pointAreaMap.containsKey(areaAttributeValue)) { // get

				area = pointAreaMap.get(areaAttributeValue);

			} else { // map it

				if (areaAttribute.getScale().equalsIgnoreCase(LINEAR)) {

					// value is value
					double value = (Double) areaAttributeValue;
					double minValue = areaAttribute.getRange()[0];
					double maxValue = areaAttribute.getRange()[1];

					area = map(value, minValue, maxValue,
							settings.minPointArea, settings.maxPointArea);

				} else if (areaAttribute.getScale().equalsIgnoreCase(ORDINAL)) {

					// value is index
					double value = (double) getIndex(areaAttribute.getDomain(),
							areaAttributeValue);
					double minValue = 0;
					double maxValue = areaAttribute.getDomain().size();

					area = map(value, minValue, maxValue,
							settings.minPointArea, settings.maxPointArea);

				} else {
					//
				} // END: scale check

				// store for future reference
				pointAreaMap.put(areaAttributeValue, area);

			} // END: key check

			label = ("area[" + settings.pointAreaMapping + ":"
					+ areaAttributeValue.toString() + "]");

		} // END: mapping check

		// add coordinates
		Coordinate coordinate = getCoordinate(point);

		points.addAll(generateCircle(coordinate, area, numPoints));
		linearRing.setCoordinates(points);

		// ---COLOR---//

		int red = (int) settings.pointColor[KmlRendererSettings.R];
		int green = (int) settings.pointColor[KmlRendererSettings.G];
		int blue = (int) settings.pointColor[KmlRendererSettings.B];
		// TODO: alpha mapping
		int alpha = (int) settings.pointAlpha;

		Color color = new Color(red, green, blue, alpha);

		if (colorAttribute != null) {

			Object colorAttributeValue = point.getAttributes().get(
					settings.pointColorMapping);

			if (pointColorMap.containsKey(colorAttributeValue)) { // get

				color = pointColorMap.get(colorAttributeValue);

			} else { // map it

				if (colorAttribute.getScale().equalsIgnoreCase(LINEAR)) {

					// value is value
					double value = (Double) colorAttributeValue;
					double minValue = colorAttribute.getRange()[0];
					double maxValue = colorAttribute.getRange()[1];

					red = (int) map(value, minValue, maxValue,
							settings.minPointRed, settings.maxPointRed);
					green = (int) map(value, minValue, maxValue,
							settings.minPointGreen, settings.maxPointGreen);
					blue = (int) map(value, minValue, maxValue,
							settings.minPointBlue, settings.maxPointBlue);

				} else if (colorAttribute.getScale().equalsIgnoreCase(ORDINAL)) {

					// value is index
					double value = (double) getIndex(
							colorAttribute.getDomain(), colorAttributeValue);
					double minValue = 0;
					double maxValue = colorAttribute.getDomain().size();

					red = (int) map(value, minValue, maxValue,
							settings.minPointRed, settings.maxPointRed);
					green = (int) map(value, minValue, maxValue,
							settings.minPointGreen, settings.maxPointGreen);
					blue = (int) map(value, minValue, maxValue,
							settings.minPointBlue, settings.maxPointBlue);

				} else {
					//
				} // END: scale check

				red = (int) limitValue(red, 0, 255);
				green = (int) limitValue(green, 0, 255);
				blue = (int) limitValue(blue, 0, 255);
				
				// store it for future reference
				color = new Color(red, green, blue, alpha);
				pointColorMap.put(colorAttributeValue, color);

			} // END: key check

			label += ", color[" + settings.pointColorMapping + "="
					+ colorAttributeValue.toString() + "]";

		} // END: mapping check

		KmlStyle style = new KmlStyle(color);
		style.setId(style.toString());

		if (!styles.contains(style)) {
			styles.add(style);
		}

		PolyStyle polyStyle = new PolyStyle();
		polyStyle.setOutline(false);
		polyStyle.setColor(getKMLColor(style.getFillColor()));
		style.setPolyStyle(polyStyle);
		placemark.setStyleUrl(style.getId());

		kmlframework.kml.Polygon kfPolygon = new kmlframework.kml.Polygon();
		kfPolygon.setTessellate(true);
		kfPolygon.setOuterBoundary(linearRing);
		placemark.setGeometry(kfPolygon);
		placemark.setName(name);

		placemark.setDescription(label);

		return placemark;
	}// END: generatePoint

	// ---AREAS---//

	public Feature generateAreas(List<Area> areas) throws IOException,
			AnalysisException {

		Folder folder = new Folder();
		folder.setName("areas");

		// read the supplied colors and create map
		if (settings.pointColors != null) {
			DiscreteColorsParser colorsParser = new DiscreteColorsParser(
					settings.pointColors);
			pointColorMap = colorsParser.parseColors();
		}
		
		Attribute colorAttribute = null;
		if (this.settings.areaColorMapping != null) {
			colorAttribute = getAttribute(data.getPointAttributes(),
					settings.areaColorMapping);
		}
		
		for (Area area : areas) {

			Feature feature = generateArea(area, colorAttribute);
			folder.addFeature(feature);

		} // END: points loop

		return folder;
	}// END: generateAreas

	private Feature generateArea(Area area, Attribute colorAttribute) throws AnalysisException {

		Placemark placemark = new Placemark();
		LinearRing linearRing = new LinearRing();
		List<kmlframework.kml.Point> points = new ArrayList<kmlframework.kml.Point>();
		String name = "";
		String label = "";

		// set time
		TimeSpan timeSpan = new TimeSpan();
		LocalDate startDate = formatter.parseLocalDate(area.getStartTime());
		timeSpan.setBegin(startDate.toString());
		placemark.setTimePrimitive(timeSpan);

		// add coordinates
		for (Coordinate coordinate : area.getPolygon().getCoordinates()) {
			points.add(generatePoint(coordinate));
		} // END: coordinates loop

		linearRing.setCoordinates(points);

		// ---COLOR---//
		int red = (int) settings.areaColor[KmlRendererSettings.R];
		int green = (int) settings.areaColor[KmlRendererSettings.G];
		int blue = (int) settings.areaColor[KmlRendererSettings.B];
		int alpha = (int) settings.areaAlpha;

		Color color = new Color(red, green, blue, alpha);

		
		if (colorAttribute != null) {

			Object colorAttributeValue = area.getAttributes().get(
					settings.pointColorMapping);

			if (pointColorMap.containsKey(colorAttributeValue)) { // get

				color = pointColorMap.get(colorAttributeValue);

			} else { // map it

				if (colorAttribute.getScale().equalsIgnoreCase(LINEAR)) {

					// value is value
					double value = (Double) colorAttributeValue;
					double minValue = colorAttribute.getRange()[0];
					double maxValue = colorAttribute.getRange()[1];

					red = (int) map(value, minValue, maxValue,
							settings.minAreaRed, settings.maxAreaRed);
					green = (int) map(value, minValue, maxValue,
							settings.minAreaGreen, settings.maxAreaGreen);
					blue = (int) map(value, minValue, maxValue,
							settings.minAreaBlue, settings.maxAreaBlue);

				} else if (colorAttribute.getScale().equalsIgnoreCase(ORDINAL)) {

					// value is index
					double value = (double) getIndex(
							colorAttribute.getDomain(), colorAttributeValue);
					double minValue = 0;
					double maxValue = colorAttribute.getDomain().size();

					red = (int) map(value, minValue, maxValue,
							settings.minAreaRed, settings.maxAreaRed);
					green = (int) map(value, minValue, maxValue,
							settings.minAreaGreen, settings.maxAreaGreen);
					blue = (int) map(value, minValue, maxValue,
							settings.minAreaBlue, settings.maxAreaBlue);

				} else {
					//
				} // END: scale check

				red = (int) limitValue(red, 0, 255);
				green = (int) limitValue(green, 0, 255);
				blue = (int) limitValue(blue, 0, 255);
				
				// store it for future reference
				color = new Color(red, green, blue, alpha);
				areaColorMap.put(colorAttributeValue, color);

			} // END: key check

			label += ", color[" + settings.areaColorMapping + "="
					+ colorAttributeValue.toString() + "]";

		} // END: mapping check
		
		KmlStyle style = new KmlStyle(color);
		style.setId(style.toString());

		if (!styles.contains(style)) {
			styles.add(style);
		}

		PolyStyle polyStyle = new PolyStyle();
		polyStyle.setOutline(false);
		polyStyle.setColor(getKMLColor(style.getFillColor()));
		style.setPolyStyle(polyStyle);
		placemark.setStyleUrl(style.getId());

		kmlframework.kml.Polygon kfPolygon = new kmlframework.kml.Polygon();
		kfPolygon.setTessellate(true);
		kfPolygon.setOuterBoundary(linearRing);
		placemark.setGeometry(kfPolygon);
		placemark.setName(name);

		placemark.setDescription(label);

		return placemark;
	}// END: generateArea

	// ---COUNTS---//

	private Feature generateCounts(List<Point> counts) throws IOException,
			AnalysisException {

		Folder folder = new Folder();
		folder.setName("counts");

		Attribute countAttribute = getAttribute(data.getPointAttributes(),
				DiscreteTreeParser.COUNT);

		for (Point count : counts) {

			Feature feature = generateCount(count, countAttribute);
			folder.addFeature(feature);

		} // END: points loop

		return folder;
	}// END: generateCounts

	private Feature generateCount(Point count, Attribute countAttribute)
			throws AnalysisException {

		int numPoints = 36;

		Placemark placemark = new Placemark();
		LinearRing linearRing = new LinearRing();
		List<kmlframework.kml.Point> points = new ArrayList<kmlframework.kml.Point>();
		String name = "";
		String label = "";

		// ---AREA---//

		Double area = 0.0;
		Double countAttributeValue = (Double) count.getAttributes().get(
				DiscreteTreeParser.COUNT);
		if (countAreaMap.containsKey(countAttributeValue)) { // get from map

			area = countAreaMap.get(countAttributeValue);

		} else { // map it

			double minValue = countAttribute.getRange()[0];
			double maxValue = countAttribute.getRange()[1];

			area = map(countAttributeValue, minValue, maxValue,
					settings.minCountArea, settings.maxCountArea);

			// store for future reference
			countAreaMap.put(countAttributeValue, area);
		} // END: key check

		label = ("area[" + DiscreteTreeParser.COUNT + ":"
				+ countAttributeValue.toString() + "]");

		Coordinate coordinate = count.getLocation().getCoordinate();
		points.addAll(generateCircle(coordinate, area, numPoints));
		linearRing.setCoordinates(points);

		// ---COLOR---//

		int red = (int) settings.countColor[KmlRendererSettings.R];
		int green = (int) settings.countColor[KmlRendererSettings.G];
		int blue = (int) settings.countColor[KmlRendererSettings.B];
		int alpha = (int) settings.countAlpha;

		Color color = new Color(red, green, blue, alpha);

		KmlStyle style = new KmlStyle(color);
		style.setId(style.toString());

		if (!styles.contains(style)) {
			styles.add(style);
		}

		// set time
		TimeSpan timeSpan = new TimeSpan();
		// DateTime startDate = formatter.parseDateTime(count.getStartTime());
		// DateTime endDate = formatter.parseDateTime(count.getEndTime());
		LocalDate startDate = formatter.parseLocalDate(count.getStartTime());
		LocalDate endDate = formatter.parseLocalDate(count.getEndTime());

		timeSpan.setBegin(startDate.toString());
		timeSpan.setEnd(endDate.toString());
		placemark.setTimePrimitive(timeSpan);

		PolyStyle polyStyle = new PolyStyle();
		polyStyle.setOutline(false);
		polyStyle.setColor(getKMLColor(style.getFillColor()));
		style.setPolyStyle(polyStyle);
		placemark.setStyleUrl(style.getId());

		kmlframework.kml.Polygon kfPolygon = new kmlframework.kml.Polygon();
		kfPolygon.setTessellate(true);
		kfPolygon.setOuterBoundary(linearRing);
		placemark.setGeometry(kfPolygon);
		placemark.setName(name);

		placemark.setDescription(label);

		return placemark;

	}// END: generateCount

	// /////////////
	// ---UTILS---//
	// /////////////

	private List<kmlframework.kml.Point> generateCircle(Coordinate centroid,
			double area, int numPoints) throws AnalysisException {

		double radius = Math.sqrt(area / Math.PI);

		Double latitude = centroid.getXCoordinate();
		Double longitude = centroid.getYCoordinate();

		List<kmlframework.kml.Point> points = new ArrayList<kmlframework.kml.Point>();

		double dLongitude = Math.toDegrees((radius / Utils.EARTH_RADIUS));
		double dLatitude = dLongitude / Math.cos(Math.toRadians(latitude));

		for (int i = 0; i < numPoints; i++) {

			double theta = 2.0 * Math.PI * (i / (double) numPoints);
			double cLatitude = latitude + (dLongitude * Math.cos(theta));
			double cLongitude = longitude + (dLatitude * Math.sin(theta));

			Coordinate coordinate = new Coordinate(cLatitude, cLongitude);
			points.add(generatePoint(coordinate));

		} // END: numPoints loop

		return points;
	}// END: GenerateCircle

	private Coordinate getCoordinate(Point point) throws AnalysisException {

		Coordinate coordinate = null;
		if (point.hasLocation()) {
			coordinate = point.getLocation().getCoordinate();
		} else {
			coordinate = point.getCoordinate();
		}

		return coordinate;
	}// END: getCoordinate

	private Point getPoint(List<Point> points, String id) {

		Point startPoint = null;
		for (Point p : points) {
			if (p.getId().equalsIgnoreCase(id)) {
				startPoint = p;
				break;
			}

		}

		return startPoint;
	}// END: getPoint

	private Attribute getAttribute(List<Attribute> attributes, String id) {

		Attribute attribute = null;
		for (Attribute att : attributes) {
			if (att.getId().equalsIgnoreCase(id)) {
				attribute = att;
				break;
			}

		}

		return attribute;
	}// END: getAttribute

	private int getIndex(Set<? extends Object> set, Object value) {
		int result = 0;
		for (Object entry : set) {
			if (entry.equals(value))
				return result;
			result++;
		}
		return -1;
	}

	private String getKMLColor(Color color) {
		/**
		 * converts a Java color into a 4 channel hex color string.
		 * 
		 * @param color
		 * @return the color string
		 */
		String a = Integer.toHexString(color.getAlpha());
		String b = Integer.toHexString(color.getBlue());
		String g = Integer.toHexString(color.getGreen());
		String r = Integer.toHexString(color.getRed());
		return (a.length() < 2 ? "0" : "") + a + (b.length() < 2 ? "0" : "")
				+ b + (g.length() < 2 ? "0" : "") + g
				+ (r.length() < 2 ? "0" : "") + r;
	}// END: getKMLColor

	private double map(double value, double fromLow, double fromHigh,
			double toLow, double toHigh) {
		return (toLow + (toHigh - toLow)
				* ((value - fromLow) / (fromHigh - fromLow)));
	}// END: map

	private LinkedList<Coordinate> getIntermediateCoords(
			Coordinate startCoordinate, Coordinate endCoordinate, int sliceCount)
			throws AnalysisException {

		LinkedList<Coordinate> coords = new LinkedList<Coordinate>();

		double distance = Utils.rhumbDistance(startCoordinate, endCoordinate);

		double distanceSlice = distance / (double) sliceCount;

		// Convert to radians
		double rlon1 = longNormalise(Math.toRadians(startCoordinate
				.getYCoordinate()));
		double rlat1 = Math.toRadians(startCoordinate.getXCoordinate());
		double rlon2 = longNormalise(Math.toRadians(endCoordinate
				.getYCoordinate()));
		double rlat2 = Math.toRadians(endCoordinate.getXCoordinate());

		coords.add(0, startCoordinate);
		for (int i = 1; i < sliceCount; i++) {

			distance = distanceSlice;
			double rDist = distance / Utils.EARTH_RADIUS;

			double bearing = rhumbBearing(rlon1, rlat1, rlon2, rlat2);

			// use the bearing and the start point to find the destination
			double newLonRad = longNormalise(rlon1
					+ Math.atan2(
							Math.sin(bearing) * Math.sin(rDist)
									* Math.cos(rlat1),
							Math.cos(rDist) - Math.sin(rlat1) * Math.sin(rlat2)));

			double newLatRad = Math.asin(Math.sin(rlat1) * Math.cos(rDist)
					+ Math.cos(rlat1) * Math.sin(rDist) * Math.cos(bearing));

			// Convert from radians to degrees
			double newLat = Math.toDegrees(newLatRad);
			double newLon = Math.toDegrees(newLonRad);

			Coordinate newCoord = new Coordinate(newLat, newLon);
			coords.add(i, newCoord);

			// This updates the input to calculate new bearing
			rlon1 = newLonRad;
			rlat1 = newLatRad;

			distance = Utils.rhumbDistance(newCoord, endCoordinate);

			distanceSlice = distance / (sliceCount - i);

		} // END: sliceCount loop
		coords.add(sliceCount, endCoordinate);

		return coords;
	}// END: getIntermediateCoords

	private double longNormalise(double lon) {
		// normalise to -180...+180
		return (lon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
	}// END: longNormalise

	private double rhumbBearing(double rlon1, double rlat1, double rlon2,
			double rlat2) {
		/**
		 * Returns the bearing from start point to the supplied point along a
		 * rhumb line
		 * 
		 * @param rlat1
		 *            : start point latitude in radians
		 * @param rlon1
		 *            : start point longitude in radians
		 * @param rlat2
		 *            : end point latitude in radians
		 * @param rlon2
		 *            : end point longitude in radians
		 * 
		 * @returns Initial bearing in degrees from North
		 */
		double dLon = (rlon2 - rlon1);

		double dPhi = Math.log(Math.tan(rlat2 / 2 + Math.PI / 4)
				/ Math.tan(rlat1 / 2 + Math.PI / 4));
		if (Math.abs(dLon) > Math.PI)
			dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);

		double brng = Math.atan2(dLon, dPhi);

		return Math.toRadians((Math.toDegrees(brng) + 360) % 360);
	}// END: rhumbBearing

	private double limitValue(double value, double lower, double upper) {

		Double limitedValue = value;

		if (value <= lower) {
			limitedValue = 0.0;
		}

		if (value >= upper) {
			limitedValue = upper;

		}

		return limitedValue;
	}// END: limitValue
	
}// END: class
