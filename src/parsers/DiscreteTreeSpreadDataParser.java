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
import structure.data.primitive.Coordinate;
import structure.geojson.GeoJsonData;
import utils.Utils;
import exceptions.AnalysisException;

public class DiscreteTreeSpreadDataParser {

	private DiscreteTreeSettings settings;

	public DiscreteTreeSpreadDataParser(DiscreteTreeSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException,
			AnalysisException  {

		TimeLine timeLine = null;
		LinkedList<Attribute> mapAttributes = null;
		LinkedList<Attribute> lineAttributes = null;
		LinkedList<Attribute> pointAttributes = null;
		LinkedList<Location> locationsList = null;

		LinkedList<Layer> layersList = new LinkedList<Layer>();

		// ---IMPORT---//

		// tree
		RootedTree rootedTree;
		if (settings.rootedTree != null) {
			rootedTree = settings.rootedTree;
		} else {
			rootedTree = Utils.importRootedTree(settings.treeFilename);
		}

		System.out.println("Imported tree");

		// locations
		if (settings.locationsList != null) {
			locationsList = settings.locationsList;
		} else {
			DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
					settings.locationsFilename, settings.header);
			locationsList = locationsParser.parseLocations();
		}

		System.out.println("Imported locations");

		// ---PARSE AND FILL STRUCTURES---//

		// ---TIME---//

		TimeParser timeParser = new TimeParser(settings.mrsd);
		timeLine = timeParser.getTimeLine(rootedTree.getHeight(rootedTree
				.getRootNode()));

		System.out.println("Parsed time line");

		// ---GEOJSON LAYER---//

		if (settings.geojsonFilename != null) {

			GeoJSONParser geojsonParser = new GeoJSONParser(
					settings.geojsonFilename);
			GeoJsonData geojson = geojsonParser.parseGeoJSON();

			mapAttributes = geojsonParser.getUniqueMapAttributes();

			String geojsonLayerId = Utils.splitString(settings.geojsonFilename,
					"/");
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

		LinkedList<Attribute> rangeAttributes = getCoordinateRangeAttributes(locationsList);
		Attribute xCoordinate = rangeAttributes.get(Utils.X_INDEX);
		Attribute yCoordinate = rangeAttributes.get(Utils.Y_INDEX);

		pointAttributes.add(xCoordinate);
		pointAttributes.add(yCoordinate);
		AxisAttributes axis = new AxisAttributes(xCoordinate.getId(),
				yCoordinate.getId());

		System.out.println("Parsed tree attributes");

		SpreadData data = new SpreadData(timeLine, //
				axis, mapAttributes, //
				lineAttributes, //
				pointAttributes, //
				locationsList, //
				layersList //
		);

		return data;
	}// END: parse

	private LinkedList<Attribute> getCoordinateRangeAttributes(
			LinkedList<Location> locationsList) throws AnalysisException {

		LinkedList<Attribute> coordinateRange = new LinkedList<Attribute>();

		double[] xCoordinateRange = new double[2];
		xCoordinateRange[Attribute.MIN_INDEX] = Double.MAX_VALUE;
		xCoordinateRange[Attribute.MAX_INDEX] = Double.MIN_VALUE;

		double[] yCoordinateRange = new double[2];
		yCoordinateRange[Attribute.MIN_INDEX] = Double.MAX_VALUE;
		yCoordinateRange[Attribute.MAX_INDEX] = Double.MIN_VALUE;

		for (Location location : locationsList) {

			Coordinate coordinate = location.getCoordinate();

			Double latitude = coordinate.getXCoordinate();
			
			Double longitude = coordinate.getYCoordinate();
			if(longitude == null) {
				throw new AnalysisException("Range attribute is empty.");
			}
			
			// update coordinates range

			if (latitude < xCoordinateRange[Attribute.MIN_INDEX]) {
				xCoordinateRange[Attribute.MIN_INDEX] = latitude;
			} // END: min check

			if (latitude > xCoordinateRange[Attribute.MAX_INDEX]) {
				xCoordinateRange[Attribute.MAX_INDEX] = latitude;
			} // END: max check

			if (longitude < yCoordinateRange[Attribute.MIN_INDEX]) {
				yCoordinateRange[Attribute.MIN_INDEX] = longitude;
			} // END: min check

			if (longitude > yCoordinateRange[Attribute.MAX_INDEX]) {
				yCoordinateRange[Attribute.MAX_INDEX] = longitude;
			} // END: max check

		}

		Attribute xCoordinate = new Attribute("xCoordinate", xCoordinateRange);
		Attribute yCoordinate = new Attribute("yCoordinate", yCoordinateRange);

		coordinateRange.add(Utils.X_INDEX, xCoordinate);
		coordinateRange.add(Utils.Y_INDEX, yCoordinate);

		return coordinateRange;
	}// END: getCoordinateRange

}// END: class
