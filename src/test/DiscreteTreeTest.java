package test;

import java.io.FileReader;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

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

		String treeFileName = "speciesDiffusion.MCC.tre";
		String locationFileName = "locationCoordinates_H5N1";

		String traitName = "Geo";

		// ///////////////////////////////
		// ---BUILD STRINGS FOR PATHS---//
		// ///////////////////////////////

		String treefilePath = path.concat(treeFileName);

		
		// //////////////
		// ---IMPORT---//
		// //////////////

		TreeImporter importer = new NexusImporter(new FileReader(treefilePath));
		RootedTree tree = (RootedTree) importer.importNextTree();

		// /////////////////
		// ---LOCATIONS---//
		// /////////////////

		 List<Location> locationsList = new LinkedList<Location>();
		 
		for (Node node : tree.getNodes()) {
			if (!tree.isRoot(node)) {

				
				
				
				
				
			}
		}

		// String lines[] = readLines(locationFilePath);
		// int nrow = lines.length;
		// List<Location> locationsList = new LinkedList<Location>();
		//
		// for(int i = 0; i < nrow; i++) {
		//
		// String[] line = lines[i].split("\t");
		//
		// String locationName = line[0];
		// Double longitude = Double.valueOf(line[1]);
		// Double latitude = Double.valueOf(line[2]);
		//
		// Coordinate coordinate = new Coordinate(longitude, latitude);
		// Map<String, Object> attributes = new LinkedHashMap<String, Object>();
		//
		// Location location = new Location(locationName, //
		// "Discrete location " + locationName, //
		// coordinate, //
		// attributes //
		// );
		//
		// locationsList.add(location);
		//
		// }//END: i loop

		// /////////////
		// ---LINES---//
		// /////////////

		// ////////////////
		// ---POLYGONS---//
		// ////////////////

	}// END: testDiscreteTreeToJSON

}//END: class
