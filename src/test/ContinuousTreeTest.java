package test;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import renderers.KmlRenderer;
import settings.KmlRendererSettings;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;
import kmlframework.kml.KmlException;
import utils.Trait;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import data.SpreadData;
import data.structure.Coordinate;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.MissingAttributeException;

public class ContinuousTreeTest {

	public ContinuousTreeTest() {
	}

	public static void testContinousTreeToJSON() throws IOException,
			ImportException, KmlException, MissingAttributeException {

		// /////////////////////
		// ---PARSE STRINGS---//
		// /////////////////////

		String path = ("/home/filip/Dropbox/JavaProjects/Spread2/data/continuous/locationHost/");

		String treeFileName = "HA_loc_host_mcc.tre";
		String locationTrait = "location";
		String hpd = "80";

		String[] traits = new String[1];
        traits[0] ="host";		
		
		
		// ///////////////////////////////
		// ---BUILD STRINGS FOR PATHS---//
		// ///////////////////////////////

		String treeFilePath = path.concat(treeFileName);

		String latitudeName = locationTrait.concat("1");
		String longitudeName = locationTrait.concat("2");

		String modalityAttributeName = locationTrait.concat("_").concat(hpd)
				.concat("%").concat("HPD_modality");

		// //////////////
		// ---IMPORT---//
		// //////////////

		TreeImporter importer = new NexusImporter(new FileReader(treeFilePath));
		RootedTree tree = (RootedTree) importer.importNextTree();

		// /////////////////
		// ---LOCATIONS---//
		// /////////////////

		LinkedList<Location> locationsList = new LinkedList<Location>();

		// /////////////
		// ---LINES---//
		// /////////////

		List<Line> linesList = new LinkedList<Line>();

		for (Node node : tree.getNodes()) {
			if (!tree.isRoot(node)) {

				Node parentNode = tree.getParent(node);

				Double parentLongitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, longitudeName);

				Double parentLatitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, latitudeName);

				Double parentHeight = Utils.getNodeHeight(tree, parentNode);

				Double nodeLongitude = (Double) Utils.getObjectNodeAttribute(node,
						longitudeName);

				Double nodeLatitude = (Double) Utils.getObjectNodeAttribute(node,
						latitudeName);

				Double nodeHeight = Utils.getNodeHeight(tree, node);

				Coordinate parentCoordinate = new Coordinate(parentLatitude, parentLongitude);

				Coordinate nodeCoordinate = new Coordinate(nodeLatitude, nodeLongitude);

				Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
				for(String traitName : traits) {
					
					Object parentTraitObject = Utils.getObjectNodeAttribute( parentNode, traitName);
					Trait parentTrait = new Trait(parentTraitObject, parentHeight);
					
					attributes.put("start"+traitName, parentTrait);
					
					Object nodeTraitObject = Utils.getObjectNodeAttribute( node, traitName);
					Trait nodeTrait = new Trait(nodeTraitObject, nodeHeight);
					
					attributes.put("end"+traitName, nodeTrait);
					
				}//END: traits loop
				
				Line line = new Line(parentCoordinate, nodeCoordinate,
						parentHeight, nodeHeight, attributes);

				linesList.add(line);

			}// END: root check
		}// END: nodes loop

		// ////////////////
		// ---POLYGONS---//
		// ////////////////

		List<Polygon> polygonsList = new LinkedList<Polygon>();

		for (Node node : tree.getNodes()) {
			if (!tree.isRoot(node)) {
				if (!tree.isExternal(node)) {

					Integer modality = (Integer) Utils.getObjectNodeAttribute(
							node, modalityAttributeName);

					// System.out.println("modality for the node: " + modality);

					double nodeHeight = Utils.getNodeHeight(tree, node);

					for (int m = 1; m <= modality; m++) {

						String longitudeHPDName = longitudeName.concat("_")
								.concat(hpd).concat("%").concat("HPD_" + m);
						String latitudeHPDName = latitudeName.concat("_")
								.concat(hpd).concat("%").concat("HPD_" + m);

						// trait1_80%HPD_1
						Object[] longitudeHPD = Utils
								.getObjectArrayNodeAttribute(node,
										longitudeHPDName);

						Object[] latitudeHPD = Utils
								.getObjectArrayNodeAttribute(node,
										latitudeHPDName);

						List<Coordinate> coordinateList = new ArrayList<Coordinate>();
						for (int c = 0; c < longitudeHPD.length; c++) {

							Double longitude = (Double) longitudeHPD[c];
							Double latitude = (Double) latitudeHPD[c];

							Coordinate coordinate = new Coordinate(latitude, longitude);
							coordinateList.add(coordinate);

						}// END: c loop

						Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
						for(String traitName : traits) {
							
							Object nodeTraitObject = Utils.getObjectNodeAttribute( node, traitName);
							Trait nodeTrait = new Trait(nodeTraitObject, nodeHeight);
							
							attributes.put(traitName, nodeTrait);
							
						}//END: traits loop
						
						// attributes.put("modality", m);
						Polygon polygon = new Polygon(coordinateList,
								nodeHeight, attributes);

						polygonsList.add(polygon);

					}// END: modality loop

				}// END: external node check
			}// END: root check
		}// END: nodes loop

		// /////////////
		// ---LAYER---//
		// /////////////
		
		LinkedList<Layer> layersList = new LinkedList<Layer>();

		Layer continuousLayer = new Layer(treeFileName,
				"Continuous tree visualisation", linesList, polygonsList);

		layersList.add(continuousLayer);

		SpreadData data = new SpreadData(locationsList, layersList);

		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String s = gson.toJson(data);

		File file = new File("test.json");
		FileWriter fw = new FileWriter(file);
		fw.write(s);
		fw.close();

		
		// /////////////////
		// ---READ JSON---//
		// /////////////////
			
			Reader reader = new  FileReader("/home/filip/Dropbox/JavaProjects/Spread2/test.json");
			Gson gson2 = new GsonBuilder().create();
            SpreadData input = gson2.fromJson(reader, SpreadData.class);
		
//            System.out.println(input.getLayers().get(0).getLines().get(0).getStartCoordinate().getLatitude());
            
            System.out.println("Imported JSON.");
		
    		// //////////////
    		// ---RENDER---//
    		// //////////////
		
            KmlRendererSettings kmlRendererSettings = new KmlRendererSettings();
            kmlRendererSettings.output = "test.kml";
			KmlRenderer renderer = new KmlRenderer(input, kmlRendererSettings);
			renderer.render();
			
			System.out.println("Rendered KML.");
		
		
		
		
		
		
		
		
		
	}// END: testContinousTreeToJSON

}// END: class
