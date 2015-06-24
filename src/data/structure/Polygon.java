package data.structure;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import utils.Trait;

public class Polygon {

	private final Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();

	private final String location;
	private final boolean hasLocation;

	private final List<Coordinate> coordinates;
	private final String startTime;

	public Polygon(List<Coordinate> coordinates, //
			String startTime, //
			Map<String, Trait> attributes //
	) {

		super();

		this.location = null;
		this.hasLocation = false;

		this.coordinates = coordinates;
		this.startTime = startTime;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Polygon(String location, //
			String startTime, //
			Map<String, Trait> attributes //
	) {

		super();

		this.location = location;
		this.hasLocation = true;
		this.coordinates = null;
		this.startTime = startTime;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public List<Coordinate> getCoordinates() {
		return coordinates;
	}

	public String getStartTime() {
		return startTime;
	}

	public String getLocationId() {
		return location;
	}

	public Map<String, Trait> getAttributes() {
		return attributes;
	}

	public boolean hasLocation() {
		return hasLocation;
	}

}// END: class
