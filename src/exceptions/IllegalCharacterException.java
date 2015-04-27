package exceptions;

@SuppressWarnings("serial")
public class IllegalCharacterException extends Exception {

	private final String illegalCharacter;
	private final String examinedString;

	public IllegalCharacterException(String examinedString, String illegalCharacters) {

		this.examinedString = examinedString;
        this.illegalCharacter = illegalCharacters;
		
	}// END: Constructor

	public String getExaminedString() {
		return examinedString;
	}
	
	public String getIllegalCharacter() {
		return illegalCharacter;
	}

	@Override
	public String getMessage() {
		String message = "Illegal character " + illegalCharacter + " found in " + examinedString;
		return message;
	}
	
}// END: class
