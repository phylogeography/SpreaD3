package parsers;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;

import utils.Trait;
import utils.Utils;
import data.structure.Coordinate;
import data.structure.Line;
import data.structure.Location;
import exceptions.LocationNotFoundException;

public class BayesFactorLinesParser {

	private static final String BAYES_FACTOR = "bayesFactor";
	private static final String POSTERIOR_PROBABILITY = "posteriorProbability";

	private LinkedList<Location> locationsList;
	private LinkedList<String> from;
	private LinkedList<String> to;
	private LinkedList<Double> bayesFactors;
	private LinkedList<Double> posteriorProbabilities;

	public BayesFactorLinesParser(LinkedList<Location> locationsList, //
			LinkedList<String> from, //
			LinkedList<String> to, //
			LinkedList<Double> bayesFactors, //
			LinkedList<Double> posteriorProbabilities //
	) {

		this.locationsList = locationsList;
		this.from = from;
		this.to = to;
		this.bayesFactors = bayesFactors;
		this.posteriorProbabilities = posteriorProbabilities;

	}// END: Constructor

	public LinkedList<Line> parseLines() throws LocationNotFoundException {

		LinkedList<Line> linesList = new LinkedList<Line>();
		Location dummy;

		int n = bayesFactors.size();
		for (int i = 0; i < n; i++) {

			dummy = new Location(from.get(i), "", new Coordinate(0.0, 0.0),
					null);
			int fromLocationIndex = Integer.MAX_VALUE;
			if (locationsList.contains(dummy)) {
				fromLocationIndex = locationsList.indexOf(dummy);
			} else {
				throw new LocationNotFoundException(dummy);
			}

			dummy = new Location(to.get(i), "", new Coordinate(0.0, 0.0), null);
			int toLocationIndex = Integer.MAX_VALUE;
			if (locationsList.contains(dummy)) {
				toLocationIndex = locationsList.indexOf(dummy);
			} else {
				throw new LocationNotFoundException(dummy);
			}

			Location fromLocation = locationsList.get(fromLocationIndex);
			Location toLocation = locationsList.get(toLocationIndex);

			Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();

			Double bayesFactor = bayesFactors.get(i);
			Trait bayesFactorTrait = new Trait(bayesFactor);
			attributes.put(BAYES_FACTOR, bayesFactorTrait);

			Double posteriorProbability = posteriorProbabilities.get(i);
			Trait posteriorProbabilityTrait = new Trait(posteriorProbability);
			attributes.put(POSTERIOR_PROBABILITY, posteriorProbabilityTrait);

			Double distance = Utils.rhumbDistance(fromLocation.getCoordinate(), toLocation.getCoordinate());
			Trait distanceTrait = new Trait(distance);
			attributes.put(Utils.DISTANCE, distanceTrait);
			
			
//			Utils.printMap(attributes);
			
			Line line = new Line(fromLocation, toLocation, attributes);
			linesList.add(line);

		}// END: i loop

		return linesList;
	}// END: parseLines

}// END: class
