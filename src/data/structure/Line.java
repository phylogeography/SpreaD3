package data.structure;

import java.util.LinkedHashMap;
import java.util.Map;

import exceptions.MissingAttributeException;
import utils.Trait;

public class Line {

	// Traits which have start and end values go here:
	private final Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();

	private final Coordinate startCoordinate;
	private final Coordinate endCoordinate;

	private final Location startLocation;
	private final Location endLocation;
	private final boolean connectsLocations;

	private final String startTime;
	private final String endTime;

	public Line(Location startLocation, //
			Location endLocation, //
			String startTime, //
			String endTime, //
			Map<String, Trait> attributes //
	) {

		this.startLocation = startLocation;
		this.endLocation = endLocation;
		this.connectsLocations = true;

		this.startTime = startTime;
		this.endTime = endTime;

		this.startCoordinate = null;
		this.endCoordinate = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Line(Location startLocation, //
			Location endLocation, //
			Map<String, Trait> attributes //
	) {

		this.startLocation = startLocation;
		this.endLocation = endLocation;
		this.connectsLocations = true;

		this.startTime = null;
		this.endTime = null;

		this.startCoordinate = null;
		this.endCoordinate = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}

	public Line(Coordinate startCoordinate, //
			Coordinate endCoordinate, //
			String startTime, //
			String endTime, //
			Map<String, Trait> attributes //
	) {

		this.startCoordinate = startCoordinate;
		this.endCoordinate = endCoordinate;
		this.startTime = startTime;
		this.endTime = endTime;

		this.startLocation = null;
		this.endLocation = null;
		this.connectsLocations = false;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Coordinate getStartCoordinate() {
		return startCoordinate;
	}

	public Coordinate getEndCoordinate() {
		return endCoordinate;
	}

	public String getStartTime() {
		return startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public Location getStartLocation() {
		return startLocation;
	}

	public Location getEndLocation() {
		return endLocation;
	}

	public boolean connectsLocations() {
		return connectsLocations;
	}

	public Map<String, Trait> getAttributes() {
		return attributes;
	}

}// END: class
