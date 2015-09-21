package structure.geojson;

public class Property {

	private final String id;
	private final Object value;

	public Property(String id, Object value) {
		this.id = id;
		this.value = value;
	}// END: Constructor

	public String getId() {
		return id;
	}

	public Object getValue() {
		return value;
	}

}// END: class
