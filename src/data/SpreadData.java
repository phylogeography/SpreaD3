package data;

import java.util.LinkedList;
import java.util.List;

import data.structure.Layer;
import data.structure.Location;
import data.structure.TimeLine;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class SpreadData {

	private final TimeLine timeLine;
	private final LinkedList<Location> locations;// = new LinkedList<Location>();
	private final LinkedList<Layer> layers;// = new LinkedList<Layer>();

	public SpreadData(LinkedList<Location> locations, LinkedList<Layer> layers) {

		this.timeLine = null; //TODO
		this.locations = locations;
		this.layers = layers;

	}// END: Constructor

	public List<Location> getLocations() {
		return locations;
	}

	public List<Layer> getLayers() {
		return layers;
	}

//	public hasLocations()
	
}// END: class
