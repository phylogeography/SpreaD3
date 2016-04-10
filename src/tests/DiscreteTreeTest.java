package tests;

import java.awt.*;
import java.io.File;
import java.io.FileWriter;
import java.util.LinkedList;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import parsers.DiscreteTreeSpreadDataParser;
import settings.parsing.DiscreteSpreadDataSettings;
import settings.parsing.DiscreteTreeSettings;
import structure.data.Location;
import structure.data.SpreadData;

public class DiscreteTreeTest {
	
	
	public static void main(String[] args) {

		try {
			
			// ---SETTINGS---//
			
			DiscreteTreeSettings settings = new DiscreteTreeSettings();
			
			settings.treeFilename = new String("/home/filip/Dropbox/JavaProjects/SpreaD3/data/discrete/EBOV/Makona_1561_cds_ig.GLM.MCC.tre");
			
			settings.locationsFilename = new String("/home/filip/Dropbox/JavaProjects/SpreaD3/data/discrete/EBOV/locations.txt");
			
			settings.locationAttributeName = "location";
			
			settings.geojsonFilename = new String("/home/filip/Dropbox/JavaProjects/SpreaD3/data/discrete/EBOV/combined.geojson");
			
			settings.outputFilename = new String("/home/filip/Pulpit/output.json");
			
			settings.mrsd = "2015.3";
			
			// ---PARSE---//
			
			DiscreteTreeSpreadDataParser parser = new DiscreteTreeSpreadDataParser(settings);
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
			
			
			
		} catch(Exception e) {
	e.printStackTrace();
		}

	}//END: main
		
}//END: class