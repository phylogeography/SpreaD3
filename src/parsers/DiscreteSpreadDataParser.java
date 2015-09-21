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
import structure.data.attributable.Area;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import structure.geojson.GeoJsonData;
import utils.Utils;
import exceptions.AnalysisException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

public class DiscreteSpreadDataParser {

	private DiscreteTreeSettings settings;

	public DiscreteSpreadDataParser(DiscreteTreeSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException,
			AnalysisException, IllegalCharacterException,
			LocationNotFoundException {

		TimeLine timeLine = null;
		LinkedList<Attribute> uniqueDataAttributes = null;
		LinkedList<Attribute> uniqueMapAttributes = null;
		LinkedList<Location> locationsList = null;

		LinkedList<Layer> layersList = null;
		LinkedList<Point> pointsList = null;
		LinkedList<Line> linesList = null;
		LinkedList<Area> areasList = null;

		// ---IMPORT---//

		RootedTree rootedTree = Utils.importRootedTree(settings.tree);

		// ---PARSE AND FILL STRUCTURES---//

		TimeParser timeParser = new TimeParser(settings.mrsd);
		timeParser.parseTime();
		timeLine = timeParser.getTimeLine(rootedTree.getHeight(rootedTree
				.getRootNode()));

		System.out.println("Parsed time line");

		// TODO
		// System.exit(-1);

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

		pointsList = treeParser.getPointsList();
		linesList = treeParser.getLinesList();
		areasList = null;

		uniqueDataAttributes = treeParser.getUniqueAttributes();

		System.out.println("Parsed the tree");

		layersList = new LinkedList<Layer>();

		// TODO: filename only as id
		Layer discreteLayer = new Layer(settings.tree, //
				"Discrete tree visualisation", //
				pointsList, //
				areasList, //
				linesList //
		);

		layersList.add(discreteLayer);

		if (settings.geojson != null) {

			GeoJSONParser geojsonParser = new GeoJSONParser(settings.geojson);
			GeoJsonData geojson = geojsonParser.parseGeoJSON();
			uniqueMapAttributes = geojsonParser.getUniqueAttributes();
			
			
			// TODO: filename only as id
			Layer geojsonLayer = new Layer(settings.geojson, //
					"GeoJson layer", //
					geojson);

			layersList.add(geojsonLayer);

			System.out.println("Parsed the GeoJSON");

		}// END: null check

		SpreadData data = new SpreadData(timeLine, //
				uniqueDataAttributes, //
				uniqueMapAttributes, //
				locationsList, //
				layersList//
		);

		return data;
	}// END: parse

}// END: class
