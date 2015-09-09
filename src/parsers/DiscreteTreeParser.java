package parsers;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import data.structure.Attribute;
import data.structure.Location;
import data.structure.attributable.Line;
import data.structure.attributable.Point;
import exceptions.AnalysisException;
import exceptions.LocationNotFoundException;
import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import utils.Utils;

public class DiscreteTreeParser {

	private String locationTrait;
	private List<Location> locationsList;
	// private LinkedList<Point> pointsList;
	private RootedTree rootedTree;
	private String mrsd;
	private double timescaleMultiplier;

	private LinkedList<Line> linesList;
	private LinkedList<Point> pointsList;
	private LinkedList<Attribute> uniqueAttributes;

	public DiscreteTreeParser(RootedTree rootedTree, //
			String locationTrait, //
			List<Location> locationsList, //
			// LinkedList<Point> pointsList, //
			String mrsd, //
			double timescaleMultiplier //
	) {

		this.locationTrait = locationTrait;
		this.locationsList = locationsList;
		// this.pointsList = pointsList;
		this.rootedTree = rootedTree;
		this.mrsd = mrsd;
		this.timescaleMultiplier = timescaleMultiplier;

		// structures
		this.linesList = new LinkedList<Line>();
		this.pointsList = new LinkedList<Point>();

	}// END: Constructor

	public void parseTree() throws IOException, ImportException, LocationNotFoundException, AnalysisException {

		HashMap<Node, Point> pointsMap = new HashMap<Node, Point>();

		// TODO: or 2d array
		HashMap<String, List<Double>> countMap = new HashMap<String, List<Double>>();

		Double[] sliceHeights = createSliceHeights(10);

		TimeParser timeParser = new TimeParser(mrsd);
		timeParser.parseTime();

		int index = 0;
		Location dummy;
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				Node parentNode = rootedTree.getParent(node);

				String parentState = (String) Utils.getObjectNodeAttribute(parentNode, locationTrait);
				if (parentState.contains("+")) {
					String message = "Found tied state " + parentState + ".";
					parentState = Utils.breakTiesRandomly(parentState);
					message += (" randomly choosing " + parentState + ".");
					System.out.println(message);
				} // END: tie check

				String nodeState = (String) Utils.getObjectNodeAttribute(node, locationTrait);
				if (nodeState.contains("+")) {
					String message = "Found tied state " + nodeState + ".";
					nodeState = Utils.breakTiesRandomly(nodeState);
					message += (" Randomly choosing " + nodeState + ".");
					System.out.println(message);
				} // END: tie check

				dummy = new Location(parentState);
				int locationIndex = Integer.MAX_VALUE;
				if (locationsList.contains(dummy)) {
					locationIndex = locationsList.indexOf(dummy);
				} else {
					throw new LocationNotFoundException(dummy);
				}

				Location parentLocation = locationsList.get(locationIndex);

				dummy = new Location(nodeState);
				locationIndex = Integer.MAX_VALUE;
				if (locationsList.contains(dummy)) {
					locationIndex = locationsList.indexOf(dummy);
				} else {
					throw new LocationNotFoundException(dummy);
				}

				Location nodeLocation = locationsList.get(locationIndex);

				if (!parentLocation.equals(nodeLocation)) {

					Point parentPoint = pointsMap.get(parentNode);
					if (parentPoint == null) {
						PointParser parentPointParser = new PointParser(index, //
								// parentState, //
								parentLocation, parentNode, //
								rootedTree, //
								timescaleMultiplier, //
								timeParser //
						// locationsList
						);

						parentPoint = parentPointParser.parsePoint();
						pointsMap.put(parentNode, parentPoint);
						index++;
					}

					Point nodePoint = pointsMap.get(node);
					if (nodePoint == null) {
						PointParser nodePointParser = new PointParser(index, //
								// parentState, //
								nodeLocation, parentNode, //
								rootedTree, //
								timescaleMultiplier, //
								timeParser //
						// locationsList
						);

						nodePoint = nodePointParser.parsePoint();

						pointsMap.put(node, nodePoint);
						index++;
					}

					Line line = new Line(parentPoint.getId(), //
							nodePoint.getId(), //
							parentPoint.getStartTime(), //
							nodePoint.getStartTime(), //
							nodePoint.getAttributes()//
					);

					linesList.add(line);

				} else {

					// TODO: count lineages holding state
					for (int i = 0; i < sliceHeights.length; i++) {

						double sliceHeight = sliceHeights[i];
						for (Location location : locationsList) {

							if ((rootedTree.getHeight(node) <= sliceHeight)
									&& (rootedTree.getHeight(parentNode) > sliceHeight)) {

								if (nodeLocation.equals(parentLocation) && parentLocation.equals(location)) {

									// locationCount++;

								} // END: location check

							} // END:
						} // END: locations loop
					} // END: sliceHeights lop

				} // END: state check

			} // END: root check
		} // END: node loop

		pointsList.addAll(pointsMap.values());

		// collect attributes from points and lines
		Map<String, Attribute> attributesMap = new HashMap<String, Attribute>();

		for (Line line : linesList) {

			for (Entry<String, Object> entry : line.getAttributes().entrySet()) {

				String attributeId = entry.getKey();
				Object attributeValue = entry.getValue();

				if (attributesMap.containsKey(attributeId)) {

					Attribute attribute = attributesMap.get(attributeId);

					if (attribute.getScale().equals(Attribute.ORDINAL)) {

						attribute.getDomain().add(attributeValue);

					} else {

						double value = Utils.round((double) attributeValue, 100);

						if (value < attribute.getRange()[Attribute.MIN_INDEX]) {
							attribute.getRange()[Attribute.MIN_INDEX] = value;
						} // END: min check

						if (value > attribute.getRange()[Attribute.MAX_INDEX]) {
							attribute.getRange()[Attribute.MAX_INDEX] = value;
						} // END: max check

					} // END: scale check

				} else {

					Attribute attribute;
					if (attributeValue instanceof Double) {

						double[] range = new double[2];
						range[Attribute.MIN_INDEX] = (double) attributeValue;
						range[Attribute.MAX_INDEX] = (double) attributeValue;

						attribute = new Attribute(attributeId, range);

					} else {

						HashSet<Object> domain = new HashSet<Object>();
						domain.add(attributeValue);

						attribute = new Attribute(attributeId, domain);

					} // END: isNumeric check

					attributesMap.put(attributeId, attribute);

				} // END: key check

			} // END: attributes loop

		} // END: lines loop

		uniqueAttributes = new LinkedList<Attribute>();
		uniqueAttributes.addAll(attributesMap.values());

	}// END: parseTree

	private Double[] createSliceHeights(int intervals) {
		double rootHeight = rootedTree.getHeight(rootedTree.getRootNode());
		double delta = rootHeight / (double) intervals;

		Double[] sliceHeights = new Double[intervals - 1];
		for (int i = 0; i < (intervals - 1); i++) {
			sliceHeights[i] = rootHeight - ((i + 1) * delta);
		}

		return sliceHeights;
	}

	public LinkedList<Line> getLinesList() {
		return linesList;
	}

	public LinkedList<Point> getPointsList() {
		return pointsList;
	}

	public LinkedList<Attribute> getUniqueAttributes() {
		return uniqueAttributes;
	}

}// END: class
