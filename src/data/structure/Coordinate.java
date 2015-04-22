package data.structure;

public class Coordinate {

	private final double longitude;
	private final double latitude;

	public Coordinate(Double longitude, //
			Double latitude //
	) {

		this.longitude = longitude;
		this.latitude = latitude;

	}// END: Constructor

	public double getLongitude() {
		return longitude;
	}

	public double getLatitude() {
		return latitude;
	}

}// END: class
