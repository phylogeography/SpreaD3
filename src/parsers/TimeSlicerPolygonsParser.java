package parsers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;
import contouring.ContourMaker;
import contouring.ContourPath;
import contouring.ContourWithSnyder;
import data.structure.Coordinate;
import data.structure.Polygon;

public class TimeSlicerPolygonsParser {
	
	private RootedTree rootedTree;
	private NexusImporter treesImporter;
	private int numberOfIntervals;
	// how many trees to burn in (in #trees)
	private int burnIn;
	private String locationTrait;
	private int gridSize;
	private double hpdLevel;
	private int assumedTrees;
	
	public TimeSlicerPolygonsParser(RootedTree rootedTree,
			NexusImporter treesImporter, //
			int numberOfIntervals, //
			String locationTrait, //
			int burnIn, //
			int gridSize, //
			double hpdValue //
			) {

		this.rootedTree = rootedTree;
		this.treesImporter = treesImporter;
        this.numberOfIntervals = numberOfIntervals;
		this.burnIn = burnIn;
		this.locationTrait = locationTrait;
		this.gridSize = gridSize;
		this.hpdLevel = hpdValue;
		
	}// END: Constructor

	public LinkedList<Polygon> parsePolygons() throws IOException, ImportException {

		LinkedList<Polygon> polygonsList = new LinkedList<Polygon>();
		double[] sliceHeights = generateSliceHeights(rootedTree, numberOfIntervals);
		//sort them in ascending numerical order
		Arrays.sort(sliceHeights);
		
		System.out.println("Using as slice times: ");
		Utils.printArray(sliceHeights);
		
		int barLength = 100;
		int treesRead = 0;
		double stepSize = (double)assumedTrees / (double) barLength;
//		if(stepSize < 1) {
//			stepSize = (double)barLength / (double)assumedTrees ;
//		}
		
		System.out.println("Reading trees (bar assumes " + assumedTrees +" trees)");
		System.out
		.println(          "0                        25                       50                       75                       100%");
		System.out.println("|------------------------|------------------------|------------------------|------------------------|");
		
		RootedTree currentTree;
		ConcurrentHashMap<Double, LinkedList<double[]>> slicesMap = new ConcurrentHashMap<Double, LinkedList<double[]>>();
		
		int counter = 0;
		while (treesImporter.hasTree()) {
		
			currentTree = (RootedTree) treesImporter.importNextTree();
			
			if (counter >= burnIn) {

				new AnalyzeTree(slicesMap, //
						currentTree, //
						sliceHeights, //
						locationTrait//
						).run();
				
				treesRead++;
			}// END: burnin check
			
//			if (stepSize < 1) {
//
//				if (totalTrees % (int) stepSize == 0 && m < 100) {
//					System.out.print("*");
//					m++;
//					if (m % 25 == 0) {
//						System.out.print(" ");
//					}
//					System.out.flush();
//				}
//
//			} else {
//
//				for (int i = 0; i < stepSize; i++) {
//					System.out.print("*");
//					m++;
//					if (m % 25 == 0) {
//						System.out.print(" ");
//					}
//					System.out.flush();
//				}
//
//			}//END: stepSize check
		
			counter++;
			double progress = stepSize * counter;
			updateProgress(progress, barLength);
		}//END: trees loop

		System.out.print("\n");
		System.out.println("Analyzed " + treesRead
				+ " trees with burn-in of " + burnIn + " for the total of "
				+ counter + " trees");
		
		System.out.println("Creating contours at " + hpdLevel + " HPD level");
		System.out
		.println(          "0                        25                       50                       75                       100%");
		System.out.println("|------------------------|------------------------|------------------------|------------------------|");

		Iterator<Double> iterator = slicesMap.keySet().iterator();
		
         counter = 0;
		 stepSize = (double)slicesMap.size() / (double) barLength;
		while (iterator.hasNext()) {
			
			Double sliceHeight = iterator.next();
			LinkedList<double[]> coords = slicesMap.get(sliceHeight);
			int n = coords.size();
			
			double[] x = new double[n];
			double[] y = new double[n];
			
			for (int i = 0; i < n; i++) {

				if (coords.get(i) == null) {
					System.out.println("null found");
				}

				x[i] = coords.get(i)[Utils.LATITUDE_INDEX];  
				y[i] = coords.get(i)[Utils.LONGITUDE_INDEX];

			}//END: i loop
			
			ContourMaker contourMaker = new ContourWithSnyder(x, y, gridSize);
			ContourPath[] paths = contourMaker.getContourPaths(hpdLevel);

			for (ContourPath path : paths) {

				double[] latitude = path.getAllX();
				double[] longitude = path.getAllY();

				List<Coordinate> coordinateList = new ArrayList<Coordinate>();

				for (int i = 0; i < latitude.length; i++) {
					coordinateList.add(new Coordinate(longitude[i], latitude[i]));
				}

				//TODO: add them traits / attributes
				Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
				
				Polygon polygon = new Polygon(coordinateList,
						sliceHeight, attributes);
				
                  polygonsList.add(polygon);
			}// END: paths loop
			
			counter++;
			double progress = stepSize * counter;
			updateProgress(progress, barLength);
		}//END: iterate
		System.out.print("\n");
		
		return polygonsList;
	}//END: parsePolygons

	private double[] generateSliceHeights(RootedTree rootedTree,
			int numberOfIntervals
			) {

		double rootHeight = rootedTree.getHeight(rootedTree.getRootNode());
		double[] timeSlices = new double[numberOfIntervals];

		for (int i = 0; i < numberOfIntervals; i++) {

			timeSlices[i] = rootHeight
					- (rootHeight / (double) numberOfIntervals)
					* ((double) i);
		}

		return timeSlices;
	}// END: generateTimeSlices

	public void setAssumedTrees(int assumedTrees) {
		this.assumedTrees = assumedTrees;
	}
	
	void updateProgress(double progressPercentage, int barLength) {

		System.out.print("\r[");
		int i = 0;
//		for (; i <= (int) (progressPercentage * barLength); i++) {
		for (; i < (int) (progressPercentage * (barLength-1)); i++) {
			System.out.print("*");
		}
		
		for (; i < barLength-1; i++) {
			System.out.print(" ");
		}
		
		System.out.print("]");
	}//END: updateProgress
	
}//END: class
