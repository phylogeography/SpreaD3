package app;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;

import jebl.evolution.io.ImportException;
import kmlframework.kml.KmlException;
import parsers.ContinuousTreeParser;
import parsers.DiscreteTreeParser;
import renderers.KmlRenderer;
import settings.Settings;
import settings.parsing.ContinuousTreeSettings;
import settings.parsing.DiscreteTreeSettings;
import settings.rendering.KmlRendererSettings;
import utils.Arguments;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import data.SpreadData;
import exceptions.ArgumentException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;
import exceptions.MissingAttributeException;

public class Spread2ConsoleApp {

	private Arguments modeArguments;
	private Arguments args1;
	private Arguments args2;
	private Arguments args3;
	private Arguments args4;

	private Arguments renderArguments;
	
	private static final String HELP = "help";
	private static final String READ = "read";
	private static final String PARSE = "parse";
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
	
	private static final String POLYGON_COLOR_MAPPING = "polygoncolormapping";
	private static final String POLYGON_COLORS = "polygoncolors";
	private static final String POLYGON_COLOR = "polygoncolor";

	private static final String POLYGON_ALPHA_MAPPING = "polygonalphamapping";
	private static final String POLYGON_ALPHA = "polygonalpha";
	
	private static final String LINE_COLOR_MAPPING = "linecolormapping";
	private static final String LINE_COLORS = "linecolors";
	private static final String LINE_COLOR = "linecolor";
	
	private static final String LINE_ALPHA = "linealpha";
	private static final String LINE_ALPHA_MAPPING = "linealphamapping";
	
	private static final String LINE_ALTITUDE_MAPPING = "linealtitudemapping";	
	private static final String LINE_ALTITUDE = "linealtitude";	

	private static final String LINE_WIDTH_MAPPING = "linewidthmapping";
	private static final String LINE_WIDTH = "linewidth";
	
	public Spread2ConsoleApp() {

		// //////////////////
		// ---DEFINITION---//
		// //////////////////

		modeArguments = new Arguments(new Arguments.Option[] {

		new Arguments.Option(HELP, "print this information and exit"),

		new Arguments.Option(READ, "read existing JSON file"),

		new Arguments.Option(PARSE, "create JSON from input files"),

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

		new Arguments.StringArrayOption(TRAITS, -1, "", "traits to be parsed from nodes"),
		
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

		//TODO: what overrides what in descriptions
		renderArguments = new Arguments(new Arguments.Option[] {

				new Arguments.StringOption(JSON, "", "json input file name"),

				new Arguments.StringOption(OUTPUT, "", "kml output file name"),

				//---LINE WIDTH---//
				
				new Arguments.RealOption(LINE_WIDTH, "specify line width"),
				
                new Arguments.StringOption(LINE_WIDTH_MAPPING,
                        new String[]{Utils.DISTANCE, //
                                Utils.DURATION //
                        }, false, "attribute to map line width"),

				//---LINE ALTITUDE---//
				
				new Arguments.RealOption(LINE_ALTITUDE,  "specify line altitude"),
				
                new Arguments.StringOption(LINE_ALTITUDE_MAPPING,
                        new String[]{Utils.DISTANCE, //
                                Utils.DURATION //
                        }, false, "attribute to map line altitude"),
				
				//---LINE COLORS---//
				
				//TODO: this should read RGB or RGBA
				new Arguments.RealArrayOption(LINE_COLOR, 3, "specify RGB value"),
				
				new Arguments.StringOption(LINE_COLOR_MAPPING, "", "attribute to map RGB aesthetics"),
				
				new Arguments.StringOption(LINE_COLORS, "", "file with RGB(A) colors to map line attribute values."),
				
				//---LINE ALPHA CHANEL---//
				
				new Arguments.RealOption(LINE_ALPHA, "specify A value"),
				
				 new Arguments.StringOption(LINE_ALPHA_MAPPING, "", "attribute to map A aesthetics. Higher values will be more opaque, lower values will be more translucent. "),
				
				//---POLYGON COLORS---//	
				
				//TODO: this should read RGB or RGBA
				new Arguments.RealArrayOption(POLYGON_COLOR, 3, "specify RGB value"),
				
				new Arguments.StringOption(POLYGON_COLOR_MAPPING, "", "attribute to map RGB aesthetics"),
				
				new Arguments.StringOption(POLYGON_COLORS, "", "file with RGB(A) colors to map attribute values"),
	
				//---POLYGON ALPHA CHANEL---//

			    new Arguments.RealOption(POLYGON_ALPHA, "specify A value. Higher values are more opaque, lower values more translucent."),
				
			    new Arguments.StringOption(POLYGON_ALPHA_MAPPING, "", "attribute to map A aesthetics. Higher values will be more opaque, lower values will be more translucent."),
			    
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

		if (modeArguments.hasOption(PARSE)) {

			System.out.println("In parsing mode");
			settings.create = true;

		} else if (modeArguments.hasOption(READ)) {

			System.out.println("In read mode");
			settings.read = true;

		} else if (modeArguments.hasOption(RENDER)) {

			System.out.println("In rendering mode");
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

					if (args1.hasOption(LOCATIONS)) {

						settings.discreteTreeSettings.locations = args1
								.getStringOption(LOCATIONS);

					} else {

						throw new ArgumentException("Required argument "
								+ LOCATIONS + " is missing.");

					}// END: option check

					if (args1.hasOption(TREE)) {

						settings.discreteTreeSettings.tree = args1
								.getStringOption(TREE);

					} else {

						throw new ArgumentException("Required argument " + TREE
								+ " is missing.");

					}// END: option check

					if (args1.hasOption(LOCATION_TRAIT)) {

						settings.discreteTreeSettings.locationTrait = args1
								.getStringOption(LOCATION_TRAIT);

					} else {

						throw new ArgumentException("Required argument "
								+ LOCATION_TRAIT + " is missing.");

					}// END: option check

					if (args1.hasOption(INTERVALS)) {

						settings.discreteTreeSettings.intervals = args1
								.getIntegerOption(INTERVALS);

					}// END: option check

					if (args1.hasOption(OUTPUT)) {

						settings.discreteTreeSettings.output = args1
								.getStringOption(OUTPUT);

					} // END: option check

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), args1, e);
				}// END: try-catch

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
			
			try {
				
				renderArguments.parseArguments(otherArgs);
				
//			} catch (ArgumentException e) {
//				gracefullyExit(e.getMessage(), renderArguments, e);
//			}
			
			// ---INTERROGATE---//

			settings.kmlRendererSettings = new KmlRendererSettings();
			if (renderArguments.hasOption(JSON)) {

            settings.kmlRendererSettings.json = renderArguments.getStringOption(JSON);
				
			} else {

				throw new ArgumentException("Required argument "
						+ JSON + " is missing.");

			}// END: option check
			
			if (renderArguments.hasOption(OUTPUT)) {

	            settings.kmlRendererSettings.output = renderArguments.getStringOption(OUTPUT);
					
			} 
			
			//---POLYGON COLOR---//
			
			if(renderArguments.hasOption(POLYGON_COLOR_MAPPING)) {
				
				settings.kmlRendererSettings.polygonColorMapping = renderArguments.getStringOption(POLYGON_COLOR_MAPPING);
				
				if(renderArguments.hasOption(POLYGON_COLORS)) {
					settings.kmlRendererSettings.polygonColors = renderArguments.getStringOption(POLYGON_COLORS);
				}
				
			} else if(renderArguments.hasOption(POLYGON_COLOR)) {
				
				settings.kmlRendererSettings.polygonColor = renderArguments.getRealArrayOption(POLYGON_COLOR);

			} else if(renderArguments.hasOption(POLYGON_COLOR_MAPPING) && renderArguments.hasOption(POLYGON_COLOR)) {
				
				gracefullyExit("Can't both map and have a defined polygon color!", renderArguments, null);
				
			} else {
				
				// use defaults
				
			}
			
			//---POLYGON ALPHA---//
			
			if(renderArguments.hasOption(POLYGON_ALPHA_MAPPING)) {
				
				settings.kmlRendererSettings.polygonAlphaMapping = renderArguments.getStringOption(POLYGON_ALPHA_MAPPING);
				
			} else if(renderArguments.hasOption(POLYGON_ALPHA)) {
				
				settings.kmlRendererSettings.polygonAlpha = renderArguments.getRealOption(POLYGON_ALPHA);
				settings.kmlRendererSettings.polygonAlphaChanged = true;
				
			} else if(renderArguments.hasOption(POLYGON_ALPHA_MAPPING) && renderArguments.hasOption(POLYGON_ALPHA)){
				
				gracefullyExit("Can't both map and have a defined polygon alpha!", renderArguments, null);
			
			} else {
				
				// use defaults
				
			}
			
			
			//---LINE COLOR---//
			
			if(renderArguments.hasOption(LINE_COLOR_MAPPING)) {
				
				settings.kmlRendererSettings.lineColorMapping = renderArguments.getStringOption(LINE_COLOR_MAPPING);
				
				if(renderArguments.hasOption(LINE_COLORS)) {
					settings.kmlRendererSettings.lineColors = renderArguments.getStringOption(LINE_COLORS);
				}
				
			} else if(renderArguments.hasOption(LINE_COLOR)) {
				
				settings.kmlRendererSettings.lineColor = renderArguments.getRealArrayOption(LINE_COLOR);
				
			} else if(renderArguments.hasOption(LINE_COLOR_MAPPING) && renderArguments.hasOption(LINE_COLOR)) {
				
				gracefullyExit("Can't both map and have a defined line color!", renderArguments, null);
				
			} else {
				
				// use defaults
				
			}
			
			//---LINE ALPHA---//		
			
			if(renderArguments.hasOption(LINE_ALPHA_MAPPING)) {
				
				settings.kmlRendererSettings.lineAlphaMapping = renderArguments.getStringOption(LINE_ALPHA_MAPPING);
				
			} else if(renderArguments.hasOption(LINE_ALPHA)) {
				
				settings.kmlRendererSettings.lineAlpha = renderArguments.getRealOption(LINE_ALPHA);
				settings.kmlRendererSettings.lineAlphaChanged = true;
				
			} else if(renderArguments.hasOption(LINE_ALPHA_MAPPING) && renderArguments.hasOption(LINE_ALPHA)) {
				
				gracefullyExit("Can't both map and have a defined line alpha!", renderArguments, null);
				
			} else {
				
				// use defaults
				
			}
			
			//---LINE WIDTH---//	
			
			if(renderArguments.hasOption(LINE_WIDTH_MAPPING)) {
				
				settings.kmlRendererSettings.lineWidthMapping = renderArguments.getStringOption(LINE_WIDTH_MAPPING);
				
			} else if(renderArguments.hasOption(LINE_WIDTH)) {
				
				settings.kmlRendererSettings.lineWidth = renderArguments.getRealOption(LINE_WIDTH);
				
			} else if(renderArguments.hasOption(LINE_WIDTH_MAPPING) && renderArguments.hasOption(LINE_WIDTH)) {
				
				gracefullyExit("Can't both map and have a defined line width!", renderArguments, null);
				
			} else {
				
				// use defaults
				
			}
			
			//---LINE ALTITUDE---//	
			
			
			if(renderArguments.hasOption(LINE_ALTITUDE_MAPPING)) {
				
				settings.kmlRendererSettings.lineAltitudeMapping = renderArguments.getStringOption(LINE_ALTITUDE_MAPPING);
				
			} else if(renderArguments.hasOption(LINE_ALTITUDE)) {
				
				settings.kmlRendererSettings.lineAltitude = renderArguments.getRealOption(LINE_ALTITUDE);
				
			} else if(renderArguments.hasOption(LINE_ALTITUDE_MAPPING) && renderArguments.hasOption(LINE_ALTITUDE)) {
				
				gracefullyExit("Can't both map and have a defined line altitude!", renderArguments, null);
				
			} else {
				
				// use defaults
				
			}
			
			
		} catch (ArgumentException e) {
			gracefullyExit(e.getMessage(), renderArguments, e);
		}//END: try-catch
			
			// ---RUN---//
			
			try {

				Reader reader = new FileReader(settings.kmlRendererSettings.json);
				Gson gson = new GsonBuilder().create();
				SpreadData input = gson.fromJson(reader, SpreadData.class);
				
				KmlRenderer renderer = new KmlRenderer(input, settings.kmlRendererSettings);
				renderer.render();

				System.out.println("Rendered KML.");
				
			} catch (KmlException e) {

				gracefullyExit(e.getMessage(), renderArguments, e);

			} catch (IOException e) {

				gracefullyExit(e.getMessage(), renderArguments, e);

			} catch (MissingAttributeException e) {
				
				gracefullyExit(e.getMessage(), renderArguments, e);
				
			}// END: try-catch block
		
			
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
