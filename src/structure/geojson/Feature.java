package structure.geojson;

public class Feature {

	private final String type;
	private final String id;
	private final Object properties;
	
	private final Object geometry;
	
	
	public Feature(String type, //
			String id, //
			Object geometry, //
			Object properties
			) {
		
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


	public Object getProperties() {
		return properties;
	}
	
}
