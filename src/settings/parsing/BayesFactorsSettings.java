package settings.parsing;

public class BayesFactorsSettings {

	// path to locations file
	public String locations = null;
	
	// path to log file
	public String log = null;
	
	// path to json output file 
	public String output = "output.json";

	// burnin in %
	public Double burnin = 10.0;

	public double bfcutoff = 0.0;
	
}//END: class
