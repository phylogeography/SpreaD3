package test;

import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import utils.Utils;

import data.structure.Coordinate;
import data.structure.Location;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;

public class DiscreteTreeTest {

	public static void testDiscreteTreeToJSON() throws IOException,
			ImportException {

		// /////////////////////
		// ---PARSE STRINGS---//
		// /////////////////////

		String path = ("/home/filip/Dropbox/JavaProjects/Spread2/data/discrete/");

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

		TreeImporter importer = new NexusImporter(new FileReader(treefilePath));
		RootedTree tree = (RootedTree) importer.importNextTree();

		// /////////////////
		// ---LOCATIONS---//
		// /////////////////

		 List<Location> locationsList = new LinkedList<Location>();

		// parse the unique locations from tree
		Set<String> uniqueLocations = new HashSet<String>();
		for (Node node : tree.getNodes()) {
			if (!tree.isRoot(node)) {

				Object[] statesSet = Utils.getObjectArrayNodeAttribute(node,
						traitSetName);

				for (int i = 0; i < statesSet.length; i++) {

					String state = String.valueOf(statesSet[i]);
					uniqueLocations.add(state);

				}// END: i loop

			}// END: root check
		}// END: nodes loop

		//TODO: error handling here - howto
		
		// look up location coordinates from the file
		String[] lines = Utils.readLines(locationFilePath);
		int nrow = lines.length;
		
		if(uniqueLocations.size() != nrow) {
			System.err.println("Size mismatch.");
		}
		
		for (int i = 0; i < nrow; i++) {

			String[] line = lines[i].split("\t");
			String locationName = line[0];
			
			if(uniqueLocations.contains(locationName)) {
				
//				System.out.println("Matched " + locationName);
				
				Double longitude = Double.valueOf(line[1]);
				Double latitude = Double.valueOf(line[2]);
				
				Location location = new Location(locationName, "", new Coordinate(longitude, latitude), null);
				
			} else {
				
				System.err.println("Warning: location " + i + " " + locationName + " does not exist in the tree!");
				
			}
			
			
			
			

		}// END: i loop

		// /////////////
		// ---LINES---//
		// /////////////

		// ////////////////
		// ---POLYGONS---//
		// ////////////////

	}// END: testDiscreteTreeToJSON

}// END: class
