package gui;

public enum DateFormats {

	DATE_FORMAT("DATE_FORMAT", "Date time format"), //
	DECIMAL_FORMAT("DECIMAL_FORMAT", "Decimal format");

	private String type;
	private String typeDisplay;

	private DateFormats(String code, String name) {
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
