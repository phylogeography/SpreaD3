package settings.parsing;

public class DiscreteTreeSettings {

	// path to tree file
	public String tree = null;
	// path to locations file
	public String locations = null;
	// location attribute name
	public String locationTrait = null;
	// number of discrete intervals
	public Integer intervals = 10;
	// path to json output file 
	public String output = "output.json";
	
	public DiscreteTreeSettings() {
	}//END: Construtor
	
}//END: class
