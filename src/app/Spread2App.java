package app;

import java.util.Locale;

import utils.FortuneCookies;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class Spread2App {

	public static final boolean DEBUG = true;
	
	public static final String SHORT_NAME = "SPREAD";
	public static final String LONG_NAME = "Spatial Phylogenetic Reconstruction Of Evolutionary Dynamics";
    public static final String VERSION = "2.0.2";
    public  static final String DATE_STRING = "2015";
    private static final String CODENAME = "Classy & Fabulous.";
    
	private static final String FILIP_BIELEJEC = "Filip Bielejec";
	private static final String GUY_BAELE = "Guy Baele";
	private static final String ANDREW_RAMBAUT = "Andrew Rambaut";
	private static final String MARC_SUCHARD = "Marc A. Suchard";
	private static final String PHILIPPE_LEMEY = "Philippe 'The Wise' Lemey";
	
	public static void main(String[] args) {
		
		 Locale.setDefault(Locale.US);
			
			if (args.length > 0) {
				
				Spread2ConsoleApp cli = new Spread2ConsoleApp();
				welcomeDialog();
				cli.run(args);
				
			} else {
				
//				Spread2UIApp gui = 
						new Spread2UIApp();
				
			}

	}//END: main

	private static void welcomeDialog() {
		
        System.out.println();
        centreLine(SHORT_NAME + " version " + VERSION + " (" + DATE_STRING + ")" + " -- " + CODENAME , 60);
        centreLine(LONG_NAME, 60);
        centreLine("Authors: " + FILIP_BIELEJEC + ", " + GUY_BAELE + ", " + ANDREW_RAMBAUT + ", " + MARC_SUCHARD + " and "  + PHILIPPE_LEMEY , 60);
        centreLine("Thanks to: Stephan Nylinder " + "", 60);
        
        System.out.println();        
        centreLine(FortuneCookies.nextCookie(), 60);
        System.out.println();
		
	}//END: welcomeDialog
	
    public static void centreLine(String line, int pageWidth) {
        int n = pageWidth - line.length();
        int n1 = n / 2;
        for (int i = 0; i < n1; i++) {
            System.out.print(" ");
        }
        System.out.println(line);
    }
	
}//END: class
