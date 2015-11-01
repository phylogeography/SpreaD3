package settings.parsing;

import java.util.LinkedList;

import structure.data.Location;

public interface DiscreteSpreadDataSettings {

	public String getLocationsFilename();

	public void setLocationsFilename(String locationsFilename);

	public boolean hasHeader();

	public LinkedList<Location> getLocationsList();

	public void setLocationsList(LinkedList<Location> locationsList);

}// END: interface