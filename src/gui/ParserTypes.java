package gui;

public enum ParserTypes {

	DISCRETE_TREE("DISCRETE_TREE", "Discretely annotated tree"), //
	BAYES_FACTOR("BAYES_FACTOR", "Log file from BSSVS analysis"), //
	CONTINUOUS_TREE("CONTINUOUS_TREE", "Continuously annotated tree"), //
	TIME_SLICER("TIME_SLICER", "Posterior tree distribution");

//	public static int DISCRETE_TREE_INDEX = 0;
//	public static int BAYES_FACTOR_INDEX = 1;
//	public static int CONTINUOUS_TREE_INDEX = 2;
//	public static int TIME_SLICER_INDEX = 3;
//	public static String[] DISPLAY_TYPES = new String[]{DISCRETE_TREE.toString(), BAYES_FACTOR.toString(), CONTINUOUS_TREE.toString(), TIME_SLICER.toString()};
	
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