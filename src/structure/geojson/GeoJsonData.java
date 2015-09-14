package structure.geojson;

import java.util.List;

public class GeoJsonData {

	private final String type;
	private final List<Feature> features;
	
	public GeoJsonData(String type, List<Feature> features) {
		
		this.type = type;
		this.features = features;
		
	}

	public String getType() {
		return type;
	}

	public List<Feature> getFeatures() {
		return features;
	}
	
}
