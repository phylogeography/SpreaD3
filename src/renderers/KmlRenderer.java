package renderers;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import parsers.ContinuousLinesParser;
import parsers.ContinuousPolygonsParser;
import parsers.DiscreteColorsParser;

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
import kmlframework.kml.Point;
import kmlframework.kml.PolyStyle;
import kmlframework.kml.StyleSelector;
import settings.KmlRendererSettings;
import utils.Trait;
import utils.Utils;
import data.SpreadData;
import data.structure.Coordinate;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;

public class KmlRenderer {

	public static final double EARTH_RADIUS = 6371.0;
	
	private SpreadData data;
	private KmlRendererSettings settings;
	
	private Map<Object, Color> lineColorMap = new LinkedHashMap<Object, Color>();
	private Map<Object, Integer> lineAlphaMap = new LinkedHashMap<Object, Integer>();
	private Map<Object, Double> lineAltitudeMap = new LinkedHashMap<Object, Double>();
	private Map<Object, Double> lineWidthMap = new LinkedHashMap<Object, Double>();
	
	
	
	private Map<Object, Color> polygonColorMap = new LinkedHashMap<Object, Color>();
	private Map<Object, Integer> polygonAlphaMap = new LinkedHashMap<Object, Integer>();

	private List<StyleSelector> styles = new ArrayList<StyleSelector>();
	
	public KmlRenderer(SpreadData data, KmlRendererSettings settings) {
		
		this.data = data;
		this.settings = settings;
		
	}//END: Constructor
	
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
	
	private Feature generateLocations(List<Location> locations) {
		
		Folder folder = new Folder();
		folder.setName("locations");
		
		for(Location location : locations) {
			
			folder.addFeature(generateLocation(location));
			
		}//EMD: locations list
		
		return folder;
	}//END: generateLocations
	
	private Placemark generateLocation(Location location) {
		
		Placemark placemark = new Placemark();
		placemark.setName(location.getId());
		placemark.setGeometry(generatePoint(location.getCoordinate()));
		
		return placemark;
	}//END: generateLocation
	
	// //////////////
	// ---LAYERS---//
	// //////////////
	
	private Feature generateLayer(Layer layer) throws IOException {

		Folder folder = new Folder();
		
		folder.setName(layer.getId());
		folder.setDescription(layer.getDescription());
		
		folder.addFeature(generateLines(layer.getLines()));
		folder.addFeature(generatePolygons(layer.getPolygons()));
		
		return folder;
	}

	// ---LINES---//
	
	private Feature generateLines(List<Line> lines) throws IOException {

		Folder folder = new Folder();
		folder.setName("lines");
		
		// read the supplied colors and create lineColorMap
		if (settings.lineColors != null) {
			
			DiscreteColorsParser colorsParser = new DiscreteColorsParser( settings.lineColors);
			lineColorMap = colorsParser.parseColors();
			
		}
		
		// Map trait values (String | Double) to numerical values (Double)
		Double factorValue = 1.0;
		Map<Object, Double> valueMap = new HashMap<Object, Double>();
		
	    for(Line line : lines) {
			
	    	// Get the mapping for node attributes
			Map<String, Trait> attributes = line.getAttributes();
			for (Trait trait : attributes.values()) {

				Object traitValue =  trait.isNumber() ? trait.getValue()[0] : (String) trait.getId();
					if (!valueMap.containsKey(traitValue)) {
						
						if(trait.isNumber()) { 
							valueMap.put( traitValue, (Double) traitValue);
						} else {
							valueMap.put(traitValue, factorValue);
							factorValue++;
						}//END: isNumber check
						
					}//END: contains check
			}//END: nodeAttributes loop
			
	    }//END: lines loop
		
	 double maxValue = Collections.max(valueMap.values());
	 double minValue = Collections.min(valueMap.values());	
		
		for(Line line : lines) {
			
			folder.addFeature(generateLine(line, valueMap, minValue, maxValue));
			
		}//END: lines loop
		
		return folder;
	}//END: generateLines

	private Feature generateLine(
			Line line, //
			Map<Object, Double> valueMap, //
			double minValue, //
			double maxValue //
	) {

		//TODO: make this a setting
		int sliceCount = 10;
		
		Folder folder = new Folder();
		String name = "";
		String label = "";
		
		Double startTime = line.getStartTime();
		
		Coordinate startCoordinate;
		Coordinate endCoordinate;
		if (line.connectsLocations()) {

			Location startLocation = line.getStartLocation();
			Location endLocation = line.getEndLocation();

			 name = startLocation.getId() + " to " + endLocation.getId();
			
			startCoordinate = startLocation.getCoordinate();
			endCoordinate = endLocation.getCoordinate();

		} else {

			startCoordinate = line.getStartCoordinate();
			endCoordinate = line.getEndCoordinate();

		}
		
		//---LINE COLOR---//
		
		Color startColor;
		int startRed = 255, startGreen = 255, startBlue = 255, startAlpha = 0;
		
		Color endColor;
		int endRed = 255, endGreen = 255, endBlue = 255, endAlpha = 0;
		
		if (this.settings.lineColorMapping != null) { // map

			Trait startTrait = line.getAttributes().get(settings.lineColorMapping);
			
			if(startTrait == null) {
				startTrait = line.getAttributes().get(ContinuousLinesParser.START + settings.lineColorMapping);
			}
			
			if(startTrait == null) {
				throw new RuntimeException("Trait " + settings.lineColorMapping + " missing from file");
			}
			
			Object startKey = startTrait.isNumber() ? startTrait.getValue()[0] : (String) startTrait.getId();
			
			if (lineColorMap.containsKey(startKey)) {
				
				// read the supplied color map, or re-use already mapped values
				Color c = lineColorMap.get(startKey);
				
				startRed = c.getRed();
				startGreen = c.getGreen();
				startBlue = c.getBlue();
				// take alpha value from map if file is supplied by the user 
				startAlpha = c.getAlpha();
				
			} else {
				
				// scale needs to be created | color for attribute not supplied
				// TODO: display warning for the latter case?
				
				Double startValue = valueMap.get(startKey);

				startRed = (int) map(startValue, minValue, maxValue,
						settings.minLineRed, settings.maxLineRed);
				startGreen = (int) map(startValue, minValue, maxValue,
						settings.minLineGreen, settings.maxLineGreen);
				startBlue = (int) map(startValue, minValue, maxValue,
						settings.minLineBlue, settings.maxLineBlue);
				
				Color c = new Color(startRed, startGreen, startBlue);
				lineColorMap.put(startKey, c);

			}// END: startkey check

			Trait endTrait = line.getAttributes().get(settings.lineColorMapping);
			
			if(endTrait == null) {
				endTrait = line.getAttributes().get(ContinuousLinesParser.START + settings.lineColorMapping);
			}
			
			if(endTrait == null) {
				throw new RuntimeException("Trait " + settings.lineColorMapping + " missing from file");
			}
			
			Object endKey = endTrait.isNumber() ? endTrait.getValue()[0] : (String) endTrait.getId();
			
			if (lineColorMap.containsKey(endKey)) {

				endColor = lineColorMap.get(endKey);

			} else {

				Double endValue = valueMap.get(endKey);

				endRed = (int) map(endValue, minValue, maxValue,
						settings.minLineRed, settings.maxLineRed);
				endGreen = (int) map(endValue, minValue, maxValue,
						settings.minLineGreen, settings.maxLineGreen);
				endBlue = (int) map(endValue, minValue, maxValue,
						settings.minLineBlue, settings.maxLineBlue);
				
				Color c = new Color(endRed, endGreen, endBlue);
				lineColorMap.put(endKey, c);

			}// END: endkey check

				label += (", "+settings.lineColorMapping + "="+startKey.toString().concat(" to ").concat(endKey.toString()));

		} else { // use defaults or user defined color

			startRed = (int) settings.lineColor[KmlRendererSettings.R];
			startGreen = (int) settings.lineColor[KmlRendererSettings.G];
			startBlue = (int) settings.lineColor[KmlRendererSettings.B];
			startAlpha = (int) settings.lineAlpha;
			
			endRed = startRed;
			endGreen = startGreen;
			endBlue = startBlue;
            endAlpha = startAlpha;
			
		}// END: settings check
		
		//---LINE ALPHA CHANEL---//
		
		// this should overwrite any previous settings
		if (this.settings.lineAlphaMapping != null) { // map
			
            Trait startTrait = line.getAttributes().get(settings.lineAlphaMapping);
			
			if(startTrait == null) {
				startTrait = line.getAttributes().get(ContinuousLinesParser.START + settings.lineAlphaMapping);
			}
			
			if(startTrait == null) {
				throw new RuntimeException("Trait " + settings.lineAlphaMapping + " missing from file");
			}
			
			Object startKey = startTrait.isNumber() ? startTrait.getValue()[0] : (String) startTrait.getId();
			
			if (lineAlphaMap.containsKey(startKey)) {
				
				startAlpha = lineAlphaMap.get(startKey);
				
			} else {
				
				Double startValue = valueMap.get(startKey);
				startAlpha = (int) map(startValue, minValue, maxValue, settings.minPolygonAlpha, settings.maxPolygonAlpha);
				
				lineAlphaMap.put(startKey, startAlpha);
				
			}// END: startkey check

			Trait endTrait = line.getAttributes().get(settings.lineAlphaMapping);
			
			if(endTrait == null) {
				endTrait = line.getAttributes().get(ContinuousLinesParser.START + settings.lineAlphaMapping);
			}
			
			if(endTrait == null) {
				throw new RuntimeException("Trait " + settings.lineAlphaMapping + " missing from file");
			}
			
			Object endKey = endTrait.isNumber() ? endTrait.getValue()[0] : (String) endTrait.getId();
			
			if (lineAlphaMap.containsKey(endKey)) {

				endAlpha = lineAlphaMap.get(endKey);

			} else {

				Double endValue = valueMap.get(endKey);
				endAlpha = (int) map(endValue, minValue, maxValue, settings.minPolygonAlpha, settings.maxPolygonAlpha);
				
				lineAlphaMap.put(endKey, endAlpha);

			}// END: endkey check

			label += (", "+settings.lineAlphaMapping + "="+startKey.toString().concat(" to ").concat(endKey.toString()));
			
		} // END: settings check
		
		// if alpha was specified by the user it overwrites previous settings
		if(settings.lineAlphaChanged) {
			startAlpha = (int) settings.lineAlpha;
			endAlpha = startAlpha;
		}//END: setting check
		
		startColor = new Color(startRed, startGreen, startBlue, startAlpha);
		endColor = new Color(endRed, endGreen, endBlue, endAlpha);
		
		//---LINE ALTITUDE---//
		
		Double altitude = 0.0;
		if (settings.lineAltitudeMapping != null) {// map

			Trait trait = line.getAttributes().get(
					settings.lineAltitudeMapping);
			Object key = trait.isNumber() ? trait.getValue()[0] : (String) trait.getId();

			if (lineAltitudeMap.containsKey(key)) {
				
				altitude = lineAltitudeMap.get(key);
				
			} else {

				Double value = valueMap.get(key);
				altitude = map(value, minValue, maxValue,
						settings.minLineAltitude, settings.maxLineAltitude);

				lineAltitudeMap.put(key, altitude);
				
			}// END: key check

		} else { // use defaults or user defined color

			altitude = settings.lineAltitude;

		}// END: settings check
		
		//---LINE WIDTH---//
		
		Double width = 0.0;
		if (settings.lineWidthMapping != null) {// map

			//TODO: traits which cannot be interpolated
			
			Trait trait = line.getAttributes().get(
					settings.lineWidthMapping);
			
			if(trait == null) {
				throw new RuntimeException("Trait " + settings.lineColorMapping + " missing from file");
			}
			
			Object key = trait.isNumber() ? trait.getValue()[0] : (String) trait.getId();

			if (lineWidthMap.containsKey(key)) {
				
				width = lineWidthMap.get(key);
				
			} else {

				Double value = valueMap.get(key);
				width = map(value, minValue, maxValue,
						settings.minLineWidth, settings.maxLineWidth);

				lineWidthMap.put(key, width);
				
			}// END: key check

		} else { // use defaults or user defined color

			width = settings.lineWidth;

		}// END: settings check
		
		//---CUT INTO LINE SEGMENTS---//
		
		double	a = -2 * altitude
				/ (Math.pow(sliceCount, 2) - sliceCount);
		double	b = 2 * altitude / (sliceCount - 1);

		double redStep = (endColor.getRed() - startColor.getRed()) / sliceCount;
		double greenStep = (endColor.getGreen() - startColor.getGreen()) / sliceCount;
		double blueStep = (endColor.getBlue() - startColor.getBlue()) / sliceCount;
		double alphaStep = (endColor.getAlpha() - startColor.getAlpha()) / sliceCount;
		
		LinkedList<Coordinate> coords = getIntermediateCoords(startCoordinate, endCoordinate, sliceCount);
		for (int i = 0; i < sliceCount; i++) {
			
			Double segmentStartTime = startTime;
			
			double segmentStartAltitude = a * Math.pow((double) i, 2) + b
					* (double) i;
	
			double segmentEndAltitude = a * Math.pow((double) (i + 1), 2) + b
					* (double) (i + 1);			
			
			Coordinate segmentStartCoordinate = coords.get(i);
			segmentStartCoordinate.setAltitude(segmentStartAltitude);
			
			Coordinate segmentEndCoordinate = coords.get(i + 1);			
            segmentEndCoordinate.setAltitude(segmentEndAltitude);
			
            // interpolate colors between start-end color
            int segmentRed = (int) (startColor.getRed() + redStep*i);
            int segmentGreen = (int) (startColor.getGreen() + greenStep*i);
            int segmentBlue = (int) (startColor.getBlue() + blueStep*i);
            int segmentAlpha = (int) (startColor.getAlpha() + alphaStep*i);
            
			Color segmentColor = new Color(segmentRed, segmentGreen, segmentBlue, segmentAlpha);
			
			Double segmentWidth = width;
			
			KmlStyle segmentStyle = new KmlStyle(segmentColor, segmentWidth);
			segmentStyle.setId(segmentStyle.toString());
	        
			if(!styles.contains(segmentStyle)){
				styles.add(segmentStyle);
			}
			
			Placemark lineSegment = generateLineSegment(segmentStartCoordinate, segmentEndCoordinate, segmentStartTime, segmentStyle );
			folder.addFeature(lineSegment);
			
		}//END: i loop
		
		folder.setName(name);
		folder.setDescription(label);
		
		return folder;
	}//END: generateLine

	private Placemark generateLineSegment(Coordinate startCoordinate, //
			Coordinate endCoordinate, //
			double startTime, //
			KmlStyle style //
			) {

		Placemark placemark = new Placemark();
		
		LineStyle lineStyle = new LineStyle();
		lineStyle.setColor(getKMLColor(style.getStrokeColor()));
		lineStyle.setWidth(style.getStrokeWidth());
		
		style.setLineStyle(lineStyle);
		
		placemark.setStyleUrl(style.getId());
		
		LineString lineString = new LineString();
		lineString.setTessellate(true);
		lineString.setAltitudeMode(AltitudeModeEnum.relativeToGround);
		
		List<Point> points = new ArrayList<Point>();
		points.add(generatePoint(startCoordinate));
		points.add(generatePoint(endCoordinate));

		lineString.setCoordinates(points);
		
		placemark.setGeometry(lineString);
		
		return placemark;
	}//END: generateLineSegment
	
	// ---POLYGONS---//

	private Feature generatePolygons(List<Polygon> polygons) throws IOException {

		Folder folder = new Folder();
		folder.setName("polygons");
//		folder.setDescription("polygons");
		
		// read the supplied colors and create lineColorMap
		if (settings.polygonColors != null) {
			
			DiscreteColorsParser colorsParser = new DiscreteColorsParser( settings.polygonColors);
			polygonColorMap = colorsParser.parseColors();
			
		}
		
		// Map trait values (String | Double) to numerical values (Double)
		//TODO: this processes all traits found in json, perhaps we should split them in maps for color, alpha, width, etc.
		Double factorValue = 1.0;
		Map<Object, Double> valueMap = new LinkedHashMap<Object, Double>();
	    for(Polygon polygon : polygons) {
			
			Map<String, Trait> attributes = polygon.getAttributes();
			for (Trait trait : attributes.values()) {

				Object traitValue =  trait.isNumber() ? trait.getValue()[0] : (String) trait.getId();
					if (!valueMap.containsKey(traitValue)) {
						
						if(trait.isNumber()) { 
							valueMap.put( traitValue, (Double) traitValue);
						} else {
							valueMap.put(traitValue, factorValue);
							factorValue++;
						}//END: isNumber check
						
					}//END: contains check
			}//END: attributes loop
	    }//END: polygons loop
	
		// get max and min for mappings
		double maxValue = Collections.max(valueMap.values());
		double minValue = Collections.min(valueMap.values());
	 
		// get Colors map
		KmlStyle style = null;
		for (Polygon polygon : polygons) {

			String label = "";
			Color color = null;
			
			int red = 255, green = 255, blue = 255, alpha = 0;
			if (this.settings.polygonColorMapping != null) {// map

				Trait trait = polygon.getAttributes().get(
						settings.polygonColorMapping);
				Object key = trait.isNumber() ? trait.getValue()[0] : (String) trait.getId();
				
				if (polygonColorMap.containsKey(key)) {

					// read the supplied color map, or re-use already mapped values
					Color c = polygonColorMap.get(key);
					red = c.getRed();
					green = c.getGreen();
					blue = c.getBlue();
					// take alpha value from map if file is supplied by the user 
                    alpha = c.getAlpha();
					
				} else {

					Double value = valueMap.get(key);

					 red = (int) map(value, minValue, maxValue,
							settings.minPolygonRed, settings.maxPolygonRed);
					 green = (int) map(value, minValue, maxValue,
							settings.minPolygonGreen, settings.maxPolygonGreen);
					 blue = (int) map(value, minValue, maxValue,
							settings.minPolygonBlue, settings.maxPolygonBlue);
					
					 Color c = new Color(red,green,blue);
					 polygonColorMap.put(key, c);
					 
				}// END: key check

				label = settings.polygonColorMapping + "=" + key.toString();
				
			} else {// use defaults or user defined color

				 red = (int) settings.polygonColor[KmlRendererSettings.R];
				 green = (int) settings.polygonColor[KmlRendererSettings.G];
				 blue = (int) settings.polygonColor[KmlRendererSettings.B];
				 alpha = (int) settings.polygonAlpha;
				 
			}// END: settings check
			
			// this should overwrite any previous settings
			if (this.settings.polygonAlphaMapping != null) { // map
				
				Trait trait = polygon.getAttributes().get(
						settings.polygonAlphaMapping);
				Object key = trait.isNumber() ? trait.getValue()[0] : (String) trait.getId();
				
				if (polygonAlphaMap.containsKey(key)) {

					alpha = polygonAlphaMap.get(key);
					
				} else {

					Double value = valueMap.get(key);
					alpha = (int) map(value, minValue, maxValue, settings.minPolygonAlpha, settings.maxPolygonAlpha);
					
				}// END: key check
				
				label += (", "+settings.polygonAlphaMapping + "="+key.toString());
				
			} // END: settings check
			
			// if alpha was specified by the user it overwrites previous settings
			if(settings.polygonAlphaChanged) {
				alpha = (int) settings.polygonAlpha;
			}//END: setting check
			
			color = new Color(red, green, blue, alpha);
			style = new KmlStyle(color);
			style.setId(style.toString());
		
			if (!styles.contains(style)) {
				styles.add(style);
			}
			
			Feature feature = generatePolygon(polygon, style);
			feature.setDescription(label);
			folder.addFeature(feature);

		}// END: polygons loop
		
		return folder;
	}//END: generatePolygons

	private Feature generatePolygon(Polygon polygon , KmlStyle style) {

		Placemark placemark = new Placemark();
		LinearRing linearRing = new LinearRing();
		List<Point> points = new ArrayList<Point>();
		String name = "";
		
		if(polygon.hasLocation()) {
			
//			Location centroid = polygon.getCentroid();
			String locationId = polygon.getLocationId();
			name = locationId;
			
			Location dummy = new Location(locationId, "", new Coordinate(0.0, 0.0), null);
			Integer centroidIndex = data.getLocations().indexOf(dummy);
			Location centroid = data.getLocations().get(centroidIndex);
			
			int numPoints = 36;
			
			//TODO: radius mapping
			double radius = 100;
			points.addAll(generateCircle(centroid, radius, numPoints));
			
		} else {
			
			Trait hpdTrait = polygon.getAttributes().get(ContinuousPolygonsParser.HPD);
			name = ((String) hpdTrait.getId()).concat(ContinuousPolygonsParser.HPD);
			
			for(Coordinate coordinate: polygon.getCoordinates()) {
				
				points.add(generatePoint(coordinate));
				
			}//END: coordinates loop
			
		}//END: centroid check
		
		linearRing.setCoordinates(points);
		
		if (style != null) {
			PolyStyle polyStyle = new PolyStyle();
			polyStyle.setOutline(false);
			polyStyle.setColor(getKMLColor(style.getFillColor()));
			style.setPolyStyle(polyStyle);
			placemark.setStyleUrl(style.getId());
		}
		
		kmlframework.kml.Polygon kfPolygon = new kmlframework.kml.Polygon();
		kfPolygon.setTessellate(true);
		kfPolygon.setOuterBoundary(linearRing);
		placemark.setGeometry(kfPolygon);
		placemark.setName(name);
		
		return placemark;
	}//END: generatePolygon
	
	private  List<Point> generateCircle(Location centroid, double radius, int numPoints) {

		Double latitude = centroid.getCoordinate().getLatitude();
		Double longitude = centroid.getCoordinate().getLongitude();
				
		List<Point> points = new ArrayList<Point>();
		
		double dLongitude = Math.toDegrees((radius / EARTH_RADIUS));
		double dLatitude = dLongitude / Math.cos(Math.toRadians(latitude));

		for (int i = 0; i < numPoints; i++) {

			double theta = 2.0 * Math.PI * (i / (double) numPoints);
			double cLatitude = latitude + (dLongitude * Math.cos(theta));
			double cLongitude = longitude + (dLatitude * Math.sin(theta));

			Coordinate coordinate = new Coordinate(cLatitude, cLongitude);
            points.add(generatePoint(coordinate));
			
		}// END: numPoints loop

		return points;
	}// END: GenerateCircle
	
	// /////////////
	// ---POINT---//
	// /////////////

	private Point generatePoint( Coordinate coordinate) {
		
		Point point = new Point();
		point.setAltitudeMode(AltitudeModeEnum.relativeToGround);
		point.setAltitude(coordinate.getAltitude());
		point.setLatitude(coordinate.getLatitude());
		point.setLongitude(coordinate.getLongitude());
		
		return point;
	}//END: generatePoint

	
	// /////////////
	// ---UTILS---//
	// /////////////
	
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
	}//END: getKMLColor
	
	
	private double map(double value, double fromLow, double fromHigh,
			double toLow, double toHigh) {
		/**
		 * maps a single value from its range into another interval
		 * 
		 * @param value - value to be mapped
		 * @param fromLow - range of value
		 * @param fromHigh - range of value
		 * @param toLow - interval
		 * @param toHigh - interval
		 * @return the mapped value
		 */
		return (value - fromLow) / (fromHigh - fromLow) * (toHigh - toLow) + toLow;
	}// END: map
	
	private LinkedList<Coordinate> getIntermediateCoords(
			Coordinate startCoordinate, Coordinate endCoordinate, int sliceCount) {

		LinkedList<Coordinate> coords = new LinkedList<Coordinate>();

		double distance = rhumbDistance(startCoordinate, endCoordinate);

		double distanceSlice = distance / (double) sliceCount;

		// Convert to radians
		double rlon1 = longNormalise(Math.toRadians(startCoordinate
				.getLongitude()));
		double rlat1 = Math.toRadians(startCoordinate.getLatitude());
		double rlon2 = longNormalise(Math.toRadians(endCoordinate
				.getLongitude()));
		double rlat2 = Math.toRadians(endCoordinate.getLatitude());

		coords.add(0, startCoordinate);
		for (int i = 1; i < sliceCount; i++) {

			distance = distanceSlice;
			double rDist = distance / EARTH_RADIUS;

			double bearing = rhumbBearing(rlon1, rlat1, rlon2, rlat2);

			// use the bearing and the start point to find the destination
			double newLonRad = longNormalise(rlon1 + Math.atan2( Math.sin(bearing) * Math.sin(rDist)
									* Math.cos(rlat1), Math.cos(rDist) - Math.sin(rlat1) * Math.sin(rlat2)));

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

			distance = rhumbDistance(newCoord, endCoordinate);

			distanceSlice = distance / (sliceCount - i);

		}// END: sliceCount loop
		coords.add(sliceCount, endCoordinate);
		
		return coords;
	}// END: getIntermediateCoords
	
	private double rhumbDistance(
			Coordinate startCoordinate, Coordinate endCoordinate
			) {
		/**
		 * Returns the distance from start point to the end point in km,
		 * travelling along a rhumb line
		 * 
		 * @param start
		 *            point Lon, Lat; end point Lon, Lat;
		 * 
		 * @return distance in km
		 */
		double rlon1 = Math.toRadians(startCoordinate.getLongitude());
		double rlat1 = Math.toRadians(startCoordinate.getLatitude());
		double rlon2 = Math.toRadians(endCoordinate.getLongitude());
		double rlat2 = Math.toRadians(endCoordinate.getLatitude());

		double dLat = (rlat2 - rlat1);
		double dLon = Math.abs(rlon2 - rlon1);

		double dPhi = Math.log(Math.tan(rlat2 / 2 + Math.PI / 4)
				/ Math.tan(rlat1 / 2 + Math.PI / 4));
		double q = (!Double.isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(rlat1); // E-W
		// line
		// gives
		// dPhi=0
		// if dLon over 180° take shorter rhumb across 180° meridian:
		if (dLon > Math.PI)
			dLon = 2 * Math.PI - dLon;
		double distance = Math.sqrt(dLat * dLat + q * q * dLon * dLon)
				* EARTH_RADIUS;

		return distance;
	}
	
	public static double longNormalise(double lon) {
		// normalise to -180...+180
		return (lon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
	}
	
	public static double rhumbBearing(double rlon1, double rlat1, double rlon2,
			double rlat2) {
		/**
		 * Returns the bearing from start point to the supplied point along a
		 * rhumb line
		 * 
		 * @param rlat1
		 *            , rlon1 : longitude/latitude in radians of start point
		 *            rlon2, rlat2 : longitude/latitude of end point
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
	}
	
}//END: class
