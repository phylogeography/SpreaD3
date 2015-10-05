package settings.parsing;

public class ContinuousTreeSettings {

	// ---REQUIRED---//

	// path to tree file
	public String tree = null;

	// Continuous coordinate attribute names
	public String xCoordinate = null; // lat
	public String yCoordinate = null; // long

	// hpd  attribute 
	public String hpd = null;
	
//	public String xCoordinateHpd = null; // lat hpd
//	public String yCoordinateHpd = null; // long hpd
	
	// ---OPTIONAL---//

	// most recent sampling date yyy/mm/dd
	public String mrsd = "0-0-0";

	// multiplier for the branch lengths. Defaults to 1 unit = 1 year
	public double timescaleMultiplier = 1.0;

	// node trait attribute names
//	public String[] traits = null;

	// path to json output file
	public String output = "output.json";

}// END: class
