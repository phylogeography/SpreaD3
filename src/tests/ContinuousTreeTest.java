package tests;

import java.io.File;
import java.io.FileWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import parsers.ContinuousTreeSpreadDataParser;
import settings.parsing.ContinuousTreeSettings;
import structure.data.SpreadData;

public class ContinuousTreeTest {

	public static void main(String[] args) {

		try {

			// ---SETTINGS---//

			ContinuousTreeSettings settings = new ContinuousTreeSettings();

			settings.treeFilename = "/home/filip/WNV_relaxed_geo_gamma_MCC.tre";
			
			settings.xCoordinate = "location2";
			
			settings.yCoordinate = "location1";

			settings.hpd = "95";
			
			settings.mrsd = "2011.33";
			
			settings.geojsonFilename = "/home/filip/map.geojson";
			
			settings.outputFilename = new String("/home/filip/Dropbox/JavaScriptProjects/d3-renderer/public/wnv.json");

			// ---PARSE---//

			ContinuousTreeSpreadDataParser parser = new ContinuousTreeSpreadDataParser(settings);
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
	
}
