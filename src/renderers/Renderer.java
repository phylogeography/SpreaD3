package renderers;

import java.io.IOException;
import java.util.List;

import kmlframework.kml.Feature;
import kmlframework.kml.KmlException;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.MissingAttributeException;

public interface Renderer {

	public void render() throws KmlException, IOException, MissingAttributeException;
	
//	public Feature generateLocations(List<Location> locations);
//	
//	public Feature generateLines(List<Line> lines) throws IOException, MissingAttributeException;
//	
//	public Feature generatePolygons(List<Polygon> polygons) throws IOException, MissingAttributeException;
	
}//END: interface
