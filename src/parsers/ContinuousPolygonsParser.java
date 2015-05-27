package parsers;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import app.Spread2ConsoleApp;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;
import data.structure.Coordinate;
import data.structure.Polygon;

public class ContinuousPolygonsParser {

	public static final String MODALITY = "modality";
	public static final String HPD = "hpd";
	
	private RootedTree rootedTree;
	private String locationTrait;
	private String hpd;
	private String[] traits;
	
	public ContinuousPolygonsParser(RootedTree rootedTree, String locationTrait, String hpd, String[] traits ) {
		
		this.rootedTree = rootedTree;
		this.locationTrait = locationTrait;
		this.hpd = hpd;
		this.traits = traits;
		
	}//END: Constructor
	
	public LinkedList<Polygon> parsePolygons() {
		
		LinkedList<Polygon> polygonsList = new LinkedList<Polygon>();

		String modalityAttributeName = locationTrait.concat("_").concat(hpd)
				.concat("%").concat("HPD_modality");
		
		String latitudeName = locationTrait.concat("1");
		String longitudeName = locationTrait.concat("2");
		
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {
				if (!rootedTree.isExternal(node)) {

					Integer modality = (Integer) Utils.getObjectNodeAttribute(
							node, modalityAttributeName);

					// System.out.println("modality for the node: " + modality);

					double nodeHeight = Utils.getNodeHeight(rootedTree, node);

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
						
						if (traits != null) {
							for (String traitName : traits) {

								Object nodeTraitObject = Utils
										.getObjectNodeAttribute(node, traitName);
								Trait nodeTrait = new Trait(nodeTraitObject,
										nodeHeight);

								attributes.put(traitName, nodeTrait);

							}// END: traits loop
						}// END: null check
						
						Trait modalityTrait = new Trait(m);
						attributes.put(MODALITY, modalityTrait);
						
						Trait hpdTrait = new Trait(hpd);
						attributes.put(HPD, hpdTrait);
						
						Polygon polygon = new Polygon(coordinateList,
								nodeHeight, attributes);

						polygonsList.add(polygon);

					}// END: modality loop

				}// END: external node check
			}// END: root check
		}// END: nodes loop
		
		return polygonsList;
	}//END: parsePolygons
	
}//END: class
