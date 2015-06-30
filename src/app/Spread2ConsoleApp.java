package app;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;

import jebl.evolution.io.ImportException;
import kmlframework.kml.KmlException;
import parsers.BayesFactorParser;
import parsers.ContinuousTreeParser;
import parsers.DiscreteTreeParser;
import parsers.TimeSlicerParser;
import readers.JsonReader;
import renderers.geojson.GeoJSONRenderer;
import renderers.kml.KmlRenderer;
import settings.Settings;
import settings.parsing.BayesFactorsSettings;
import settings.parsing.ContinuousTreeSettings;
import settings.parsing.DiscreteTreeSettings;
import settings.parsing.TimeSlicerSettings;
import settings.reading.JsonReaderSettings;
import settings.rendering.GeoJSONRendererSettings;
import settings.rendering.KmlRendererSettings;
import utils.Arguments;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import data.SpreadData;
import exceptions.AnalysisException;
import exceptions.ArgumentException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;
import exceptions.MissingAttributeException;

public class Spread2ConsoleApp {

	// ---ARGUMENTS--//

	private Arguments modeArguments;

	private Arguments args1;
	private Arguments args2;
	private Arguments args3;
	private Arguments args4;

	private Arguments kmlRenderArguments;
	private Arguments geojsonRenderArguments;

	private Arguments jsonReaderArguments;;

	// ---HELP---//

	private static final String HELP = "help";

	// ---PARSING---//

	private static final String PARSE = "parse";

	private static final String TREE = "tree";
	private static final String TREES = "trees";
	private static final String SLICE_HEIGHTS = "sliceHeights";
	private static final String LOCATIONS = "locations";
	private static final String LOG = "log";
	private static final String BURNIN = "burnin";
	private static final String LOCATION_TRAIT = "locationTrait";
	private static final String TRAITS = "traits";
	private static final String HPD = Utils.HPD;
	private static final String INTERVALS = "intervals";
	private static final String OUTPUT = "output";
	private static final String JSON = "json";
	private static final String MRSD = "mrsd";
	
	// ---RENDERING---//

	private static final String RENDER = "render";
	private static final String KML = "kml";
	private static final String GEOJSON = "geojson";

	private static final String LINES_SUBSET = "linesSubset";
	private static final String LINES_CUTOFF = "linesCutoff";
	private static final String LINES_VALUE = "linesValue";

	// TODO: polygon cutoffs

	private static final String POLYGON_COLOR_MAPPING = "polygoncolormapping";
	private static final String POLYGON_COLORS = "polygoncolors";
	private static final String POLYGON_COLOR = "polygoncolor";

	private static final String POLYGON_ALPHA_MAPPING = "polygonalphamapping";
	private static final String POLYGON_ALPHA = "polygonalpha";

	private static final String POLYGON_AREA = "polygonarea";
	private static final String POLYGON_AREA_MAPPING = "polygonradiusmapping";

	private static final String LINE_COLOR_MAPPING = "linecolormapping";
	private static final String LINE_COLORS = "linecolors";
	private static final String LINE_COLOR = "linecolor";

	private static final String LINE_ALPHA = "linealpha";
	private static final String LINE_ALPHA_MAPPING = "linealphamapping";

	private static final String LINE_ALTITUDE_MAPPING = "linealtitudemapping";
	private static final String LINE_ALTITUDE = "linealtitude";

	private static final String LINE_WIDTH_MAPPING = "linewidthmapping";
	private static final String LINE_WIDTH = "linewidth";

	// ---READING---//

	private static final String READ = "read";
	private static final String LINES = "lines";
	private static final String POLYGONS = "polygons";

	public Spread2ConsoleApp() {

		// //////////////////
		// ---DEFINITION---//
		// //////////////////

		// ---MODES---//

		modeArguments = new Arguments(new Arguments.Option[] {

		new Arguments.Option(HELP, "print this information and exit"),

		new Arguments.Option(READ, "read existing JSON file"),

		new Arguments.Option(PARSE, "create JSON from input files"),

				// new Arguments.Option(RENDER, "render from JSON file"),

				new Arguments.StringOption(RENDER, new String[] { KML, //
						GEOJSON //
						}, false, "render from JSON file"),

		});

		// ---PARSERS---//

		// discrete tree arguments
		args1 = new Arguments(
				new Arguments.Option[] {

						new Arguments.StringOption(LOCATIONS, "",
								"location coordinates file"),

						new Arguments.StringOption(TREE, "", "tree file name"),

						new Arguments.StringOption(LOCATION_TRAIT, "",
								"location trait name"),

						new Arguments.IntegerOption(INTERVALS,
								"number of time intervals"),

						new Arguments.StringOption(MRSD, "",
								"most recent sampling date [yyyy/mm/dd]"),

						new Arguments.StringArrayOption(TRAITS, -1, "",
								"traits to be parsed from nodes"),

						new Arguments.StringOption(OUTPUT, "",
								"json output file name"),

				});

		// bayes factor arguments
		args2 = new Arguments(new Arguments.Option[] {

		new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),

		new Arguments.StringOption(LOG, "", "tree file name"),

		new Arguments.RealOption(BURNIN, "log file burning in %"),

		new Arguments.StringOption(OUTPUT, "", "json output file name")

		});

		// continuous arguments
		args3 = new Arguments(
				new Arguments.Option[] {

						new Arguments.StringOption(TREE, "", "tree file name"),

						new Arguments.StringOption(LOCATION_TRAIT, "",
								"location trait name"),

						new Arguments.StringOption(HPD, "",
								"hpd interval attribute name"),

						new Arguments.StringOption(MRSD, "",
								"most recent sampling date [yyyy/mm/dd]"),

						new Arguments.StringArrayOption(TRAITS, -1, "",
								"traits to be parsed from nodes"),

						new Arguments.StringOption(OUTPUT, "",
								"json output file name"),

				});

		// time slicer arguments
		args4 = new Arguments(
				new Arguments.Option[] {

						new Arguments.StringOption(TREE, "", "tree file name"),

						new Arguments.StringOption(TREES, "", "trees file name"),

						new Arguments.StringOption(SLICE_HEIGHTS, "",
								"slice heights file name"),

						new Arguments.StringArrayOption(TRAITS, -1, "",
								"traits to be parsed from nodes"),

						// new Arguments.StringOption(LOCATION_TRAIT, "",
						// "location trait name"),

						new Arguments.IntegerOption(INTERVALS,
								"number of time intervals for slicing"),

						new Arguments.StringOption(MRSD, "",
										"most recent sampling date [yyyy/mm/dd]"),			
								
						new Arguments.IntegerOption(BURNIN,
								"how many trees to discard as burn-in (in # trees)"),

						new Arguments.RealOption(HPD,
								"hpd level for contouring"),

						new Arguments.StringOption(OUTPUT, "",
								"json output file name"),

				});

		// ---RENDERERS---//

		kmlRenderArguments = new Arguments(
				new Arguments.Option[] {

						new Arguments.StringOption(JSON, "",
								"json input file name"),

						new Arguments.StringOption(OUTPUT, "",
								"kml output file name"),

						// ---LINE WIDTH---//

						new Arguments.RealOption(LINE_WIDTH,
								"specify line width"),

						new Arguments.StringOption(LINE_WIDTH_MAPPING,
								new String[] { Utils.DISTANCE, //
										Utils.DURATION //
								}, false, "attribute to map line width"),

						// ---LINE ALTITUDE---//

						new Arguments.RealOption(LINE_ALTITUDE,
								"specify line altitude"),

						new Arguments.StringOption(LINE_ALTITUDE_MAPPING,
								new String[] { Utils.DISTANCE, //
										Utils.DURATION //
								}, false, "attribute to map line altitude"),

						// ---LINE COLORS---//

						// TODO: this should read RGB or RGBA
						new Arguments.RealArrayOption(LINE_COLOR, 3,
								"specify RGB value"),

						new Arguments.StringOption(LINE_COLOR_MAPPING, "",
								"attribute to map RGB aesthetics"),

						new Arguments.StringOption(LINE_COLORS, "",
								"file with RGB(A) colors to map attribute values."),

						// ---LINE ALPHA CHANEL---//

						new Arguments.RealOption(LINE_ALPHA, "specify A value"),

						new Arguments.StringOption(
								LINE_ALPHA_MAPPING,
								"",
								"attribute to map A aesthetics. Higher values will be more opaque, lower values will be more translucent. "),

						// ---POLYGON COLORS---//

						// TODO: this should read RGB or RGBA
						new Arguments.RealArrayOption(POLYGON_COLOR, 3,
								"specify RGB value"),

						new Arguments.StringOption(POLYGON_COLOR_MAPPING, "",
								"attribute to map RGB aesthetics"),

						new Arguments.StringOption(POLYGON_COLORS, "",
								"file with RGB(A) colors to map attribute values"),

						// ---POLYGON ALPHA CHANEL---//

						new Arguments.RealOption(
								POLYGON_ALPHA,
								"specify A value. Higher values are more opaque, lower values more translucent."),

						new Arguments.StringOption(
								POLYGON_ALPHA_MAPPING,
								"",
								"attribute to map A aesthetics. Higher values will be more opaque, lower values will be more translucent."),

						// ---POLYGON RADIUS---//

						new Arguments.RealOption(POLYGON_AREA,
								"specify circular polygons area. Makes sense only for polygons with locations."),

						new Arguments.StringOption(
								POLYGON_AREA_MAPPING,
								"",
								"attribute to map circular polygons area aesthetic. Only makes sense for polygons with locations."),

						new Arguments.StringOption(LINES_SUBSET, "",
								"attribute to select a subset of values above the certain cutoff."),

						new Arguments.RealOption(LINES_CUTOFF,
								"specify cutoff value to create a subset"),

						new Arguments.StringOption(LINES_VALUE, "",
								"specify fixed value to create a subset"),

				});

		geojsonRenderArguments = new Arguments(new Arguments.Option[] {

		// TODO: fill with options

				});

		// ---READER---//

		jsonReaderArguments = new Arguments(new Arguments.Option[] {

				new Arguments.StringArrayOption(LOCATIONS, -1, "",
						"json file names with locations to read"),

				new Arguments.StringArrayOption(LINES, -1, "",
						"json file names with lines to read"),

				new Arguments.StringArrayOption(POLYGONS, -1, "",
						"json file names with polygons to read"),

				new Arguments.StringOption(OUTPUT, "", "json output file name")

		});

	}// END: Constructor

	public void run(String[] args) {

		if (args[0].contains(HELP)) {

			gracefullyExit(null, modeArguments, null);

		} else if (args.length == 0) {

			gracefullyExit("Empty or incorrect arguments list.", null, null);

		}// END: help check

		// ---SPLIT---//

		// Utils.printArray(args);

		ArrayList<String[]> argsList = new ArrayList<String[]>();

		int from = 0;
		// RENDER arg has options
		int to = args[0].equalsIgnoreCase("-" + RENDER) ? 2 : 1;
		argsList.add(Arrays.copyOfRange(args, from, to));

		from = to;
		to = args.length;
		argsList.add(Arrays.copyOfRange(args, from, to));

		String[] modeArgs = argsList.get(0);
		String[] otherArgs = argsList.get(1);

		if (modeArgs.length == 0 || otherArgs.length == 0) {
			gracefullyExit("Empty or incorrect arguments list.", null, null);
		}

		// Utils.printArray(modeArgs);
		Settings settings = new Settings();

		try {

			// ---PARSE---//

			modeArguments.parseArguments(modeArgs);

		} catch (ArgumentException e) {
			gracefullyExit("", modeArguments, e);
		}

		if (modeArguments.hasOption(HELP)) {
			gracefullyExit(null, modeArguments, null);
		}

		if (modeArguments.hasOption(PARSE)) {

			System.out.println("In parsing mode");
			settings.parse = true;

		} else if (modeArguments.hasOption(READ)) {

			System.out.println("In read mode");
			settings.read = true;

		} else if (modeArguments.hasOption(RENDER)) {

			System.out.println("In rendering mode");
			settings.render = true;

			if (modeArguments.getStringOption(RENDER).equalsIgnoreCase(KML)) {

				settings.kml = true;

			} else if (modeArguments.getStringOption(RENDER).equalsIgnoreCase(
					GEOJSON)) {

				settings.geojson = true;

			} else {
				gracefullyExit("Unrecognized option", modeArguments, null);
			}// END: render arg check

		} else {

			gracefullyExit("Unrecognized option", modeArguments, null);

		}// END: mode check

		if (settings.parse) {

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

				if (Arrays.asList(otherArgs).contains("-" + TREES)
						|| Arrays.asList(otherArgs).contains(
								"-" + SLICE_HEIGHTS)) {

					System.out.println("In time slicer mode");
					settings.timeSlicer = true;

				} else if (Arrays.asList(otherArgs).contains("-" + TREE)) {

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

					if (args1.hasOption(MRSD)) {
						settings.discreteTreeSettings.mrsd = args1
								.getStringOption(MRSD);
					}
					
					if (args1.hasOption(TRAITS)) {

						settings.discreteTreeSettings.traits = args1
								.getStringArrayOption(TRAITS);

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

				} catch (AnalysisException e) {

					gracefullyExit(e.getMessage(), args1, e);

				}// END: try-catch

			} else if (settings.bayesFactors) {

				settings.bayesFactorsSettings = new BayesFactorsSettings();

				// ---PARSE---//

				try {

					args2.parseArguments(otherArgs);

					if (args2.hasOption(LOCATIONS)) {
						settings.bayesFactorsSettings.locations = args2
								.getStringOption(LOCATIONS);
					} else {
						throw new ArgumentException("Required argument "
								+ LOCATIONS + " is missing.");
					}// END: option check

					if (args2.hasOption(LOG)) {
						settings.bayesFactorsSettings.log = args2
								.getStringOption(LOG);
					} else {
						throw new ArgumentException("Required argument " + LOG
								+ " is missing.");
					}// END: option check

					if (args2.hasOption(OUTPUT)) {
						settings.bayesFactorsSettings.output = args2
								.getStringOption(OUTPUT);
					} // END: option check

					if (args2.hasOption(BURNIN)) {

						Double burnin = args2.getRealOption(BURNIN);

						if (burnin < 0.0 || burnin > 100.0) {

							throw new ArgumentException(
									"Burnin outside of [0,100].");

						} else {
							settings.bayesFactorsSettings.burnin = burnin;
						}

					} // END: option check

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), args2, e);
				}// END: try-catch

				// ---RUN---//

				try {

					BayesFactorParser parser = new BayesFactorParser(
							settings.bayesFactorsSettings);

					SpreadData data = parser.parse();

					// ---EXPORT TO JSON---//
					
					Gson gson = new GsonBuilder().setPrettyPrinting().create();
					String s = gson.toJson(data);

					File file = new File(settings.bayesFactorsSettings.output);
					FileWriter fw;

					fw = new FileWriter(file);
					fw.write(s);
					fw.close();

					System.out.println("Created JSON file");

				} catch (IOException e) {
					gracefullyExit(e.getMessage(), args2, e);
				} catch (IllegalCharacterException e) {
					gracefullyExit(e.getMessage(), args2, e);
				} catch (LocationNotFoundException e) {
					gracefullyExit(e.getMessage(), args2, e);
				}// END: try-catch

			} else if (settings.continuousTree) {

				settings.continuousTreeSettings = new ContinuousTreeSettings();

				// ---PARSE---//

				try {

					args3.parseArguments(otherArgs);

					if (args3.hasOption(TREE)) {
						settings.continuousTreeSettings.tree = args3
								.getStringOption(TREE);
					}

					if (args3.hasOption(LOCATION_TRAIT)) {
						settings.continuousTreeSettings.locationTrait = args3
								.getStringOption(LOCATION_TRAIT);
					}

					if (args3.hasOption(HPD)) {
						settings.continuousTreeSettings.hpd = args3
								.getStringOption(HPD);
					}

					if (args3.hasOption(MRSD)) {
						settings.continuousTreeSettings.mrsd = args3
								.getStringOption(MRSD);
					}
					
					if (args3.hasOption(TRAITS)) {
						settings.continuousTreeSettings.traits = args3
								.getStringArrayOption(TRAITS);
					}

					if (args3.hasOption(OUTPUT)) {
						settings.continuousTreeSettings.output = args3
								.getStringOption(OUTPUT);
					}// END: option check

				} catch (ArgumentException e) {

					gracefullyExit(e.getMessage(), args3, e);
				}

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

				} catch (AnalysisException e) {

					gracefullyExit(e.getMessage(), args3, e);

				}// END: try-catch block

				System.out.println("Created JSON file");

			} else if (settings.timeSlicer) {

				settings.timeSlicerSettings = new TimeSlicerSettings();

				try {

					// ---PARSE---//

					// Utils.printArray(otherArgs);

					args4.parseArguments(otherArgs);

					if (args4.hasOption(TREE)) {

						settings.timeSlicerSettings.tree = args4
								.getStringOption(TREE);

					} else if (args4.hasOption(SLICE_HEIGHTS)) {

						settings.timeSlicerSettings.sliceHeights = args4
								.getStringOption(SLICE_HEIGHTS);

					} else if (args4.hasOption(TREE)
							&& args4.hasOption(SLICE_HEIGHTS)) {

						throw new ArgumentException("Can't use both a" + TREES
								+ " and " + SLICE_HEIGHTS + " argument.");

					} else {

						throw new ArgumentException("Must specify" + TREES
								+ " or " + SLICE_HEIGHTS + " argument.");

					}// END: option check

					if (args4.hasOption(TREES)) {

						settings.timeSlicerSettings.trees = args4
								.getStringOption(TREES);

					} else {

						throw new ArgumentException("Required argument "
								+ TREES + " is missing.");

					}// END: option check

					if (args4.hasOption(TRAITS)) {

						settings.timeSlicerSettings.traits = args4
								.getStringArrayOption(TRAITS);

					} else {

						throw new ArgumentException("Required argument "
								+ LOCATION_TRAIT + " is missing.");

					}// END: option check

					if (args4.hasOption(INTERVALS)) {
						settings.timeSlicerSettings.intervals = args4
								.getIntegerOption(INTERVALS);
					}

					if (args4.hasOption(BURNIN)) {
						settings.timeSlicerSettings.burnIn = args4
								.getIntegerOption(BURNIN);
					}

					if (args4.hasOption(HPD)) {

						double hpdLevel = args4.getRealOption(HPD);

						if (hpdLevel < 0.0 || hpdLevel > 1.0) {

							throw new ArgumentException(HPD
									+ "argument outside of [0.0, 1.0].");

						} else {
							settings.timeSlicerSettings.hpdLevel = hpdLevel;
						}

					}// END: option check

					if (args4.hasOption(MRSD)) {
						settings.timeSlicerSettings.mrsd = args4
								.getStringOption(MRSD);
					}
					
					if (args4.hasOption(OUTPUT)) {
						settings.timeSlicerSettings.output = args4
								.getStringOption(OUTPUT);
					}// END: option check

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), args4, e);
				}

				// ---RUN---//

				try {

					TimeSlicerParser parser = new TimeSlicerParser(
							settings.timeSlicerSettings);

					SpreadData data = parser.parse();

					// ---EXPORT TO JSON---//

					Gson gson = new GsonBuilder().setPrettyPrinting().create();
					String s = gson.toJson(data);

					File file = new File(settings.timeSlicerSettings.output);
					FileWriter fw;

					fw = new FileWriter(file);
					fw.write(s);
					fw.close();

				} catch (IOException e) {
					gracefullyExit(e.getMessage(), args4, e);
				} catch (ImportException e) {
					gracefullyExit(e.getMessage(), args4, e);
				} catch (AnalysisException e) {
					gracefullyExit(e.getMessage(), args4, e);
				}

				System.out.println("Created JSON file");

			} else {
				throw new RuntimeException("Should never get here!");
			}// END: settings check

		} else if (settings.read) {

			settings.jsonReaderSettings = new JsonReaderSettings();

			// ---PARSE---//

			try {

				jsonReaderArguments.parseArguments(otherArgs);

				if (jsonReaderArguments.hasOption(LOCATIONS)) {
					settings.jsonReaderSettings.locations = jsonReaderArguments
							.getStringArrayOption(LOCATIONS);
				}

				if (jsonReaderArguments.hasOption(LINES)) {
					settings.jsonReaderSettings.lines = jsonReaderArguments
							.getStringArrayOption(LINES);
				}

				if (jsonReaderArguments.hasOption(POLYGONS)) {
					settings.jsonReaderSettings.polygons = jsonReaderArguments
							.getStringArrayOption(POLYGONS);
				}

				if (settings.jsonReaderSettings.locations == null
						&& settings.jsonReaderSettings.lines == null
						&& settings.jsonReaderSettings.polygons == null) {
					throw new ArgumentException("Must specify at least one of "
							+ LOCATIONS + ", " + LINES + ", " + " or "
							+ POLYGONS + " arguments.");
				}

				if (jsonReaderArguments.hasOption(OUTPUT)) {

					settings.jsonReaderSettings.output = jsonReaderArguments
							.getStringOption(OUTPUT);

				} else {

					throw new ArgumentException("Required argument " + OUTPUT
							+ " is missing.");
				}

			} catch (ArgumentException e) {
				gracefullyExit(e.getMessage(), jsonReaderArguments, e);
			}

			// ---RUN---//

			try {

				JsonReader reader = new JsonReader(settings.jsonReaderSettings);
				SpreadData data = reader.read();

				// ---EXPORT TO JSON---//

				Gson gson = new GsonBuilder().setPrettyPrinting().create();
				String s = gson.toJson(data);

				File file = new File(settings.jsonReaderSettings.output);
				FileWriter fw;

				fw = new FileWriter(file);
				fw.write(s);
				fw.close();

				System.out.println("Created JSON file");
				
			} catch (IOException e) {
				gracefullyExit(e.getMessage(), jsonReaderArguments, e);
			}

		} else if (settings.render) {

			if (settings.kml) { // ---KML RENDERING---//

				// ---PARSE---//

				try {

					kmlRenderArguments.parseArguments(otherArgs);

					// ---INTERROGATE---//

					settings.kmlRendererSettings = new KmlRendererSettings();
					if (kmlRenderArguments.hasOption(JSON)) {

						settings.kmlRendererSettings.json = kmlRenderArguments
								.getStringOption(JSON);

					} else {

						throw new ArgumentException("Required argument " + JSON
								+ " is missing.");

					}// END: option check

					if (kmlRenderArguments.hasOption(OUTPUT)) {

						settings.kmlRendererSettings.output = kmlRenderArguments
								.getStringOption(OUTPUT);

					}

					// ---POLYGON COLOR---//

					if (kmlRenderArguments.hasOption(POLYGON_COLOR_MAPPING)) {

						settings.kmlRendererSettings.polygonColorMapping = kmlRenderArguments
								.getStringOption(POLYGON_COLOR_MAPPING);

						if (kmlRenderArguments.hasOption(POLYGON_COLORS)) {
							settings.kmlRendererSettings.polygonColors = kmlRenderArguments
									.getStringOption(POLYGON_COLORS);
						}

					} else if (kmlRenderArguments.hasOption(POLYGON_COLOR)) {

						settings.kmlRendererSettings.polygonColor = kmlRenderArguments
								.getRealArrayOption(POLYGON_COLOR);

					} else if (kmlRenderArguments
							.hasOption(POLYGON_COLOR_MAPPING)
							&& kmlRenderArguments.hasOption(POLYGON_COLOR)) {

						throw new ArgumentException(
								"Can't both map and have a defined polygon color!");

					} else {

						// use defaults

					}

					// ---POLYGON ALPHA---//

					if (kmlRenderArguments.hasOption(POLYGON_ALPHA_MAPPING)) {

						settings.kmlRendererSettings.polygonAlphaMapping = kmlRenderArguments
								.getStringOption(POLYGON_ALPHA_MAPPING);

					} else if (kmlRenderArguments.hasOption(POLYGON_ALPHA)) {

						settings.kmlRendererSettings.polygonAlpha = kmlRenderArguments
								.getRealOption(POLYGON_ALPHA);
						settings.kmlRendererSettings.polygonAlphaChanged = true;

					} else if (kmlRenderArguments
							.hasOption(POLYGON_ALPHA_MAPPING)
							&& kmlRenderArguments.hasOption(POLYGON_ALPHA)) {

						throw new ArgumentException(
								"Can't both map and have a defined polygon alpha!");

					} else {

						// use defaults

					}

					// ---POLYGON RADIUS---//

					if (kmlRenderArguments.hasOption(POLYGON_AREA_MAPPING)) {

						settings.kmlRendererSettings.polygonAreaMapping = kmlRenderArguments
								.getStringOption(POLYGON_AREA_MAPPING);

					} else if (kmlRenderArguments.hasOption(POLYGON_AREA)) {

						settings.kmlRendererSettings.polygonArea = kmlRenderArguments
								.getRealOption(POLYGON_AREA);

					} else if (kmlRenderArguments
							.hasOption(POLYGON_AREA_MAPPING)
							&& kmlRenderArguments.hasOption(POLYGON_AREA)) {

						throw new ArgumentException(
								"Can't both map and have a defined polygon radius!");

					} else {

						// use defaults

					}

					// ---LINE COLOR---//

					if (kmlRenderArguments.hasOption(LINE_COLOR_MAPPING)) {

						settings.kmlRendererSettings.lineColorMapping = kmlRenderArguments
								.getStringOption(LINE_COLOR_MAPPING);

						if (kmlRenderArguments.hasOption(LINE_COLORS)) {
							settings.kmlRendererSettings.lineColors = kmlRenderArguments
									.getStringOption(LINE_COLORS);
						}

					} else if (kmlRenderArguments.hasOption(LINE_COLOR)) {

						settings.kmlRendererSettings.lineColor = kmlRenderArguments
								.getRealArrayOption(LINE_COLOR);

					} else if (kmlRenderArguments.hasOption(LINE_COLOR_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_COLOR)) {

						throw new ArgumentException(
								"Can't both map and have a defined line color!");

					} else {

						// use defaults

					}

					// ---LINE ALPHA---//

					if (kmlRenderArguments.hasOption(LINE_ALPHA_MAPPING)) {

						settings.kmlRendererSettings.lineAlphaMapping = kmlRenderArguments
								.getStringOption(LINE_ALPHA_MAPPING);

					} else if (kmlRenderArguments.hasOption(LINE_ALPHA)) {

						settings.kmlRendererSettings.lineAlpha = kmlRenderArguments
								.getRealOption(LINE_ALPHA);
						settings.kmlRendererSettings.lineAlphaChanged = true;

					} else if (kmlRenderArguments.hasOption(LINE_ALPHA_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_ALPHA)) {

						throw new ArgumentException(
								"Can't both map and have a defined line alpha!");

					} else {

						// use defaults

					}

					// ---LINE WIDTH---//

					if (kmlRenderArguments.hasOption(LINE_WIDTH_MAPPING)) {

						settings.kmlRendererSettings.lineWidthMapping = kmlRenderArguments
								.getStringOption(LINE_WIDTH_MAPPING);

					} else if (kmlRenderArguments.hasOption(LINE_WIDTH)) {

						settings.kmlRendererSettings.lineWidth = kmlRenderArguments
								.getRealOption(LINE_WIDTH);

					} else if (kmlRenderArguments.hasOption(LINE_WIDTH_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_WIDTH)) {

						throw new ArgumentException(
								"Can't both map and have a defined line altitude!");

					} else {

						// use defaults

					}

					// ---LINE ALTITUDE---//

					if (kmlRenderArguments.hasOption(LINE_ALTITUDE_MAPPING)) {

						settings.kmlRendererSettings.lineAltitudeMapping = kmlRenderArguments
								.getStringOption(LINE_ALTITUDE_MAPPING);

					} else if (kmlRenderArguments.hasOption(LINE_ALTITUDE)) {

						settings.kmlRendererSettings.lineAltitude = kmlRenderArguments
								.getRealOption(LINE_ALTITUDE);

					} else if (kmlRenderArguments
							.hasOption(LINE_ALTITUDE_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_ALTITUDE)) {

						throw new ArgumentException(
								"Can't both map and have a defined line altitude!");

					} else {

						// use defaults

					}

					// ---LINES SUBSET---//

					if (kmlRenderArguments.hasOption(LINES_SUBSET)) {

						settings.kmlRendererSettings.linesSubset = kmlRenderArguments
								.getStringOption(LINES_SUBSET);

						if (kmlRenderArguments.hasOption(LINES_CUTOFF)) {

							settings.kmlRendererSettings.linesCutoff = kmlRenderArguments
									.getRealOption(LINES_CUTOFF);

						} else if (kmlRenderArguments.hasOption(LINES_VALUE)) {

							settings.kmlRendererSettings.linesValue = kmlRenderArguments
									.getStringOption(LINES_VALUE);

						} else {

							throw new ArgumentException(
									"Can't create a subset from these options!");

						}

					}// END: option check

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), kmlRenderArguments, e);
				}// END: try-catch

				// ---RUN---//

				try {

					Reader reader = new FileReader(
							settings.kmlRendererSettings.json);
					Gson gson = new GsonBuilder().create();
					SpreadData input = gson.fromJson(reader, SpreadData.class);

					KmlRenderer renderer = new KmlRenderer(input,
							settings.kmlRendererSettings);
					renderer.render();

					System.out.println("Rendered KML.");

				} catch (KmlException e) {

					gracefullyExit(e.getMessage(), kmlRenderArguments, e);

				} catch (IOException e) {

					gracefullyExit(e.getMessage(), kmlRenderArguments, e);

				} catch (MissingAttributeException e) {

					gracefullyExit(e.getMessage(), kmlRenderArguments, e);

				} catch (AnalysisException e) {

					gracefullyExit(e.getMessage(), kmlRenderArguments, e);

				}// END: Exception handling

			} else if (settings.geojson) { // ---GEOJSON RENDERING---//

				// ---PARSE---//

				try {

					geojsonRenderArguments.parseArguments(otherArgs);

					// ---INTERROGATE---//

					settings.geoJSONRendererSettings = new GeoJSONRendererSettings();

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), geojsonRenderArguments, e);
				}// END: Exception handling

				// ---RUN---//

				try {

					Reader reader = new FileReader(
							settings.geoJSONRendererSettings.json);
					Gson gson = new GsonBuilder().create();
					SpreadData input = gson.fromJson(reader, SpreadData.class);

					GeoJSONRenderer renderer = new GeoJSONRenderer(input,
							settings.geoJSONRendererSettings);
					renderer.render();

					System.out.println("Rendered GeoJSON.");

				} catch (FileNotFoundException e) {

					gracefullyExit(e.getMessage(), geojsonRenderArguments, e);

				} catch (IOException e) {

					gracefullyExit(e.getMessage(), geojsonRenderArguments, e);

				} catch (MissingAttributeException e) {

					gracefullyExit(e.getMessage(), geojsonRenderArguments, e);

				}// END: Exception handling

			} else {

				throw new RuntimeException("Should never get here!");

			}// END: rendering type check

		}// END: create / render / read check

	}// END: run

	private void gracefullyExit(String message, Arguments arguments, Exception e) {
    
		// TODO: read / parse / render in help message
		
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
