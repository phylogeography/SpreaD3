package gui;

public class JsonTableRecord {

	private String jsonFilename = "";
	private Boolean points = false;
	private Boolean lines = false;
	private Boolean areas = false;
	private Boolean counts = false;
	private Boolean geojson = false;
	private Boolean axis = false;
	
	public JsonTableRecord() {
	}// END: Constructor

	public JsonTableRecord(String jsonFilename) {
		this.jsonFilename = jsonFilename;
	}// END: Constructor

	public String getJsonFileName() {
		return jsonFilename;
	}

	public void setJsonFileName(String jsonFileName) {
		this.jsonFilename = jsonFileName;
	}

	public Boolean getPoints() {
		return points;
	}

	public void setPoints(Boolean points) {
		this.points = points;
	}

	public Boolean getAreas() {
		return areas;
	}

	public void setAreas(Boolean areas) {
		this.areas = areas;
	}

	public Boolean getLines() {
		return lines;
	}

	public void setLines(Boolean lines) {
		this.lines = lines;
	}

	public Boolean getGeojson() {
		return geojson;
	}

	public void setGeojson(Boolean geojson) {
		this.geojson = geojson;
	}

	public Boolean getCounts() {
		return counts;
	}

	public void setCounts(Boolean counts) {
		this.counts = counts;
	}

	public Boolean getAxis() {
		return axis;
	}

	public void setAxis(Boolean axis) {
		this.axis = axis;
	}

}// END: class
