package data.structure.attributable;

import java.util.LinkedHashMap;
import java.util.Map;

import data.structure.Location;
import data.structure.primitive.Coordinate;
import utils.Trait;

public class Point {

	private final Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();

	private final Location location;
	private final Coordinate coordinate;
	private final String startTime;
	private final String id;
	
	public String getId() {
		return id;
	}

	public Point(String id) {
		this.id = id;
		this.location = null;
		this.startTime = null;
		this.coordinate = null;
	}
	
	public Point(String id, Location location, String startTime, Map<String, Trait> attributes) {

		this.id = id;
		this.location = location;
		this.startTime = startTime;
		this.coordinate = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Point(String id, Coordinate coordinate, String startTime, Map<String, Trait> attributes) {

		this.id = id;
		this.coordinate = coordinate;
		this.startTime = startTime;
		this.location = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}
	}// END:
		// Constructor

	public String getStartTime() {
		return startTime;
	}

	public Location getLocation() {
		return location;
	}

	public Coordinate getCoordinate() {
		return coordinate;
	}

	public Map<String, Trait> getAttributes() {
		return attributes;
	}
	
	public void addAttribute(String name, Trait trait) {
		attributes.put(name, trait);
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
