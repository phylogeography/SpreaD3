package exceptions;

@SuppressWarnings("serial")
public class ArgumentException extends Exception {

	public ArgumentException() {
		super();
	}

	public ArgumentException(String message) {
		super(message);
	}

}// END: class