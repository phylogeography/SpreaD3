package parsers;

import java.io.IOException;
import java.util.LinkedList;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.ContinuousTreeSettings;
import utils.Utils;
import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;

public class ContinuousTreeParser {

	private ContinuousTreeSettings continuousTreeSettings;
	
	public ContinuousTreeParser(ContinuousTreeSettings continuousTreeSettings) {
		this.continuousTreeSettings = continuousTreeSettings;
	}

	public SpreadData parse() throws IOException, ImportException {

		LinkedList<Location> locationsList = null;
		LinkedList<Polygon> polygonsList= null;
		LinkedList<Line> linesList = null;
		
		// ---IMPORT---//

		RootedTree rootedTree = Utils.importRootedTree(continuousTreeSettings.tree);
		
		// ---PARSE AND FILL STRUCTURES---//
		
		ContinuousLinesParser linesParser = new ContinuousLinesParser(rootedTree, //
				continuousTreeSettings.locationTrait, //
				continuousTreeSettings.traits //
				);
	     linesList = linesParser.parseLines();
		
		System.out.println("Parsed lines");
		
		ContinuousPolygonsParser polygonsParser = new ContinuousPolygonsParser(rootedTree, //
				continuousTreeSettings.locationTrait, //
				continuousTreeSettings.hpd, //
				continuousTreeSettings.traits //
				); 
	      polygonsList = polygonsParser.parsePolygons();
		
		 System.out.println("Parsed polygons");
		
		 LinkedList<Layer> layersList = new LinkedList<Layer>();

			Layer discreteLayer = new Layer(continuousTreeSettings.tree,
					"Discrete tree visualisation", linesList, polygonsList);

			layersList.add(discreteLayer);

			SpreadData data = new SpreadData(locationsList, layersList);
			
		return data;
	}//END: parse

}//END: class
