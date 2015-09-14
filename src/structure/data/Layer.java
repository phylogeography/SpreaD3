package structure.data;

import java.util.ArrayList;
import java.util.List;

import structure.data.attributable.Area;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import structure.geojson.GeoJsonData;

public class Layer {

	public enum Type {
		map, data
	}

	private final Type type;
	private final String id;
	private final String description;
	
	private final List<Point> points;
	private final List<Area> areas;
	private final List<Line> lines;
	private final GeoJsonData geojson;

	private boolean hasAreas;

	public Layer(String id, //
			String description, //
			List<Point> points, //
			List<Area> areas, //
			List<Line> lines //
	) {

		this.type = Type.data;
		this.id = id;
		this.description = description;
		
		this.geojson = null;

		this.points = points;

		this.lines = new ArrayList<Line>();
		if (lines != null) {
			this.lines.addAll(lines);
		}

		this.hasAreas = true;
		this.areas = new ArrayList<Area>();
		if (areas != null) {
			this.areas.addAll(areas);
		} else {
			this.hasAreas = false;
		}

	}// END: Constructor

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
