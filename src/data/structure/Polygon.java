package data.structure;

import java.util.List;

/*
 * 
 * 
 * */
public class Polygon {

	private List<Coordinate> coordinateList;
	private double startTime;
	private double endTime;
	
	public Polygon(List<Coordinate> coordinateList,//
			double startTime,
			double EndTime
			
			) {
		
		this.coordinateList = coordinateList;
		this.startTime = startTime;
		this.endTime = endTime;
				
				
	}//END: Polygon
	
	public List<Coordinate> getCoordinateList() {
		return coordinateList;
	}
	
	public double getStartTime() {
		return startTime;
	}
	
	public double getEndTime() {
		return endTime;
	}
	
	public void setCoordinateList(List<Coordinate> coordList) {
		this.coordinateList = coordList;
	}
	
	public void setStartTime(double time) {
		this.startTime = time;
	}

	public void setEndTime(double time) {
		this.endTime = time;
	}
	
}//END: class
