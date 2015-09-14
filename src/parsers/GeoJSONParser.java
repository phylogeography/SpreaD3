package parsers;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;

import structure.geojson.GeoJsonData;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class GeoJSONParser {

	private static String path = "/home/filip/Dropbox/JavaProjects/Spread2/d3renderer/src/data/combined.geojson";
	private static String output = "/home/filip/Dropbox/JavaProjects/Spread2/test.geojson";
	
	public static void main(String[] args) {
		try {
			Reader reader;

			reader = new FileReader(path);

			Gson gson = new GsonBuilder().setPrettyPrinting().create();
			GeoJsonData input = gson.fromJson(reader, GeoJsonData.class);

			String s = gson.toJson(input);
			
			File file = new File(output);
			FileWriter fw;
			fw = new FileWriter(file);
			fw.write(s);
			fw.close();
			
			System.out.println("Done");
			
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

}
