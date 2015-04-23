package exceptions;

import data.structure.Location;

@SuppressWarnings("serial")
public class LocationNotFoundException extends Exception {

	private final Location location;
	
	public LocationNotFoundException(Location location) {
		
		this.location = location;
		
	}//END: Constructor
	
	public String getNotFoundLocationId() {
		return location.getId();
	}
	
}//END: class
