package data.structure;

public class Coordinate {

	private final double latitude;
	private final double longitude;
	private double altitude;
	
	public Coordinate(Double latitude, //
			Double longitude, //
			Double altitude) {

		this.latitude = latitude;
		this.longitude = longitude;
		this.altitude = altitude;
	
	}
	
	public Coordinate(
			Double latitude, //
			Double longitude //
	) {

		this.latitude = latitude;
		this.longitude = longitude;
		this.altitude = 0.0;
		
	}// END: Constructor


	public double getLatitude() {
		return latitude;
	}

	public double getLongitude() {
		return longitude;
	}
	
	public Double getAltitude() {
		return altitude;
	}

	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}
	
}// END: class
