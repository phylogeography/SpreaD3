package parsers;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;

import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;
import settings.DiscreteTreeSettings;
import utils.Utils;

public class DiscreteTreeParser {

	private DiscreteTreeSettings discreteTreeSettings;
	
	public DiscreteTreeParser(DiscreteTreeSettings discreteTreeSettings) {
		this.discreteTreeSettings = discreteTreeSettings;
	}
	
	
public SpreadData parse() throws IOException, ImportException, LocationNotFoundException, IllegalCharacterException {
	
	List<Location> locationsList = null;
	List<Polygon> polygonsList= null;
	List<Line> linesList = null;
	
	
	// ---IMPORT---//

	RootedTree rootedTree = null;
	
	rootedTree = Utils.importRootedTree(discreteTreeSettings.tree);
	
	// ---PARSE AND FILL STRUCTURES---//
	
	LocationsParser locationsParser = new LocationsParser(
		discreteTreeSettings.locations //
			);
	locationsList = locationsParser.parseLocations();
	
	System.out.println("Parsed locations");
	
	LinesParser linesParser = new LinesParser(rootedTree, //
		discreteTreeSettings.trait, //
			locationsList //
			);
     linesList = linesParser.parseLines();
	
	System.out.println("Parsed lines");
	
	
	DiscretePolygonsParser discretePolygonsParser = new DiscretePolygonsParser(rootedTree, //
			discreteTreeSettings.trait, //
			discreteTreeSettings.intervals, //
			locationsList //
			); 
      polygonsList = discretePolygonsParser.parseDiscretePolygons();
	
	 System.out.println("Parsed discrete polygons");
	
	
		List<Layer> layersList = new LinkedList<Layer>();

		Layer discreteLayer = new Layer(discreteTreeSettings.tree,
				"Discrete tree visualisation", linesList, polygonsList);

		layersList.add(discreteLayer);

		SpreadData data = new SpreadData(locationsList, layersList);
		
		return data;
}//END: parse
	
}//END: class
