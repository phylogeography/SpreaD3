package parsers;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import data.structure.Location;
import data.structure.attributable.Line;
import data.structure.attributable.Point;
import data.structure.primitive.Coordinate;
import exceptions.AnalysisException;
import exceptions.LocationNotFoundException;
import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;

public class PointParser {

	private int index;
	private RootedTree rootedTree;
	private Node node;
	private double timescaleMultiplier;
	private TimeParser timeParser;
	private List<Location> locationsList;
	private String nodeState;

	/** Parser for node specific attributes */
	public PointParser(int index, //
			String nodeState, //
			Node node, //
			RootedTree rootedTree, //
			double timescaleMultiplier, //
			TimeParser timeParser, //
			List<Location> locationsList //
	) {

		this.index = index;
		this.nodeState = nodeState;
		this.rootedTree = rootedTree;
		this.node = node;
		this.timescaleMultiplier = timescaleMultiplier;
		this.timeParser = timeParser;
		this.locationsList = locationsList;

	}// END: Constructor

	public Point parsePoint() throws LocationNotFoundException {


		String id = "point_" + index;

		Location dummy = new Location(nodeState);
		int locationIndex = Integer.MAX_VALUE;
		if (locationsList.contains(dummy)) {
			locationIndex = locationsList.indexOf(dummy);
		} else {
			throw new LocationNotFoundException(dummy);
		}

		Location location = locationsList.get(locationIndex);

		Double height = Utils.getNodeHeight(rootedTree, node) * timescaleMultiplier;
		String startTime = timeParser.getNodeDate(height);

		Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
		for (String traitName : node.getAttributeNames()) {

			Object nodeAttribute = node.getAttribute(traitName);

			Trait nodeTrait = new Trait(nodeAttribute);

			if (!nodeTrait.isMultivariate()) {
				attributes.put(traitName, nodeTrait);
			} // END: multivariate check

		} // END: attributes loop

		Point point = new Point(id, location, startTime, attributes);

		return point;
	}// END: parseNodes

}// END: class
