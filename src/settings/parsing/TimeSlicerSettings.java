package settings.parsing;


public class TimeSlicerSettings {

	//---HARDCODED---//
	
	public final int gridSize = 100;
	
	//---REQUIRED---//
	
	// path to tree file
	public String treeFilename = null;
	
	// path to slice heights file
	public String sliceHeightsFilename = null;
	
	// path to trees file
	public String treesFilename = null;

	// 2D trait for contouring
	public String trait;
	
	//---OPTIONAL---//

	// rrw rate attribute (if any)
	public String rrwRate = null;//(trait).concat(".rate");
	
	// relaxed random walk or homogenous Brownian motion?
//	public boolean hasRRWrate = false;

	// rrw rate precision
//	public String precision = "precision";
	
	// most recent sampling date yyy/mm/dd
	public String mrsd = "0/0/0";

	// multiplier for the branch lengths. Defaults to 1 unit = 1 year
	public double timescaleMultiplier = 1.0;
	
	// geojson 
	public String geojsonFilename;
	
	// number of intervals to create the time line
	public int intervals = 10;
	
	// how many trees to burn in (in #trees)
	public int burnIn = 1;

	// contouring hpd level
	public double hpdLevel = 0.8;
	
	// path to json output file 
	public String outputFilename = "output.json";

	//---GUI---//

	public Integer assumedTrees = null;
	
}//END: class
