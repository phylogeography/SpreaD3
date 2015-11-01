package settings.parsing;

import java.util.LinkedList;

import jebl.evolution.trees.RootedTree;
import structure.data.Location;

public class DiscreteTreeSettings implements DiscreteSpreadDataSettings {

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

	public boolean hasHeader = false;
	
	//---GUI---//
	
	public RootedTree rootedTree = null;
	public LinkedList<Location> locationsList = null;

	@Override
	public String getLocationsFilename() {
		return locationsFilename;
	}
	
	@Override
	public void setLocationsFilename(String locationsFilename) {
		this.locationsFilename = locationsFilename;
	}
	
	@Override
	public boolean hasHeader() {
		return hasHeader;
	}

	@Override
	public LinkedList<Location> getLocationsList() {
		return locationsList;
	}

	@Override
	public void setLocationsList(LinkedList<Location> locationsList) {
		this.locationsList = locationsList;
	}
	
}//END: class
