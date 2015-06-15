package settings.parsing;

import utils.Utils;

public class TimeSlicerSettings {

	// path to tree file
	public String tree = null;
	
	// number of intervals to create the time line
	public int intervals = 10;
	
	// path to trees file
	public String trees = null;
	
	// path to json output file 
	public String output;

	// how many trees to burn in (in #trees)
	public int burnIn = 1;

	// location attribute name
	public String locationTrait = null;

	
	

}//END: class
