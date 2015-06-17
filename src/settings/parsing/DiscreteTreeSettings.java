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
	
}//END: class
