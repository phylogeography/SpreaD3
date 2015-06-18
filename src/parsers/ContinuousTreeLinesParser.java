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

public class ContinuousTreeLinesParser {

	private RootedTree rootedTree;
	private String locationTrait;
	private String[] traits;
	
	public ContinuousTreeLinesParser(RootedTree rootedTree, String locationTrait, String traits[]) {
		
		this.rootedTree = rootedTree;
		this.locationTrait = locationTrait;
		this.traits = traits;
		
	}//END: Constructor
	
	public LinkedList<Line> parseLines() {
		
		LinkedList<Line> linesList = new LinkedList<Line>();
		String latitudeName = locationTrait.concat(Utils.ONE);
		String longitudeName = locationTrait.concat(Utils.TWO);
		
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				Node parentNode = rootedTree.getParent(node);

				Double parentLongitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, longitudeName);

				Double parentLatitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, latitudeName);

				Double parentHeight = Utils.getNodeHeight(rootedTree, parentNode);

				Double nodeLongitude = (Double) Utils.getObjectNodeAttribute(node,
						longitudeName);

				Double nodeLatitude = (Double) Utils.getObjectNodeAttribute(node,
						latitudeName);

				Double nodeHeight = Utils.getNodeHeight(rootedTree, node);

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
				
				Line line = new Line(parentCoordinate, nodeCoordinate, parentHeight, nodeHeight, attributes);
				linesList.add(line);

			}// END: root check
		}// END: nodes loop
		
		return linesList;
	}//END: parseLines
	
}//END: class
