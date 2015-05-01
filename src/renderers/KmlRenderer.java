package renderers;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import utils.Utils;

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
import kmlframework.kml.StyleSelector;
import data.SpreadData;
import data.structure.Coordinate;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;

public class KmlRenderer {

	public static final double EARTH_RADIUS = 6371.0;
	
	private SpreadData data;
	private String output;
	
	private List<StyleSelector> styles = new ArrayList<StyleSelector>();
	
	public KmlRenderer(SpreadData data, String output) {
		
		this.data = data;
		this.output = output;
		
	}//END: Constructor
	
	public void render() throws KmlException, IOException {
		
		PrintWriter writer = new PrintWriter(new File(output));
		
		// create a new KML Document
		Kml kml = new Kml();
		kml.setXmlIndent(true);
		kml.setGenerateObjectIds(false);
		
		Document document = new Document();
		document.setStyleSelectors(styles);
		
		// add a document to the kml
		kml.setFeature(document);
		
		// locations go on top
		if(data.getLocations() != null) {
		document.addFeature(generateLocations(data.getLocations()));
		}
		
		// then layers
		for(Layer layer : data.getLayers()) {
			
			document.addFeature(generateLayer(layer));
			
		}
		
		kml.createKml(writer);
		
	}//END: render

	// /////////////////
	// ---LOCATIONS---//
	// /////////////////
	
	private Feature generateLocations(List<Location> locations) {
		
		Folder folder = new Folder();
		
		folder.setName("locations");
//		folder.setDescription("locations");
		
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
	
	private Feature generateLayer(Layer layer) {

		Folder folder = new Folder();
		
		folder.setName(layer.getId());
		folder.setDescription(layer.getDescription());
		
		folder.addFeature(generateLines(layer.getLines()));
		folder.addFeature(generatePolygons(layer.getPolygons()));
		
		return folder;
	}

	// ---LINES---//
	
	private Feature generateLines(List<Line> lines) {

		Folder folder = new Folder();
		folder.setName("lines");
//		folder.setDescription("lines");
		
		for(Line line : lines) {
			
			folder.addFeature(generateLine(line));
			
		}
		
		return folder;
	}//END: generateLines

	private Feature generateLine(Line line) {

		Feature feature = null;
		
		
		Coordinate startCoordinate;
		Coordinate endCoordinate;
		String name = "";
		
		if(line.connectsLocations()) {
			
		Location startLocation = line.getStartLocation();
		Location endLocation = line.getEndLocation();
		
		name = startLocation.getId() + " to " + endLocation.getId();
		
		 startCoordinate = startLocation.getCoordinate();
		 endCoordinate = endLocation.getCoordinate();
		 
		} else {
			
			startCoordinate = line.getStartCoordinate();
			endCoordinate = line.getEndCoordinate();
			
		}
		
//		System.out.println(startCoordinate.getLatitude() + " " + startCoordinate.getLongitude());
		Double startTime = line.getStartTime();
		
		//TODO: if line is segmented name the folder and put all the segments inside it
		
		feature = generateLineSegment(startCoordinate,endCoordinate, startTime );
		
		if (line.connectsLocations()) {
			feature.setName(name);
		}
		
		return feature;
	}//END: generateLine

	private Placemark generateLineSegment(Coordinate startCoordinate,
			Coordinate endCoordinate, double startTime) {

		Placemark placemark = new Placemark();
		
		//TODO
		
		// ////////
		
		// Style
		
		int branchStyleId = 1;
		
		int red = 10;
		int green = 150;
		int blue = 10;
		int alpha = 200;
		Color col = new Color(red, green, blue, alpha);
		
		int branchWidth = 2;
		
		KmlStyle style = new KmlStyle(col, branchWidth);
		style.setId("branch_style" + branchStyleId);
		branchStyleId++;		
		
		LineStyle lineStyle = new LineStyle();
		lineStyle.setColor(getKMLColor(style.getStrokeColor()));
		lineStyle.setWidth(style.getStrokeWidth());
		
		style.setLineStyle(lineStyle);
		
		placemark.setStyleUrl(style.getId());
		
		if(!styles.contains(style)){
			styles.add(style);
		}
		
//		document.setStyleSelectors(styles);
		
		// ////////
		
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

	private Feature generatePolygons(List<Polygon> polygons) {

		Folder folder = new Folder();
		folder.setName("polygons");
//		folder.setDescription("polygons");
		
		for(Polygon polygon : polygons) {
			
			folder.addFeature(generatePolygon(polygon));
			
		}
		
		
		return folder;
	}//END: generatePolygons

	
	
	private Feature generatePolygon(Polygon polygon) {

		Placemark placemark = new Placemark();
		
		LinearRing linearRing = new LinearRing();
		
		List<Point> points = new ArrayList<Point>();
		if(polygon.hasLocation()) {
			
//			Location centroid = polygon.getCentroid();
			String locationId = polygon.getLocationId();
			
			Location dummy = new Location(locationId, "", new Coordinate(0.0, 0.0), null);
			Integer centroidIndex = data.getLocations().indexOf(dummy);
			Location centroid = data.getLocations().get(centroidIndex);
			
			
			int numPoints = 36;
			//TODO: radius mapping: map to an attribute from Map chosen by the user
			double radius = 100;
			points.addAll(generateCircle(centroid, radius, numPoints));
			
		} else {
			
			for(Coordinate coordinate: polygon.getCoordinates()) {
				
				points.add(generatePoint(coordinate));
				
			}//END: coordinates loop
			
		}//END: centroid check
		
		linearRing.setCoordinates(points);
		
		kmlframework.kml.Polygon kfPolygon = new kmlframework.kml.Polygon();
		kfPolygon.setTessellate(true);
		kfPolygon.setOuterBoundary(linearRing);
		placemark.setGeometry(kfPolygon);
		
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
	
	public static String getKMLColor(Color color) {
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
	
	
	
	
	
	
	
	
	
	
	
}//END: class
