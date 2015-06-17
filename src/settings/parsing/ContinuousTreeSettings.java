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
	
	// node trait attribute names
	public String[] traits = null;
	
	// path to json output file 
	public String output = "output.json";
	
}//END: class
