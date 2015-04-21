package data.structure;

import java.util.ArrayList;
import java.util.List;

public class Layer {

	private final String label;
	private final String description;
	private final List<Polygon> polygons;
	private final List<Line> lines;

	public Layer(String label, //
			String description, //
			List<Line> lines, //
			List<Polygon> polygons //
	) {
		
		super();

		this.polygons = new ArrayList<Polygon>();
		this.lines = new ArrayList<Line>();

		this.lines.addAll(lines);
		this.polygons.addAll(polygons);

		this.label = label;
		this.description = description;

	}

	public String getLabel() {
		return label;
	}

	public String getDescription() {
		return description;
	}

}
