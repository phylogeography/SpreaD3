//package readers;
//
//import java.io.FileNotFoundException;
//import java.io.FileReader;
//import java.io.Reader;
//import java.util.LinkedList;
//
//import com.google.gson.Gson;
//import com.google.gson.GsonBuilder;
//
//import data.SpreadData;
//import data.structure.Layer;
//import data.structure.Line;
//import data.structure.Location;
//import data.structure.Polygon;
//import data.structure.TimeLine;
//import settings.reading.JsonReaderSettings;
//
//public class JsonReader {
//
//	private JsonReaderSettings settings;
//
//	public JsonReader(JsonReaderSettings settings) {
//
//		this.settings = settings;
//
//	}// END: Constructor
//
//	public SpreadData read() throws FileNotFoundException {
//
//		TimeLine timeLine = null;
//		LinkedList<Location> locationsList = null;
//		LinkedList<Line> linesList = null;
//		LinkedList<Polygon> polygonsList = null;
//		String name = "";
//
//		// ---TIME LINE---//
//		
//		//TODO: big ass todo; compare dates and grow if neccessary
//		
//		// ---LOCATIONS---//
//
//		if (settings.locations != null) {
//			locationsList = new LinkedList<Location>();
//
//			System.out.println("Reading locations");
//			
//			for (int i = 0; i < settings.locations.length; i++) {
//
//				Reader reader = new FileReader(settings.locations[i]);
//				name += settings.locations[i];
//
//				Gson gson = new GsonBuilder().create();
//				SpreadData input = gson.fromJson(reader, SpreadData.class);
//
//				locationsList.addAll(input.getLocations());
//
//			}
//		}// END: null check
//
//		// ---LINES---//
//
//		if (settings.lines != null) {
//			linesList = new LinkedList<Line>();
//
//			System.out.println("Reading lines");
//			
//			for (int i = 0; i < settings.lines.length; i++) {
//
//				Reader reader = new FileReader(settings.lines[i]);
//				name += settings.lines[i];
//
//				Gson gson = new GsonBuilder().create();
//				SpreadData input = gson.fromJson(reader, SpreadData.class);
//
//				for (Layer layer : input.getLayers()) {
//
//					linesList.addAll(layer.getLines());
//
//				}
//
//			}
//		}// END: null check
//
//		// ---POLYGONS---//
//
//		if (settings.polygons != null) {
//			polygonsList = new LinkedList<Polygon>();
//			
//			System.out.println("Reading polygons");
//			
//			for (int i = 0; i < settings.polygons.length; i++) {
//
//				Reader reader = new FileReader(settings.polygons[i]);
//				name += settings.polygons[i];
//
//				Gson gson = new GsonBuilder().create();
//				SpreadData input = gson.fromJson(reader, SpreadData.class);
//
//				for (Layer layer : input.getLayers()) {
//
//					polygonsList.addAll(layer.getPolygons());
//
//				}
//
//			}
//		}// END: null check
//
//		LinkedList<Layer> layersList = new LinkedList<Layer>();
//
//		Layer layer = new Layer(name, "merged visualisation", linesList,
//				polygonsList);
//		layersList.add(layer);
//
//		SpreadData data = new SpreadData(timeLine, locationsList, layersList);
//
//		return data;
//	}// END: read
//
//}// END: class
