package exceptions;

@SuppressWarnings("serial")
public class MissingAttributeException extends Exception {

	public static final String LINE = "line";
	public static final String POLYGON = "polygon";
	
	private String attributeName;
	private String name;
	
	public MissingAttributeException(String attributeName, String name) {
	
		this.attributeName = attributeName;
		this.name = name;
		
	}//END: Constructor

	@Override
	public String getMessage() {
		String message = "Attribute " + attributeName + " missing from "  +  name +" attributes";
		return message;
	}
	
}//END: class
