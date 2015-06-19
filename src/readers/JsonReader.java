package readers;

import java.util.LinkedList;

import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import settings.reading.JsonReaderSettings;

public class JsonReader {

	private JsonReaderSettings settings;

	public JsonReader(JsonReaderSettings settings) {

		this.settings = settings;

	}// END: Constructor

	public SpreadData read() {

		LinkedList<Location> locationsList = null;
		LinkedList<Polygon> polygonsList = null;
		LinkedList<Line> linesList = null;

		
		
		
		
		
		
		
		LinkedList<Layer> layersList = new LinkedList<Layer>();

		Layer layer = null;
		// new Layer(settings.tree,
		// "Continuous tree visualisation", linesList, polygonsList);

		layersList.add(layer);

		SpreadData data = new SpreadData(locationsList, layersList);

		return data;
	}// END: read

}// END: class
