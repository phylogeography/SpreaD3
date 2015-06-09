package parsers;

import java.io.IOException;
import java.util.LinkedList;

import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;
import settings.parsing.BayesFactorsSettings;
import utils.Utils;

public class BayesFactorParser {

	private BayesFactorsSettings settings;
	private LinkedList<Double> bayesFactors;
	private LinkedList<Double> posteriorProbabilities;
	private LinkedList<String> from;
	private LinkedList<String> to;
	
	public BayesFactorParser(BayesFactorsSettings settings) {
		
		this.settings = settings;
		
	}// END: Constructor

	public SpreadData parse() throws IOException, IllegalCharacterException, LocationNotFoundException {
		
		LinkedList<Location> locationsList = null;
		LinkedList<Line> linesList = null;
		
		
		// ---IMPORT---//
		
		
		// ---PARSE AND FILL STRUCTURES---//
		
		DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
				settings.locations //
				);
		locationsList = locationsParser.parseLocations();
		
		System.out.println("Parsed locations");
		
		
		LogParser logParser = new LogParser(settings.log);
		Double[][] indicators = logParser.parseIndicators();
		
		this.getBayesFactors(locationsList, indicators);
		
		BayesFactorLinesParser linesParser = new BayesFactorLinesParser(
				locationsList,//
				from, //
				to, //
				bayesFactors, //
				posteriorProbabilities //
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

	private void getBayesFactors(LinkedList<Location> locationsList, Double[][] indicators) {

		this.bayesFactors = new LinkedList<Double>();
		this.posteriorProbabilities = new LinkedList<Double>();
		this.from = new LinkedList<String>();
		this.to = new LinkedList<String>();
		
		//TODO: burnin
		
		int n = locationsList.size();
		int nrow = indicators.length;
		int ncol = indicators[0].length;
		boolean symmetrical = false;
		
		
		if (ncol == n * (n - 1)) {
			symmetrical = false;
		} else if (ncol == (n * (n - 1)) / 2) {
			symmetrical = true;
		} else {
			//TODO: custom exception that we can recover from 
			throw new RuntimeException(
					"Number of rate indicators does not match the number of locations!");
		}

		
		double meanPoissonPrior = Math.log(2);
		double poissonPriorOffset = (double) (n - 1);
		double qk = Double.NaN;
		
		
		if (symmetrical) {
			qk = (meanPoissonPrior + poissonPriorOffset)
					/ ((n * (n - 1)) / 2);
		} else {
			qk = (meanPoissonPrior + poissonPriorOffset)
					/ ((n * (n - 1)) / 1);
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
		for(Location location : locationsList) {
			locations[ii] = location.getId();
			ii++;
		}//END: locations loop
		
		for (int row = 0; row < n - 1; row++) {

			String[] subset = this.subset(locations, row, n - row);
			for (int i = 1; i < subset.length; i++) {
				
				from.add(locations[row]);
				to.add(subset[i]);
				
			}
			
		}// END: row loop
		
		
		if(!symmetrical) {
			from.addAll(to);
			to.addAll(from);
		}
		
//		Utils.printList(from);
//		Utils.printList(to);
		
		
		
		
	}//END:
	
	private  double[] getColumnMeans(Double a[][]) {
		int ncol = a[0].length;
		double[] b = new double[ncol];
		for (int c = 0; c < ncol; c++) {
			b[c] = getColumnMean(a, c);
		}
		return b;
	}//END: getColumnMeans
	
	private double getColumnMean(Double a[][], int col) {
		double sum = 0;
		int nrows = a.length;
		for (int row = 0; row < nrows; row++) {
			sum += a[row][col];
		}
		return sum / nrows;
	}//END: getColumnMean
	
	private String[] subset(String line[], int start, int length) {
		String output[] = new String[length];
		System.arraycopy(line, start, output, 0, length);
		return output;
	}//END: subset
	
}// END: class
