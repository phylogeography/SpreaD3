package data.structure;

import java.util.LinkedHashMap;
import java.util.Map;

import utils.Trait;

public class Line {

	// Traits which have start and end values go here:
	private final Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
	
	private final Coordinate startCoordinate;
	private final Coordinate endCoordinate;

	private final Location startLocation;
	private final Location endLocation;
	private final boolean connectsLocations;
	
	private final double startTime;
	private final double endTime;
	
	public Line(Location startLocation, //
			Location endLocation, //
			double startTime, //
			double endTime, //
			Map<String, Trait> attributes //
	) {

		super();
		
		this.startLocation = startLocation;
		this.endLocation = endLocation;
		this.connectsLocations = true;
		
		this.startTime = startTime;
		this.endTime = endTime;

		this.startCoordinate = null;
		this.endCoordinate = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

		
	}// END: Constructor

	public Line(Coordinate startCoordinate, //
			Coordinate endCoordinate, //
			double startTime, //
			double endTime, //
			Map<String, Trait> nodeAttributes //
	) {

		super();
		
		this.startCoordinate = startCoordinate;
		this.endCoordinate = endCoordinate;
		this.startTime = startTime;
		this.endTime = endTime;

		this.startLocation = null;
		this.endLocation = null;
		this.connectsLocations = false;
		
		if (nodeAttributes != null) {
			this.attributes.putAll(nodeAttributes);
		}

//		if (branchAttributes != null) {
//			this.branchAttributes.putAll(branchAttributes);
//		}
		
	}// END: Constructor

	public Coordinate getStartCoordinate() {
		return startCoordinate;
	}

	public Coordinate getEndCoordinate() {
		return endCoordinate;
	}

	public double getStartTime() {
		return startTime;
	}

	public double getEndTime() {
		return endTime;
	}

	public Location getStartLocation() {
		return startLocation;
	}

	public Location getEndLocation() {
		return endLocation;
	}

	public boolean connectsLocations(){
		return connectsLocations;
	}
	
	public Map<String, Trait> getAttributes() {
		return attributes;
	}
	
//	public Map<String, Trait> getBranchAttributes() {
//		return branchAttributes;
//	}
	
}// END: class
