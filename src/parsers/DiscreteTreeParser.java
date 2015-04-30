package parsers;

import java.io.IOException;
import java.util.LinkedList;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.DiscreteTreeSettings;
import utils.Utils;
import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

public class DiscreteTreeParser {

	private DiscreteTreeSettings discreteTreeSettings;
	
	public DiscreteTreeParser(DiscreteTreeSettings discreteTreeSettings) {
		this.discreteTreeSettings = discreteTreeSettings;
	}
	
	
public SpreadData parse() throws IOException, ImportException, LocationNotFoundException, IllegalCharacterException {
	
	LinkedList<Location> locationsList = null;
	LinkedList<Polygon> polygonsList= null;
	LinkedList<Line> linesList = null;
	
	
	// ---IMPORT---//

	RootedTree rootedTree = null;
	
	rootedTree = Utils.importRootedTree(discreteTreeSettings.tree);
	
	// ---PARSE AND FILL STRUCTURES---//
	
	DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
		discreteTreeSettings.locations //
			);
	locationsList = locationsParser.parseLocations();
	
	System.out.println("Parsed locations");
	
	DiscreteLinesParser linesParser = new DiscreteLinesParser(rootedTree, //
		discreteTreeSettings.locationTrait, //
			locationsList //
			);
     linesList = linesParser.parseLines();
	
	System.out.println("Parsed lines");
	
	
	DiscretePolygonsParser polygonsParser = new DiscretePolygonsParser(rootedTree, //
			discreteTreeSettings.locationTrait, //
			discreteTreeSettings.intervals, //
			locationsList //
			); 
      polygonsList = polygonsParser.parseDiscretePolygons();
	
	 System.out.println("Parsed polygons");
	
	
	 LinkedList<Layer> layersList = new LinkedList<Layer>();

		Layer discreteLayer = new Layer(discreteTreeSettings.tree,
				"Discrete tree visualisation", linesList, polygonsList);

		layersList.add(discreteLayer);

		SpreadData data = new SpreadData(locationsList, layersList);
		
		return data;
}//END: parse
	
}//END: class
