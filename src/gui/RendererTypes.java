package gui;

public enum RendererTypes {

	D3("D3", "D3 renderer"), //
	KML("KML", "KML renderer");

	private String type;
	private String typeDisplay;

	private RendererTypes(String code, String name) {
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