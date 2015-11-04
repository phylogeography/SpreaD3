package parsers;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Map.Entry;

import structure.data.Attribute;
import structure.geojson.Feature;
import structure.geojson.GeoJsonData;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class GeoJSONParser {

	private final String path;
	private LinkedList<Attribute> uniqueAttributes;

	public GeoJSONParser(String path) {

		this.path = path;

	}// END: Constructor

	public GeoJsonData parseGeoJSON() throws FileNotFoundException {

		GeoJsonData data = null;

		Reader reader = new FileReader(path);
		Gson gson = new GsonBuilder().create();
		data = gson.fromJson(reader, GeoJsonData.class);

		Map<String, Attribute> attributesMap = new HashMap<String, Attribute>();
		for (Feature feature : data.getFeatures()) {

			JsonObject properties = feature.getProperties();

			for (Entry<String, JsonElement> entry : properties.entrySet()) {

				String attributeId = entry.getKey();
				Object attributeValue = entry.getValue();

				if (attributesMap.containsKey(attributeId)) {

					Attribute attribute = attributesMap.get(attributeId);

					if (attribute.getScale().equals(Attribute.ORDINAL)) {

						attribute.getDomain().add(attributeValue);

					} else {

						double value = Utils
								.round((double) attributeValue, 100);

						if (value < attribute.getRange()[Attribute.MIN_INDEX]) {
							attribute.getRange()[Attribute.MIN_INDEX] = value;
						} // END: min check

						if (value > attribute.getRange()[Attribute.MAX_INDEX]) {
							attribute.getRange()[Attribute.MAX_INDEX] = value;
						} // END: max check

					} // END: scale check

				} else {

					Attribute attribute;
					if (attributeValue instanceof Double) {

						Double[] range = new Double[2];
						range[Attribute.MIN_INDEX] = (Double) attributeValue;
						range[Attribute.MAX_INDEX] = (Double) attributeValue;

						attribute = new Attribute(attributeId, range);

					} else {

						HashSet<Object> domain = new HashSet<Object>();
						domain.add(attributeValue);

						attribute = new Attribute(attributeId, domain);

					} // END: isNumeric check

					attributesMap.put(attributeId, attribute);

				} // END: key check

			}// END: properties loop

		}// END: features loop

		this.uniqueAttributes = new LinkedList<Attribute>();
		uniqueAttributes.addAll(attributesMap.values());

		return data;
	}// END: parseGeoJSON

	public LinkedList<Attribute> getUniqueMapAttributes() {
		return uniqueAttributes;
	}// END: getUniqueAttributes

}// END: class
