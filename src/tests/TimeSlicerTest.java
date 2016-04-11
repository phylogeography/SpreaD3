package tests;

import java.io.File;
import java.io.FileWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import parsers.TimeSlicerSpreadDataParser;
import settings.parsing.TimeSlicerSettings;
import structure.data.SpreadData;

public class TimeSlicerTest {

	public static void main(String[] args) {

		try {

			// ---SETTINGS---//

			TimeSlicerSettings settings = new TimeSlicerSettings();

			settings.treesFilename = new String(
					"/home/filip/Dropbox/JavaProjects/SpreaD3/data/continuous/WNV/WNV_small.trees");

			settings.treeFilename = new String(
					"/home/filip/Dropbox/JavaProjects/SpreaD3/data/continuous/WNV/WNV_relaxed_geo_gamma_MCC.tre");

			settings.trait = "location";

			settings.geojsonFilename = new String("/home/filip/Dropbox/JavaProjects/SpreaD3/data/geoJSON_maps/continents/continent_South_America_subunits.json");
			
			settings.outputFilename = new String("/home/filip/Dropbox/JavaScriptProjects/d3-renderer/public/wnv_time_slices.json");

			settings.burnIn = 0;
			
			settings.intervals = 11;
			
			settings.mrsd = "2015.3";

			// ---PARSE---//

			TimeSlicerSpreadDataParser parser = new TimeSlicerSpreadDataParser(settings);

			SpreadData data = parser.parse();

			// ---EXPORT TO JSON---//

			Gson gson = new GsonBuilder().setPrettyPrinting().create();
			String s = gson.toJson(data);

			File file = new File(settings.outputFilename);
			FileWriter fw;

			fw = new FileWriter(file);
			fw.write(s);
			fw.close();

			System.out.println("Created JSON file");

		} catch (Exception e) {
			e.printStackTrace();
		}

	}// END: main

}//END: test
