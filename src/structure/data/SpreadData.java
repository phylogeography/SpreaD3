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
	private final LinkedList<Attribute> mapAttributes;
	private final LinkedList<Attribute> lineAttributes;
	private final LinkedList<Attribute> pointAttributes;
	private final LinkedList<Location> locations;
	private final LinkedList<Layer> layers;

	public SpreadData(TimeLine timeLine, //
			LinkedList<Attribute> mapAttributes, //
			LinkedList<Attribute> lineAttributes, //
			LinkedList<Attribute> pointAttributes, //
			LinkedList<Location> locations, //
			LinkedList<Layer> layers //
	) {

		this.timeLine = timeLine;
		this.mapAttributes = mapAttributes;
		this.lineAttributes = lineAttributes;
		this.pointAttributes = pointAttributes;
		this.locations = locations;
		this.layers = layers;

	}// END: Constructor

	public SpreadData(TimeLine timeLine, //
			LinkedList<Attribute> mapAttributes, //
			LinkedList<Attribute> lineAttributes, //
			LinkedList<Attribute> pointAttributes, //
			LinkedList<Layer> layers //
	) {

		this.timeLine = timeLine;
		this.mapAttributes = mapAttributes;
		this.lineAttributes = lineAttributes;
		this.pointAttributes = pointAttributes;
		this.locations = null;
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

	public LinkedList<Attribute> getMapAttributes() {
		return mapAttributes;
	}

	public LinkedList<Attribute> getLineAttributes() {
		return lineAttributes;
	}

	public LinkedList<Attribute> getPointAttributes() {
		return pointAttributes;
	}

}// END: class
