package parsers;

import java.io.IOException;
import java.util.LinkedList;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.parsing.DiscreteTreeSettings;
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
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

public class DiscreteTreeSpreadDataParser {

	private DiscreteTreeSettings settings;

	public DiscreteTreeSpreadDataParser(DiscreteTreeSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException,
			AnalysisException, IllegalCharacterException,
			LocationNotFoundException {

		TimeLine timeLine = null;
		LinkedList<Attribute> mapAttributes = null;
		LinkedList<Attribute> lineAttributes = null;
		LinkedList<Attribute> pointAttributes = null;
		LinkedList<Location> locationsList = null;

		LinkedList<Layer> layersList = new LinkedList<Layer>();

		// ---IMPORT---//

		RootedTree rootedTree = Utils.importRootedTree(settings.treeFilename);

		System.out.println("Imported tree");
		
		DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
				settings.locationsFilename, settings.header);
		locationsList = locationsParser.parseLocations();

		System.out.println("Imported locations");
		
		// ---PARSE AND FILL STRUCTURES---//

		// ---TIME---//
		
		TimeParser timeParser = new TimeParser(settings.mrsd);
		timeLine = timeParser.getTimeLine(rootedTree.getHeight(rootedTree
				.getRootNode()));

		System.out.println("Parsed time line");
		
		// ---GEOJSON LAYER---//

		if (settings.geojsonFilename != null) {

			GeoJSONParser geojsonParser = new GeoJSONParser(settings.geojsonFilename);
			GeoJsonData geojson = geojsonParser.parseGeoJSON();

			mapAttributes = geojsonParser.getUniqueMapAttributes();

			String geojsonLayerId = Utils.splitString(settings.geojsonFilename, "/");
			Layer geojsonLayer = new Layer(geojsonLayerId, //
					"GeoJson layer", //
					geojson);

			layersList.add(geojsonLayer);

			System.out.println("Parsed map attributes");

		}// END: null check
		
		// ---DATA LAYER (POINTS WITH COUNTS)---//
		
		DiscreteTreeParser treeParser = new DiscreteTreeParser( //
				rootedTree, //
				settings.locationAttributeName, //
				locationsList, //
				timeParser, //
				settings.timescaleMultiplier//
		);
		treeParser.parseTree();

		LinkedList<Point> countsList = treeParser.getCountsList();
		
		String countsLayerId = Utils.splitString(settings.treeFilename, "/");
		Layer countsLayer = new Layer(countsLayerId, //
				"Lineages holding the state", //
				countsList //
		);

		layersList.add(countsLayer);
		
		System.out.println("Parsed counts");
		
		// ---DATA LAYER (TREE LINES & POINTS WITH LOCATIONS)---//

		LinkedList<Line> linesList = treeParser.getLinesList();
		LinkedList<Point> pointsList = treeParser.getPointsList();

		String treeLayerId = Utils.splitString(settings.treeFilename, "/");
		Layer treeLayer = new Layer(treeLayerId, //
				"Discrete tree visualisation", //
				pointsList, //
				linesList //
		);

		layersList.add(treeLayer);

		System.out.println("Parsed lines and points");
		
		lineAttributes = treeParser.getLineAttributes();
		pointAttributes = treeParser.getPointAttributes();

		Attribute xCoordinate = locationsParser.getxCoordinateAttribute();
		Attribute yCoordinate = locationsParser.getyCoordinateAttribute();
		pointAttributes.add(xCoordinate);
		pointAttributes.add(yCoordinate);
        AxisAttributes axis = new AxisAttributes(xCoordinate.getId(), yCoordinate.getId());
		
		System.out.println("Parsed tree attributes");

		SpreadData data = new SpreadData(timeLine, //
				axis,
				mapAttributes, //
				lineAttributes, //
				pointAttributes, //
				locationsList, //
				layersList //
		);

		return data;
	}// END: parse

}// END: class
