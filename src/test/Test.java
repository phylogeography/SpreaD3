package test;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import utils.Utils;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import data.SpreadData;
import data.structure.Coordinate;
import data.structure.Line;


public class Test {

	public static void main(String[] args) throws JsonMappingException, JsonGenerationException {
		
		 try {
		
			 testContinousTreeToJSON();
			 
			System.out.println("Finished");
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		  
	}//END: main

	private static void testContinousTreeToJSON() throws IOException, ImportException {
		
		String path = "/home/filip/Dropbox/JavaProjects/Spread2/data/continuous/RacRABV_cont_0.8_MCC_snyder.tre";
		TreeImporter importer = new NexusImporter(new FileReader(path));
		
		RootedTree tree = (RootedTree) importer.importNextTree();

		String longitudeName = "location2";
		
		String latitudeName = "location1";
		
		ArrayList<Line> linesList = new ArrayList<Line>();
		
		for (Node node : tree.getNodes()) {
			if (!tree.isRoot(node)) {
				
				Node parentNode = tree.getParent(node);
				
				// START: parsing
				
				Double parentLongitude = (Double) parentNode
						.getAttribute(longitudeName);
				
				Double parentLatitude = (Double) parentNode
						.getAttribute(latitudeName);

				Double parentHeight = Utils.getNodeHeight(tree, parentNode);
				
				Double longitude = (Double) node
						.getAttribute(longitudeName);
				
				Double latitude = (Double) node
						.getAttribute(latitudeName);
				
				Double nodeHeight = Utils.getNodeHeight(tree, node);
				
				// END: parsing
				Coordinate startCoordinate = new Coordinate(parentLongitude, parentLatitude);
				Coordinate endCoordinate = new Coordinate(longitude, latitude);
				
				Line line = new Line(startCoordinate, endCoordinate, parentHeight, nodeHeight, null );				
				
				linesList.add(line);
				
			}//END: root check
		}//END: nodes loop
		
		
//		SpreadData data = new SpreadData();
		
		HashMap<String, Object>	dataMap = new HashMap<String,Object>();
		
		dataMap.put(SpreadData.LINES_KEY, linesList);
		
		 ObjectMapper mapper = new ObjectMapper();
		
		 mapper.writeValue(new File("test.json"), dataMap);
		
		
	}//END: testContinousTreeToJSON
	
}//END: class
