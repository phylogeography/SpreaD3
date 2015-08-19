package settings.parsing;

public class ContinuousTreeSettings {

	//---REQUIRED---//
	
	// path to tree file
	public String tree = null;
	
	// location attribute name
	public String locationTrait = null;
	
	// hpd attribute name
	public String hpd = null;
	
	//---OPTIONAL---//

	// most recent sampling date yyy/mm/dd
	public String mrsd = "0-0-0";
	
	// multiplier for the branch lengths. Defaults to 1 unit = 1 year
	public double timescaleMultiplier = 1.0;
	
	// node trait attribute names
	public String[] traits = null;
	
	// path to json output file 
	public String output = "output.json";

}//END: class
