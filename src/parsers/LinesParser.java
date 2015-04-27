package parsers;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;
import utils.Utils;
import data.structure.Coordinate;
import data.structure.Line;
import data.structure.Location;
import exceptions.LocationNotFoundException;

public class LinesParser {

	String tree;
	String trait;
	List<Location> locationsList;
	
	public LinesParser(String tree, String trait, List<Location> locationsList) {
		
		this.tree = tree;
		this.trait = trait;
		this.locationsList = locationsList;
		
	}//END: Constructor
	
	public List<Line> parseLines() throws IOException, ImportException, LocationNotFoundException {
		
		TreeImporter importer = new NexusImporter(new FileReader(
				tree));
		RootedTree rootedTree = (RootedTree) importer.importNextTree();
		
		List<Line> linesList = new LinkedList<Line>();
		Location dummy;
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				Node parentNode = rootedTree.getParent(node);
				
				String parentState = (String) Utils.getObjectNodeAttribute(parentNode, trait);
				if(parentState.contains("+")) { 
					String message = "Found tied state " + parentState + ".";
					parentState = breakTiesRandomly(parentState);
					message += (" randomly choosing " + parentState + ".");
					System.out.println(message);
				}//END: tie check
				
				String nodeState = (String) Utils.getObjectNodeAttribute(node, trait);
				if(nodeState.contains("+")) { 
					String message = "Found tied state " + nodeState + ".";
					nodeState = breakTiesRandomly(nodeState);
					message += (" Randomly choosing " + nodeState + ".");
					System.out.println(message);
				}//END: tie check
				
				dummy = new Location(parentState, "", new Coordinate(0.0, 0.0), null);
				int parentLocationIndex = Integer.MAX_VALUE;
				if(locationsList.contains(dummy)) {
					 parentLocationIndex = locationsList.indexOf(dummy);
				} else {
					throw new LocationNotFoundException(dummy);
				}
				
				dummy = new Location(nodeState, "", new Coordinate(0.0, 0.0), null);
				int nodeLocationIndex = Integer.MAX_VALUE;
				if(locationsList.contains(dummy)) {
					 nodeLocationIndex = locationsList.indexOf(dummy);
				} else {
					throw new LocationNotFoundException(dummy);
				}
				
				Location parentLocation = locationsList.get(parentLocationIndex);
				Location nodeLocation = locationsList.get(nodeLocationIndex);
				if( !(parentLocation.equals(nodeLocation)) ) {
				
				//TODO: start time & end time
				Line line = new Line(parentLocation, nodeLocation, 0.0, 0.0, null);
				linesList.add(line);
				
				}//END: branch changes state check
				
			}// END: root check
		}// END: node loop
		
		return linesList;
	}//END: parseLines
	
	private String breakTiesRandomly(String tiedState) {

		String[] array = tiedState.split("\\+");
		String state = (String) Utils.pickRand(array);
		
		return state;
	}//END: breakTiesRandomly
	
}//END: class
