package settings.parsing;

import jebl.evolution.trees.RootedTree;

public class ContinuousTreeSettings {

	// ---REQUIRED---//

	// path to tree file
	public String treeFilename = null;

	// continuous coordinate attribute names
	public String xCoordinate = null; // long
	public String yCoordinate = null; // lat

	public String hpd = "";
	
	// ---OPTIONAL---//

	// most recent sampling date yyy/mm/dd
	public String mrsd = "0/0/0";

	// multiplier for the branch lengths. Defaults to 1 unit = 1 year
	public double timescaleMultiplier = 1.0;

	// path to json output file
	public String outputFilename = "output.json";

	public String geojsonFilename = null;

	public boolean externalAnnotations = false;
	
	// ---GUI---//
	
	public RootedTree rootedTree = null;

}// END: class
