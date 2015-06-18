package data.structure;

public class Coordinate {
	
	// latitude, xCoordinate
	private final double xCoordinate;
	// longitude, yCoordinate
	private final double yCoordinate;
	private double altitude;

	public Coordinate(Double latitude, //
			Double longitude, //
			Double altitude //
	) {

		this.xCoordinate = latitude;
		this.yCoordinate = longitude;
		this.altitude = altitude;

	}

	public Coordinate(Double latitude, //
			Double longitude //
	) {

		this.xCoordinate = latitude;
		this.yCoordinate = longitude;
		this.altitude = 0.0;

	}// END: Constructor

	public double getLatitude() {
		return xCoordinate;
	}

	public double getLongitude() {
		return yCoordinate;
	}

	public Double getAltitude() {
		return altitude;
	}

	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}

}// END: class
