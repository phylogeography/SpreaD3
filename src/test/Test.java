package test;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import data.SpreadData;
import data.structure.Coordinate;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;


public class Test {

//	https://sites.google.com/site/gson/gson-user-guide#TOC-Using-Gson
	
	public static void main(String[] args)  {
		
		 try {
		
			 testContinousTreeToJSON();
			 
			 testDiscreteTreeToJSON();
			 
			System.out.println("Finished");
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		  
	}//END: main

	private static void testDiscreteTreeToJSON() {
		
		String treeFileName = "speciesDiffusion.MCC.tre";
		String locationFileName = "locationCoordinates_H5N1";
		
		String treefilePath = ("/home/filip/Dropbox/JavaProjects/Spread2/data/continuous/").concat(treeFileName);
		String locationFilePath = ("/home/filip/Dropbox/JavaProjects/Spread2/data/continuous/").concat(locationFileName);
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	}//END: testDiscreteTreeToJSON
	
	private static void testContinousTreeToJSON() throws IOException, ImportException {

		String fileName = "speciesDiffusion.MCC.tre";
		String path = ("/home/filip/Dropbox/JavaProjects/Spread2/data/continuous/").concat(fileName);
		String traitName = "trait";
		String hpd = "80";
		
		
		TreeImporter importer = new NexusImporter(new FileReader(path));
		
		RootedTree tree = (RootedTree) importer.importNextTree();
		
		String longitudeName = traitName.concat("2");
		
		String latitudeName = traitName.concat("1");
		
		 List<Line> linesList = new LinkedList<Line>();

		// /////////////
		// ---LINES---//
		// /////////////

		for (Node node : tree.getNodes()) {
			if (!tree.isRoot(node)) {
				
				Node parentNode = tree.getParent(node);
				
				Double parentLongitude = (Double) Utils.getObjectNodeAttribute(parentNode, longitudeName);
				
				Double parentLatitude = (Double) Utils.getObjectNodeAttribute(parentNode, latitudeName);

				Double parentHeight = Utils.getNodeHeight(tree, parentNode);
				
				Double longitude = (Double) Utils.getObjectNodeAttribute(node, longitudeName);
				
				Double latitude = (Double) Utils.getObjectNodeAttribute(node, latitudeName);
				
				Double nodeHeight = Utils.getNodeHeight(tree, node);
				
				Coordinate startCoordinate = new Coordinate(parentLongitude, parentLatitude);
				
				Coordinate endCoordinate = new Coordinate(longitude, latitude);
				
				Line line = new Line(startCoordinate, endCoordinate, parentHeight, nodeHeight, null );				
				
				linesList.add(line);
				
			}//END: root check
		}//END: nodes loop
		
		
		// ////////////////
		// ---POLYGONS---//
		// ////////////////
		
//		trait_80%HPD_modality
		String modalityAttributeName = traitName.concat("_").concat(hpd).concat("%").concat("HPD_modality");
		
		List<Polygon> polygonsList = new LinkedList<Polygon>();
		
		for (Node node : tree.getNodes()) {
			if (!tree.isRoot(node)) {
				if (!tree.isExternal(node)) {

					Integer modality = (Integer) Utils.getObjectNodeAttribute(node, modalityAttributeName);
					
//					System.out.println("modality for the node: " + modality);
					
					double nodeHeight = Utils.getNodeHeight(tree, node);

						for (int m = 1; m <= modality; m++) {
		
							String longitudeHPDName = longitudeName.concat("_").concat(hpd).concat("%").concat("HPD_"+m);
							String latitudeHPDName = latitudeName.concat("_").concat(hpd).concat("%").concat("HPD_"+m);
							
//							trait1_80%HPD_1
							Object[] longitudeHPD = Utils
									.getObjectArrayNodeAttribute(node, longitudeHPDName);

							Object[] latitudeHPD = Utils
									.getObjectArrayNodeAttribute(node, latitudeHPDName);
							
							List<Coordinate> coordinateList = new ArrayList<Coordinate>();
							for(int c = 0 ; c<longitudeHPD.length; c++ ) {
								
								Double longitude = (Double) longitudeHPD[c];
								Double latitude = (Double) latitudeHPD[c];
								
							Coordinate coordinate = new Coordinate(longitude, latitude);
							coordinateList.add(coordinate);
							
							}//END: c loop
							
							Map<String, Object> attributes = new LinkedHashMap<String, Object>();
//							attributes.put("modality", m);
							Polygon polygon = new Polygon(coordinateList, nodeHeight, attributes);
							
							polygonsList.add(polygon);
							
						}// END: modality loop
						
				}// END: external node check
			}// END: root check
		}// END: nodes loop
		
		List<Location> locationsList = new LinkedList<Location>();
		
		List<Layer> layersList = new LinkedList<Layer>();
		
		Layer continuousLayer = new Layer(fileName,
				"Continuous tree visualisation", 
				linesList, 
				polygonsList);
		
		layersList.add(continuousLayer);
		
		SpreadData data = new SpreadData(locationsList, layersList);
		
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String s = gson.toJson(data);
		
		File file = new File("test.json");
        FileWriter fw = new FileWriter(file);
        fw.write(s);
        fw.close();
		
		
	}//END: testContinousTreeToJSON
	
}//END: class
