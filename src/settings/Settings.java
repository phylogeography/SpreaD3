package settings;

import settings.parsing.BayesFactorsSettings;
import settings.parsing.ContinuousTreeSettings;
import settings.parsing.DiscreteTreeSettings;
import settings.parsing.TimeSlicerSettings;
import settings.reading.JsonMergerSettings;
import settings.rendering.D3RendererSettings;
import settings.rendering.KmlRendererSettings;

public class Settings {

	// ---MODES---//

	public boolean parse = false;
	public boolean merge = false;
	public boolean render = false;

	// ---PARSERS---//

	public boolean discreteTree = false;
	public ContinuousTreeSettings continuousTreeSettings = null;

	public boolean timeSlicer = false;
	public TimeSlicerSettings timeSlicerSettings = null;

	public boolean bayesFactors = false;
	public BayesFactorsSettings bayesFactorsSettings = null;

	public boolean continuousTree = false;
	public DiscreteTreeSettings discreteTreeSettings = null;

	// ---RENDERERS---//

	public boolean kml = false;
	public KmlRendererSettings kmlRendererSettings = null;

	public boolean d3 = false;
	public D3RendererSettings d3RendererSettings = null;

	// ---READERS---//

	public JsonMergerSettings jsonMergerSettings = null;

}// END: class
