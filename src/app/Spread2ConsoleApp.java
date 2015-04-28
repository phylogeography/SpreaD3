package app;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;

import parsers.DiscretePolygonsParser;
import parsers.LinesParser;
import parsers.LocationsParser;

import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;

import exceptions.AnalysisTypeArgumentsException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

import settings.ContinuousTreeSettings;
import settings.DiscreteTreeSettings;
import settings.Settings;
import test.ContinuousTreeTest;
import utils.Arguments;
import utils.Arguments.ArgumentException;
import utils.Utils;

public class Spread2ConsoleApp {

	private Arguments	modeArguments;
	private Arguments	args1;
	private Arguments	args2;
	private Arguments	args3;
	private Arguments	args4;
	
	private static final String HELP = "help";
	private static final String READ = "read";
	private static final String CREATE = "create";
	private static final String RENDER = "render";
	
	private static final String TREE = "tree";
	private static final String TREES = "trees";
	private static final String LOCATIONS = "locations";
	private static final String LOG = "log";
	private static final String TRAIT = "trait";
	private static final String HPD = "hpd";
	private static final String INTERVALS = "intervals";
	private static final String OUTPUT = "output";
	
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
					
					new Arguments.StringOption(TRAIT, "", "location trait name"),
					
					new Arguments.IntegerOption(INTERVALS, "number of time intervals"),
					
					new Arguments.StringOption(OUTPUT, "", "output file name"),
					
			});
	
				// bayes factor arguments
				args2 = new Arguments(new Arguments.Option[] {

					new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),
					
					new Arguments.StringOption(LOG, "", "tree file name"),
					
			});
			
				// continuous arguments
				args3 = new Arguments(new Arguments.Option[] {

					new Arguments.StringOption(TREE, "", "tree file name"),
					
					new Arguments.StringOption(TRAIT, "", "location trait name"),
					
					new Arguments.IntegerOption(HPD, "hpd interval attribute name"),
					
			});
		
				// time slicer arguments
				args4 = new Arguments(new Arguments.Option[] {

                    new Arguments.StringOption("timeLine",
                            new String[]{"tree", //
                                    "file", //
                            }, false, "how to create time intervals"),
					
					new Arguments.StringOption(TREES, "", "trees file name"),
					
					new Arguments.StringOption("file", "", "time intervals file name"),
					
			});
			
	}// END: Constructor

	public void run(String[] args) {

		if(args[0].contains(HELP)) {
			
			gracefullyExit(null, modeArguments, null);

		} else if (args.length == 0) {
        
			gracefullyExit("Empty or incorrect arguments list.", null, null);
        
		}// END: help check
		
		//---SPLIT---//
		
		ArrayList<String[]> argsList = new ArrayList<String[]>();
		int from = 0;
		int to = 1;
		argsList.add( Arrays.copyOfRange(args, from, to) );
		from = 1;
		to = args.length;
		argsList.add( Arrays.copyOfRange(args, from, to ) );
		String[] modeArgs = argsList.get(0);
		String[] otherArgs = argsList.get(1);
		
		//---PARSE---//
		
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
		
		if(modeArguments.hasOption(CREATE)) {
			
			System.out.println("In create mode");
			settings.create = true;
			
		} else if(modeArguments.hasOption(READ)) {
			
			System.out.println("In read mode");
			settings.read = true;
			
	} else if(modeArguments.hasOption(RENDER)) {
			
			System.out.println("In render mode");
			settings.render = true;
			
			
		} else {
			
			gracefullyExit("Unrecognized option", modeArguments, null);
			
		}//END: mode check
		
		//---GET INTENT---//
		
        // recognises type of analysis from input files
		if(Arrays.asList(otherArgs).contains("-"+LOCATIONS)) {
			
//			System.out.println("In Discrete mode");

			if(Arrays.asList(otherArgs).contains("-"+TREE)) {
				
				System.out.println("In Discrete tree mode");
				settings.discreteTree = true;
				
			} else if(Arrays.asList(otherArgs).contains("-"+LOG)) {
				
				System.out.println("In bayes factor mode");
				settings.bayesFactors = true;
				
			} else {
				
				gracefullyExit("Unrecognized option", null, null);
				
			}//END: tree/log input check
			
		} else {
			
			System.out.println("In Continuous mode");
			
			if(Arrays.asList(otherArgs).contains("-"+TREES)) {
				
				System.out.println("In time slicer mode");
				settings.timeSlicer = true;
				
			} else {
				
				System.out.println("In Continuous tree mode");
				settings.continuousTree = true;
				
			}//END: continuous modes
			
		}//END: get intent logic 
			
		
		if (settings.discreteTree) {

			settings.discreteTreeSettings = new DiscreteTreeSettings();
			
			// ---PARSE---//
			
			try {
				
				args1.parseArguments(otherArgs);
				
			} catch (ArgumentException e) {
				gracefullyExit(e.getMessage(), args1, e);
			}//END: try-catch	
			
			// ---INTERROGATE---//
			
			if(args1.hasOption(LOCATIONS)) {
				
				settings.discreteTreeSettings.locations = args1.getStringOption(LOCATIONS);
				
			} 
			
			if(args1.hasOption(TREE)) {
				
				settings.discreteTreeSettings.tree = args1.getStringOption(TREE);
				
			} 
			
			
			if(args1.hasOption(TRAIT)) {
				
				settings.discreteTreeSettings.trait = args1.getStringOption(TRAIT);
				
			} 
			

			if(args1.hasOption(INTERVALS)) {
				
				settings.discreteTreeSettings.intervals = args1.getIntegerOption(INTERVALS);
				
			} 
			
			
			if(args1.hasOption(OUTPUT)) {
				
				settings.discreteTreeSettings.output = args1.getStringOption(OUTPUT);
				
			} 
			
			// ---RUN---//
			
			List<Location> locationsList = null;
			List<Polygon> polygonsList= null;
			List<Line> linesList = null;
			
			// ---IMPORT---//

			RootedTree rootedTree = null;
			
			try {
				
				rootedTree = Utils.importRootedTree(settings.discreteTreeSettings.tree);
				
			} catch (IOException | ImportException e1) {

				gracefullyExit(e1.getMessage(), args1, e1);
				
			}//END: try-catch
			
			
			try {
				
				// ---PARSE AND FILL STRUCTURES---//
				
				LocationsParser locationsParser = new LocationsParser(
						settings.discreteTreeSettings.locations //
						);
				locationsList = locationsParser.parseLocations();
				
				System.out.println("Parsed locations");
				
				LinesParser linesParser = new LinesParser(rootedTree, //
						settings.discreteTreeSettings.trait, //
						locationsList //
						);
			linesList = linesParser.parseLines();
				
				System.out.println("Parsed lines");
				
				
				DiscretePolygonsParser discretePolygonsParser = new DiscretePolygonsParser(rootedTree, //
						settings.discreteTreeSettings.trait, //
						settings.discreteTreeSettings.intervals, //
						locationsList //
						); 
		 polygonsList = discretePolygonsParser.parseDiscretePolygons();
				
				 System.out.println("Parsed discrete polygons");
				 
			} catch (IOException | IllegalCharacterException | ImportException | LocationNotFoundException e) {

				gracefullyExit(e.getMessage(), args1, e);

			}//END: try-catch
			
			// ---EXPORT TO JSON---//
			
			try {
				
			List<Layer> layersList = new LinkedList<Layer>();

			Layer discreteLayer = new Layer(settings.discreteTreeSettings.tree,
					"Discrete tree visualisation", linesList, polygonsList);

			layersList.add(discreteLayer);

			SpreadData data = new SpreadData(locationsList, layersList);

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
				
			}//END: try-catch
			
			
			
		} else if (settings.bayesFactors) {

			// TODO
			
			// ---PARSE---//
			
			// ---INTERROGATE---//
			
			// ---RUN---//
			
		} else if (settings.continuousTree) {

			// TODO
			
			// ---PARSE---//
			
			// ---INTERROGATE---//
			
			// ---RUN---//
			
		} else if (settings.timeSlicer) {

			// TODO
			
			// ---PARSE---//
			
			// ---INTERROGATE---//
			
			// ---RUN---//
			
		} else {
			throw new RuntimeException("Should never get here!");
		}
		

		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		

	}// END: run

	private void gracefullyExit(String message, Arguments arguments, Exception e) {

		if(Spread2App.DEBUG){
			if(e != null) {
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

		//TODO: print all usage options
		arguments.printUsage("java -jar spread.jar", "");
		 
	}// END: printUsage

}// END: class
