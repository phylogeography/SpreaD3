package parsers;

import java.io.IOException;
import java.util.LinkedList;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.parsing.ContinuousTreeSettings;
import utils.Utils;
import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import data.structure.TimeLine;
import exceptions.AnalysisException;

public class ContinuousTreeParser {

	private ContinuousTreeSettings settings;

	public ContinuousTreeParser(ContinuousTreeSettings settings) {
		this.settings = settings;
	}

	public SpreadData parse() throws IOException, ImportException,
			AnalysisException {

		TimeLine timeLine = null;
		LinkedList<Location> locationsList = null;
		LinkedList<Polygon> polygonsList = null;
		LinkedList<Line> linesList = null;

		// ---IMPORT---//

		RootedTree rootedTree = Utils.importRootedTree(settings.tree);

		// ---PARSE AND FILL STRUCTURES---//

		System.out.println("Parsing lines");
		
		ContinuousTreeLinesParser linesParser = new ContinuousTreeLinesParser(
				rootedTree, //
				settings.locationTrait, //
				settings.traits, //
				settings.mrsd, //
				settings.timescaleMultiplier //
		);

		linesList = linesParser.parseLines();

		System.out.println("Parsed lines");

		System.out.println("Parsing polygons");
		
		ContinuousTreePolygonsParser polygonsParser = new ContinuousTreePolygonsParser(
				rootedTree, //
				settings.locationTrait, //
				settings.hpd, //
				settings.traits, //
				settings.mrsd, //
				settings.timescaleMultiplier //
		);

		polygonsList = polygonsParser.parsePolygons();

		System.out.println("Parsed polygons");

		LinkedList<Layer> layersList = new LinkedList<Layer>();

		Layer layer = new Layer(settings.tree, "Continuous tree visualisation",
				linesList, polygonsList);

		layersList.add(layer);

		SpreadData data = new SpreadData(timeLine, locationsList, layersList);

		return data;
	}// END: parse

}// END: class
