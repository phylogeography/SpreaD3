package app;

import java.util.ArrayList;
import java.util.Arrays;

import utils.Arguments;
import utils.Utils;

public class Spread2ConsoleApp {

	private Arguments analysisTypeArguments;
	
	private Arguments continuousTreeArguments;
	
	
	private static final String HELP = "help";

	private static final String ANALYSIS_TYPE = "analysis";
	private static final String CONTINUOUS_TREE = "continuousTree";
	private static final String DISCRETE_TREE = "discreteTree";

	private static final String TREE_FILE = "treeFile";
	private static final String TRAIT = "trait";
	private static final String HPD = "hpd";
	
	
	public Spread2ConsoleApp() {

		// //////////////////
		// ---DEFINITION---//
		// //////////////////

		analysisTypeArguments = new Arguments(new Arguments.Option[] {

				new Arguments.Option(HELP, "print this information and exit"),

				new Arguments.StringOption(ANALYSIS_TYPE, new String[] {
						CONTINUOUS_TREE, //
						DISCRETE_TREE //
						}, false, "specify analysis type"),

		});

		
		continuousTreeArguments = new Arguments(new Arguments.Option[] {

				new Arguments.Option(HELP, "print this information and exit"),

                new Arguments.StringOption(TREE_FILE, "",
                        "path to the tree file"),

                        new Arguments.StringOption(TRAIT, "",
                                "location attribute name"),
                                
                                new Arguments.StringOption(HPD, "tree file",
                                        "HPD attribute name"),
                        
		});
		
		
	}// END: Constructor

	
//	private void parseAnalysisType(String[] args) {
//		
//	}
	
	public void run(String[] args) {

		try {

			String SPLIT_ANALYSIS_TYPE = ":";
			
            // ////////////////////////
            // ---SPLIT ARGUMENTS ---//
            // ////////////////////////
			
            int from = 0;
            int to = 0;
            
            ArrayList<String[]> argsList = new ArrayList<String[]>();
            
            for (String arg : args) {

                if (arg.equalsIgnoreCase(SPLIT_ANALYSIS_TYPE)) {
                    argsList.add(Arrays.copyOfRange(args, from, to));
                    from = to + 1;
                }// END: split check

                to++;
            }// END: args loop

            // add the remainder
            argsList.add(Arrays.copyOfRange(args, from, args.length));
            
            if (args[0].contains(HELP)) {

                gracefullyExit(null);
                
            } else if (argsList.size() == 0) {
            	
            	 gracefullyExit("Empty or incorrect arguments list.");
            	 
            } else if(argsList.size() > 2) { 
            	
            	gracefullyExit("Arguments list is too long.");
            	
            } else {
            	
            	//
            	
            }// END: failed split check
            
			// ////////////////////////////////////
			// ---PARSE ANALYSIS TYPE ARGUMENT---//
			// ////////////////////////////////////
            
            analysisTypeArguments.parseArguments(argsList.get(0));
            
			// ///////////////////
			// ---INTERROGATE---//
			// ///////////////////
            
			String option = null;

			// Analysis type
			if (analysisTypeArguments.hasOption(ANALYSIS_TYPE)) {

				option = analysisTypeArguments.getStringOption(ANALYSIS_TYPE);

				if (option.equalsIgnoreCase(CONTINUOUS_TREE)) {

					//TODO: parse cont tree arguments
					System.out.println(CONTINUOUS_TREE);

				} else if (option.equalsIgnoreCase(DISCRETE_TREE)) {

					//TODO: parse discrete tree arguments
					System.out.println(DISCRETE_TREE);
					
				} else {

					gracefullyExit("Unrecognized option.");

				}// END: option check

			}// END: ANALYSIS_TYPE option check
            
            
            
            
			
			
			


			// ////////////////////
			// ---RUN ANALYSIS---//
			// ////////////////////

            System.out.println("Finito");
            
		} catch (Exception e) {

			System.out.println(e.getMessage());

			System.out.println();
			printUsage(analysisTypeArguments);
			System.out.println();

			if (Spread2App.DEBUG) {
				e.printStackTrace();
			}
			System.exit(1);

		}// END: try-catch block

	}// END: run

	private void gracefullyExit(String message) {
		if (message != null) {
			System.out.println(message);
			System.out.println();
		}

		printUsage(analysisTypeArguments);

		System.exit(0);
	}// END: gracefullyExit

	private void printUsage(Arguments arguments) {

		 arguments.printUsage("", "");
		
	}// END: printUsage

}// END: class
