package data.structure;

import java.util.LinkedHashMap;
import java.util.Map;

import utils.Trait;

public class Line {

	// Traits which have start and end values go here:
	private final Map<String, Trait> nodeAttributes = new LinkedHashMap<String, Trait>();
	// Traits which apply to a whole branch go here:
	private final Map<String, Trait> branchAttributes = new LinkedHashMap<String, Trait>();
	
	private final Coordinate startCoordinate;
	private final Coordinate endCoordinate;

	private final Location startLocation;
	private final Location endLocation;
	private final boolean connectsLocations;
	
	private final double startTime;
	private final double endTime;
	
	//TODO: branchatrributes in this constructor too (used for discrete data, so change parsers accordingly)
	public Line(Location startLocation, //
			Location endLocation, //
			double startTime, //
			double endTime, //
			Map<String, Trait> nodeAttributes //
//			Map<String, Trait> branchAttributes //
	) {

		super();
		
		this.startLocation = startLocation;
		this.endLocation = endLocation;
		this.connectsLocations = true;
		
		this.startTime = startTime;
		this.endTime = endTime;

		this.startCoordinate = null;
		this.endCoordinate = null;

		if (nodeAttributes != null) {
			this.nodeAttributes.putAll(nodeAttributes);
		}

		
	}// END: Constructor

	public Line(Coordinate startCoordinate, //
			Coordinate endCoordinate, //
			double startTime, //
			double endTime, //
			Map<String, Trait> nodeAttributes, //
			Map<String, Trait> branchAttributes //
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
			this.nodeAttributes.putAll(nodeAttributes);
		}

		if (branchAttributes != null) {
			this.branchAttributes.putAll(branchAttributes);
		}
		
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
	
	public Map<String, Trait> getNodeAttributes() {
		return nodeAttributes;
	}
	
	public Map<String, Trait> getBranchAttributes() {
		return branchAttributes;
	}
	
}// END: class
