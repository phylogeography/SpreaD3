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
import parsers.BayesFactorSpreadDataParser;
import parsers.ContinuousTreeSpreadDataParser;
import parsers.DiscreteTreeSpreadDataParser;
import parsers.TimeSlicerSpreadDataParser;
import renderers.d3.D3Renderer;
import renderers.kml.KmlRenderer;
import settings.Settings;
import settings.parsing.BayesFactorsSettings;
import settings.parsing.ContinuousTreeSettings;
import settings.parsing.DiscreteTreeSettings;
import settings.parsing.TimeSlicerSettings;
import settings.reading.JsonReaderSettings;
import settings.rendering.D3RendererSettings;
import settings.rendering.KmlRendererSettings;
import structure.data.SpreadData;
import utils.Arguments;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import exceptions.AnalysisException;
import exceptions.ArgumentException;
import exceptions.IllegalCharacterException;
import exceptions.LocationNotFoundException;

public class Spread2ConsoleApp {

	// ---ARGUMENTS--//

	private Arguments modeArguments;

	private Arguments args1;
	private Arguments args2;
	private Arguments args3;
	private Arguments args4;

	private Arguments kmlRenderArguments;
	// private Arguments d3RenderArguments;
	private Arguments d3RenderArguments;

	private Arguments jsonReaderArguments;;

	// ---HELP---//

	private static final String HELP = "help";

	// ---PARSING---//

	private static final String PARSE = "parse";

	private static final String TREE = "tree";
	private static final String TREES = "trees";
	private static final String SLICE_HEIGHTS = "sliceHeights";
	private static final String LOCATIONS = "locations";
	private static final String HEADER = "header";
	private static final String TRUE = "true";
	private static final String FALSE = "false";
	private static final String LOG = "log";
	private static final String BURNIN = "burnin";
	private static final String TRAIT = "trait";
	private static final String LOCATION_TRAIT = "locationTrait";
	private static final String X_COORDINATE = "xCoordinate";
	private static final String Y_COORDINATE = "yCoordinate";

	private static final String HPD = Utils.HPD;
	private static final String INTERVALS = "intervals";
	private static final String MAP = "map";
	private static final String OUTPUT = "output";
	private static final String JSON = "json";
	private static final String MRSD = "mrsd";
	private static final String TIMESCALE_MULTIPLIER = "timescaleMultiplier";

	// ---RENDERING---//

	private static final String RENDER = "render";
	private static final String KML = "kml";
	private static final String D3 = "d3";

	// ---POINTS---//

	private static final String POINTS_SUBSET = "pointsSubset";
	private static final String POINTS_CUTOFF = "pointsCutoff";
	private static final String POINTS_VALUE = "pointsValue";

	private static final String POINT_AREA = "pointArea";
	private static final String POINT_AREA_MAPPING = "pointAreaMapping";

	private static final String POINT_COLOR = "pointColor";
	private static final String POINT_COLOR_MAPPING = "pointColorMapping";
	private static final String POINT_COLORS = "pointColors";

	private static final String POINT_ALPHA = "pointAlpha";
	private static final String POINT_ALPHA_MAPPING = "pointAlphaMapping";

	// ---LINES---//

	private static final String LINES_SUBSET = "linesSubset";
	private static final String LINES_CUTOFF = "linesCutoff";
	private static final String LINES_VALUE = "linesValue";

	private static final String LINE_COLOR_MAPPING = "lineColormapping";
	private static final String LINE_COLORS = "lineColors";
	private static final String LINE_COLOR = "lineColor";

	private static final String LINE_ALPHA = "lineAlpha";
	private static final String LINE_ALPHA_MAPPING = "lineAlphaMapping";

	private static final String LINE_ALTITUDE_MAPPING = "lineAltitudeMapping";
	private static final String LINE_ALTITUDE = "lineAltitude";

	private static final String LINE_WIDTH_MAPPING = "lineWidthMapping";
	private static final String LINE_WIDTH = "lineWidth";

	// ---AREAS---//

	// private static final String AREA_SUBSET = "linesSubset";
	// private static final String AREA_CUTOFF = "linesCutoff";
	// private static final String AREA_VALUE = "linesValue";

	private static final String AREA_COLOR = "areaColor";
	private static final String AREA_ALPHA = "areaAlpha";

	// ---COUNTS---//

	private static final String COUNT_COLOR = "countColor";
	private static final String COUNT_ALPHA = "countAlpha";

	// ---READING---//

	private static final String READ = "read";
	private static final String LINES = "lines";
	private static final String POLYGONS = "polygons";

	public Spread2ConsoleApp() {

		// //////////////////
		// ---DEFINITION---//
		// //////////////////

		// ---MODES---//

		modeArguments = new Arguments(
				new Arguments.Option[] {

				new Arguments.Option(HELP, "print this information and exit"),

				new Arguments.Option(READ, "read existing JSON file"),

				new Arguments.Option(PARSE, "create JSON from input files"),

				// new Arguments.Option(RENDER, "render from JSON file"),

				new Arguments.StringOption(RENDER, new String[] { KML, //
						D3 //
				}, false, "render from JSON file"),

		});

		// ---PARSERS---//

		// discrete tree arguments
		args1 = new Arguments(
				new Arguments.Option[] {

				new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),

				new Arguments.StringOption(HEADER, new String[] { TRUE, //
						FALSE //
				}, false, "locations file has header line"),

				new Arguments.StringOption(TREE, "", "tree file name"),

				new Arguments.StringOption(LOCATION_TRAIT, "", "location trait name"),

				new Arguments.IntegerOption(INTERVALS, "number of time intervals"),

				new Arguments.StringOption(MRSD, "", "most recent sampling date in [yyyy/mm/dd] or [XXXX.XX] format"),

				new Arguments.RealOption(TIMESCALE_MULTIPLIER,
						"multiplier for the tree branches time scale. By default 1 unit = 1 year."),

				new Arguments.StringOption(MAP, "", "geojson file name"),

				// new Arguments.StringArrayOption(TRAITS, -1, "",
				// "traits to be parsed from nodes"),

				new Arguments.StringOption(OUTPUT, "", "json output file name"),

		});

		// bayes factor arguments
		args2 = new Arguments(
				new Arguments.Option[] {

				new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),

				new Arguments.StringOption(LOG, "", "tree file name"),

				new Arguments.RealOption(BURNIN, "log file burning in %"),

				new Arguments.StringOption(MAP, "", "geojson file name"),

				new Arguments.StringOption(OUTPUT, "", "json output file name")

		});

		// continuous arguments
		args3 = new Arguments(
				new Arguments.Option[] {

				new Arguments.StringOption(TREE, "", "tree file name"),

				new Arguments.StringOption(X_COORDINATE, "", "x location trait name (latitude)"),

				new Arguments.StringOption(Y_COORDINATE, "", "y location trait name (longitude)"),

				new Arguments.StringOption(HPD, "", "hpd level"),

				new Arguments.StringOption(MRSD, "", "most recent sampling date in [yyyy/mm/dd] or [XXXX.XX] format"),

				new Arguments.RealOption(TIMESCALE_MULTIPLIER,
						"multiplier for the tree branches time scale. By default 1 unit = 1 year."),

				new Arguments.StringOption(MAP, "", "geojson file name"),

				new Arguments.StringOption(OUTPUT, "", "json output file name"),

		});

		// time slicer arguments
		args4 = new Arguments(
				new Arguments.Option[] {

				new Arguments.StringOption(TREE, "", "tree file name"),

				new Arguments.StringOption(TREES, "", "trees file name"),

				new Arguments.StringOption(SLICE_HEIGHTS, "", "slice heights file name"),

				// new Arguments.StringArrayOption(TRAITS, -1, "",
				// "traits to be parsed from nodes"),

				new Arguments.StringOption(TRAIT, "", "2D trait used for contouring"),

				new Arguments.StringOption(MAP, "", "geojson file name"),

				new Arguments.StringOption(MRSD, "", "most recent sampling date in [yyyy/mm/dd] or [XXXX.XX] format"),

				new Arguments.RealOption(TIMESCALE_MULTIPLIER,
						"multiplier for the tree branches time scale. By default 1 unit = 1 year."),

				new Arguments.IntegerOption(INTERVALS, "number of time intervals for slicing"),

				new Arguments.IntegerOption(BURNIN, "how many trees to discard as burn-in (in # trees)"),

				new Arguments.RealOption(HPD, "hpd level for contouring"),

				new Arguments.StringOption(OUTPUT, "", "json output file name"),

		});

		// ---RENDERERS---//

		kmlRenderArguments = new Arguments(
				new Arguments.Option[] {

				new Arguments.StringOption(JSON, "", "json input file name"),

				new Arguments.StringOption(OUTPUT, "", "kml output file name"),

				// ///////////////
				// ---POINTS---//
				// ///////////////

				// ---POINT SUBSETS---//

				new Arguments.StringOption(POINTS_SUBSET, "",
						"attribute to select a subset of values above the certain cutoff."),

				new Arguments.RealOption(POINTS_CUTOFF, "specify cutoff value to create a subset"),

				new Arguments.StringOption(POINTS_VALUE, "", "specify fixed value to create a subset"),

				// ---POINT COLORS---//

				new Arguments.RealArrayOption(POINT_COLOR, 3, "specify RGB value"),

				new Arguments.StringOption(POINT_COLOR_MAPPING, "", "attribute to map RGB aesthetics"),

				new Arguments.StringOption(POINT_COLORS, "", "file with RGB(A) colors to map attribute values to."),

				// ---POINT ALPHA---//

				new Arguments.RealOption(POINT_ALPHA, "specify alpha value"),

				new Arguments.StringOption(POINT_ALPHA_MAPPING, "",
						"attribute to map alpha aesthetic. Higher values will be more opaque, lower values will be more translucent. "),

				// ---POINT AREA---//

				new Arguments.RealOption(POINT_AREA, "specify point areas"),

				new Arguments.StringOption(POINT_AREA_MAPPING, "", "attribute to map area aesthetics"),

				// //////////////
				// ---AREAS---//
				// //////////////

				// ---SUBSETS---//

				// new Arguments.StringOption(AREA_SUBSET, "",
				// "attribute to select a subset of values above the
				// certain
				// cutoff."),
				//
				// new Arguments.RealOption(AREA_CUTOFF, "specify cutoff
				// value
				// to create a subset"),
				//
				// new Arguments.StringOption(AREA_VALUE, "", "specify
				// fixed
				// value to create a subset"),

				// ---AREA COLOR---//

				// TODO: this should read RGB or RGBA
						new Arguments.RealArrayOption(AREA_COLOR, 3, "specify RGB value"),

				// // ---AREA ALPHA---//

				new Arguments.RealOption(AREA_ALPHA,
						"specify alpha value. Higher values are more opaque, lower values more translucent."),

				// //////////////
				// ---LINES---//
				// //////////////

				// ---SUBSETS---//

				new Arguments.StringOption(LINES_SUBSET, "",
						"attribute to select a subset of values above the certain cutoff."),

				new Arguments.RealOption(LINES_CUTOFF, "specify cutoff value to create a subset"),

				new Arguments.StringOption(LINES_VALUE, "", "specify fixed value to create a subset"),

				// ---LINE WIDTH---//

				new Arguments.RealOption(LINE_WIDTH, "specify line width"),

				new Arguments.StringOption(LINE_WIDTH_MAPPING, new String[] { Utils.DISTANCE, //
						Utils.DURATION //
				}, false, "attribute to map line width"),

				// ---LINE ALTITUDE---//

				new Arguments.RealOption(LINE_ALTITUDE, "specify line altitude"),

				new Arguments.StringOption(LINE_ALTITUDE_MAPPING, "", "attribute to map line altitude"),

				// ---LINE COLOR---//

				// TODO: this should read RGB or RGBA
						new Arguments.RealArrayOption(LINE_COLOR, 3, "specify RGB value"),

				new Arguments.StringOption(LINE_COLOR_MAPPING, "", "attribute to map RGB aesthetics"),

				new Arguments.StringOption(LINE_COLORS, "", "file with RGB(A) colors to map attribute values."),

				// ---LINE ALPHA---//

				new Arguments.RealOption(LINE_ALPHA, "specify A value"),

				new Arguments.StringOption(LINE_ALPHA_MAPPING, "",
						"attribute to map A aesthetics. Higher values will be more opaque, lower values will be more translucent. "),

				// //////////////
				// ---COUNTS---//
				// //////////////

				// TODO: this should read RGB or RGBA
						new Arguments.RealArrayOption(COUNT_COLOR, 3, "specify RGB value"),

		});

		d3RenderArguments = new Arguments(
				new Arguments.Option[] {

				new Arguments.StringOption(JSON, "", "json input file name"),

				new Arguments.StringOption(OUTPUT, "", "output directory name. If directory already exists the content will be overwritten.")

		});

		// ---READER---//

		jsonReaderArguments = new Arguments(
				new Arguments.Option[] {

				new Arguments.StringArrayOption(LOCATIONS, -1, "", "json file names with locations to read"),

				new Arguments.StringArrayOption(LINES, -1, "", "json file names with lines to read"),

				new Arguments.StringArrayOption(POLYGONS, -1, "", "json file names with polygons to read"),

				new Arguments.StringOption(OUTPUT, "", "json output file name")

		});

	}// END: Constructor

	public void run(String[] args) {

		if (args[0].contains(HELP)) {

			gracefullyExit(null, modeArguments, null);

		} else if (args.length == 0) {

			gracefullyExit("Empty or incorrect arguments list.", null, null);

		} // END: help check

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

			} else if (modeArguments.getStringOption(RENDER).equalsIgnoreCase(D3)) {

				settings.d3 = true;

			} else {
				gracefullyExit("Unrecognized option", modeArguments, null);
			} // END: render arg check

		} else {

			gracefullyExit("Unrecognized option", modeArguments, null);

		} // END: mode check

		if (settings.parse) {

			// ---GET INTENT---//

			// recognise type of analysis from input files
			if (Arrays.asList(otherArgs).contains("-" + LOCATIONS)) {

				if (Arrays.asList(otherArgs).contains("-" + TREE)) {

					System.out.println("In discrete tree mode");
					settings.discreteTree = true;

				} else if (Arrays.asList(otherArgs).contains("-" + LOG)) {

					System.out.println("In bayes factor mode");
					settings.bayesFactors = true;

				} else {

					gracefullyExit("Unrecognized option", null, null);

				} // END: tree/log input check

			} else {

				System.out.println("In continuous mode");

				if (Arrays.asList(otherArgs).contains("-" + TREES)
						|| Arrays.asList(otherArgs).contains("-" + SLICE_HEIGHTS)) {

					System.out.println("In time slicer mode");
					settings.timeSlicer = true;

				} else if (Arrays.asList(otherArgs).contains("-" + TREE)) {

					System.out.println("In continuous tree mode");
					settings.continuousTree = true;

				} else {

					gracefullyExit("Unrecognized option", null, null);

				} // END: continuous modes

			} // END: get intent logic

			if (settings.discreteTree) {

				settings.discreteTreeSettings = new DiscreteTreeSettings();

				// ---PARSE---//

				try {

					args1.parseArguments(otherArgs);

					if (args1.hasOption(LOCATIONS)) {

						settings.discreteTreeSettings.locations = args1.getStringOption(LOCATIONS);

					} else {

						throw new ArgumentException("Required argument " + LOCATIONS + " is missing.");

					} // END: option check

					if (args1.hasOption(HEADER)) {

						String option = args1.getStringOption(HEADER);
						if (option.equalsIgnoreCase(TRUE)) {
							settings.discreteTreeSettings.header = true;
						}

					} // END: option check

					if (args1.hasOption(TREE)) {

						settings.discreteTreeSettings.tree = args1.getStringOption(TREE);

					} else {

						throw new ArgumentException("Required argument " + TREE + " is missing.");

					} // END: option check

					if (args1.hasOption(LOCATION_TRAIT)) {

						settings.discreteTreeSettings.locationAttribute = args1.getStringOption(LOCATION_TRAIT);

					} else {

						throw new ArgumentException("Required argument " + LOCATION_TRAIT + " is missing.");

					} // END: option check

					if (args1.hasOption(INTERVALS)) {

						settings.discreteTreeSettings.intervals = args1.getIntegerOption(INTERVALS);

					} // END: option check

					if (args1.hasOption(MRSD)) {
						settings.discreteTreeSettings.mrsd = args1.getStringOption(MRSD);
					}

					if (args1.hasOption(TIMESCALE_MULTIPLIER)) {
						settings.discreteTreeSettings.timescaleMultiplier = args1.getRealOption(TIMESCALE_MULTIPLIER);
					}

					if (args1.hasOption(MAP)) {

						settings.discreteTreeSettings.geojson = args1.getStringOption(MAP);
					}

					// if (args1.hasOption(TRAITS)) {
					//
					// settings.discreteTreeSettings.traits =
					// args1.getStringArrayOption(TRAITS);
					//
					// } // END: option check

					if (args1.hasOption(OUTPUT)) {

						settings.discreteTreeSettings.output = args1.getStringOption(OUTPUT);

					} // END: option check

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), args1, e);
				} // END: try-catch

				// ---RUN---//

				try {

					// DiscreteTreeParserOld parser = new DiscreteTreeParserOld(
					// settings.discreteTreeSettings);

					DiscreteTreeSpreadDataParser parser = new DiscreteTreeSpreadDataParser(
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

				} catch (FileNotFoundException e) {

					gracefullyExit(e.getMessage(), args1, e);

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

				} // END: try-catch

			} else if (settings.bayesFactors) {

				settings.bayesFactorsSettings = new BayesFactorsSettings();

				// ---PARSE---//

				try {

					args2.parseArguments(otherArgs);

					if (args2.hasOption(LOCATIONS)) {
						settings.bayesFactorsSettings.locations = args2.getStringOption(LOCATIONS);
					} else {
						throw new ArgumentException("Required argument " + LOCATIONS + " is missing.");
					} // END: option check

					if (args2.hasOption(LOG)) {
						settings.bayesFactorsSettings.log = args2.getStringOption(LOG);
					} else {
						throw new ArgumentException("Required argument " + LOG + " is missing.");
					} // END: option check

					if (args2.hasOption(OUTPUT)) {
						settings.bayesFactorsSettings.output = args2.getStringOption(OUTPUT);
					} // END: option check

					if (args2.hasOption(MAP)) {

						settings.bayesFactorsSettings.geojson = args2.getStringOption(MAP);
					}

					if (args2.hasOption(BURNIN)) {

						Double burnin = args2.getRealOption(BURNIN);

						if (burnin < 0.0 || burnin > 100.0) {

							throw new ArgumentException("Burnin outside of [0,100].");

						} else {
							settings.bayesFactorsSettings.burnin = burnin;
						}

					} // END: option check

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), args2, e);
				} // END: try-catch

				// ---RUN---//

				try {

					BayesFactorSpreadDataParser parser = new BayesFactorSpreadDataParser(settings.bayesFactorsSettings);
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

				} catch (AnalysisException e) {

					gracefullyExit(e.getMessage(), args2, e);

				} catch (LocationNotFoundException e) {

					gracefullyExit(e.getMessage(), args2, e);

				} // END: try-catch

			} else if (settings.continuousTree) {

				settings.continuousTreeSettings = new ContinuousTreeSettings();

				// ---PARSE---//

				try {

					args3.parseArguments(otherArgs);

					if (args3.hasOption(TREE)) {
						settings.continuousTreeSettings.tree = args3.getStringOption(TREE);
					}

					if (args3.hasOption(X_COORDINATE)) {
						settings.continuousTreeSettings.xCoordinate = args3.getStringOption(X_COORDINATE);
					}

					if (args3.hasOption(Y_COORDINATE)) {
						settings.continuousTreeSettings.yCoordinate = args3.getStringOption(Y_COORDINATE);
					}

					if (args3.hasOption(HPD)) {
						settings.continuousTreeSettings.hpd = args3.getStringOption(HPD);
					}

					if (args3.hasOption(MRSD)) {
						settings.continuousTreeSettings.mrsd = args3.getStringOption(MRSD);
					}

					if (args3.hasOption(TIMESCALE_MULTIPLIER)) {
						settings.continuousTreeSettings.timescaleMultiplier = args3.getRealOption(TIMESCALE_MULTIPLIER);
					}

					if (args3.hasOption(MAP)) {

						settings.continuousTreeSettings.geojson = args3.getStringOption(MAP);
					}

					if (args3.hasOption(OUTPUT)) {
						settings.continuousTreeSettings.output = args3.getStringOption(OUTPUT);
					} // END: option check

				} catch (ArgumentException e) {

					gracefullyExit(e.getMessage(), args3, e);
				}

				// ---RUN---//

				try {

					ContinuousTreeSpreadDataParser parser = new ContinuousTreeSpreadDataParser(
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

				} catch (NumberFormatException e) {

					gracefullyExit(e.getMessage(), args3, e);

				} // END: try-catch block

				System.out.println("Created JSON file");

			} else if (settings.timeSlicer) {

				settings.timeSlicerSettings = new TimeSlicerSettings();

				try {

					// ---PARSE---//

					// Utils.printArray(otherArgs);

					args4.parseArguments(otherArgs);

					if (args4.hasOption(TREE)) {

						settings.timeSlicerSettings.tree = args4.getStringOption(TREE);

					} else if (args4.hasOption(SLICE_HEIGHTS)) {

						settings.timeSlicerSettings.sliceHeights = args4.getStringOption(SLICE_HEIGHTS);

					} else if (args4.hasOption(TREE) && args4.hasOption(SLICE_HEIGHTS)) {

						throw new ArgumentException("Can't use both a" + TREE + " and " + SLICE_HEIGHTS + " argument.");

					} else {

						throw new ArgumentException("Must specify" + TREE + " or " + SLICE_HEIGHTS + " argument.");

					} // END: option check

					if (args4.hasOption(TREES)) {

						settings.timeSlicerSettings.trees = args4.getStringOption(TREES);

					} else {

						throw new ArgumentException("Required argument " + TREES + " is missing.");

					} // END: option check

					if (args4.hasOption(TRAIT)) {

						settings.timeSlicerSettings.trait = args4.getStringOption(TRAIT);

					} else {

						throw new ArgumentException("Required argument " + LOCATION_TRAIT + " is missing.");

					} // END: option check

					if (args4.hasOption(INTERVALS)) {
						settings.timeSlicerSettings.intervals = args4.getIntegerOption(INTERVALS);
					}

					if (args4.hasOption(BURNIN)) {
						settings.timeSlicerSettings.burnIn = args4.getIntegerOption(BURNIN);
					}

					if (args4.hasOption(HPD)) {

						double hpdLevel = args4.getRealOption(HPD);

						if (hpdLevel < 0.0 || hpdLevel > 1.0) {

							throw new ArgumentException(HPD + "argument outside of [0.0, 1.0].");

						} else {
							settings.timeSlicerSettings.hpdLevel = hpdLevel;
						}

					} // END: option check

					if (args4.hasOption(MRSD)) {
						settings.timeSlicerSettings.mrsd = args4.getStringOption(MRSD);
					}

					if (args4.hasOption(TIMESCALE_MULTIPLIER)) {
						settings.timeSlicerSettings.timescaleMultiplier = args4.getRealOption(TIMESCALE_MULTIPLIER);
					}

					if (args4.hasOption(MAP)) {

						settings.timeSlicerSettings.geojson = args4.getStringOption(MAP);
					}

					if (args4.hasOption(OUTPUT)) {
						settings.timeSlicerSettings.output = args4.getStringOption(OUTPUT);
					} // END: option check

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), args4, e);
				}

				// ---RUN---//

				try {

					TimeSlicerSpreadDataParser parser = new TimeSlicerSpreadDataParser(settings.timeSlicerSettings);
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

				} catch (UnsupportedClassVersionError e) {

					String message = "Java version found " + System.getProperty("java.version")
							+ " is too old. Please update";
					gracefullyExit(message, args4, new AnalysisException(e.getMessage()));

				}

				System.out.println("Created JSON file");

			} else {
				throw new RuntimeException("Should never get here!");
			} // END: settings check

		} else if (settings.read) {

			settings.jsonReaderSettings = new JsonReaderSettings();

			// ---PARSE---//

			try {

				jsonReaderArguments.parseArguments(otherArgs);

				if (jsonReaderArguments.hasOption(LOCATIONS)) {
					settings.jsonReaderSettings.locations = jsonReaderArguments.getStringArrayOption(LOCATIONS);
				}

				if (jsonReaderArguments.hasOption(LINES)) {
					settings.jsonReaderSettings.lines = jsonReaderArguments.getStringArrayOption(LINES);
				}

				if (jsonReaderArguments.hasOption(POLYGONS)) {
					settings.jsonReaderSettings.polygons = jsonReaderArguments.getStringArrayOption(POLYGONS);
				}

				if (settings.jsonReaderSettings.locations == null && settings.jsonReaderSettings.lines == null
						&& settings.jsonReaderSettings.polygons == null) {
					throw new ArgumentException("Must specify at least one of " + LOCATIONS + ", " + LINES + ", "
							+ " or " + POLYGONS + " arguments.");
				}

				if (jsonReaderArguments.hasOption(OUTPUT)) {

					settings.jsonReaderSettings.output = jsonReaderArguments.getStringOption(OUTPUT);

				} else {

					throw new ArgumentException("Required argument " + OUTPUT + " is missing.");
				}

			} catch (ArgumentException e) {
				gracefullyExit(e.getMessage(), jsonReaderArguments, e);
			}

			// ---RUN---//

			try {

				// JsonReader reader = new
				// JsonReader(settings.jsonReaderSettings);
				SpreadData data = null;// reader.read();

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

						settings.kmlRendererSettings.json = kmlRenderArguments.getStringOption(JSON);

					} else {

						throw new ArgumentException("Required argument " + JSON + " is missing.");

					} // END: option check

					if (kmlRenderArguments.hasOption(OUTPUT)) {

						settings.kmlRendererSettings.output = kmlRenderArguments.getStringOption(OUTPUT);

					}

					// ////////////////
					// ---POINTS---//
					// ///////////////

					// ---AREA SUBSET---//

					if (kmlRenderArguments.hasOption(POINTS_SUBSET)) {

						settings.kmlRendererSettings.pointsSubset = kmlRenderArguments.getStringOption(POINTS_SUBSET);

						if (kmlRenderArguments.hasOption(POINTS_CUTOFF)) {

							settings.kmlRendererSettings.pointsCutoff = kmlRenderArguments.getRealOption(POINTS_CUTOFF);

						} else if (kmlRenderArguments.hasOption(POINTS_VALUE)) {

							settings.kmlRendererSettings.pointsValue = kmlRenderArguments.getStringOption(POINTS_VALUE);

						} else {

							throw new ArgumentException("Can't create a subset from these options!");

						}

					} // END: option check

					// ---POINT COLOR---//

					if (kmlRenderArguments.hasOption(POINT_COLOR_MAPPING)) {

						settings.kmlRendererSettings.pointColorMapping = kmlRenderArguments
								.getStringOption(POINT_COLOR_MAPPING);

						if (kmlRenderArguments.hasOption(POINT_COLORS)) {
							settings.kmlRendererSettings.pointColors = kmlRenderArguments.getStringOption(POINT_COLORS);
						}

					} else if (kmlRenderArguments.hasOption(POINT_COLOR)) {

						settings.kmlRendererSettings.pointColor = kmlRenderArguments.getRealArrayOption(POINT_COLOR);

					} else if (kmlRenderArguments.hasOption(POINT_COLOR_MAPPING)
							&& kmlRenderArguments.hasOption(POINT_COLOR)) {

						throw new ArgumentException("Can't both map and have a defined point color!");

					} else {

						// use defaults

					}

					// ---POINT ALPHA---//

					if (kmlRenderArguments.hasOption(POINT_ALPHA_MAPPING)) {

						settings.kmlRendererSettings.pointAlphaMapping = kmlRenderArguments
								.getStringOption(POINT_ALPHA_MAPPING);

					} else if (kmlRenderArguments.hasOption(POINT_ALPHA)) {

						settings.kmlRendererSettings.pointAlpha = kmlRenderArguments.getRealOption(POINT_ALPHA);
						settings.kmlRendererSettings.pointAlphaChanged = true;

					} else if (kmlRenderArguments.hasOption(POINT_ALPHA_MAPPING)
							&& kmlRenderArguments.hasOption(POINT_ALPHA)) {

						throw new ArgumentException("Can't both map and have a defined point alpha!");

					} else {

						// use defaults

					}

					// ---POINT AREA---//

					if (kmlRenderArguments.hasOption(POINT_AREA_MAPPING)) {

						settings.kmlRendererSettings.pointAreaMapping = kmlRenderArguments
								.getStringOption(POINT_AREA_MAPPING);

					} else if (kmlRenderArguments.hasOption(POINT_AREA)) {

						settings.kmlRendererSettings.pointArea = kmlRenderArguments.getRealOption(POINT_AREA);

					} else if (kmlRenderArguments.hasOption(POINT_AREA_MAPPING)
							&& kmlRenderArguments.hasOption(POINT_AREA)) {

						throw new ArgumentException("Can't both map and have a defined point area!");

					} else {

						// use defaults

					}

					// //////////////
					// ---AREAS---//
					// //////////////

					// ---AREA COLOR---//

					if (kmlRenderArguments.hasOption(AREA_COLOR)) {

						settings.kmlRendererSettings.areaColor = kmlRenderArguments.getRealArrayOption(AREA_COLOR);

					}

					// ---AREA ALPHA---//

					if (kmlRenderArguments.hasOption(AREA_ALPHA)) {

						settings.kmlRendererSettings.areaAlpha = kmlRenderArguments.getRealOption(AREA_ALPHA);

					}

					// //////////////
					// ---COUNTS---//
					// //////////////

					// ---COUNT COLOR---//

					if (kmlRenderArguments.hasOption(COUNT_COLOR)) {

						settings.kmlRendererSettings.countColor = kmlRenderArguments.getRealArrayOption(COUNT_COLOR);

					}

					// /////////////
					// ---LINES---//
					// /////////////

					// ---LINES SUBSET---//

					if (kmlRenderArguments.hasOption(LINES_SUBSET)) {

						settings.kmlRendererSettings.linesSubset = kmlRenderArguments.getStringOption(LINES_SUBSET);

						if (kmlRenderArguments.hasOption(LINES_CUTOFF)) {

							settings.kmlRendererSettings.linesCutoff = kmlRenderArguments.getRealOption(LINES_CUTOFF);

						} else if (kmlRenderArguments.hasOption(LINES_VALUE)) {

							settings.kmlRendererSettings.linesValue = kmlRenderArguments.getStringOption(LINES_VALUE);

						} else {

							throw new ArgumentException("Can't create a subset from these options!");

						}

					} // END: option check

					// ---LINE COLOR---//

					if (kmlRenderArguments.hasOption(LINE_COLOR_MAPPING)) {

						settings.kmlRendererSettings.lineColorMapping = kmlRenderArguments
								.getStringOption(LINE_COLOR_MAPPING);

						if (kmlRenderArguments.hasOption(LINE_COLORS)) {
							settings.kmlRendererSettings.lineColors = kmlRenderArguments.getStringOption(LINE_COLORS);
						}

					} else if (kmlRenderArguments.hasOption(LINE_COLOR)) {

						settings.kmlRendererSettings.lineColor = kmlRenderArguments.getRealArrayOption(LINE_COLOR);

					} else if (kmlRenderArguments.hasOption(LINE_COLOR_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_COLOR)) {

						throw new ArgumentException("Can't both map and have a defined line color!");

					} else {

						// use defaults

					}

					// ---LINE ALPHA---//

					if (kmlRenderArguments.hasOption(LINE_ALPHA_MAPPING)) {

						settings.kmlRendererSettings.lineAlphaMapping = kmlRenderArguments
								.getStringOption(LINE_ALPHA_MAPPING);

					} else if (kmlRenderArguments.hasOption(LINE_ALPHA)) {

						settings.kmlRendererSettings.lineAlpha = kmlRenderArguments.getRealOption(LINE_ALPHA);
						settings.kmlRendererSettings.lineAlphaChanged = true;

					} else if (kmlRenderArguments.hasOption(LINE_ALPHA_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_ALPHA)) {

						throw new ArgumentException("Can't both map and have a defined line alpha!");

					} else {

						// use defaults

					}

					// ---LINE WIDTH---//

					if (kmlRenderArguments.hasOption(LINE_WIDTH_MAPPING)) {

						settings.kmlRendererSettings.lineWidthMapping = kmlRenderArguments
								.getStringOption(LINE_WIDTH_MAPPING);

					} else if (kmlRenderArguments.hasOption(LINE_WIDTH)) {

						settings.kmlRendererSettings.lineWidth = kmlRenderArguments.getRealOption(LINE_WIDTH);

					} else if (kmlRenderArguments.hasOption(LINE_WIDTH_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_WIDTH)) {

						throw new ArgumentException("Can't both map and have a defined line altitude!");

					} else {

						// use defaults

					}

					// ---LINE ALTITUDE---//

					if (kmlRenderArguments.hasOption(LINE_ALTITUDE_MAPPING)) {

						settings.kmlRendererSettings.lineAltitudeMapping = kmlRenderArguments
								.getStringOption(LINE_ALTITUDE_MAPPING);

					} else if (kmlRenderArguments.hasOption(LINE_ALTITUDE)) {

						settings.kmlRendererSettings.lineAltitude = kmlRenderArguments.getRealOption(LINE_ALTITUDE);

					} else if (kmlRenderArguments.hasOption(LINE_ALTITUDE_MAPPING)
							&& kmlRenderArguments.hasOption(LINE_ALTITUDE)) {

						throw new ArgumentException("Can't both map and have a defined line altitude!");

					} else {

						// use defaults

					}

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), kmlRenderArguments, e);
				} // END: try-catch

				// ---RUN---//

				try {

					Reader reader = new FileReader(settings.kmlRendererSettings.json);
					Gson gson = new GsonBuilder().create();
					SpreadData input = gson.fromJson(reader, SpreadData.class);

					KmlRenderer renderer = new KmlRenderer(input, settings.kmlRendererSettings);
					renderer.render();

					System.out.println("Rendered KML.");

				} catch (KmlException e) {

					gracefullyExit(e.getMessage(), kmlRenderArguments, e);

				} catch (IOException e) {

					gracefullyExit(e.getMessage(), kmlRenderArguments, e);
					//
					// } catch (MissingAttributeException e) {
					//
					// gracefullyExit(e.getMessage(), kmlRenderArguments, e);

					// } catch (AnalysisException e) {
					//
					// gracefullyExit(e.getMessage(), kmlRenderArguments, e);

				} // END: Exception handling

			} else if (settings.d3) { // ---D3 RENDERING---//

				// ---PARSE---//

				try {

					d3RenderArguments.parseArguments(otherArgs);

					// ---INTERROGATE---//

					settings.d3RendererSettings = new D3RendererSettings();

					if (d3RenderArguments.hasOption(JSON)) {

						settings.d3RendererSettings.json = d3RenderArguments.getStringOption(JSON);

					} else {

						throw new ArgumentException("Required argument " + JSON + " is missing.");

					} // END: option check

					if (d3RenderArguments.hasOption(OUTPUT)) {

						settings.d3RendererSettings.output = d3RenderArguments.getStringOption(OUTPUT);

					}

				} catch (ArgumentException e) {
					gracefullyExit(e.getMessage(), d3RenderArguments, e);
				} // END: Exception handling

				// ---RUN---//

				try {

					D3Renderer d3Renderer = new D3Renderer(settings.d3RendererSettings);
					d3Renderer.render();

					System.out.println("Rendered D3.");

				} catch (IOException e) {

					gracefullyExit(e.getMessage(), d3RenderArguments, e);

				} // END: Exception handling

			} else {

				throw new RuntimeException("Should never get here!");

			} // END: rendering type check

		} // END: create / render / read check

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
