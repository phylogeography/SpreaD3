package gui;

import java.awt.Dimension;
import java.io.File;
import java.io.IOException;

import jam.framework.DocumentFrame;

import javax.swing.Action;
import javax.swing.JComponent;


public class MainFrame extends DocumentFrame implements FileMenuHandler {

	
	
	
	public MainFrame(String title)  {

        super();

        setTitle(title);
	
	}//END: Constructor

	
	@Override
	protected void initializeComponents() {

        setSize(new Dimension(1300, 600));
        setMinimumSize(new Dimension(260, 100));
		
		
		
	}//END: initializeComponents
	
	@Override
	public Action getLoadSettingsAction() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Action getSaveSettingsAction() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JComponent getExportableComponent() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	protected boolean readFromFile(File arg0) throws IOException {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	protected boolean writeToFile(File arg0) throws IOException {
		// TODO Auto-generated method stub
		return false;
	}

	
	
	
}//END: class
