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

public class ContinuousLinesParser {

	RootedTree rootedTree;
	String locationTrait;
	String[] traits;
	
	public ContinuousLinesParser(RootedTree rootedTree, String locationTrait, String traits[]) {
		
		this.rootedTree = rootedTree;
		this.locationTrait = locationTrait;
		this.traits = traits;
		
	}//END: Constructor
	
	public LinkedList<Line> parseLines() {
		
		LinkedList<Line> linesList = new LinkedList<Line>();
		String latitudeName = locationTrait.concat("1");
		String longitudeName = locationTrait.concat("2");
		
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

				Map<String, Object> attributes = new LinkedHashMap<String, Object>();
				for(String traitName : traits) {
					
					Object parentTraitObject = Utils.getObjectNodeAttribute( parentNode, traitName);
					Trait parentTrait = new Trait(parentTraitObject, parentHeight);
					
					attributes.put("start"+traitName, parentTrait);
					
					Object nodeTraitObject = Utils.getObjectNodeAttribute( node, traitName);
					Trait nodeTrait = new Trait(nodeTraitObject, nodeHeight);
					
					attributes.put("end"+traitName, nodeTrait);
					
				}//END: traits loop
				
				//TODO: start time & end time
				Line line = new Line(parentCoordinate, nodeCoordinate,
						parentHeight, nodeHeight, attributes);

				linesList.add(line);

			}// END: root check
		}// END: nodes loop
		
		return linesList;
	}//END: parseLines
	
}//END: class
