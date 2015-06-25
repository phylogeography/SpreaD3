package data;

import java.util.LinkedList;
import java.util.List;

import data.structure.Layer;
import data.structure.Location;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class SpreadData {

//	private final TimeLine timeLine;
	private final LinkedList<Location> locations;
	private final LinkedList<Layer> layers;

	public SpreadData(LinkedList<Location> locations, LinkedList<Layer> layers) {

//		this.timeLine = null; // TODO
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
