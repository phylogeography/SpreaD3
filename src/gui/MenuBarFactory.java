package gui;

import jam.framework.DefaultMenuBarFactory;

public class MenuBarFactory extends DefaultMenuBarFactory {

	public MenuBarFactory() {
		
		  registerMenuFactory(new DefaultFileMenuFactory());
		  registerMenuFactory(new DefaultEditMenuFactory());
		  registerMenuFactory(new ViewMenuFactory());
		  registerMenuFactory(new DefaultHelpMenuFactory());
		  
	}//END: Constructor

}// END: class
