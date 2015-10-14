package structure.data;

import java.util.HashSet;

public class Attribute {

	public static int MIN_INDEX = 0;
	public static int MAX_INDEX = 1;
	public static String LINEAR = "linear";
	public static String ORDINAL = "ordinal";

	private final String id;
	private final String scale;
	private double[] range;
	private HashSet<Object> domain;

	public Attribute(String id, double[] range) {

		this.id = id;
		this.scale = LINEAR;
		this.range = range;
		this.domain = null;
	}

	public Attribute(String id, HashSet<Object> domain) {

		this.id = id;
		this.scale = ORDINAL;
		this.range = null;
		this.domain = domain;
	}

	public String getScale() {
		return scale;
	}

	public double[] getRange() {
		return range;
	}

	public HashSet<Object> getDomain() {
		return domain;
	}

	public String getId() {
		return id;
	}

}
