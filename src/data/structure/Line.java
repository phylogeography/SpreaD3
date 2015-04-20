package data.structure;

public class Line {

	private  Coordinate startCoordinate;
	private  Coordinate endCoordinate;
	private  double endTime;
	private  double startTime;
	
	public Line(Coordinate startCoordinate, //
			Coordinate endCoordinate, //
			double startTime, //
			double endTime //
			) {
		
		//TODO: altitude?
		
		this.startCoordinate = startCoordinate;
		this.endCoordinate = endCoordinate;
		this.startTime = startTime;
		this.endTime = endTime;
		
	}//END: Constructor
	
	
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
	
	public void setStartCoordinate(Coordinate coordinate) {
		this.startCoordinate = coordinate;
	}
	
	public void setEndCoordinate(Coordinate coordinate) {
		this.endCoordinate = coordinate;
	}
	
	public void setStartTime(double time) {
		this.startTime = time;
	}

	public void setEndTime(double time) {
		this.endTime = time;
	}
	
}//END: class
