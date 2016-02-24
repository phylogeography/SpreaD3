package structure.data.primitive;

public class Coordinate {

	private final Double xCoordinate;
	private final Double yCoordinate;
	private Double altitude;

	public Coordinate(Double latitude, //
			Double longitude, //
			Double altitude //
	) {

//		this.xCoordinate = latitude;
//		this.yCoordinate = longitude;
		this.xCoordinate = longitude;
		this.yCoordinate = latitude;
		this.altitude = altitude;

	}

	public Coordinate(Double latitude, //
			Double longitude //
	) {

//		this.xCoordinate = latitude;
//		this.yCoordinate = longitude;
		this.xCoordinate = longitude;
		this.yCoordinate = latitude;
		this.altitude = 0.0;

	}// END: Constructor

	public double getXCoordinate() {
		return xCoordinate;
	}// END: getXCoordinate

	public double getYCoordinate() {
		return yCoordinate;
	}// END: yCoordinate

	public Double getAltitude() {
		return altitude;
	}// END: getAltitude

	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}// END: setAltitude

}// END: class
