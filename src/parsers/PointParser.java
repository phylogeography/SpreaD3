package parsers;

import java.util.LinkedHashMap;
import java.util.Map;

import data.structure.Location;
import data.structure.attributable.Point;
import exceptions.LocationNotFoundException;
import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import utils.Utils;

public class PointParser {

	private int index;
	private RootedTree rootedTree;
	private Node node;
	private double timescaleMultiplier;
	private TimeParser timeParser;
//	private List<Location> locationsList;
//	private String nodeState;
	private Location location;

	/** Parser for node specific attributes */
	public PointParser(int index, //
//			String nodeState, //
			Location location,
			Node node, //
			RootedTree rootedTree, //
			double timescaleMultiplier, //
			TimeParser timeParser //
//			List<Location> locationsList //
	) {

		this.index = index;
//		this.nodeState = nodeState;
		this.location = location;
		this.rootedTree = rootedTree;
		this.node = node;
		this.timescaleMultiplier = timescaleMultiplier;
		this.timeParser = timeParser;
//		this.locationsList = locationsList;

	}// END: Constructor

	public Point parsePoint() throws LocationNotFoundException {

		String id = "point_" + index;
		Double height = Utils.getNodeHeight(rootedTree, node) * timescaleMultiplier;
		String startTime = timeParser.getNodeDate(height);

		Map<String, Object> attributes = new LinkedHashMap<String, Object>();
		for (String attributeName : node.getAttributeNames()) {

			Object nodeAttribute = node.getAttribute(attributeName);

			if (!(nodeAttribute instanceof Object[])) {
				attributes.put(attributeName, nodeAttribute);
			} // END: multivariate check

		} // END: attributes loop

		Point point = new Point(id, location, startTime, attributes);

		return point;
	}// END: parseNodes

}// END: class
