package data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import data.structure.Coordinate;
import data.structure.Line;
import data.structure.Polygon;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class SpreadData {

	public static final String LINES_KEY = "Lines";
	
	private List<Coordinate> placesList ;
	private List<Line> linesList;
	private List<Polygon> polygonsList;
	
	private HashMap<String,Object> dataMap;// = new HashMap<String,Object>();
	
	public SpreadData(
//			ArrayList<Coordinate> placesList,//
//			ArrayList<Line> linesList,//
//			ArrayList<Polygon> polygonsList//
			
			) {
		
		dataMap = new HashMap<String,Object>();
		
		placesList = new ArrayList<Coordinate>();
		linesList = new ArrayList<Line>();
		polygonsList = new ArrayList<Polygon>();
		
//		this.placesList = placesList;
//		this.linesList = linesList;
//		this.polygonsList = polygonsList;
		
	}// END: Constructor
	
	
	//TODO: these should fill in places in the Map:
	
	public List<Coordinate> getPlacesList() {
		return placesList;
	}

	public void setPlacesList(List<Coordinate> placesList) {
		this.placesList = placesList;
	}
	
	public List<Line> getLinesList() {
		return linesList;
	}

	public void setLinesList(List<Line> linesList) {
		this.linesList = linesList;
	}

	public List<Polygon> getPolygonsList() {
		return polygonsList;
	}

	public void setPolygonsList(List<Polygon> polygonsList) {
		this.polygonsList = polygonsList;
	}
	

	

	
	
	
	
	
	
	
	
	
}//END: class
