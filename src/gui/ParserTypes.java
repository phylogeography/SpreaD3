package gui;

public enum ParserTypes {

	DISCRETE_TREE("DISCRETE_TREE", "Discretely annotated tree"), //
	BAYES_FACTOR("BAYES_FACTOR", "Log file from BSSVS analysis"), //
	CONTINUOUS_TREE("CONTINUOUS_TREE", "Continuously annotated tree"), //
	TIME_SLICER("TIME_SLICER", "Posterior tree distribution");

	private String type;
	private String typeDisplay;

	private ParserTypes(String code, String name) {
		this.type = code;
		this.typeDisplay = name;
	}

	public String getType() {
		return this.type;
	}

	public String getTypeDisplay() {
		return this.typeDisplay;
	}

	@Override
	public String toString() {
		return this.typeDisplay;
	}

}// END: class