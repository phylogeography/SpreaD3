package parsers;

import java.io.IOException;
import java.util.LinkedList;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.parsing.DiscreteTreeSettings;
import utils.Utils;
import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.AnalysisException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

public class DiscreteTreeParser {

	private DiscreteTreeSettings settings;

	public DiscreteTreeParser(DiscreteTreeSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException,
			LocationNotFoundException, IllegalCharacterException,
			AnalysisException {

		LinkedList<Location> locationsList = null;
		LinkedList<Polygon> polygonsList = null;
		LinkedList<Line> linesList = null;

		// ---IMPORT---//

		RootedTree rootedTree = null;

		rootedTree = Utils.importRootedTree(settings.tree);

		// ---PARSE AND FILL STRUCTURES---//

		DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
				settings.locations //
		);
		locationsList = locationsParser.parseLocations();

		System.out.println("Parsed locations");

		System.out.println("Parsing lines");
		
		DiscreteLinesParser linesParser = new DiscreteLinesParser(rootedTree, //
				settings.locationTrait, //
				locationsList, //
				settings.traits //
		);

		linesList = linesParser.parseLines();

		System.out.println("Parsed lines");

		System.out.println("Parsing polygons");
		
		DiscretePolygonsParser polygonsParser = new DiscretePolygonsParser(
				rootedTree, //
				settings.locationTrait, //
				settings.intervals, //
				locationsList, //
				settings.traits, //
				settings.mrsd //
		);

		polygonsList = polygonsParser.parseDiscretePolygons();

		System.out.println("Parsed polygons");

		LinkedList<Layer> layersList = new LinkedList<Layer>();

		Layer discreteLayer = new Layer(settings.tree,
				"Discrete tree visualisation", linesList, polygonsList);

		layersList.add(discreteLayer);

		SpreadData data = new SpreadData(locationsList, layersList);

		return data;
	}// END: parse

}// END: class
