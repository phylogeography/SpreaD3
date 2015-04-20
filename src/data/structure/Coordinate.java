package data.structure;

public class Coordinate {
	
	private double longitude;
	private double latitude;

	public Coordinate(final double longitude, final double latitude) {
		this.longitude = longitude;
		this.latitude = latitude;
	}//END: Constructor
	
	public double getLongitude() {
		return longitude;
	}

	public double getLatitude() {
		return latitude;
	}

	
}//END: class
