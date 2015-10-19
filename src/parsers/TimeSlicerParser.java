package parsers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import contouring.ContourMaker;
import contouring.ContourPath;
import contouring.ContourWithSnyder;
import exceptions.AnalysisException;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.trees.RootedTree;
import structure.data.attributable.Area;
import structure.data.primitive.Coordinate;
import structure.data.primitive.Polygon;
import utils.ProgressBar;
import utils.Utils;

public class TimeSlicerParser {

	private double[] sliceHeights;
	private NexusImporter treesImporter;
	private String traitName;
    private TimeParser timeParser;
	
	private int assumedTrees;
	private int burnIn;
	private double hpdLevel;
	private double timescaleMultiplier ;
	
	private int gridSize;

	private LinkedList<Area> areasList;

	public TimeSlicerParser(String traitName, //
			NexusImporter treesImporter, //
			TimeParser timeParser, //
			int burnIn, //
			int assumedTrees, //
			double hpdLevel, //
			int gridSize, //
			double timescaleMultiplier, //
			double[] sliceHeights //
			
			
	) {

		this.sliceHeights = sliceHeights;
		this.treesImporter = treesImporter;
		this.timeParser = timeParser;
		this.burnIn = burnIn;
		this.assumedTrees = assumedTrees;
		this.traitName = traitName;
		this.hpdLevel = hpdLevel;

		this.gridSize = gridSize;
		this.timescaleMultiplier = timescaleMultiplier;
		
		
		
		this.areasList = new LinkedList<Area>();

	}// END: Constructor

	public void parse() throws AnalysisException, IOException, ImportException {

		// ---PARSE TREES---//

		int barLength = 100;
		int treesRead = 0;
		double stepSize = (double) barLength / (double) assumedTrees;

		System.out.println("Reading trees (bar assumes " + assumedTrees + " trees)");

		ProgressBar progressBar = new ProgressBar(barLength);
		progressBar.start();

		System.out.println(
				"0                        25                       50                       75                       100%");
		System.out.println(
				"|------------------------|------------------------|------------------------|------------------------|");

		RootedTree currentTree;
		ConcurrentHashMap<Double, List<double[]>> slicesMap = new ConcurrentHashMap<Double, List<double[]>>();

		int counter = 0;
		while (treesImporter.hasTree()) {

			try {

				currentTree = (RootedTree) treesImporter.importNextTree();

				if (counter >= burnIn) {

					new TimeSliceTree(slicesMap, //
							currentTree, //
							sliceHeights, //
							traitName //
					).run();

					treesRead++;
				} // END: burnin check

				counter++;
				double progress = (stepSize * counter) / barLength;
				progressBar.setProgressPercentage(progress);

			} catch (Exception e) {
				// catch any unchecked exceptions coming from Runnable, pass
				// them to handlers
				throw new AnalysisException(e.getMessage());
			} // END: try-catch

		} // END: trees loop
		progressBar.showCompleted();
		progressBar.setShowProgress(false);

		System.out.print("\n");
		System.out.println("Analyzed " + treesRead + " trees with burn-in of " + burnIn + " for the total of " + counter
				+ " trees");

		// ---MAKE CONTOURS---//

		System.out.println("Creating contours for " + traitName + " trait at " + hpdLevel + " HPD level");
		System.out.println(
				"0                        25                       50                       75                       100%");
		System.out.println(
				"|------------------------|------------------------|------------------------|------------------------|");

		counter = 0;
		stepSize = (double) barLength / (double) slicesMap.size();

		progressBar = new ProgressBar(barLength);
		progressBar.start();

		// Iterator<Double> iterator = traitMap.keySet().iterator();
		// while (iterator.hasNext()) {
		// Double sliceHeight = iterator.next();

		for (Double sliceHeight : slicesMap.keySet()) {

			List<double[]> coords = slicesMap.get(sliceHeight);
			int n = coords.size();

			double[] x = new double[n];
			double[] y = new double[n];

			for (int i = 0; i < n; i++) {

				if (coords.get(i) == null) {
					System.out.println("null found");
				}

				x[i] = coords.get(i)[Utils.LATITUDE_INDEX];
				y[i] = coords.get(i)[Utils.LONGITUDE_INDEX];

			} // END: i loop

			ContourMaker contourMaker = new ContourWithSnyder(x, y, gridSize);
			ContourPath[] paths = contourMaker.getContourPaths(hpdLevel);

			for (ContourPath path : paths) {

				double[] latitude = path.getAllX();
				double[] longitude = path.getAllY();

				List<Coordinate> coordinateList = new ArrayList<Coordinate>();

				for (int i = 0; i < latitude.length; i++) {
					coordinateList.add(new Coordinate(latitude[i], longitude[i]));
				}

//				Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
//
//				Trait hpdTrait = new Trait(hpdLevel);
//				attributes.put(Utils.HPD, hpdTrait);
//
//				Trait attributeName = new Trait(traitName);
//				attributes.put(Utils.TRAIT, attributeName);

				String startTime = timeParser.getNodeDate(sliceHeight * timescaleMultiplier);

				Polygon polygon = new Polygon(coordinateList
//						, //
//						startTime, //
//						attributes //
				);


				// TODO: no attributes?
				Area area = new Area(polygon, startTime, null);
				areasList.add(area);
				
			} // END: paths loop

			counter++;
			double progress = (stepSize * counter) / barLength;
			progressBar.setProgressPercentage(progress);

		} // END: iterate

		progressBar.showCompleted();
		progressBar.setShowProgress(false);
		System.out.print("\n");

		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		// TODO

	}// END: parse

	public LinkedList<Area> getAreasList() {
		return areasList;
	}// END: getAreas

}// END: class
