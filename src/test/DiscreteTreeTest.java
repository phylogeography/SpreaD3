package test;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import app.Spread2App;

import utils.Utils;

import data.structure.Coordinate;
import data.structure.Line;
import data.structure.Location;
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

			String path = ("/home/filip/Dropbox/JavaProjects/Spread2/data/discrete/ambiguousState/");

			String treeFileName = "GeoTree.tree";
			String locationFileName = "GeoLatLongall.txt";
			String traitName = "Geo";

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

			// /////////////////
			// ---LOCATIONS---//
			// /////////////////

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
					
					dummy = new Location(parentState, "", new Coordinate(0.0, 0.0), null);
					int parentLocationIndex = Integer.MAX_VALUE;
					if(locationsList.contains(dummy)) {

						 parentLocationIndex = locationsList.indexOf(dummy);
						
					} else {
						
						throw new LocationNotFoundException(dummy);
						
					}
					
					
					String state = (String) Utils.getObjectNodeAttribute(node, traitName);
					
					if(state.contains("+")) { 

						String message = "Found tied state " + state + ".";
						state = breakTiesRandomly(state);
						message += (" Randomly choosing " + state + ".");
						
						System.out.println(message);
						
					}//END: tie check
					
					dummy = new Location(state, "", new Coordinate(0.0, 0.0), null);
					int nodeLocationIndex = Integer.MAX_VALUE;
					if(locationsList.contains(dummy)) {

						 nodeLocationIndex = locationsList.indexOf(dummy);
						
					} else {
						
						throw new LocationNotFoundException(dummy);
						
					}
					
					Location parentLocation = locationsList.get(parentLocationIndex);
					Location nodeLocation = locationsList.get(nodeLocationIndex);

					
					//TODO: start time & end time
					Line line = new Line(parentLocation, nodeLocation, 0.0, 0.0, null);
					linesList.add(line);
					
				}// END: root check
			}// END: node loop

			// ////////////////
			// ---POLYGONS---//
			// ////////////////

			
			
			
			
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
