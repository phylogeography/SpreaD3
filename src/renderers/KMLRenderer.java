package renderers;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import kmlframework.kml.AltitudeModeEnum;
import kmlframework.kml.Document;
import kmlframework.kml.Feature;
import kmlframework.kml.Folder;
import kmlframework.kml.Kml;
import kmlframework.kml.KmlException;
import kmlframework.kml.LineString;
import kmlframework.kml.Placemark;
import kmlframework.kml.Point;
import data.SpreadData;
import data.structure.Coordinate;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;

public class KMLRenderer {

	private SpreadData data;
	
	
	public KMLRenderer(SpreadData data) {
		
		this.data = data;
		
	}//END: Constructor
	
	
	public void render() throws KmlException, IOException {
		
		PrintWriter writer = new PrintWriter(new File("test.kml"));
		
		// We create a new KML Document
		Kml kml = new Kml();
		kml.setXmlIndent(true);
		kml.setGenerateObjectIds(false);
		
		Document document = new Document();
		
		// We add a document to the kml
		kml.setFeature(document);
		
		//TODO: start adding Folders in the SpreadData order
		document.addFeature(generateLocations(data.getLocations()));

		for(Layer layer : data.getLayers()) {
			
			document.addFeature(generateLayer(layer));
			
		}
		
		kml.createKml(writer);
		
	}//END: render


	private Feature generateLayer(Layer layer) {

		Folder folder = new Folder();
		
		folder.setName(layer.getId());
		folder.setDescription(layer.getDescription());
		
		folder.addFeature(generateLines(layer.getLines()));
		
		//TODO
		folder.addFeature(generatePolygons(layer.getPolygons()));
		
		return folder;
	}


	private Feature generatePolygons(List<Polygon> polygons) {
		// TODO Auto-generated method stub
		return null;
	}


	private Feature generateLines(List<Line> lines) {

		Folder folder = new Folder();
		folder.setName("lines");
		folder.setDescription("lines");
		
		for(Line line : lines) {
			
			folder.addFeature(generateLine(line));
			
		}
		
		
		return folder;
	}


	private Feature generateLine(Line line) {

		Feature feature = null;
		
		Location startLocation = line.getStartLocation();
		Location endLocation = line.getEndLocation();
		
		Coordinate startCoordinate = startLocation.getCoordinate();
		Coordinate endCoordinate = endLocation.getCoordinate();
		
		Double startTime = line.getStartTime();
		
		//TODO: if line is segmented name the folder and put all the segments inside it
		
		feature = generateLineSegment(startCoordinate,endCoordinate, startTime );
		feature.setName(startLocation.getId() + " to " + endLocation.getId());
//		feature.setDescription(startLocation.getId() + " to " + endLocation.getId());
		
		return feature;
	}


	
	
	
	private Placemark generateLineSegment(Coordinate startCoordinate,
			Coordinate endCoordinate, double startTime) {

		Placemark placemark = new Placemark();
		
		LineString lineString = new LineString();
		lineString.setTessellate(true);
		lineString.setAltitudeMode(AltitudeModeEnum.relativeToGround);
		
		List<Point> points = new ArrayList<Point>();
		points.add(generatePoint(startCoordinate));
		points.add(generatePoint(endCoordinate));

		lineString.setCoordinates(points);
		
		placemark.setGeometry(lineString);
		
		return placemark;
	}


	private Feature generateLocations(List<Location> locations) {
		
		Folder folder = new Folder();
		
		
		folder.setName("locations");
		folder.setDescription("locations");
		
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
	
	private Point generatePoint( Coordinate coordinate) {
		
		Point point = new Point();
		point.setAltitudeMode(AltitudeModeEnum.relativeToGround);
		point.setAltitude(coordinate.getAltitude());
		point.setLongitude(coordinate.getLongitude());
		point.setLatitude(coordinate.getLatitude());
		
		return point;
	}//END: generateCoordinate
	
}//END: class
