package structure.data.primitive;

public class Coordinate {

	private final Double xCoordinate;
	private final Double yCoordinate;
	private Double altitude;

	public Coordinate(Double latitude, //
			Double longitude, //
			Double altitude //
	) {

		this.xCoordinate = longitude;
		this.yCoordinate = latitude;
		this.altitude = altitude;

	}

	public Coordinate(Double latitude, //
			Double longitude //
	) {

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

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((xCoordinate == null) ? 0 : xCoordinate.hashCode());
		result = prime * result + ((yCoordinate == null) ? 0 : yCoordinate.hashCode());
		return result;
	}
	
//	@Override
//	public boolean equals(Object obj) {
//		if (this == obj)
//			return true;
//		if (obj == null)
//			return false;
//		if (getClass() != obj.getClass())
//			return false;
//		Coordinate other = (Coordinate) obj;
//		if (xCoordinate == null) {
//			if (other.xCoordinate != null)
//				return false;
//		} else if (!xCoordinate.equals(other.xCoordinate))
//			return false;
//		if (yCoordinate == null) {
//			if (other.yCoordinate != null)
//				return false;
//		} else if (!yCoordinate.equals(other.yCoordinate))
//			return false;
//		return true;
//	}
	
}// END: class
