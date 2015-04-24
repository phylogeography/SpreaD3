package data.structure;

import java.util.LinkedHashMap;
import java.util.Map;

public class Line {

	private final Map<String, Object> attributes = new LinkedHashMap<String, Object>();

	private final Coordinate startCoordinate;
	private final Coordinate endCoordinate;

	private final Location startLocation;
	private final Location endLocation;

	private final double startTime;
	private final double endTime;
	
	public Line(Location startLocation, //
			Location endLocation, //
			double startTime, //
			double endTime, //
			Map<String, Object> attributes //
	) {

		super();
		
		this.startLocation = startLocation;
		this.endLocation = endLocation;

		this.startTime = startTime;
		this.endTime = endTime;

		this.startCoordinate = null;
		this.endCoordinate = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Line(Coordinate startCoordinate, //
			Coordinate endCoordinate, //
			double startTime, //
			double endTime, //
			Map<String, Object> attributes //
	) {

		super();
		
		this.startCoordinate = startCoordinate;
		this.endCoordinate = endCoordinate;
		this.startTime = startTime;
		this.endTime = endTime;

		this.startLocation = null;
		this.endLocation = null;

		if(  attributes != null) {
		this.attributes.putAll(attributes);
		}
		
	}// END: Constructor

	public Coordinate getStartCoordinate() {
		return startCoordinate;
	}

	public Coordinate getEndCoordinate() {
		return endCoordinate;
	}

	public double getStartTime() {
		return startTime;
	}

	public double getEndTime() {
		return endTime;
	}

	public Location getStartLocation() {
		return startLocation;
	}

	public Location getEndLocation() {
		return endLocation;
	}

}// END: class
