package settings.parsing;

import java.util.LinkedList;

import jebl.evolution.trees.RootedTree;
import structure.data.Location;

public class DiscreteTreeSettings {

	//---REQUIRED---//
	
	// path to tree file
	public String treeFilename = null;
	
	// path to locations file
	public String locationsFilename = null;
	
	// location attribute name
	public String locationAttributeName = null;
	
	//---OPTIONAL---//
	
	// moste recent sampling date string yyyy/MM/dd
	public String mrsd = "0/0/0";
	
	// multiplier for the branch lengths. Defaults to 1 unit = 1 year
	public double timescaleMultiplier = 1;
	
	public String geojsonFilename = null;
	
	// number of discrete intervals
	public Integer intervals = 10;
	
	// path to json output file 
	public String outputFilename = "output.json";

	public boolean header = false;
	
	//---GUI---//
	
	public RootedTree rootedTree = null;
	public LinkedList<Location> locationsList = null;
//	public boolean locationsEdited = false;
	
}//END: class
