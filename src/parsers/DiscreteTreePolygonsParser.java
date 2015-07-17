package parsers;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;
import data.structure.Coordinate;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.AnalysisException;
import exceptions.LocationNotFoundException;

public class DiscreteTreePolygonsParser {

	public static final String COUNT = "count";
//	public static final String LOCATION = "location";
	
	private RootedTree rootedTree;
	private String locationTrait;
	private List<Location> locationsList;
	
	private Integer intervals;
	private String[] traits;
	private String mrsd;
	
	public DiscreteTreePolygonsParser(
			RootedTree rootedTree, //
			String locationTrait, // 
			Integer intervals, //
			List<Location> locationsList, // 
			String[] traits, //
			String mrsd //
			) {
		
		this.rootedTree = rootedTree;
		this.locationTrait = locationTrait;
		this.locationsList = locationsList;
		this.intervals = intervals;
		this.traits = traits;
		this.mrsd = mrsd;
		
	}//END: Constructor
	
	public  LinkedList<Polygon> parseDiscretePolygons() throws LocationNotFoundException, AnalysisException {
		
		LinkedList<Polygon> polygonsList = new LinkedList<Polygon>();
		
    	double rootHeight = rootedTree.getHeight(rootedTree.getRootNode());
        double delta = rootHeight / intervals;
		
        Double[] sliceHeights = new Double[intervals - 1];
        for (int i = 0; i < (intervals - 1); i++) {
        	sliceHeights[i] = rootHeight - ((i + 1) * delta);
		}
        
		TimeParser timeParser = new TimeParser(mrsd);
		timeParser.parseTime();
        
        Location dummy;
		for (int i = 0; i < sliceHeights.length; i++) {

			double sliceHeight = sliceHeights[i];
			String startTime = timeParser.getNodeDate(sliceHeight);
			
			for (Location location : locationsList) {

				int locationCount = 0;
				
				for (Node node : rootedTree.getNodes()) {

					if (!rootedTree.isRoot(node)) {

						Node parentNode = rootedTree.getParent(node);
						
						if ((rootedTree.getHeight(node) <= sliceHeight)
								&& (rootedTree.getHeight(parentNode) > sliceHeight)) {

							String parentState = (String) Utils.getObjectNodeAttribute(parentNode, locationTrait);
							if(parentState.contains("+")) { 
								String message = "Found tied state " + parentState + ".";
								parentState = Utils.breakTiesRandomly(parentState);
								message += (" Randomly choosing " + parentState + ".");
								System.out.println(message);
							}//END: tie check
							
							
						String nodeState = (String) Utils.getObjectNodeAttribute(node, locationTrait);
						if(nodeState.contains("+")) { 
							String message = "Found tied state " + nodeState + ".";
							nodeState = Utils.breakTiesRandomly(nodeState);
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
						if(nodeLocation.equals(parentLocation) && parentLocation.equals(location) ) {
							
							locationCount++;
							
						}//END: branch maintais state check
						
						}//END: if slice cuts the branch
						
					}// END: root check

				}// END: node loop

				if (locationCount > 0) {

					Map<String, Trait> attributes = new HashMap<String, Trait>();

					//TODO: no sense to have traits for these polygons, they represent all nodes ?
					if (traits != null) {
						for (String traitName : traits) {

//							Trait nodeTrait = Utils.getNodeTrait(node, traitName);
//							attributes.put(traitName, nodeTrait);

						}// END: traits loop
					}// END: null check
					
					// it's just easier to add them here as well, we avoid convoluted logic in renderers 
					Trait locationTrait = new Trait(location.getId());
					attributes.put(Utils.LOCATION, locationTrait);
					
					Trait countTrait = new Trait(locationCount);
					attributes.put(COUNT, countTrait);
					
					Polygon polygon = new Polygon(location.getId(), startTime, attributes);
					polygonsList.add(polygon);

				}// END: positive count check
				
			}// END: locations loop

		}// END: i loop
		
		return polygonsList;
	}//END: parseDiscretePolygons
	
}//END: class
