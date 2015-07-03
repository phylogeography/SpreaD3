package parsers;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;
import data.structure.Coordinate;
import data.structure.Line;
import data.structure.Location;
import exceptions.AnalysisException;
import exceptions.LocationNotFoundException;

public class DiscreteTreeLinesParser {

	private String locationTrait;
	private List<Location> locationsList;
	private RootedTree rootedTree;
	private String[] traits;
	private String mrsd;
	
	public DiscreteTreeLinesParser(RootedTree rootedTree, //
			String locationTrait, //
			List<Location> locationsList, //
			String traits[], //
			String mrsd //
	) {

		this.locationTrait = locationTrait;
		this.locationsList = locationsList;
		this.rootedTree = rootedTree;
		this.traits = traits;
		this.mrsd = mrsd;
		
	}// END: Constructor

	public LinkedList<Line> parseLines() throws IOException, ImportException,
			LocationNotFoundException, AnalysisException {

		LinkedList<Line> linesList = new LinkedList<Line>();

		TimeParser timeParser = new TimeParser(mrsd);
		timeParser.parseTime();

		Location dummy;
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				Node parentNode = rootedTree.getParent(node);

				String parentState = (String) Utils.getObjectNodeAttribute(
						parentNode, locationTrait);
				if (parentState.contains("+")) {
					String message = "Found tied state " + parentState + ".";
					parentState = Utils.breakTiesRandomly(parentState);
					message += (" randomly choosing " + parentState + ".");
					System.out.println(message);
				}// END: tie check

				String nodeState = (String) Utils.getObjectNodeAttribute(node,
						locationTrait);
				if (nodeState.contains("+")) {
					String message = "Found tied state " + nodeState + ".";
					nodeState = Utils.breakTiesRandomly(nodeState);
					message += (" Randomly choosing " + nodeState + ".");
					System.out.println(message);
				}// END: tie check

				dummy = new Location(parentState, "", new Coordinate(0.0, 0.0),
						null);
				int parentLocationIndex = Integer.MAX_VALUE;
				if (locationsList.contains(dummy)) {
					parentLocationIndex = locationsList.indexOf(dummy);
				} else {
					throw new LocationNotFoundException(dummy);
				}

				dummy = new Location(nodeState, "", new Coordinate(0.0, 0.0),
						null);
				int nodeLocationIndex = Integer.MAX_VALUE;
				if (locationsList.contains(dummy)) {
					nodeLocationIndex = locationsList.indexOf(dummy);
				} else {
					throw new LocationNotFoundException(dummy);
				}

				Location parentLocation = locationsList
						.get(parentLocationIndex);
				Location nodeLocation = locationsList.get(nodeLocationIndex);
				if (!(parentLocation.equals(nodeLocation))) {

					Double parentHeight = Utils.getNodeHeight(rootedTree,
							parentNode);
					String startTime = timeParser.getNodeDate(parentHeight);

					Double nodeHeight = Utils.getNodeHeight(rootedTree, node);
					String endTime = timeParser.getNodeDate(nodeHeight);

					Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();

					if (traits != null) {
						for (String traitName : traits) {

							Trait parentTrait = Utils.getNodeTrait(parentNode,
									traitName);
							attributes
									.put(Utils.START + traitName, parentTrait);

							Trait nodeTrait = Utils.getNodeTrait(node,
									traitName);
							attributes.put(Utils.END + traitName, nodeTrait);

						}// END: traits loop
					}// END: null check

					// branch attribute traits

					double branchDuration = parentHeight - nodeHeight;
					Trait branchDurationTrait = new Trait(branchDuration);
					attributes.put(Utils.DURATION, branchDurationTrait);

					double distance = Utils.rhumbDistance(
							parentLocation.getCoordinate(),
							nodeLocation.getCoordinate());
					Trait distanceTrait = new Trait(distance);
					attributes.put(Utils.DISTANCE, distanceTrait);

					Line line = new Line(parentLocation, nodeLocation,
							startTime, endTime, attributes);
					linesList.add(line);

				}// END: branch changes state check

			}// END: root check
		}// END: node loop

		return linesList;
	}// END: parseLines

}// END: class