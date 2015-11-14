package settings.reading;

import java.util.LinkedList;

import gui.JsonTableRecord;

public class JsonMergerSettings {

	public String[] pointsFiles = null;

	public String[] linesFiles = null;

	public String[] areasFiles = null;

	public String[] countsFiles = null;
	
	public String geojsonFile = null;
	
	// there can be only one
	public String axisAttributesFile = null;

	public String outputFilename = "output.json";

	//---GUI---//
	
	public  LinkedList<JsonTableRecord> recordsList = new LinkedList<JsonTableRecord>();
	
	
}// END: class
