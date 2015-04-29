package data.structure;

import java.util.LinkedHashMap;
import java.util.Map;

public class Location {

	private final Map<String, Object> attributes = new LinkedHashMap<String, Object>();

	private final String id;
	private final String description;	
	private final Polygon polygon;
	private final Coordinate coordinate;

	public Location(String id, //
			String description, //
			Polygon polygon, //
			Map<String, Object> attributes //
	) {

		super();

		this.id = id;
		this.description = description;
		this.coordinate = null;
		this.polygon = polygon;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}

	public Location(String id, //
			String description, //
			Coordinate coordinate, //
			Map<String, Object> attributes //
	) {

		super();

		this.id = id;
		this.description = description;
		this.coordinate = coordinate;
		this.polygon = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}

	public String getId() {
		return id;
	}

	public String getDescription() {
		return description;
	}
	
	public Polygon getPolygon() {
		return polygon;
	}

	public Coordinate getCoordinate() {
		return coordinate;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		return result;
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
		
		Location location = (Location) obj;
		if (location.getId().equals(this.id)) {
			return true;
		} else {
			return false;
		}

	}// END: equals

}// END: class
