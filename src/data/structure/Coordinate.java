package data.structure;

public class Coordinate {
	
	private double longitude;
	private double latitude;

	public Coordinate( double longitude, double latitude) {

		this.longitude = longitude;
		this.latitude = latitude;
		
		//TODO: altitude?
		
	}//END: Constructor
	
	public double getLongitude() {
		return longitude;
	}

	public double getLatitude() {
		return latitude;
	}

	
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}

	
	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}

	
}//END: class
