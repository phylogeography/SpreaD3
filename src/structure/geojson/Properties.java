package structure.geojson;

import java.util.LinkedList;

public class Properties {

	private final LinkedList<Property> properties;

	public Properties(LinkedList<Property> properties) {

		this.properties = properties;

	}// END: Constructor

	public LinkedList<Property> getProperties() {
		return properties;
	}

}// END: class
