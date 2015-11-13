package readers;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Set;

import org.joda.time.LocalDate;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import settings.reading.JsonMergerSettings;
import structure.data.Attribute;
import structure.data.AxisAttributes;
import structure.data.Layer;
import structure.data.Location;
import structure.data.SpreadData;
import structure.data.TimeLine;
import structure.data.attributable.Line;
import structure.data.primitive.Polygon;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class JsonMerger {

	private JsonMergerSettings settings;

	public JsonMerger(JsonMergerSettings settings) {

		this.settings = settings;

	}// END: Constructor

	public SpreadData merge() throws FileNotFoundException {

		SpreadData data = null;

		// compile a unique list of files
		Set<String> jsonFiles = new HashSet<String>();

		for (String file : settings.pointsFiles) {
			jsonFiles.add(file);
		}

		for (String file : settings.linesFiles) {
			jsonFiles.add(file);
		}

		for (String file : settings.areasFiles) {
			jsonFiles.add(file);
		}

		for (String file : settings.geojsonFiles) {
			jsonFiles.add(file);
		}

		jsonFiles.add(settings.axisAttributesFile);

		// Utils.printArray(jsonFiles.toArray());

		DateTimeFormatter dateFormatter = DateTimeFormat
				.forPattern("yyyy/MM/dd");

		TimeLine timeLine = null;
		AxisAttributes axisAttributes = null;
		Set<Attribute> mapAttributes = null;
		Set<Attribute> lineAttributes = null;
		Set<Attribute> pointAttributes = null;
		Set<Location> locations = null;
		LinkedList<Layer> layers = null;

		boolean timeLineCreated = false;
		boolean mapAttributesCreated = false;
		boolean pointAttributesCreated = false;
		boolean lineAttributesCreated = false;

		for (String file : jsonFiles) {

			Reader reader = new FileReader(file);
			Gson gson = new GsonBuilder().create();
			SpreadData json = gson.fromJson(reader, SpreadData.class);

			// ---TIME LINE---//
			if (!timeLineCreated) {

				timeLine = json.getTimeLine();
				if (timeLine != null) {
					timeLineCreated = false;
				}

			} else {

				timeLine = compareTimeLines(timeLine, json.getTimeLine(),
						dateFormatter);

			}// END: first check

			// ---AXIS ATTRIBUTES---//

			if (file.equalsIgnoreCase(settings.axisAttributesFile)) {
				axisAttributes = json.getAxisAttributes();
			}

			// --- MAP ATTRIBUTES---//

			if (Arrays.asList(settings.geojsonFiles).contains(file)) {

				if (!mapAttributesCreated) {
					mapAttributes = new HashSet<Attribute>();
					mapAttributes.addAll(json.getMapAttributes());

					if (mapAttributes != null) {
						mapAttributesCreated = true;
					}

				} else {
					mapAttributes.addAll(json.getMapAttributes());
				}// END: first check

			}// END: map check

			// --- POINT ATTRIBUTES---//

			if (Arrays.asList(settings.pointsFiles).contains(file)) {

				if (!pointAttributesCreated) {

					pointAttributes = new HashSet<Attribute>();
					pointAttributes.addAll(json.getPointAttributes());

					if (pointAttributes != null) {
						pointAttributesCreated = true;
					}

				} else {
					pointAttributes.addAll(json.getPointAttributes());
				}// END: first check

			}// END: map check

			// --- LINE ATTRIBUTES---//

			if (Arrays.asList(settings.linesFiles).contains(file)) {

				if (!lineAttributesCreated) {

					lineAttributes = new HashSet<Attribute>();
					lineAttributes.addAll(json.getLineAttributes());

					if (mapAttributes != null) {
						lineAttributesCreated = true;
					}

				} else {
					lineAttributes.addAll(json.getLineAttributes());
				}// END: first check

			}// END: map check

			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
		}// END: json loop

		// ---SPREAD DATA---//

		LinkedList<Attribute> mapAttributesList = null;
		if (mapAttributes != null) {
			mapAttributesList = new LinkedList<Attribute>(mapAttributes);
		}

		LinkedList<Attribute> lineAttributesList = null;
		if (lineAttributes != null) {
			lineAttributesList = new LinkedList<Attribute>(lineAttributes);
		}

		LinkedList<Attribute> pointAttributesList = null;
		if (pointAttributes != null) {
			pointAttributesList = new LinkedList<Attribute>(pointAttributes);
		}

		LinkedList<Location> locationsList = null;
		if (locations != null) {
			locationsList = new LinkedList<Location>(locations);
		}

		data = new SpreadData(timeLine, //
				axisAttributes, //
				mapAttributesList, //
				lineAttributesList, //
				pointAttributesList, //
				locationsList, //
				layers);

		return data;
	}// END: merge

	private TimeLine compareTimeLines(TimeLine current, TimeLine candidate,
			DateTimeFormatter dateFormatter) {

		TimeLine timeLine = null;

		LocalDate currentStart = dateFormatter.parseLocalDate(current
				.getStartTime());
		LocalDate candidateStart = dateFormatter.parseLocalDate(candidate
				.getStartTime());

		String newStartTime = dateFormatter.print(currentStart);
		if (candidateStart.isBefore(currentStart)) {
			newStartTime = dateFormatter.print(candidateStart);
		}

		LocalDate currentEnd = dateFormatter.parseLocalDate(current
				.getEndTime());
		LocalDate candidateEnd = dateFormatter.parseLocalDate(candidate
				.getEndTime());

		String newEndTime = dateFormatter.print(currentEnd);
		if (candidateEnd.isAfter(currentEnd)) {
			newEndTime = dateFormatter.print(candidateEnd);
		}

		timeLine = new TimeLine(newStartTime, newEndTime);

		return timeLine;
	}// END: compareTimeLines

	// public SpreadData merge() throws FileNotFoundException {
	//
	// TimeLine timeLine = null;
	// LinkedList<Location> locationsList = null;
	// LinkedList<Line> linesList = null;
	// LinkedList<Polygon> polygonsList = null;
	// String name = "";
	//
	// // ---TIME LINE---//
	//
	//
	// // ---LOCATIONS---//
	//
	// if (settings.points != null) {
	// locationsList = new LinkedList<Location>();
	//
	// System.out.println("Reading locations");
	//
	// for (int i = 0; i < settings.points.length; i++) {
	//
	// Reader reader = new FileReader(settings.points[i]);
	// name += settings.points[i];
	//
	// Gson gson = new GsonBuilder().create();
	// SpreadData input = gson.fromJson(reader, SpreadData.class);
	//
	// locationsList.addAll(input.getLocations());
	//
	// }
	// }// END: null check
	//
	// // ---LINES---//
	//
	// if (settings.lines != null) {
	// linesList = new LinkedList<Line>();
	//
	// System.out.println("Reading lines");
	//
	// for (int i = 0; i < settings.lines.length; i++) {
	//
	// Reader reader = new FileReader(settings.lines[i]);
	// name += settings.lines[i];
	//
	// Gson gson = new GsonBuilder().create();
	// SpreadData input = gson.fromJson(reader, SpreadData.class);
	//
	// for (Layer layer : input.getLayers()) {
	//
	// linesList.addAll(layer.getLines());
	//
	// }
	//
	// }
	// }// END: null check
	//
	// // ---POLYGONS---//
	//
	// if (settings.areas != null) {
	// polygonsList = new LinkedList<Polygon>();
	//
	// System.out.println("Reading polygons");
	//
	// for (int i = 0; i < settings.areas.length; i++) {
	//
	// Reader reader = new FileReader(settings.areas[i]);
	// name += settings.areas[i];
	//
	// Gson gson = new GsonBuilder().create();
	// SpreadData input = gson.fromJson(reader, SpreadData.class);
	//
	// for (Layer layer : input.getLayers()) {
	//
	// // polygonsList.addAll(layer.getPolygons());
	//
	// }
	//
	// }
	// }// END: null check
	//
	// LinkedList<Layer> layersList = new LinkedList<Layer>();
	//
	// // Layer layer = new Layer(name, "merged visualisation", linesList,
	// // polygonsList);
	// // layersList.add(layer);
	//
	// SpreadData data=null;// = new SpreadData(timeLine, locationsList,
	// layersList);
	//
	// return data;
	// }// END: merge

}// END: class
