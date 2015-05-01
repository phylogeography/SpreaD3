package app;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import kmlframework.kml.KmlException;

import parsers.ContinuousTreeParser;
import parsers.DiscretePolygonsParser;
import parsers.DiscreteTreeParser;
import parsers.DiscreteLinesParser;
import parsers.DiscreteLocationsParser;

import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;

import exceptions.AnalysisTypeArgumentsException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

import renderers.KmlRenderer;
import settings.ContinuousTreeSettings;
import settings.DiscreteTreeSettings;
import settings.KmlRendererSettings;
import settings.Settings;
import test.ContinuousTreeTest;
import utils.Arguments;
import utils.Arguments.ArgumentException;
import utils.Utils;

public class Spread2ConsoleApp {

	private Arguments modeArguments;
	private Arguments args1;
	private Arguments args2;
	private Arguments args3;
	private Arguments args4;

	private Arguments renderArguments;
	
	private static final String HELP = "help";
	private static final String READ = "read";
	private static final String CREATE = "create";
	private static final String RENDER = "render";

	private static final String TREE = "tree";
	private static final String TREES = "trees";
	private static final String LOCATIONS = "locations";
	private static final String LOG = "log";
	private static final String LOCATION_TRAIT = "locationTrait";
	private static final String TRAITS = "traits";
	private static final String HPD = "hpd";
	private static final String INTERVALS = "intervals";
	private static final String OUTPUT = "output";

	private static final String JSON = "json";
	
	
	
	
	
	
	public Spread2ConsoleApp() {

		// //////////////////
		// ---DEFINITION---//
		// //////////////////

		modeArguments = new Arguments(new Arguments.Option[] {

		new Arguments.Option(HELP, "print this information and exit"),

		new Arguments.Option(READ, "read existing JSON file"),

		new Arguments.Option(CREATE, "create JSON from input files"),

		new Arguments.Option(RENDER, "render from JSON file"),

		});

		// discrete tree arguments
		args1 = new Arguments(new Arguments.Option[] {

		new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),

		new Arguments.StringOption(TREE, "", "tree file name"),

		new Arguments.StringOption(LOCATION_TRAIT, "", "location trait name"),

		new Arguments.IntegerOption(INTERVALS, "number of time intervals"),

		new Arguments.StringOption(OUTPUT, "", "json output file name"),

		});

		// bayes factor arguments
		args2 = new Arguments(new Arguments.Option[] {

		new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),

		new Arguments.StringOption(LOG, "", "tree file name"),
		
		new Arguments.StringOption(OUTPUT, "", "json output file name")

		});

		// continuous arguments
		args3 = new Arguments(new Arguments.Option[] {

		new Arguments.StringOption(TREE, "", "tree file name"),

		new Arguments.StringOption(LOCATION_TRAIT, "", "location trait name"),

		new Arguments.StringOption(HPD, "", "hpd interval attribute name"),

		new Arguments.StringArrayOption(TRAITS, -1, "", "traits to be parsed"),
		
		new Arguments.StringOption(OUTPUT, "", "json output file name"),
		
		});

		// time slicer arguments
		args4 = new Arguments(new Arguments.Option[] {

		new Arguments.StringOption("timeLine", new String[] { "tree", //
				"file", //
		}, false, "how to create time intervals"),

		new Arguments.StringOption(TREES, "", "trees file name"),

		new Arguments.StringOption("file", "", "time intervals file name"),
		
		new Arguments.StringOption(OUTPUT, "", "json output file name"),

		});

		renderArguments = new Arguments(new Arguments.Option[] {

				new Arguments.StringOption(JSON, "", "json input file name"),

				new Arguments.StringOption(OUTPUT, "", "kml output file name"),

				});
		
		
		
		
		
		
	}// END: Constructor

	public void run(String[] args) {

		if (args[0].contains(HELP)) {

			gracefullyExit(null, modeArguments, null);

		} else if (args.length == 0) {

			gracefullyExit("Empty or incorrect arguments list.", null, null);

		}// END: help check

		// ---SPLIT---//

		ArrayList<String[]> argsList = new ArrayList<String[]>();
		int from = 0;
		int to = 1;
		argsList.add(Arrays.copyOfRange(args, from, to));
		from = 1;
		to = args.length;
		argsList.add(Arrays.copyOfRange(args, from, to));
		String[] modeArgs = argsList.get(0);
		String[] otherArgs = argsList.get(1);

		if(modeArgs.length == 0 || otherArgs.length == 0){
			gracefullyExit("Empty or incorrect arguments list.", null, null);
		}
		
		// ---PARSE---//

		Settings settings = new Settings();

		try {

			modeArguments.parseArguments(modeArgs);

		} catch (ArgumentException e) {
			gracefullyExit("", modeArguments, e);
		}

		// ---INTERROGATE---//

		if (modeArguments.hasOption(HELP)) {
			gracefullyExit(null, modeArguments, null);
		}

		if (modeArguments.hasOption(CREATE)) {

			System.out.println("In create mode");
			settings.create = true;

		} else if (modeArguments.hasOption(READ)) {

			System.out.println("In read mode");
			settings.read = true;

		} else if (modeArguments.hasOption(RENDER)) {

			System.out.println("In render mode");
			settings.render = true;

		} else {

			gracefullyExit("Unrecognized option", modeArguments, null);

		}// END: mode check

		if(settings.create) {
		
		// ---GET INTENT---//

		// recognise type of analysis from input files
		if (Arrays.asList(otherArgs).contains("-" + LOCATIONS)) {

			if (Arrays.asList(otherArgs).contains("-" + TREE)) {

				System.out.println("In Discrete tree mode");
				settings.discreteTree = true;

			} else if (Arrays.asList(otherArgs).contains("-" + LOG)) {

				System.out.println("In bayes factor mode");
				settings.bayesFactors = true;

			} else {

				gracefullyExit("Unrecognized option", null, null);

			}// END: tree/log input check

		} else {

			System.out.println("In Continuous mode");

			if (Arrays.asList(otherArgs).contains("-" + TREES)) {

				System.out.println("In time slicer mode");
				settings.timeSlicer = true;

			} else if(Arrays.asList(otherArgs).contains("-" + TREE)){

				System.out.println("In Continuous tree mode");
				settings.continuousTree = true;

			} else {
				
				gracefullyExit("Unrecognized option", null, null);
				
			}// END: continuous modes

		}// END: get intent logic

		if (settings.discreteTree) {

			settings.discreteTreeSettings = new DiscreteTreeSettings();

			// ---PARSE---//

			try {

				args1.parseArguments(otherArgs);

			} catch (ArgumentException e) {
				gracefullyExit(e.getMessage(), args1, e);
			}// END: try-catch

			if (args1.hasOption(LOCATIONS)) {

				settings.discreteTreeSettings.locations = args1
						.getStringOption(LOCATIONS);

			}

			if (args1.hasOption(TREE)) {

				settings.discreteTreeSettings.tree = args1
						.getStringOption(TREE);

			}

			if (args1.hasOption(LOCATION_TRAIT)) {

				settings.discreteTreeSettings.locationTrait = args1
						.getStringOption(LOCATION_TRAIT);

			}

			if (args1.hasOption(INTERVALS)) {

				settings.discreteTreeSettings.intervals = args1
						.getIntegerOption(INTERVALS);

			}
			
			if (args1.hasOption(OUTPUT)) {

				settings.discreteTreeSettings.output = args1
						.getStringOption(OUTPUT);

			}
			
			// ---RUN---//

			try {

				DiscreteTreeParser parser = new DiscreteTreeParser(
						settings.discreteTreeSettings);

				SpreadData data = parser.parse();

				// ---EXPORT TO JSON---//
				Gson gson = new GsonBuilder().setPrettyPrinting().create();
				String s = gson.toJson(data);

				File file = new File(settings.discreteTreeSettings.output);
				FileWriter fw;
				fw = new FileWriter(file);
				fw.write(s);
				fw.close();

				System.out.println("Created JSON file");

			} catch (IOException e) {

				gracefullyExit(e.getMessage(), args1, e);

			} catch (ImportException e) {

				gracefullyExit(e.getMessage(), args1, e);

			} catch (LocationNotFoundException e) {

				gracefullyExit(e.getMessage(), args1, e);

			} catch (IllegalCharacterException e) {

				gracefullyExit(e.getMessage(), args1, e);

			}// END: try-catch

		} else if (settings.bayesFactors) {

			// ---PARSE---//

			// ---INTERROGATE---//

			// ---RUN---//

		} else if (settings.continuousTree) {

			settings.continuousTreeSettings = new ContinuousTreeSettings();
			
			// ---PARSE---//
			
			try {
				args3.parseArguments(otherArgs);
			} catch (ArgumentException e) {
				
				gracefullyExit(e.getMessage(), args3, e);
			}
			
			// ---INTERROGATE---//

			if(args3.hasOption(TREE)) {
				settings.continuousTreeSettings.tree = args3.getStringOption(TREE);
			}

			if(args3.hasOption(LOCATION_TRAIT)) {
				settings.continuousTreeSettings.locationTrait = args3.getStringOption(LOCATION_TRAIT);
			}

			if(args3.hasOption(HPD)) {
				settings.continuousTreeSettings.hpd = args3.getStringOption(HPD);
			}

			if(args3.hasOption(TRAITS)) {
				settings.continuousTreeSettings.traits = args3.getStringArrayOption(TRAITS);
			}
			
			if (args3.hasOption(OUTPUT)) {
				settings.continuousTreeSettings.output = args3.getStringOption(OUTPUT);
			}//END: option check
			
			// ---RUN---//
			
			try {
					
			ContinuousTreeParser parser = new ContinuousTreeParser(
					settings.continuousTreeSettings);

			SpreadData data = parser.parse();

			// ---EXPORT TO JSON---//
			
			Gson gson = new GsonBuilder().setPrettyPrinting().create();
			String s = gson.toJson(data);

			File file = new File(settings.continuousTreeSettings.output);
			FileWriter fw;

			fw = new FileWriter(file);
			fw.write(s);
			fw.close();
				
			} catch (IOException e) {
				gracefullyExit(e.getMessage(), args3, e);
			} catch (ImportException e) {
				gracefullyExit(e.getMessage(), args3, e);
			}

			System.out.println("Created JSON file");
			
			
			
			
			
			
			

		} else if (settings.timeSlicer) {

			// ---PARSE---//

			// ---INTERROGATE---//

			// ---RUN---//

		} else {
			throw new RuntimeException("Should never get here!");
		}//END: setings check

		
		} else if(settings.read) {
			
			System.out.println("NOT YET IMPLEMENTED!");
			
		} else if (settings.render){
			
			
			// ---PARSE---//
			//TODO: parse style choices
			
			try {
				
//				Utils.printArray(otherArgs);
				
				renderArguments.parseArguments(otherArgs);
				
			} catch (ArgumentException e) {
				gracefullyExit(e.getMessage(), renderArguments, e);
			}
			
			// ---INTERROGATE---//

			settings.kmlRendererSettings = new KmlRendererSettings();
			if (renderArguments.hasOption(JSON)) {

            settings.kmlRendererSettings.json = renderArguments.getStringOption(JSON);
				
			} 
			
			if (renderArguments.hasOption(OUTPUT)) {

	            settings.kmlRendererSettings.output = renderArguments.getStringOption(OUTPUT);
					
			} 
			
			
			// ---RUN---//
			
			try {

				Reader reader = new FileReader(settings.kmlRendererSettings.json);
				Gson gson = new GsonBuilder().create();
				SpreadData input = gson.fromJson(reader, SpreadData.class);
				
				KmlRenderer renderer = new KmlRenderer(input, settings.kmlRendererSettings.output);
				renderer.render();

				System.out.println("Rendered KML.");
				
			} catch (KmlException e) {

				gracefullyExit(e.getMessage(), renderArguments, e);

			} catch (IOException e) {

				gracefullyExit(e.getMessage(), renderArguments, e);

			}//END: try-catch block
			
			
		}//END: create / render / read check
		
		
		
	}// END: run

	private void gracefullyExit(String message, Arguments arguments, Exception e) {

		if (Spread2App.DEBUG) {
			if (e != null) {
				e.printStackTrace();
			}
		}

		if (message != null) {
			System.out.println(message);
			System.out.println();
		}

		if (arguments != null) {
			printUsage(arguments);
		}

		System.exit(0);
	}// END: gracefullyExit

	private void printUsage(Arguments arguments) {

		arguments.printUsage("java -jar spread.jar", "");

	}// END: printUsage

}// END: class
