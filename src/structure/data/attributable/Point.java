package structure.data.attributable;

import java.util.LinkedHashMap;
import java.util.Map;

import structure.data.Location;
import structure.data.primitive.Coordinate;

public class Point {

	private final String id;
	private final Location location;
	private final Coordinate coordinate;
	private final String startTime;
	private final String endTime;
	private final Map<String, Object> attributes = new LinkedHashMap<String, Object>();

	public String getId() {
		return id;
	}

	public Point(String id) {
		this.id = id;
		this.location = null;
		this.coordinate = null;
		this.startTime = null;
		this.endTime = null;
	}

	public Point(String id, Location location, String startTime, Map<String, Object> attributes) {

		this.id = id;
		this.location = location;
		this.coordinate = null;
		this.startTime = startTime;
		this.endTime = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Point(String id, Location location, String startTime, String endTime, Map<String, Object> attributes) {

		this.id = id;
		this.location = location;
		this.coordinate = null;
		this.startTime = startTime;
		this.endTime = endTime;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Point(String id, Coordinate coordinate, String startTime, Map<String, Object> attributes) {

		this.id = id;
		this.coordinate = coordinate;
		this.location = null;
		this.startTime = startTime;
		this.endTime = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}
	}// END:
		// Constructor

	public String getStartTime() {
		return startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public boolean hasLocation() {

		boolean hasLocation = false;
		if (this.location != null) {
			hasLocation = true;
		}

		return hasLocation;
	}//END: hasLocation

	public Location getLocation() {
		return location;
	}

	public Coordinate getCoordinate() {
		return coordinate;
	}

	public Map<String, Object> getAttributes() {
		return attributes;
	}

	public void addAttribute(String name, Object value) {
		attributes.put(name, value);
	}

	@Override
	public boolean equals(Object obj) {

		if (obj == null) {
			return false;
		}

		if (obj == this) {
			return true;
		}

		if (!(obj instanceof Location)) {
			return false;
		}

		Point point = (Point) obj;
		if (point.getId().equals(this.id)) {
			return true;
		} else {
			return false;
		}

	}// END: equals

}// END: class
