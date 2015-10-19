package parsers;

import java.util.LinkedList;

import structure.data.attributable.Area;
import utils.ProgressBar;

public class TimeSlicerParser {

	private int assumedTrees;
	
	private LinkedList<Area> areasList;
	
	
	
	public TimeSlicerParser(
			
			
			int assumedTrees
			) {
		
		
		this.assumedTrees = assumedTrees;
		
		
		
		this.areasList = new LinkedList<Area>();
		
		
	}//END: Constructor
	
	
	public void parse() {
		
		// ---PARSE TREES---//

		int barLength = 100;
		int treesRead = 0;
		double stepSize = (double) barLength / (double) assumedTrees;

		System.out.println("Reading trees (bar assumes " + assumedTrees
				+ " trees)");

		ProgressBar progressBar = new ProgressBar(barLength);
		progressBar.start();

		System.out
				.println("0                        25                       50                       75                       100%");
		System.out
				.println("|------------------------|------------------------|------------------------|------------------------|");
		
		
	}//END: parse


	public LinkedList<Area> getAreas() {
		return areasList;
	}//END: getAreas

}//END: class
