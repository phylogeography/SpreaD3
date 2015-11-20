package parsers;

import java.io.IOException;
import java.util.LinkedList;

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
import utils.Utils;
import exceptions.AnalysisException;

public class BayesFactorSpreadDataParser {

	private BayesFactorsSettings settings;

	public BayesFactorSpreadDataParser(BayesFactorsSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, AnalysisException {

		TimeLine timeLine = null;
		AxisAttributes axis = null;
		LinkedList<Attribute> mapAttributes = null;
		LinkedList<Attribute> lineAttributes = null;
		LinkedList<Attribute> pointAttributes = null;
		LinkedList<Layer> layersList = new LinkedList<Layer>();

		// ---IMPORT---//

		Double[][] indicators;
		if (settings.indicators != null) {

			indicators = settings.indicators;

		} else {

			LogParser logParser = new LogParser(settings.logFilename, settings.burninPercent);
			indicators = logParser.parseIndicators();

		}

		System.out.println("Imported log file");

		LinkedList<Location> locationsList;
		if (settings.locationsList != null) {

			locationsList = settings.locationsList;

		} else {

			DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(settings.locationsFilename,
					settings.hasHeader);
			locationsList = locationsParser.parseLocations();

		}

		System.out.println("Imported locations");

		// ---PARSE AND FILL STRUCTURES---//

		// ---GEOJSON LAYER---//

		if (settings.geojsonFilename != null) {

			GeoJSONParser geojsonParser = new GeoJSONParser(settings.geojsonFilename);
			GeoJsonData geojson = geojsonParser.parseGeoJSON();

			String geojsonLayerId = Utils.splitString(settings.geojsonFilename, "/");
			Layer geojsonLayer = new Layer(geojsonLayerId, //
					"GeoJson layer", //
					geojson);

			layersList.add(geojsonLayer);

			System.out.println("Parsed map");

			mapAttributes = geojsonParser.getUniqueMapAttributes();

			System.out.println("Parsed map attributes");

		} // END: null check

		// ---DATA LAYER (LINES & POINTS WITH LOCATIONS)---//

		BayesFactorParser bayesFactorParser = new BayesFactorParser(locationsList, indicators);
		bayesFactorParser.parse();

		LinkedList<Line> linesList = bayesFactorParser.getLinesList();
		LinkedList<Point> pointsList = bayesFactorParser.getPointsList();

		String bfLayerId = Utils.splitString(settings.logFilename, "/");
		Layer bfLayer = new Layer(bfLayerId, //
				"BF graph layer", // 
				pointsList, //
				linesList //
		);

		layersList.add(bfLayer);

		System.out.println("Parsed the graph");

		lineAttributes = bayesFactorParser.getLineAttributes();
		// pointAttributes = bayesFactorParser.getPointAttributes();

		System.out.println("Parsed line attributes");

		SpreadData data = new SpreadData(timeLine, //
				axis, //
				mapAttributes, //
				lineAttributes, //
				pointAttributes, //
				null, // areaAttributes
				locationsList, //
				layersList //
		);

		// TODO: write or print
		
		
		System.out.println("Bayes factors table: ");
		bayesFactorParser.printBfTable();

		String bfFilename = settings.outputFilename + ".txt";
		bayesFactorParser.writeBfTable(bfFilename);;
	
		System.out.println("Bayes factors table written to " + bfFilename);
		
		return data;
	}// END: parse

}// END: class
