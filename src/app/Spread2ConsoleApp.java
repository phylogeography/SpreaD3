package app;

import java.util.ArrayList;
import java.util.Arrays;

import exceptions.AnalysisTypeArgumentsException;

import settings.ContinuousTreeSettings;
import settings.DiscreteTreeSettings;
import settings.Settings;
import test.ContinuousTreeTest;
import utils.Arguments;
import utils.Arguments.ArgumentException;
import utils.Utils;

public class Spread2ConsoleApp {

	private Arguments	modeArguments;
	private Arguments	otherArguments;
	
	
	
	private static final String HELP = "help";
	private static final String READ = "read";
	private static final String CREATE = "create";
	
	private static final String TREE = "tree";
	private static final String TREES = "trees";
	private static final String LOCATIONS = "locations";
	private static final String LOG = "log";
	private static final String TRAIT = "trait";
	private static final String HPD = "hpd";
	private static final String INTERVALS = "intervals";
	
	
//	private Arguments args1 = new Arguments(new Arguments.Option[] {
//			
//			new Arguments.Option(HELP, "print this information and exit"),
//			
//            new Arguments.StringOption("mode",
//                    new String[]{"read", //
//                            "create", //
//                    }, false, "specify mode"),
//			
//			new Arguments.StringOption("input",
//                    new String[]{"read", //
//                            "create", //
//                    }, false, "specify mode")
//			
//			
//			
//	});
	
	
	public Spread2ConsoleApp() {

		// //////////////////
		// ---DEFINITION---//
		// //////////////////

			modeArguments = new Arguments(new Arguments.Option[] {

				new Arguments.Option(HELP, "print this information and exit"),

				new Arguments.Option(READ, "read existing JSON file"),
				
				new Arguments.Option(CREATE, "create JSON from input files"),
				
		});
		
		
//			otherArguments = new Arguments(new Arguments.Option[] {
//
//					new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),
//					
//					new Arguments.StringOption(TREE, "", "tree file name"),
//					
//					new Arguments.StringOption(TRAIT, "", "location trait name"),
//					
//					new Arguments.IntegerOption(INTERVALS, "number of time intervals"),
//					
//			});

			Arguments	arg1 = new Arguments(new Arguments.Option[] {

					new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),
					
					new Arguments.StringOption(TREE, "", "tree file name"),
					
					new Arguments.StringOption(TRAIT, "", "location trait name"),
					
					new Arguments.IntegerOption(INTERVALS, "number of time intervals"),
					
			});
		
			Arguments	arg2 = new Arguments(new Arguments.Option[] {

					new Arguments.StringOption(LOCATIONS, "", "location coordinates file"),
					
					new Arguments.StringOption(LOG, "", "tree file name"),
					
			});
			
			Arguments	arg3 = new Arguments(new Arguments.Option[] {

					new Arguments.StringOption(TREE, "", "tree file name"),
					
					new Arguments.StringOption(TRAIT, "", "location trait name"),
					
					new Arguments.IntegerOption(HPD, "hpd interval attribute name"),
					
			});
		
			
			Arguments	arg4 = new Arguments(new Arguments.Option[] {

                    new Arguments.StringOption("timeLine",
                            new String[]{"tree", //
                                    "file", //
                            }, false, "how to create time intervals"),
					
					new Arguments.StringOption(TREES, "", "trees file name"),
					
					new Arguments.StringOption("file", "", "time intervals file name"),
					
			});
			
	}// END: Constructor

	public void run(String[] args) {

		if(args[0].contains(HELP)){
			gracefullyExit(null, modeArguments);
		} else if (args.length == 0) {
            gracefullyExit("Empty or incorrect arguments list.", null);
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
//		Utils.printArray(modeArgs);
		
		Settings settings = new Settings();
		try {
			
			modeArguments.parseArguments(modeArgs);
			
		} catch (ArgumentException e) {
			gracefullyExit("", modeArguments);
		}
		
		// ---INTERROGATE---//
		
		if (modeArguments.hasOption(HELP)) {

			gracefullyExit(null, modeArguments);
			
		}
		
		if(modeArguments.hasOption(CREATE)) {
			
			System.out.println("In create mode");
			settings.create = true;
			
		} else if(modeArguments.hasOption(READ)) {
			
			System.out.println("In read mode");
			settings.read = true;
			
		} else {
			
			gracefullyExit("Unrecognized option", modeArguments);
			
		}//END: mode check
		
		
		
		//---PARSE---//
		
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
				
				//TODO: print discrete usage options
				gracefullyExit("Unrecognized option", null);
				
			}//END: tree/log input check
			
		} else {
			
			Utils.printArray(Arrays.asList(otherArgs).toArray());
			
			System.out.println("In Continuous mode");
			
			if(Arrays.asList(otherArgs).contains(TREES)) {
				
				System.out.println("In time slicer mode");
				settings.timeSlicer = true;
				
			} else {
				
				System.out.println("In Continuous tree mode");
				settings.continuousTree = true;
				
			}//END: continuous modes
			
		}//END: get intent logic 
			
		
		
		
		
		
		
		
		
		// ---INTERROGATE---//
		
		
		

		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		

	}// END: run

	private void gracefullyExit(String message, Arguments arguments) {

		if(Spread2App.DEBUG){
			
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
