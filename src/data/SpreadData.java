package data;

import java.util.List;

import data.structure.Layer;
import data.structure.Location;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class SpreadData {

	private final List<Location> locations;// = new LinkedList<Location>();
	private final List<Layer> layers;// = new LinkedList<Layer>();

	public SpreadData(List<Location> locations, List<Layer> layers) {

		this.locations = locations;
		this.layers = layers;

	}// END: Constructor

	public List<Location> getLocations() {
		return locations;
	}

	public List<Layer> getLayers() {
		return layers;
	}

}// END: class
