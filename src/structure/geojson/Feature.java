package structure.geojson;

import com.google.gson.JsonObject;

public class Feature {

	private final String type;
	private final String id;

	// TODO: specific classes for these Objects, for spec sheet see:
	// http://geojson.org/geojson-spec.html#feature-collection-objects
	private final JsonObject properties;
	private final Object geometry;

	public Feature(String type, //
			String id, //
			Object geometry, //
			JsonObject properties) {

		this.type = type;
		this.id = id;
		this.properties = properties;
		this.geometry = geometry;

	}

	public String getType() {
		return type;
	}

	public String getId() {
		return id;
	}

	public Object getGeometry() {
		return geometry;
	}

	public JsonObject getProperties() {
		return properties;
	}

}
