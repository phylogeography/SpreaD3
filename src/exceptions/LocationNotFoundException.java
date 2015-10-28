//package exceptions;
//
//import structure.data.Location;
//
//@SuppressWarnings("serial")
//public class LocationNotFoundException extends Exception {
//
//	public enum Type {
//		NODE, PARENT
//	}
//	
//	private final Location location;
//	private final Type type;
//	
//	public LocationNotFoundException(Location location, Type type) {
//		
//		this.location = location;
//		this.type = type;
//		
//	}//END: Constructor
//	
//	public String getNotFoundLocationId() {
//		return location.getId();
//	}
//	
//	@Override
//	public String getMessage() {
//		
//		String locationType = (type == Type.PARENT ? "Parent" : " Child");
//		String message =  locationType + " location " + location.getId() + " could not be found in the locations file.";
//		return message;
//	}
//	
//}//END: class
