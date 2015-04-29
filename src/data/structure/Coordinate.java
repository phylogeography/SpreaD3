package data.structure;

public class Coordinate {

	private final double longitude;
	private final double latitude;
	private final double altitude;
	
	public Coordinate(Double longitude, //
			Double latitude //
	) {

		this.longitude = longitude;
		this.latitude = latitude;
		this.altitude = 0.0;
		
	}// END: Constructor

	public double getLongitude() {
		return longitude;
	}

	public double getLatitude() {
		return latitude;
	}

	public Double getAltitude() {
		return altitude;
	}

}// END: class
