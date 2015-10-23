package gui;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Insets;
import java.io.File;
import java.io.IOException;

import jam.framework.DocumentFrame;

import javax.swing.Action;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JProgressBar;
import javax.swing.JTabbedPane;
import javax.swing.plaf.BorderUIResource;

import app.Spread2App;
import settings.Settings;


public class MainFrame extends DocumentFrame implements FileMenuHandler {

	private Settings settings;
	
	// tabs, there shall be two
    private JTabbedPane tabbedPane = new JTabbedPane();
    
    private final String DATA_TAB_NAME = "Data";
    private DataPanel dataPanel;
    
    
    // labels
    private JLabel statusLabel;
    private JProgressBar progressBar;
    
	public MainFrame(String title)  {

        super();

        setTitle(title);
	    settings =  new Settings();
        
	}//END: Constructor

	
	@Override
	protected void initializeComponents() {

        setSize(new Dimension(1300, 600));
        setMinimumSize(new Dimension(260, 100));
		
		
        dataPanel = new DataPanel(this, settings);
        tabbedPane.addTab(DATA_TAB_NAME, null, dataPanel);
		
        
        statusLabel = new JLabel("Welcome to " + Spread2App.SHORT_NAME);

        JPanel progressPanel = new JPanel(new BorderLayout(0, 0));
        progressBar = new JProgressBar();
        progressPanel.add(progressBar, BorderLayout.CENTER);

        JPanel statusPanel = new JPanel(new BorderLayout(0, 0));
        statusPanel.add(statusLabel, BorderLayout.CENTER);
        statusPanel.add(progressPanel, BorderLayout.EAST);
        statusPanel.setBorder(new BorderUIResource.EmptyBorderUIResource(
                new Insets(0, 6, 0, 6)));

        JPanel tabbedPanePanel = new JPanel(new BorderLayout(0, 0));
        tabbedPanePanel.add(tabbedPane, BorderLayout.CENTER);
        tabbedPanePanel.add(statusPanel, BorderLayout.SOUTH);
        tabbedPanePanel.setBorder(new BorderUIResource.EmptyBorderUIResource(
                new Insets(12, 12, 12, 12)));

        getContentPane().setLayout(new java.awt.BorderLayout(0, 0));
        getContentPane().add(tabbedPanePanel, BorderLayout.CENTER);

        tabbedPane.setSelectedComponent(dataPanel);
        
        
	}//END: initializeComponents
	
    // /////////////////
    // ---MAIN MENU---//
    // /////////////////
	
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
