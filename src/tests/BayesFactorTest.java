package tests;

import java.io.File;
import java.io.FileWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import parsers.BayesFactorSpreadDataParser;
import settings.parsing.BayesFactorsSettings;
import structure.data.SpreadData;

public class BayesFactorTest {

	public static void main(String[] args) {

		try {

			// ---SETTINGS---//

			BayesFactorsSettings settings = new BayesFactorsSettings();

			settings.locationsFilename = "/home/filip/Dropbox/JavaProjects/SpreaD3/data/discrete/H5N1/locationCoordinates_H5N1";

			settings.logFilename = "/home/filip/Dropbox/JavaProjects/SpreaD3/data/discrete/H5N1/H5N1_HA_discrete_rateMatrix.log";

//			settings.geojsonFilename = "/home/filip/Dropbox/JavaProjects/SpreaD3/data/geoJSON_maps/subregion/subregion_Eastern_Asia_subunits.json";
			
			settings.outputFilename = new String("/home/filip/Pulpit/output.json");

			// ---PARSE---//

			BayesFactorSpreadDataParser parser = new BayesFactorSpreadDataParser(settings);
			SpreadData data = parser.parse();

			// ---EXPORT TO JSON---//

			Gson gson = new GsonBuilder().setPrettyPrinting().create();
			String s = gson.toJson(data);

			File file = new File(settings.outputFilename);
			FileWriter fw = new FileWriter(file);
			fw.write(s);
			fw.close();

			System.out.println("Created JSON file");

		} catch (Exception e) {
			e.printStackTrace();
		}

	}// END: main

}//END: class
