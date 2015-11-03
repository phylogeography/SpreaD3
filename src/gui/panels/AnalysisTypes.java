package gui.panels;

public enum AnalysisTypes {

	MCC_TREE("MCC_TREE", "Generated from MCC tree"), //
	CUSTOM("CUSTOM", "Custom");

	private String type;
	private String typeDisplay;

	private AnalysisTypes(String code, String name) {
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
