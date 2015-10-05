package parsers;

import java.io.IOException;
import java.util.LinkedList;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.parsing.DiscreteTreeSettings;
import structure.data.Attribute;
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

		RootedTree rootedTree = Utils.importRootedTree(settings.tree);

		// ---PARSE AND FILL STRUCTURES---//

		TimeParser timeParser = new TimeParser(settings.mrsd);
		timeParser.parseTime();
		timeLine = timeParser.getTimeLine(rootedTree.getHeight(rootedTree
				.getRootNode()));

		System.out.println("Parsed time line");

		DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
				settings.locations, settings.header);
		locationsList = locationsParser.parseLocations();

		System.out.println("Parsed locations");

		DiscreteTreeParser treeParser = new DiscreteTreeParser(rootedTree, //
				settings.locationTrait, //
				locationsList, //
				settings.mrsd, //
				settings.timescaleMultiplier//
		);
		treeParser.parseTree();

		lineAttributes = treeParser.getLineAttributes();
		pointAttributes = treeParser.getPointAttributes();

		System.out.println("Parsed tree attributes");

		// ---GEOJSON LAYER---//

		if (settings.geojson != null) {

			GeoJSONParser geojsonParser = new GeoJSONParser(settings.geojson);
			GeoJsonData geojson = geojsonParser.parseGeoJSON();

			mapAttributes = geojsonParser.getUniqueMapAttributes();

			// TODO: filename only as id
			Layer geojsonLayer = new Layer(settings.geojson, //
					"GeoJson layer", //
					geojson);

			layersList.add(geojsonLayer);

			System.out.println("Parsed map attributes");

		}// END: null check

		// ---DATA LAYER (POINTS WITH COUNTS)---//

		LinkedList<Point> countsList = treeParser.getCountsList();
		Layer countsLayer = new Layer(settings.tree, //
				"Lineages holding the state", //
				countsList //
		);

		layersList.add(countsLayer);

		// ---DATA LAYER (TREE LINES & POINTS WITH LOCATIONS)---//

		LinkedList<Line> linesList = treeParser.getLinesList();
		LinkedList<Point> pointsList = treeParser.getPointsList();

		Layer treeLayer = new Layer(settings.tree, //
				"Discrete tree visualisation", //
				pointsList, //
				linesList //
		);

		layersList.add(treeLayer);

		System.out.println("Parsed the tree");

		SpreadData data = new SpreadData(timeLine, //
				mapAttributes, //
				lineAttributes, //
				pointAttributes, locationsList, //
				layersList //
		);

		return data;
	}// END: parse

}// END: class
