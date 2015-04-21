package data;

import generator.Generator;
import generator.JSONGenerator;
import generator.KMLGenerator;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

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

	// private List<Coordinate> placesList ;
	// private List<Line> linesList;
	// private List<Polygon> polygonsList;

	private HashMap<String, Object> dataMap;// = new HashMap<String,Object>();

	public SpreadData(
	// ArrayList<Coordinate> placesList,//
	// ArrayList<Line> linesList,//
	// ArrayList<Polygon> polygonsList//

	) {

		dataMap = new HashMap<String, Object>();

		// placesList = new ArrayList<Coordinate>();
		// linesList = new ArrayList<Line>();
		// polygonsList = new ArrayList<Polygon>();

		// this.placesList = placesList;
		// this.linesList = linesList;
		// this.polygonsList = polygonsList;

	}// END: Constructor

	public Object getLinesList() {
		return dataMap.get(LINES_KEY);
	}

	public void setLinesList(List<Line> linesList) {
		dataMap.put(LINES_KEY, linesList);
	}

	public void toJSON() throws JsonGenerationException, JsonMappingException,
			IOException {

		Generator generator = new JSONGenerator();
		generator.generate(this, new File("test.json"));
		
	}//END: toJSON

	public void toKML() throws IOException {

		Generator generator = new KMLGenerator();
		generator.generate(this, new File("test.kml"));
		
	}//END: toKML

}// END: class
