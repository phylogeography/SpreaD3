package test;

import java.io.File;
import java.io.FileWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import readers.JsonMerger;
import settings.reading.JsonMergerSettings;
import structure.data.SpreadData;

public class JsonMergerTest {

	public static void main(String[] args) {

		try {

			// ---SETTINGS---//
			
			JsonMergerSettings settings = new JsonMergerSettings();

			settings.pointsFiles = new String[] {"/home/filip/ebov1.json", 
					"/home/filip/ebov2.json"};

			settings.linesFiles = new String[] {"/home/filip/ebov1.json"};

//			settings.areasFiles = new String[]{""};
			
			settings.countsFiles = new String[]{"/home/filip/ebov2.json"};
			
//			settings.geojsonFiles = new String[]{""};
			
			settings.axisAttributesFile = new String("/home/filip/ebov1.json");
			
			settings.outputFilename = new String("/home/filip/merged.json");;
			

			// ---MERGE---//
			
			
			JsonMerger jsonMerger = new JsonMerger(settings);
			SpreadData data = jsonMerger.merge();

			
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

	}// END:main

}// END: test
