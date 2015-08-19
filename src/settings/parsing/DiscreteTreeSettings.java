package settings.parsing;

public class DiscreteTreeSettings {

	//---REQUIRED---//
	
	// path to tree file
	public String tree = null;
	
	// path to locations file
	public String locations = null;
	
	// location attribute name
	public String locationTrait = null;
	
	//---OPTIONAL---//
	
	// node trait attribute names
	public String[] traits = null;
	
	// number of discrete intervals
	public Integer intervals = 10;
	
	// path to json output file 
	public String output = "output.json";

	// moste recent sampling date string yyy-MM-dd
	public String mrsd = "0-0-0";

	// multiplier for the branch lengths. Defaults to 1 unit = 1 year
	public double timescaleMultiplier = 1;
	
}//END: class
