package settings;

import settings.parsing.BayesFactorsSettings;
import settings.parsing.ContinuousTreeSettings;
import settings.parsing.DiscreteTreeSettings;
import settings.parsing.TimeSlicerSettings;
import settings.rendering.GeoJSONRendererSettings;
import settings.rendering.KmlRendererSettings;

public class Settings {

	// modes
	public boolean create = false;
	public boolean read = false;
	public boolean render = false;
	
	
	public boolean discreteTree = false;
	public ContinuousTreeSettings continuousTreeSettings = null;
	
	public boolean bayesFactors = false;
	public BayesFactorsSettings bayesFactorsSettings = null;
	
	public boolean continuousTree = false;
	public DiscreteTreeSettings discreteTreeSettings  = null;

	public boolean timeSlicer = false;
	public TimeSlicerSettings timeSlicerSettings  = null;
	
	public KmlRendererSettings kmlRendererSettings = null;

    public GeoJSONRendererSettings geoJSONRendererSettings = null;
	
	public Settings() {
	}//END: Constructor
	
	
	
	
	
	
	
}//END: class
