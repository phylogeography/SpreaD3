package data.structure;

import java.util.ArrayList;
import java.util.List;

public class Layer {
	
	private final String id;
	private final String description;
	private final List<Polygon> polygons;

	private final List<Line> lines;

	public Layer(String id, //
			String description, //
			List<Line> lines, //
			List<Polygon> polygons //
	) {
		
		super();

		this.polygons = new ArrayList<Polygon>();
		this.lines = new ArrayList<Line>();

		this.lines.addAll(lines);
		this.polygons.addAll(polygons);

		this.id = id;
		this.description = description;

	}//END: Constructor

	public List<Line> getLines() {
		return lines;
	}

	public List<Polygon> getPolygons() {
		return polygons;
	}
	
	public String getId() {
		return id;
	}

	public String getDescription() {
		return description;
	}

}//END: class
