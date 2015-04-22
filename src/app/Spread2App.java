package app;

import java.util.Locale;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class Spread2App {

	public static final boolean DEBUG = true;
	
	public static final String SHORT_NAME = "SPREAD2";
	public static final String LONG_NAME = "Spatial Phylogenetic Reconstruction Of Evolutionary Dynamics 2";
    private static final String VERSION = "2.0.0rc";
    private static final String DATE_STRING = "2015";
	
	public static void main(String[] args) {
		
		 Locale.setDefault(Locale.US);
			
			if (args.length > 0) {
				
				Spread2ConsoleApp cli = new Spread2ConsoleApp();
				cli.run(args);
				
			} else {
				
				Spread2UIApp gui = new Spread2UIApp();
				
			}

	}//END: main

}//END: class
