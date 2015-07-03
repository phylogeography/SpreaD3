package parsers;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;
import data.structure.Coordinate;
import data.structure.Line;
import exceptions.AnalysisException;

public class ContinuousTreeLinesParser {

	private RootedTree rootedTree;
	private String locationTrait;
	private String mrsd;
	private String[] traits;
	
	public ContinuousTreeLinesParser(RootedTree rootedTree, //
			String locationTrait, //
			String traits[], //
			String mrsd //
			) {
		
		this.rootedTree = rootedTree;
		this.locationTrait = locationTrait;
		this.traits = traits;
		this.mrsd = mrsd;
		
	}//END: Constructor
	
	public LinkedList<Line> parseLines() throws AnalysisException {
		
		LinkedList<Line> linesList = new LinkedList<Line>();
		String latitudeName = locationTrait.concat(Utils.ONE);
		String longitudeName = locationTrait.concat(Utils.TWO);

		TimeParser timeParser = new TimeParser(mrsd);
		timeParser.parseTime();
		
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				Node parentNode = rootedTree.getParent(node);

				Double parentLongitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, longitudeName);

				Double parentLatitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, latitudeName);

				Double parentHeight = Utils.getNodeHeight(rootedTree, parentNode);
				
				String startTime = timeParser.getNodeDate(parentHeight);
				
				Double nodeLongitude = (Double) Utils.getObjectNodeAttribute(node,
						longitudeName);

				Double nodeLatitude = (Double) Utils.getObjectNodeAttribute(node,
						latitudeName);

				Double nodeHeight = Utils.getNodeHeight(rootedTree, node);

				String endTime = timeParser.getNodeDate(nodeHeight);
				
				Coordinate parentCoordinate = new Coordinate(parentLatitude, parentLongitude);

				Coordinate nodeCoordinate = new Coordinate(nodeLatitude, nodeLongitude);

				Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
				
				if (traits != null) {
					for (String traitName : traits) {

						Trait parentTrait = Utils.getNodeTrait(parentNode, traitName); 
						attributes.put(Utils.START + traitName, parentTrait);

						Trait nodeTrait = Utils.getNodeTrait(node, traitName); 
						attributes.put(Utils.END + traitName, nodeTrait);

					}// END: traits loop
				}// END: null check

                // branch attribute traits
				
				double branchDuration = parentHeight - nodeHeight;
				Trait branchDurationTrait = new Trait(branchDuration);
				attributes.put(Utils.DURATION, branchDurationTrait);
				
				double distance = Utils.rhumbDistance(parentCoordinate, nodeCoordinate);
				Trait distanceTrait = new Trait(distance);
				attributes.put(Utils.DISTANCE, distanceTrait);
				
				Line line = new Line(parentCoordinate, nodeCoordinate, startTime, endTime, attributes);
				linesList.add(line);

			}// END: root check
		}// END: nodes loop
		
		return linesList;
	}//END: parseLines
	
}//END: class
