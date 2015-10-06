package structure.data;

import java.util.List;

import structure.data.attributable.Area;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import structure.geojson.GeoJsonData;

public class Layer {

	public enum Type {
		map, tree, counts
	}

	private final Type type;
	private final String id;
	private final String description;

	private final List<Point> points;
	private final List<Line> lines;
	private final List<Area> areas;

	private final GeoJsonData geojson;

	private boolean hasAreas;

	public Layer(String id, //
			String description, //
			List<Point> points, //
			List<Line> lines, //
			List<Area> areas //
	) {

		this.type = Type.tree;
		
		this.id = id;
		this.description = description;

		this.points = points;
		this.lines = lines;
		this.areas = areas;

		this.geojson = null;

	}// END: Constructor

	public Layer(String id, //
			String description, //
			List<Point> points, //
			List<Line> lines //
	) {

		this.type = Type.tree;
		
		this.id = id;
		this.description = description;

		this.points = points;
		this.lines = lines;
		this.areas = null;
		this.hasAreas = false;

		this.geojson = null;

	}// END: Constructor

	public Layer(String id, //
			String description, //
			List<Point> points //
	) {

		this.type = Type.counts;
		
		this.id = id;
		this.description = description;

		this.points = points;
		this.lines = null;
		this.areas = null;
		this.hasAreas = false;

		this.geojson = null;

	}// END: Constructor

//	 public Layer(
//	 String id, //
//	 String description, //
//	 List<Area> areas //
//	 ) {
//	
//	 this.type = Type.data;
//	 this.id = id;
//	 this.description = description;
//	
//	
//	 this.points = null;
//	 this.lines = null;
//	 this.areas = areas;
//	 this.hasAreas = true;
//	
//	 this.geojson = null;
//	
//	 }//END: Constructor

	public Layer(String id, //
			String description, //
			GeoJsonData map //
	) {

		this.type = Type.map;
		this.id = id;
		this.description = description;
		this.geojson = map;

		this.points = null;
		this.lines = null;
		this.areas = null;
		this.hasAreas = false;

	}// END: Constructor

	public List<Line> getLines() {
		return lines;
	}

	public boolean hasAreas() {
		return hasAreas;
	}

	public List<Area> getAreas() {
		return areas;
	}

	public List<Point> getPoints() {
		return points;
	}

	public String getId() {
		return id;
	}

	public String getDescription() {
		return description;
	}

	public String getType() {
		return type.toString();
	}

	public GeoJsonData getGeojson() {
		return geojson;
	}

}// END: class
