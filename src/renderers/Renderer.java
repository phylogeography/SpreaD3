package renderers;

import java.io.IOException;

import kmlframework.kml.KmlException;
import exceptions.AnalysisException;
import exceptions.MissingAttributeException;

public interface Renderer {

	public void render() throws KmlException, IOException, MissingAttributeException, AnalysisException;
	
//	public Feature generateLocations(List<Location> locations);
//	
//	public Feature generateLines(List<Line> lines) throws IOException, MissingAttributeException;
//	
//	public Feature generatePolygons(List<Polygon> polygons) throws IOException, MissingAttributeException;
	
}//END: interface
