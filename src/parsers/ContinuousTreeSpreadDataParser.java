package parsers;

import java.io.IOException;
import java.util.LinkedList;

import exceptions.AnalysisException;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.parsing.ContinuousTreeSettings;
import structure.data.Attribute;
import structure.data.AxisAttributes;
import structure.data.Layer;
import structure.data.SpreadData;
import structure.data.TimeLine;
import structure.data.attributable.Area;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import structure.geojson.GeoJsonData;
import utils.Utils;

public class ContinuousTreeSpreadDataParser {

	private final ContinuousTreeSettings settings;

	public ContinuousTreeSpreadDataParser(ContinuousTreeSettings settings) {

		this.settings = settings;

	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException, AnalysisException {

		TimeLine timeLine = null;
		LinkedList<Attribute> mapAttributes = null;
		LinkedList<Attribute> lineAttributes = null;
		LinkedList<Attribute> pointAttributes = null;

		LinkedList<Layer> layersList = new LinkedList<Layer>();

		// ---IMPORT---//

		RootedTree rootedTree = Utils.importRootedTree(settings.tree);

		// ---PARSE AND FILL STRUCTURES---//

		TimeParser timeParser = new TimeParser(settings.mrsd);
		// timeParser.parseTime();
		timeLine = timeParser.getTimeLine(rootedTree.getHeight(rootedTree.getRootNode()));

		System.out.println("Parsed time line");

		ContinuousTreeParser treeParser = new ContinuousTreeParser(rootedTree, //
				settings.xCoordinate, //
				settings.yCoordinate, //
				settings.hpd, //
				timeParser, //
				settings.timescaleMultiplier);

		treeParser.parseTree();

		lineAttributes = treeParser.getLineAttributes();
		pointAttributes = treeParser.getPointAttributes();

		System.out.println("Parsed tree attributes");

		// ---GEOJSON LAYER---//

		if (settings.geojson != null) {

			GeoJSONParser geojsonParser = new GeoJSONParser(settings.geojson);
			GeoJsonData geojson = geojsonParser.parseGeoJSON();

			mapAttributes = geojsonParser.getUniqueMapAttributes();

			String id = Utils.splitString(settings.geojson, "/");
			Layer geojsonLayer = new Layer(id, //
					"GeoJson layer", //
					geojson);

			layersList.add(geojsonLayer);

			System.out.println("Parsed map attributes");

		} // END: null check

		// ---DATA LAYER (TREE LINES & POINTS, AREAS)---//

		LinkedList<Line> linesList = treeParser.getLinesList();
		LinkedList<Point> pointsList = treeParser.getPointsList();
		LinkedList<Area> areasList = treeParser.getAreasList();

		String id = Utils.splitString(settings.tree, "/");
		Layer treeLayer = new Layer(id, //
				"Continuous tree visualisation", //
				pointsList, //
				linesList, //
				areasList);
		layersList.add(treeLayer);

		AxisAttributes axis = new AxisAttributes(settings.xCoordinate, settings.yCoordinate);

		return new SpreadData(timeLine, //
				axis, //
				mapAttributes, //
				lineAttributes, //
				pointAttributes, //
				layersList//
		);
	}// END: parse

}// END: class
