package settings;

public class Settings {

	// modes
	public boolean create = false;
	public boolean read = false;
	public boolean render = false;
	
	
	public boolean discreteTree = false;
	public ContinuousTreeSettings continuousTreeSettings = null;
	
	public boolean bayesFactors = false;
// TODO
	
	public boolean continuousTree = false;
	public DiscreteTreeSettings discreteTreeSettings  = null;

	public boolean timeSlicer = false;
	// TODO	
	
	public KmlRendererSettings kmlRendererSettings = null;
	
	public Settings() {
		
	}//END: Constructor
	
	
	
	
	
	
	
}//END: class
