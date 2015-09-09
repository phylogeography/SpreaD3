package data.structure;

import java.util.ArrayList;
import java.util.List;

import data.structure.attributable.Area;
import data.structure.attributable.Line;
import data.structure.attributable.Point;

public class Layer {

	private final String id;
	private final String description;
	private final List<Point> points;
	private final List<Area> areas;
	private final List<Line> lines;

	private boolean hasAreas;

	public Layer(String id, //
			String description, //
			List<Point> points, //
			List<Area> areas, //
			List<Line> lines //
	) {

		this.hasAreas = true;
		this.areas = new ArrayList<Area>();
		this.lines = new ArrayList<Line>();
		this.points = points;

		if (lines != null) {
			this.lines.addAll(lines);
		}

		if (areas != null) {
			this.areas.addAll(areas);
		} else {
			this.hasAreas = false;
		}

		this.id = id;
		this.description = description;

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

}// END: class
