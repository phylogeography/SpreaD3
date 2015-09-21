package structure.data;

import java.util.LinkedList;
import java.util.List;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class SpreadData {

	private final TimeLine timeLine;
	private final LinkedList<Attribute> uniqueDataAttributes;
	private final LinkedList<Attribute> uniqueMapAttributes;
	private final LinkedList<Location> locations;
	
	private final LinkedList<Layer> layers;

	public SpreadData(TimeLine timeLine, //
			LinkedList<Attribute> uniqueDataAttributes, //
			LinkedList<Attribute> uniqueMapAttributes, //
			LinkedList<Location> locations, //
			LinkedList<Layer> layers//
			) {

		this.timeLine = timeLine; 
		this.uniqueDataAttributes = uniqueDataAttributes;
		this.uniqueMapAttributes = uniqueMapAttributes;
		this.locations = locations;
		this.layers = layers;

	}// END: Constructor

	public List<Layer> getLayers() {
		return layers;
	}

	public TimeLine getTimeLine() {
		return timeLine;
	}

	public LinkedList<Location> getLocations() {
		return locations;
	}

	public LinkedList<Attribute> getDataAttributes() {
		return uniqueDataAttributes;
	}

	public LinkedList<Attribute> getMapAttributes() {
		return uniqueMapAttributes;
	}

}// END: class
