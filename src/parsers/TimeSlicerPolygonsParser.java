package parsers;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.Scanner;
import java.util.concurrent.ConcurrentHashMap;

import utils.Utils;

import data.structure.Coordinate;
import data.structure.Polygon;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.trees.RootedTree;

public class TimeSlicerPolygonsParser {

	private RootedTree rootedTree;
	private NexusImporter treesImporter;
	private int numberOfIntervals;
	// how many trees to burn in (in #trees)
	private int burnIn;
	private String locationTrait;
	
	private int assumedTrees;
	
	public TimeSlicerPolygonsParser(RootedTree rootedTree,
			NexusImporter treesImporter, int numberOfIntervals, String locationTrait, int burnIn) {

		this.rootedTree = rootedTree;
		this.treesImporter = treesImporter;
        this.numberOfIntervals = numberOfIntervals;
		this.burnIn = burnIn;
		this.locationTrait = locationTrait;
		
		
		
	}// END: Constructor

	public LinkedList<Polygon> parsePolygons() throws IOException, ImportException {

		LinkedList<Polygon> polygonsList = new LinkedList<Polygon>();
//		String latitudeName = locationTrait.concat(Utils.ONE);
//		String longitudeName = locationTrait.concat(Utils.TWO);
		
		
		double[] sliceHeights = generateSliceHeights(rootedTree, numberOfIntervals);
		
		//sort them in ascending numerical order
		Arrays.sort(sliceHeights);
		
		System.out.println("Using as slice times: ");
		Utils.printArray(sliceHeights);
		
		
		int barLength = 100;
		int totalTrees = 0;
		int treesRead = 0;
		
		double stepSize = (double)assumedTrees / (double)barLength;
		if(stepSize < 1) {
			stepSize = (double)barLength / (double)assumedTrees ;
		}
		
		System.out.println("Reading trees (bar assumes " + assumedTrees +" trees)");
		System.out
				.println("0                         25                        50                        75                        100%");
		System.out
				.println("|-------------------------|-------------------------|-------------------------|-------------------------|");
		System.out.print(" ");
		
		int m = 0;
		
		RootedTree currentTree;
		ConcurrentHashMap<Double, LinkedList<Coordinate>> slicesMap = new ConcurrentHashMap<Double, LinkedList<Coordinate>>();
		
		while (treesImporter.hasTree()) {
		
			currentTree = (RootedTree) treesImporter.importNextTree();
			
			if (totalTrees >= burnIn) {

				

				new AnalyzeTree(slicesMap, //
						currentTree, //
						sliceHeights, //
						locationTrait).run();
				
				
				
				treesRead++;
			}// END: burnin check
			
			if (stepSize < 1) {

				if (totalTrees % (int) stepSize == 0 && m < 100) {
					System.out.print("*");
					m++;
					if (m % 25 == 0) {
						System.out.print(" ");
					}
					System.out.flush();
				}

			} else {

				for (int i = 0; i < stepSize; i++) {
					System.out.print("*");
					m++;
					if (m % 25 == 0) {
						System.out.print(" ");
					}
					System.out.flush();
				}

			}//END: stepSize check
		
			totalTrees++;
		}//END: trees loop
		
		System.out.println("\nAnalyzed " + treesRead
				+ " trees with burn-in of " + burnIn + " for the total of "
				+ totalTrees + " trees");
		
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
	
	
}//END: class
