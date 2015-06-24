package settings.parsing;


public class TimeSlicerSettings {

	//---HARDCODED---//
	
	public final int gridSize = 100;
	
	//---REQUIRED---//
	
	// path to tree file
	public String tree = null;
	
	// path to trees file
	public String trees = null;

	// path to slice heights file
	public String sliceHeights = null;

	// location attribute name
	public String locationTrait = null;
	
	//---OPTIONAL---//
	
	// number of intervals to create the time line
	public int intervals = 10;
	
	// how many trees to burn in (in #trees)
	public int burnIn = 1;

	// contouring hpd level
	public double hpdLevel = 0.95;

	public String[] traits = null;
	
	// path to json output file 
	public String output = "output.json";

	// most recent sampling date yyy/mm/dd
	public String mrsd = null;
	
}//END: class
