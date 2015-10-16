package parsers;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.LinkedList;

import exceptions.AnalysisException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;
import settings.parsing.BayesFactorsSettings;
import structure.data.Attribute;
import structure.data.AxisAttributes;
import structure.data.Layer;
import structure.data.Location;
import structure.data.SpreadData;
import structure.data.TimeLine;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import structure.geojson.GeoJsonData;

public class BayesFactorSpreadDataParser {

	private BayesFactorsSettings settings;

	public BayesFactorSpreadDataParser(BayesFactorsSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, IllegalCharacterException,
			AnalysisException, LocationNotFoundException {

		TimeLine timeLine = null;
		AxisAttributes axis = null;
		LinkedList<Attribute> mapAttributes = null;
		LinkedList<Attribute> lineAttributes = null;
		LinkedList<Attribute> pointAttributes = null;
		LinkedList<Location> locationsList = null;
		LinkedList<Layer> layersList = new LinkedList<Layer>();

		// ---IMPORT---//

		LogParser logParser = new LogParser(settings.log, settings.burnin);
		Double[][] indicators = logParser.parseIndicators();

		System.out.println("Imported log file");

		DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
				settings.locations, settings.header);
		locationsList = locationsParser.parseLocations();

		System.out.println("Imported locations");

		// ---PARSE AND FILL STRUCTURES---//

		// ---GEOJSON LAYER---//

		if (settings.geojson != null) {

			GeoJSONParser geojsonParser = new GeoJSONParser(settings.geojson);
			GeoJsonData geojson = geojsonParser.parseGeoJSON();

			// TODO: filename only as id
			Layer geojsonLayer = new Layer(settings.geojson, //
					"GeoJson layer", //
					geojson);

			layersList.add(geojsonLayer);

			System.out.println("Parsed map");
			
			mapAttributes = geojsonParser.getUniqueMapAttributes();
			
			System.out.println("Parsed map attributes");

		}// END: null check

		// ---DATA LAYER (LINES & POINTS WITH LOCATIONS)---//

		BayesFactorParser bayesFactorParser = new BayesFactorParser(
				locationsList, indicators);
		bayesFactorParser.parse();

		LinkedList<Line> linesList = bayesFactorParser.getLinesList();
		LinkedList<Point> pointsList = bayesFactorParser.getPointsList();

		Layer bfLayer = new Layer(settings.log, //
				"Bayes factors visualisation", //
				pointsList, //
				linesList //
		);

		layersList.add(bfLayer);

		System.out.println("Parsed the graph");

		lineAttributes = bayesFactorParser.getLineAttributes();
		// pointAttributes = bayesFactorParser.getPointAttributes();

		System.out.println("Parsed line attributes");

		SpreadData data = new SpreadData(timeLine, //
				axis, mapAttributes, //
				lineAttributes, //
				pointAttributes, //
				locationsList, //
				layersList //
		);

		return data;
	}// END: parse

}// END: class
