package structure.data.primitive;

import exceptions.AnalysisException;

public class Coordinate {

	private final Double xCoordinate;
	private final Double yCoordinate;
	private Double altitude;

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

	public double getXCoordinate() throws AnalysisException {
		return xCoordinate;
	}// END: getXCoordinate

	public double getYCoordinate() throws AnalysisException {
		return yCoordinate;
	}// END: yCoordinate

	public Double getAltitude() throws AnalysisException {
		return altitude;
	}// END: getAltitude

	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}// END: setAltitude

}// END: class
