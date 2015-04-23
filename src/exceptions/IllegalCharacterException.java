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

}// END: class
