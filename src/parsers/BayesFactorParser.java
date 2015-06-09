package parsers;

import java.io.IOException;
import java.util.LinkedList;

import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.IllegalCharacterException;
import settings.parsing.BayesFactorsSettings;

public class BayesFactorParser {

	private BayesFactorsSettings settings;

	public BayesFactorParser(BayesFactorsSettings settings) {
		this.settings = settings;
	}// END: Constructor

	public SpreadData parse() throws IOException, IllegalCharacterException {
		
		LinkedList<Location> locationsList = null;
		LinkedList<Line> linesList = null;
		
		
		// ---IMPORT---//
		
		
		// ---PARSE AND FILL STRUCTURES---//
		
		DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
				settings.locations //
				);
		locationsList = locationsParser.parseLocations();
		
		System.out.println("Parsed locations");
		
		
		// TODO: import log, pass to lines parser
		LogParser logParser = new LogParser(settings.log);
		Double[][] indicators = logParser.parseIndicators();
		
		
		
		BayesFactorLinesParser linesParser = new BayesFactorLinesParser(
				locationsList//,//
//				settings.log //
				);
		
		     linesList = linesParser.parseLines();
			
			System.out.println("Parsed lines");
		
		 LinkedList<Layer> layersList = new LinkedList<Layer>();

			Layer discreteLayer = new Layer(settings.log,
					"Bayes factors visualisation", linesList, null);

			layersList.add(discreteLayer);

			SpreadData data = new SpreadData(locationsList, layersList);
			
			return data;
	}// END: parse

}// END: class
