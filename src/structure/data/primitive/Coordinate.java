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

		if (xCoordinate == null) {
			throw new AnalysisException("xCoordinate attribute is empty.");
		}

		return xCoordinate;
	}// END: getXCoordinate

	public double getYCoordinate() throws AnalysisException {

		if (yCoordinate == null) {
			throw new AnalysisException("yCoordinate attribute is empty.");
		}

		return yCoordinate;
	}// END: yCoordinate

	public Double getAltitude() throws AnalysisException {
		if (altitude == null) {
			throw new AnalysisException("altitude attribute is empty.");
		}
		return altitude;
	}// END: getAltitude

	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}// END: setAltitude

}// END: class
