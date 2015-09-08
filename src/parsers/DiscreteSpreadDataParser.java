package parsers;

import java.io.IOException;
import java.util.LinkedList;

import data.SpreadData;
import data.structure.Layer;
import data.structure.Location;
import data.structure.TimeLine;
import data.structure.attributable.Area;
import data.structure.attributable.Line;
import data.structure.attributable.Point;
import data.structure.primitive.Polygon;
import exceptions.AnalysisException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.parsing.DiscreteTreeSettings;
import utils.Utils;

public class DiscreteSpreadDataParser {

	private DiscreteTreeSettings settings;

	public DiscreteSpreadDataParser(DiscreteTreeSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException, AnalysisException, IllegalCharacterException,
			LocationNotFoundException {

		TimeLine timeLine = null;
		LinkedList<Location> locationsList = null;
		LinkedList<Layer> layersList = null;

		// ---IMPORT---//

		RootedTree rootedTree = Utils.importRootedTree(settings.tree);

		// ---PARSE AND FILL STRUCTURES---//

		TimeParser timeParser = new TimeParser(settings.mrsd);
		timeParser.parseTime();
		timeLine = timeParser.getTimeLine(rootedTree.getHeight(rootedTree.getRootNode()));

		System.out.println("Parsed time line");

		DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(settings.locations //
		);
		locationsList = locationsParser.parseLocations();

		System.out.println("Parsed locations");

		DiscreteTreeParser treeParser = new DiscreteTreeParser(rootedTree, //
				settings.locationTrait, //
				locationsList, //
				settings.mrsd, //
				settings.timescaleMultiplier//
		);
		treeParser.parseTree();

		LinkedList<Point> pointsList = treeParser.getPointsList();
		LinkedList<Line> linesList = treeParser.getLinesList();
		LinkedList<Area> areasList = null;

		System.out.println("Parsed the tree");

		layersList = new LinkedList<Layer>();
		Layer discreteLayer = new Layer(settings.tree, "Discrete tree visualisation", pointsList, linesList, areasList);
		layersList.add(discreteLayer);

		SpreadData data = new SpreadData(timeLine, locationsList, layersList);

		return data;
	}// END: parse

}// END: class
