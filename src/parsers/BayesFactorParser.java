package parsers;

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Map.Entry;

import structure.data.Attribute;
import structure.data.Location;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import utils.Utils;
import exceptions.AnalysisException;

public class BayesFactorParser {

	private static final String BAYES_FACTOR = "bayesFactor";
	private static final String POSTERIOR_PROBABILITY = "posteriorProbability";

	private LinkedList<Location> locationsList;
	private Double[][] indicators;

	private LinkedList<Double> bayesFactors;
	private LinkedList<Double> posteriorProbabilities;
	private LinkedList<String> from;
	private LinkedList<String> to;

	private LinkedList<Attribute> uniqueLineAttributes;

	private LinkedList<Line> linesList;
	private LinkedList<Point> pointsList;

	private double meanPoissonPrior;
	
	public BayesFactorParser(LinkedList<Location> locationsList,
			Double[][] indicators, double meanPoissonPrior) {

		this.locationsList = locationsList;
		this.indicators = indicators;

		this.linesList = new LinkedList<Line>();
		this.pointsList = new LinkedList<Point>();
		this.uniqueLineAttributes = new LinkedList<Attribute>();

		this.meanPoissonPrior = meanPoissonPrior;
		
	}// END: Constructor

	public void parse() throws AnalysisException {

		parseBayesFactors();
		parseGraph();
		parseAttributes();

	}// END: parse

	private void parseBayesFactors() throws AnalysisException {

		this.bayesFactors = new LinkedList<Double>();
		this.posteriorProbabilities = new LinkedList<Double>();
		this.from = new LinkedList<String>();
		this.to = new LinkedList<String>();

		int n = locationsList.size();
		int nrow = indicators.length;
		int ncol = indicators[0].length;
		boolean symmetrical = false;

		if (ncol == n * (n - 1)) {
			symmetrical = false;
		} else if (ncol == (n * (n - 1)) / 2) {
			symmetrical = true;
		} else {
			throw new AnalysisException(
					"Number of rate indicators does not match the number of locations!");
		}

//		double meanPoissonPrior = settings.meanPoissonPrior;//Math.log(2);
		double poissonPriorOffset = (double) (n - 1);
		double qk = Double.NaN;

		if (symmetrical) {
			qk = (meanPoissonPrior + poissonPriorOffset) / ((n * (n - 1)) / 2);
		} else {
			qk = (meanPoissonPrior + poissonPriorOffset) / ((n * (n - 1)) / 1);
		}

		double priorOdds = qk / (1 - qk);
		double[] pk = getColumnMeans(indicators);

		for (int row = 0; row < pk.length; row++) {
			double bf = (pk[row] / (1 - pk[row])) / priorOdds;

			if (bf == Double.POSITIVE_INFINITY) {

				bf = ((pk[row] - (double) (1.0 / nrow)) / (1 - (pk[row] - (double) (1.0 / nrow))))
						/ priorOdds;

				System.out.println("Correcting for infinite bf: " + bf);
			}// END: infinite BF check

			bayesFactors.add(bf);
			posteriorProbabilities.add(pk[row]);
		}// END: row loop

		String[] locations = new String[locationsList.size()];
		int ii = 0;
		for (Location location : locationsList) {
			locations[ii] = location.getId();
			ii++;
		}// END: locations loop

		for (int row = 0; row < n - 1; row++) {

			String[] subset = this.subset(locations, row, n - row);
			for (int i = 1; i < subset.length; i++) {

				from.add(locations[row]);
				to.add(subset[i]);

			}// END: i loop

		}// END: row loop

		if (!symmetrical) {
			from.addAll(to);
			to.addAll(from);
		}

	}// END: parseBayesFactors

	private void parseGraph() throws AnalysisException {

		HashMap<Location, Point> pointsMap = new HashMap<Location, Point>();

		int index = 0;
		Location dummy;
		int n = bayesFactors.size();
		for (int i = 0; i < n; i++) {

			// from parsed first

			dummy = new Location(from.get(i));
			int fromLocationIndex = Integer.MAX_VALUE;
			if (locationsList.contains(dummy)) {
				fromLocationIndex = locationsList.indexOf(dummy);
			} else {

				String message1 = "Location " + dummy.getId()
						+ " could not be found in the locations file.";
				String message2 = "Resulting file may be incomplete!";
				System.out.println(message1 + " " + message2);
				continue;

			}

			Location fromLocation = locationsList.get(fromLocationIndex);

			Point fromPoint = pointsMap.get(fromLocation);
			if (fromPoint == null) {

				fromPoint = createPoint(index, fromLocation);
				pointsMap.put(fromLocation, fromPoint);
				index++;

			}// END: null check

			// to parsed second

			dummy = new Location(to.get(i));
			int toLocationIndex = Integer.MAX_VALUE;
			if (locationsList.contains(dummy)) {
				toLocationIndex = locationsList.indexOf(dummy);
			} else {

				String message = "Parent location " + dummy.getId()
						+ " could not be found in the locations file.";
				throw new AnalysisException(message);
			}

			Location toLocation = locationsList.get(toLocationIndex);

			Point toPoint = pointsMap.get(toLocation);
			if (toPoint == null) {

				toPoint = createPoint(index, toLocation);
				pointsMap.put(toLocation, toPoint);
				index++;

			}// END: null check

			Map<String, Object> attributes = new LinkedHashMap<String, Object>();

			Double bayesFactor = bayesFactors.get(i);
			attributes.put(BAYES_FACTOR, bayesFactor);

			Double posteriorProbability = posteriorProbabilities.get(i);
			attributes.put(POSTERIOR_PROBABILITY, posteriorProbability);

			if(!fromLocation.hasCoordinate()) {
				
				String message = "Coordinate values could not be found for the location " + fromLocation.getId()
						+ " Resulting visualisation may be incomplete!";

				System.out.println(message);
				continue;
			}
			
			if(!toLocation.hasCoordinate()) {
				
				String message = "Coordinate values could not be found for the location " + toLocation.getId()
						+ " Resulting visualisation may be incomplete!";

				System.out.println(message);
				continue;
			}
			
//			Double distance = Utils.rhumbDistance(fromLocation.getCoordinate(),
//					toLocation.getCoordinate());
//			attributes.put(Utils.DISTANCE, distance);

			// Utils.printMap(attributes);

			Line line = new Line(fromPoint.getId(), //
					toPoint.getId(), //
					null, //
					null, //
					attributes //
			);

			linesList.add(line);

		}// END: i loop

		pointsList.addAll(pointsMap.values());

	}// END: parseGraph

	private void parseAttributes() {

		// collect attributes from lines
		Map<String, Attribute> branchAttributesMap = new HashMap<String, Attribute>();

		for (Line line : linesList) {

			for (Entry<String, Object> entry : line.getAttributes().entrySet()) {

				String attributeId = entry.getKey();
				Object attributeValue = entry.getValue();

				if (branchAttributesMap.containsKey(attributeId)) {

					Attribute attribute = branchAttributesMap.get(attributeId);

					if (attribute.getScale().equals(Attribute.ORDINAL)) {

						attribute.getDomain().add(attributeValue);

					} else {

						double value = Utils
								.round(Double.valueOf(attributeValue.toString()), 100);

						if (value < attribute.getRange()[Attribute.MIN_INDEX]) {
							attribute.getRange()[Attribute.MIN_INDEX] = value;
						} // END: min check

						if (value > attribute.getRange()[Attribute.MAX_INDEX]) {
							attribute.getRange()[Attribute.MAX_INDEX] = value;
						} // END: max check

					} // END: scale check

				} else {

					Attribute attribute;
					if (attributeValue instanceof Double) {

						Double[] range = new Double[2];
						range[Attribute.MIN_INDEX] = (Double) attributeValue;
						range[Attribute.MAX_INDEX] = (Double) attributeValue;

						attribute = new Attribute(attributeId, range);

					} else {

						HashSet<Object> domain = new HashSet<Object>();
						domain.add(attributeValue);

						attribute = new Attribute(attributeId, domain);

					} // END: isNumeric check

					branchAttributesMap.put(attributeId, attribute);

				} // END: key check

			} // END: attributes loop

		} // END: lines loop

		uniqueLineAttributes.addAll(branchAttributesMap.values());

	}// END: parseAttributes

	private Point createPoint(int index, Location location) {

		String id = "point_" + index;

		// Map<String, Object> attributes = new LinkedHashMap<String, Object>();
		// for (String attributeName : node.getAttributeNames()) {
		// } // END: attributes loop

		Point point = new Point(id, location, null, null);

		return point;
	}// END: createPoint

	private String[] subset(String line[], int start, int length) {
		String output[] = new String[length];
		System.arraycopy(line, start, output, 0, length);
		return output;
	}// END: subset

	private double getColumnMean(Double a[][], int col) {
		double sum = 0;
		int nrows = a.length;
		for (int row = 0; row < nrows; row++) {
			sum += a[row][col];
		}
		return sum / nrows;
	}// END: getColumnMean

	private double[] getColumnMeans(Double a[][]) {
		int ncol = a[0].length;
		double[] b = new double[ncol];
		for (int c = 0; c < ncol; c++) {
			b[c] = getColumnMean(a, c);
		}
		return b;
	}// END: getColumnMeans

	public void printBfTable() {

		System.out.println("FROM" + Utils.TAB + "TO" + Utils.TAB
				+ "BAYES_FACTOR" + Utils.TAB + "POSTERIOR PROBABILITY");

		for (int i = 0; i < bayesFactors.size(); i++) {

			System.out.print(from.get(i) + Utils.TAB);
			System.out.print(to.get(i) + Utils.TAB);
			System.out.print(bayesFactors.get(i) + Utils.TAB);
			System.out.println(posteriorProbabilities.get(i));

		}// END: i loop

	}// END: print

	public void writeBfTable(String filename) throws FileNotFoundException,
			UnsupportedEncodingException {

		PrintWriter writer = new PrintWriter(filename, "UTF-8");

		writer.println("FROM" + Utils.TAB + "TO" + Utils.TAB + "BAYES_FACTOR"
				+ Utils.TAB + "POSTERIOR PROBABILITY");

		for (int i = 0; i < bayesFactors.size(); i++) {

			writer.print(from.get(i) + Utils.TAB);
			writer.print(to.get(i) + Utils.TAB);
			writer.print(bayesFactors.get(i) + Utils.TAB);
			writer.println(posteriorProbabilities.get(i));

		}// END: i loop

		writer.close();
	}// END: writeBfTable

	public LinkedList<Line> getLinesList() {
		return linesList;
	}

	public LinkedList<Point> getPointsList() {
		return pointsList;
	}

	public LinkedList<Attribute> getLineAttributes() {
		return uniqueLineAttributes;
	}

	// public LinkedList<Attribute> getPointAttributes() {
	// return null;
	// }

}// END: class
