package gui;

public enum ParserTypes {

	DISCRETE_TREE("DISCRETE_TREE", "MCC tree with DISCRETE traits"), //
	BAYES_FACTOR("BAYES_FACTOR", "Log file from BSSVS analysis"), //
	CONTINUOUS_TREE("CONTINUOUS_TREE", "MCC tree with CONTINUOUS traits"), //
	TIME_SLICER("TIME_SLICER", "Tree distribution with CONTINUOUS traits");

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