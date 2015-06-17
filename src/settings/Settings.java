package settings;

import settings.parsing.BayesFactorsSettings;
import settings.parsing.ContinuousTreeSettings;
import settings.parsing.DiscreteTreeSettings;
import settings.parsing.TimeSlicerSettings;
import settings.rendering.GeoJSONRendererSettings;
import settings.rendering.KmlRendererSettings;

public class Settings {

	//---MODES---//
	
	public boolean create = false;
	public boolean read = false;
	public boolean render = false;

	//---PARSERS---//
	
	public boolean discreteTree = false;
	public ContinuousTreeSettings continuousTreeSettings = null;
	
	public boolean timeSlicer = false;
	public TimeSlicerSettings timeSlicerSettings  = null;
	
	public boolean bayesFactors = false;
	public BayesFactorsSettings bayesFactorsSettings = null;
	
	public boolean continuousTree = false;
	public DiscreteTreeSettings discreteTreeSettings  = null;

	//---RENDERERS---//
	
	public boolean kml = false;
	public KmlRendererSettings kmlRendererSettings = null;

	public boolean geojson = false;
    public GeoJSONRendererSettings geoJSONRendererSettings = null;
	
}//END: class
