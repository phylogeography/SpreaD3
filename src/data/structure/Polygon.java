package data.structure;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Polygon {

	private final Map<String, Object> attributes = new LinkedHashMap<String, Object>();

	private final List<Coordinate> coordinates;
	private final double time;

	public Polygon(List<Coordinate> coordinates,//
			double time, //
			Map<String, Object> attributes //
	) {

		this.coordinates = coordinates;
		this.time = time;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Polygon

	public List<Coordinate> getCoordinateList() {
		return coordinates;
	}

	public double getTime() {
		return time;
	}

}// END: class
