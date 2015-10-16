package settings.parsing;

public class BayesFactorsSettings {

	//---REQUIRED---//
	
	// path to locations file
	public String locations = null;
	
	// path to log file
	public String log = null;
	
	//---OPTIONAL---//
	
	// path to json output file 
	public String output = "output.json";

	// burnin in %
	public Double burnin = 10.0;

	public double bfcutoff = 0.0;
	
	public boolean header = false;
	
	public String geojson = null;
	
}//END: class
