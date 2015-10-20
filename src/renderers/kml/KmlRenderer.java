package renderers.kml;

import java.awt.Color;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import exceptions.AnalysisException;
import exceptions.MissingAttributeException;
import kmlframework.kml.AltitudeModeEnum;
import kmlframework.kml.Document;
import kmlframework.kml.Feature;
import kmlframework.kml.Folder;
import kmlframework.kml.Kml;
import kmlframework.kml.KmlException;
import kmlframework.kml.LinearRing;
import kmlframework.kml.Placemark;
import kmlframework.kml.PolyStyle;
import kmlframework.kml.StyleSelector;
import kmlframework.kml.TimeSpan;
import parsers.DiscreteColorsParser;
import renderers.Renderer;
import settings.rendering.KmlRendererSettings;
import structure.data.Attribute;
import structure.data.Layer;
import structure.data.Location;
import structure.data.SpreadData;
import structure.data.attributable.Area;
import structure.data.attributable.Point;
import structure.data.primitive.Coordinate;
import utils.Trait;
import utils.Utils;

public class KmlRenderer implements Renderer {

	// private static final int MIN_INDEX=0;
	// private static final int MAX_INDEX=1;

	private static final String TREE_LAYER_TYPE = "tree";
	private static final String ORDINAL = "ordinal";
	private static final String LINEAR = "linear";

	private SpreadData data;
	private KmlRendererSettings settings;

	// Points: area, color, alpha
	private Map<Object, Double> pointAreaMap = new LinkedHashMap<Object, Double>();
	private Map<Object, Color> pointColorMap = new LinkedHashMap<Object, Color>();
	private Map<Object, Integer> pointAlphaMap = new LinkedHashMap<Object, Integer>();

	// Areas: color, alpha
	private Map<Object, Color> areaColorMap = new LinkedHashMap<Object, Color>();
	private Map<Object, Integer> areaAlphaMap = new LinkedHashMap<Object, Integer>();

	// Lines: color, alpha, altitude, width
	private Map<Object, Color> lineColorMap = new LinkedHashMap<Object, Color>();
	private Map<Object, Integer> lineAlphaMap = new LinkedHashMap<Object, Integer>();
	private Map<Object, Double> lineAltitudeMap = new LinkedHashMap<Object, Double>();
	private Map<Object, Double> lineWidthMap = new LinkedHashMap<Object, Double>();

	// Counts: 
	
	private List<StyleSelector> styles = new ArrayList<StyleSelector>();

	public KmlRenderer(SpreadData data, KmlRendererSettings settings) {

		this.data = data;
		this.settings = settings;

	}// END: Constructor

	public void render() throws KmlException, IOException {

		PrintWriter writer = new PrintWriter(new File(settings.output));

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
			document.addFeature(generateLayer(layer));
		}

		kml.createKml(writer);
	}// END: render

	// /////////////////
	// ---LOCATIONS---//
	// /////////////////

	public Feature generateLocations(List<Location> locations) {

		Folder folder = new Folder();
		folder.setName("locations");

		for (Location location : locations) {

			folder.addFeature(generateLocation(location));

		} // EMD: locations list

		return folder;
	}// END: generateLocations

	private Placemark generateLocation(Location location) {

		Placemark placemark = new Placemark();
		placemark.setName(location.getId());
		placemark.setGeometry(generatePoint(location.getCoordinate()));

		return placemark;
	}// END: generateLocation

	// ---KML POINT---//

	private kmlframework.kml.Point generatePoint(Coordinate coordinate) {

		kmlframework.kml.Point point = new kmlframework.kml.Point();
		point.setAltitudeMode(AltitudeModeEnum.relativeToGround);
		point.setAltitude(coordinate.getAltitude());
		point.setLatitude(coordinate.getLatitude());
		point.setLongitude(coordinate.getLongitude());

		return point;
	}// END: generatePoint

	// //////////////
	// ---LAYERS---//
	// //////////////

	private Feature generateLayer(Layer layer) throws IOException {

		Folder folder = new Folder();

		folder.setName(layer.getId());
		folder.setDescription(layer.getDescription());

		if (layer.getType().equalsIgnoreCase(TREE_LAYER_TYPE)) {

			if (layer.hasPoints()) {
				folder.addFeature(generatePoints(layer.getPoints()));
			}

			// TODO : lines, areas

			// if (layer.hasLines()) {
			// folder.addFeature(generateLines(layer.getLines()));
			// }

			if (layer.hasAreas()) {
				folder.addFeature(generateAreas(layer.getAreas()));
			}

		} // END: type check

		return folder;
	}// END: generateLayer

	// ---AREAS---//

	public Feature generateAreas(List<Area> areas) throws IOException {

		Folder folder = new Folder();
		folder.setName("polygons");

		for (Area area : areas) {

			Feature feature = generateArea(area );
			folder.addFeature(feature);

		} // END: points loop
		
		return folder;
	}// END: generateAreas

	private Feature generateArea(Area area) {
		
		Placemark placemark = new Placemark();
		LinearRing linearRing = new LinearRing();
		List<kmlframework.kml.Point> points = new ArrayList<kmlframework.kml.Point>();
		String name = "";
		String label = "";
		
		// set time
		TimeSpan timeSpan = new TimeSpan();
		timeSpan.setBegin(area.getStartTime());
		placemark.setTimePrimitive(timeSpan);
		
		// add coordinates
		for(Coordinate coordinate: area.getPolygon().getCoordinates()) {
			
			points.add(generatePoint(coordinate));
			
		}//END: coordinates loop

		linearRing.setCoordinates(points);

		//---COLOR---//
		int red = (int) settings.areaColor[KmlRendererSettings.R];
		int green = (int) settings.areaColor[KmlRendererSettings.G];
		int blue = (int) settings.areaColor[KmlRendererSettings.B];
		int alpha = (int) settings.areaAlpha;

		Color color = new Color(red, green, blue, alpha);
		
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
	}//END: generateArea
	
	// ---POINTS---//

	private Feature generatePoints(List<Point> points) throws IOException {

		Folder folder = new Folder();
		folder.setName("points");

		// read the supplied colors and create lineColorMap
		if (settings.pointColors != null) {

			DiscreteColorsParser colorsParser = new DiscreteColorsParser(settings.pointColors);
			pointColorMap = colorsParser.parseColors();

		}

		Attribute areaAttribute = null;
		if (this.settings.pointAreaMapping != null) {
			areaAttribute = getAttribute(data.getPointAttributes(), settings.pointAreaMapping);
		}

		Attribute colorAttribute = null;
		if (this.settings.pointColorMapping != null) {
			colorAttribute = getAttribute(data.getPointAttributes(), settings.pointColorMapping);
		}

		for (Point point : points) {

			Feature feature = generatePoint(point, areaAttribute, colorAttribute);
			folder.addFeature(feature);

		} // END: points loop

		return folder;
	}// END: generatePoints

	private Feature generatePoint(Point point, Attribute areaAttribute, Attribute colorAttribute) {

		int numPoints = 36;

		Placemark placemark = new Placemark();
		LinearRing linearRing = new LinearRing();
		List<kmlframework.kml.Point> points = new ArrayList<kmlframework.kml.Point>();
		String name = "";
		String label = "";

		// ---AREA---//

		Double area = settings.pointArea;
		if (areaAttribute != null) {

			Object areaAttributeValue = point.getAttributes().get(settings.pointAreaMapping);

			if (pointAreaMap.containsKey(areaAttributeValue)) { // get from map

				area = pointAreaMap.get(areaAttributeValue);

			} else { // map it

				if (areaAttribute.getScale().equalsIgnoreCase(LINEAR)) {

					// value is value
					double value = (double) areaAttributeValue;
					double minValue = areaAttribute.getRange()[0];
					double maxValue = areaAttribute.getRange()[1];

					area = map(value, minValue, maxValue, settings.minPointArea, settings.maxPointArea);

				} else if (areaAttribute.getScale().equalsIgnoreCase(ORDINAL)) {

					// value is index
					double value = (double) getIndex(areaAttribute.getDomain(), areaAttributeValue);
					double minValue = 0;
					double maxValue = areaAttribute.getDomain().size();

					area = map(value, minValue, maxValue, settings.minPointArea, settings.maxPointArea);

				} else {
					//
				} // END: scale check

				// store for future reference
				pointAreaMap.put(areaAttributeValue, area);

			} // END: key check

			label = ("area[" + settings.pointAreaMapping + ":" + areaAttributeValue.toString() + "]");

		} // END: mapping check

		// add coordinates
		Coordinate coordinate = null;
		if (point.hasLocation()) {
			coordinate = point.getLocation().getCoordinate();
		} else {
			coordinate = point.getCoordinate();
		}

		points.addAll(generateCircle(coordinate, area, numPoints));
		linearRing.setCoordinates(points);

		// ---COLOR---//

		int red = (int) settings.pointColor[KmlRendererSettings.R];
		int green = (int) settings.pointColor[KmlRendererSettings.G];
		int blue = (int) settings.pointColor[KmlRendererSettings.B];
		int alpha = (int) settings.pointAlpha;

		Color color = new Color(red, green, blue, alpha);

		if (colorAttribute != null) {

			Object colorAttributeValue = point.getAttributes().get(settings.pointColorMapping);

			if (pointColorMap.containsKey(colorAttributeValue)) { // get from map

				color = pointColorMap.get(colorAttributeValue);

			} else { // map it

				if (colorAttribute.getScale().equalsIgnoreCase(LINEAR)) {

					// value is value
					double value = (double) colorAttributeValue;
					double minValue = colorAttribute.getRange()[0];
					double maxValue = colorAttribute.getRange()[1];

					red = (int) map(value, minValue, maxValue, settings.minPointRed, settings.maxPointRed);
					green = (int) map(value, minValue, maxValue, settings.minPointGreen, settings.maxPointGreen);
					blue = (int) map(value, minValue, maxValue, settings.minPointBlue, settings.maxPointBlue);

				} else if (colorAttribute.getScale().equalsIgnoreCase(ORDINAL)) {

					// value is index
					double value = (double) getIndex(colorAttribute.getDomain(), colorAttributeValue);
					double minValue = 0;
					double maxValue = colorAttribute.getDomain().size();

					red = (int) map(value, minValue, maxValue, settings.minPointRed, settings.maxPointRed);
					green = (int) map(value, minValue, maxValue, settings.minPointGreen, settings.maxPointGreen);
					blue = (int) map(value, minValue, maxValue, settings.minPointBlue, settings.maxPointBlue);

				} else {
					//
				} // END: scale check

				// store it for future reference
				color = new Color(red, green, blue, alpha);
				pointColorMap.put(colorAttributeValue, color);

			} // END: key check

			label += ", color[" + settings.pointColorMapping + "=" + colorAttributeValue.toString() + "]";

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

	// /////////////
	// ---UTILS---//
	// /////////////

	private List<kmlframework.kml.Point> generateCircle(Coordinate centroid, double area, int numPoints) {

		double radius = Math.sqrt(area / Math.PI);

		Double latitude = centroid.getLatitude();
		Double longitude = centroid.getLongitude();

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
		return (a.length() < 2 ? "0" : "") + a + (b.length() < 2 ? "0" : "") + b + (g.length() < 2 ? "0" : "") + g
				+ (r.length() < 2 ? "0" : "") + r;
	}// END: getKMLColor

	private double map(double value, double fromLow, double fromHigh, double toLow, double toHigh) {
		return (toLow + (toHigh - toLow) * ((value - fromLow) / (fromHigh - fromLow)));
	}// END: map

	private LinkedList<Coordinate> getIntermediateCoords(Coordinate startCoordinate, Coordinate endCoordinate,
			int sliceCount) {

		LinkedList<Coordinate> coords = new LinkedList<Coordinate>();

		double distance = Utils.rhumbDistance(startCoordinate, endCoordinate);

		double distanceSlice = distance / (double) sliceCount;

		// Convert to radians
		double rlon1 = longNormalise(Math.toRadians(startCoordinate.getLongitude()));
		double rlat1 = Math.toRadians(startCoordinate.getLatitude());
		double rlon2 = longNormalise(Math.toRadians(endCoordinate.getLongitude()));
		double rlat2 = Math.toRadians(endCoordinate.getLatitude());

		coords.add(0, startCoordinate);
		for (int i = 1; i < sliceCount; i++) {

			distance = distanceSlice;
			double rDist = distance / Utils.EARTH_RADIUS;

			double bearing = rhumbBearing(rlon1, rlat1, rlon2, rlat2);

			// use the bearing and the start point to find the destination
			double newLonRad = longNormalise(rlon1 + Math.atan2(Math.sin(bearing) * Math.sin(rDist) * Math.cos(rlat1),
					Math.cos(rDist) - Math.sin(rlat1) * Math.sin(rlat2)));

			double newLatRad = Math
					.asin(Math.sin(rlat1) * Math.cos(rDist) + Math.cos(rlat1) * Math.sin(rDist) * Math.cos(bearing));

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

	private double rhumbBearing(double rlon1, double rlat1, double rlon2, double rlat2) {
		/**
		 * Returns the bearing from start point to the supplied point along a
		 * rhumb line
		 * 
		 * @param rlat1:
		 *            start point latitude in radians
		 * @param rlon1:
		 *            start point longitude in radians
		 * @param rlat2:
		 *            end point latitude in radians
		 * @param rlon2:
		 *            end point longitude in radians
		 * 
		 * @returns Initial bearing in degrees from North
		 */
		double dLon = (rlon2 - rlon1);

		double dPhi = Math.log(Math.tan(rlat2 / 2 + Math.PI / 4) / Math.tan(rlat1 / 2 + Math.PI / 4));
		if (Math.abs(dLon) > Math.PI)
			dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);

		double brng = Math.atan2(dLon, dPhi);

		return Math.toRadians((Math.toDegrees(brng) + 360) % 360);
	}// END: rhumbBearing

}// END: class
