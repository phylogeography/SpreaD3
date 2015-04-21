package data.structure;

import java.util.LinkedHashMap;
import java.util.Map;

public class Location {

	private final Map<String, Object> attributes = new LinkedHashMap<String, Object>();

	private final Polygon polygon;
	private final String label;
	private final Coordinate coordinate;
	private final String id;

	public Location(String id, //
			String label, //
			Polygon polygon, //
			Map<String, Object> attributes//
	) {

		super();

		this.id = id;
		this.label = label;
		this.coordinate = null;
		this.polygon = polygon;

		this.attributes.putAll(attributes);

	}

	public Location(String id, String label, Coordinate coordinate,
			Map<String, Object> attributes) {

		super();

		this.id = id;
		this.label = label;
		this.coordinate = coordinate;
		this.polygon = null;

		this.attributes.putAll(attributes);

	}

	public String getId() {
		return id;
	}

	public Polygon getPolygon() {
		return polygon;
	}

	public String getLabel() {
		return label;
	}

	public Coordinate getCoordinate() {
		return coordinate;
	}

}
