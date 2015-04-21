package app;

import utils.Arguments;
import data.SpreadData;

public class Spread2ConsoleApp {

	private SpreadData data;
	 private Arguments arguments;
	
	    private static final String HELP = "help";
	 
	 //TODO: move to SpreadData?
	 
	    private static final String ANALYSIS_TYPE = "analysis";
	    private static final String CONTINUOUS_TREE = "continuousTree";
	    private static final String DISCRETE_TREE = "discreteTree";
	    
	public Spread2ConsoleApp() {
		
		data = new SpreadData();
		
        // //////////////////
        // ---DEFINITION---//
        // //////////////////
		
        arguments = new Arguments(
                new Arguments.Option[]{ 
                		
                        new Arguments.Option(HELP,
                                "print this information and exit"),
                		
                        new Arguments.StringOption(ANALYSIS_TYPE,
                                new String[]{CONTINUOUS_TREE, //
                                        DISCRETE_TREE //
                                }, false, "specify analysis type"),
                		
                });
		
	}//END: Constructor
	
	
	public void run(String[] args) {
		
		 try {
			 
	            // /////////////
             // ---PARSE---//
             // /////////////		
	            if (args[0].contains(HELP)) {

	                gracefullyExit(null);

	            } else if (args.length == 0) {

	                gracefullyExit("Empty or incorrect arguments list.");

	            }// END: help check
		
		
	            arguments.parseArguments(args);
		
		
                // ///////////////////
                // ---INTERROGATE---//
                // ///////////////////
	            
	            String option = null;
	            
                // Analysis type
	            if (arguments.hasOption(ANALYSIS_TYPE)) {
	            	
	            	 option = arguments.getStringOption(ANALYSIS_TYPE);
	            	
	            	  if (option.equalsIgnoreCase(CONTINUOUS_TREE)) { 
	            		  
//	            		  SpreadData.OUTPUT_TYPE = CONTINUOUS_TREE;
	            		  
	            	  } else if (option.equalsIgnoreCase(DISCRETE_TREE)) {
	            		  
//	            		  SpreadData.OUTPUT_TYPE = DISCRETE_TREE;
	            		  
	            	  } else {
	            		  
	            		  gracefullyExit("Unrecognized option.");
	            		  
	            	  }//END: option check
	            	 
	            }//END: ANALYSIS_TYPE option check
	            
	            
	            
	            // ////////////////////
	            // ---RUN ANALYSIS---//
	            // ////////////////////
	            
	            
		
		
	        } catch (Exception e) {

	            System.out.println();
	            printUsage(arguments);
	            System.out.println();
	            System.out.println(e.getMessage());
	            e.printStackTrace();
	            System.exit(1);

	        }// END: try-catch block
		
	}//END: run

    private void gracefullyExit(String message) {
        printUsage(arguments);
        if (message != null) {
            System.out.println(message);
            System.out.println();
        }
        System.exit(0);
    }// END: gracefullyExit

	private void printUsage(Arguments arguments) {
			
		System.out.println("printUsage not yet implemented!");
		
	}//END: printUsage
	
}//END: class
