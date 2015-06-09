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
	
	@Override
	public String getMessage() {
		String message = "Location " + location.getId() + " not found";
		return message;
	}
	
}//END: class
