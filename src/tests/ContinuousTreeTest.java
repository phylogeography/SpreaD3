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

			settings.treeFilename = "/home/filip/Dropbox/JavaProjects/SpreaD3/data/continuous/languages/IE2011_RelaxedSDollo_AllSingletonsGeo2.MCC.tre";
			
			settings.xCoordinate = "trait2";
			
			settings.yCoordinate = "trait1";

			settings.hpd = "80";
			
			settings.mrsd = "2011.33";
			
			settings.geojsonFilename = "/home/filip/Dropbox/JavaProjects/SpreaD3/data/geoJSON_maps/world.geojson";
			
			settings.outputFilename = new String("/home/filip/Dropbox/JavaScriptProjects/d3-renderer/public/languages.json");

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
