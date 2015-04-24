package test;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import app.Spread2App;

import utils.Utils;

import data.SpreadData;
import data.structure.Coordinate;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;

public class DiscreteTreeTest {

	public static void testDiscreteTreeToJSON() {

		try {

			// /////////////////////
			// ---PARSE STRINGS---//
			// /////////////////////

			String path = ("/home/filip/Dropbox/JavaProjects/Spread2/data/discrete/H5N1/");

			int numberOfIntervals = 10;
			
			String treeFileName = "H5N1_HA_discrete_MCC.tre";
			String locationFileName = "locationCoordinates_H5N1";
			String traitName = "states";

			// ///////////////////////////////
			// ---BUILD STRINGS FOR PATHS---//
			// ///////////////////////////////

			String treefilePath = path.concat(treeFileName);
			String locationFilePath = path.concat(locationFileName);

			String traitSetName = traitName.concat(".set");

			// //////////////
			// ---IMPORT---//
			// //////////////

			TreeImporter importer = new NexusImporter(new FileReader(
					treefilePath));
			RootedTree tree = (RootedTree) importer.importNextTree();

			double rootHeight = tree.getHeight(tree.getRootNode());
			
			// /////////////////
			// ---LOCATIONS---//
			// /////////////////
           // TODO: this needs to run thirst, rest can run concurrently
			List<Location> locationsList = new LinkedList<Location>();
			
			// create list from the coordinates file
			String[] lines = Utils.readLines(locationFilePath);
			int nrow = lines.length;

			for (int i = 0; i < nrow; i++) {

				String[] line = lines[i].split("\t");
				String locationName = line[0];

				String illegalCharacter = "+";
				if (locationName.contains(illegalCharacter)) {
					throw new IllegalCharacterException(locationName,
							illegalCharacter);
				}

				Double longitude = Double.valueOf(line[1]);
				Double latitude = Double.valueOf(line[2]);

				//create Location and add to the list of Locations
				Location location = new Location(locationName, "",
						new Coordinate(longitude, latitude), null);
				locationsList.add(location);

			}// END: i loop

			// /////////////
			// ---LINES---//
			// /////////////

			List<Line> linesList = new LinkedList<Line>();
			Location dummy;
			
			for (Node node : tree.getNodes()) {
				if (!tree.isRoot(node)) {

					Node parentNode = tree.getParent(node);
					
					String parentState = (String) Utils.getObjectNodeAttribute(parentNode, traitName);
					if(parentState.contains("+")) { 
						String message = "Found tied state " + parentState + ".";
						parentState = breakTiesRandomly(parentState);
						message += (" randomly choosing " + parentState + ".");
						System.out.println(message);
					}//END: tie check
					
					String nodeState = (String) Utils.getObjectNodeAttribute(node, traitName);
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

			// ////////////////
			// ---POLYGONS---//
			// ////////////////
			
            List<Polygon> polygonsList = new LinkedList<Polygon>();
			
            double delta = rootHeight / numberOfIntervals;
    		
            Double[] sliceHeights = new Double[numberOfIntervals - 1];
            for (int i = 0; i < (numberOfIntervals - 1); i++) {
            	sliceHeights[i] = rootHeight - ((i + 1) * delta);
    		}
            
            // TODO
//            Utils.printArray(sliceHeights);

			for (int i = 0; i < sliceHeights.length; i++) {

				for (Location location : locationsList) {

					int locationCount = 0;
					
					for (Node node : tree.getNodes()) {

						if (!tree.isRoot(node)) {

							Node parentNode = tree.getParent(node);
							
							if ((tree.getHeight(node) <= sliceHeights[i])
									&& (tree.getHeight(parentNode) > sliceHeights[i])) {

								
								
								String parentState = (String) Utils.getObjectNodeAttribute(parentNode, traitName);
								if(parentState.contains("+")) { 
									String message = "Found tied state " + parentState + ".";
									parentState = breakTiesRandomly(parentState);
									message += (" Randomly choosing " + parentState + ".");
									System.out.println(message);
								}//END: tie check
								
								
							String nodeState = (String) Utils.getObjectNodeAttribute(node, traitName);
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
							if(nodeLocation.equals(parentLocation) && parentLocation.equals(location) ) {
								
								locationCount++;
								
							}//END: branch maintais state check
							
							}//END: if slice cuts the branch
							
						}// END: root check

					}// END: node loop

					if(locationCount > 0) {
					
					System.out.println(location.getId() + " " + locationCount);
					
					
					
					}//END: positive count check
					
				}// END: locations loop

			}// END: i loop
            
            
            
			
			// /////////////
			// ---LAYER---//
			// /////////////
            
			List<Layer> layersList = new LinkedList<Layer>();

			Layer discreteLayer = new Layer(treeFileName,
					"Discrete tree visualisation", linesList, polygonsList);

			layersList.add(discreteLayer);

			SpreadData data = new SpreadData(locationsList, layersList);

			Gson gson = new GsonBuilder().setPrettyPrinting().create();
			String s = gson.toJson(data);

			File file = new File("test.json");
			FileWriter fw = new FileWriter(file);
			fw.write(s);
			fw.close();
			
			
		} catch (IllegalCharacterException e) {

			System.out.println("Entry " + e.getExaminedString()
					+ " contains illegal character " + e.getIllegalCharacter());

		}  catch (LocationNotFoundException e) {
			
			System.out.println("Location " + e.getNotFoundLocationId()
					+ " not found in the locations coordinate file.");

			if (Spread2App.DEBUG) e.printStackTrace();
			
		} catch (FileNotFoundException e) {

			System.out.println(e.getMessage());

		} catch (IOException e) {

			throw new RuntimeException(e);
			
		} catch (ImportException e) {

			throw new RuntimeException(e);

		}// END: try-catch


	}// END: testDiscreteTreeToJSON

	private static String breakTiesRandomly(String tiedState) {

		String[] array = tiedState.split("\\+");
		String state = (String) Utils.pickRand(array);
		
		return state;
	}//END: breakTiesRandomly

}// END: class
