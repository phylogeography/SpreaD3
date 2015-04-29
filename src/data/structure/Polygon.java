package data.structure;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Polygon {

	private final Map<String, Object> attributes = new LinkedHashMap<String, Object>();

	private final Location location;
	private final List<Coordinate> coordinates;
	private final double time;
	private final boolean hasCentroid;
	
	public Polygon(List<Coordinate> coordinates, //
			double time, //
			Map<String, Object> attributes //
	) {

		super();

		this.location = null;
        this.hasCentroid = false;
		
		this.coordinates = coordinates;
		this.time = time;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Polygon

	public Polygon(Location centroid, //
			double time, //
			Map<String, Object> attributes //
	) {

		super();

		this.location = centroid;
		this.hasCentroid = true;
		this.coordinates = null;
		this.time = time;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}
	}

	public List<Coordinate> getCoordinates() {
		return coordinates;
	}

	public double getTime() {
		return time;
	}

	public Location getCentroid() {
		return location;
	}

	public boolean hasCentroid() {
		return hasCentroid;
	}
	
}// END: class
