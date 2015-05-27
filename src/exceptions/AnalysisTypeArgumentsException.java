package exceptions;

@SuppressWarnings("serial")
public class AnalysisTypeArgumentsException extends Exception {

	private final ArgumentException e;
	
	public AnalysisTypeArgumentsException(ArgumentException e) {
		
		this.e=e;
		
	}//END: Constructor
	
	@Override
	public String getMessage() {
		return e.getMessage();
	}
	
}//END: class
