package gui.panels;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;
import java.util.LinkedHashSet;

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JSlider;
import javax.swing.SwingWorker;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import gui.InterfaceUtils;
import gui.LocationCoordinatesEditor;
import gui.MainFrame;
import gui.SimpleFileFilter;
import jam.panels.OptionsPanel;
import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import parsers.LogParser;
import settings.parsing.BayesFactorsSettings;
import utils.Utils;

@SuppressWarnings("serial")
public class BayesFactorsPanel extends OptionsPanel {

	private BayesFactorsSettings settings;
	private MainFrame frame;

	// Buttons
	private JButton loadLog;
	private boolean loadLogCreated = false;
	private JButton setupLocationCoordinates;
	private boolean setupLocationCoordinatesCreated = false;
	
	// Sliders
	private JSlider burninPercent;
	private boolean burninPercentCreated = false;

	public BayesFactorsPanel(MainFrame frame) {

		this.frame = frame;
		populatePanel();

	}// END: Constructor

	private void populatePanel() {

		settings = new BayesFactorsSettings();
		resetFlags();

		if (!burninPercentCreated) {
			burninPercent = new JSlider(JSlider.HORIZONTAL, 0, 90, settings.burninPercent.intValue());
			burninPercent.setMajorTickSpacing(20);
			burninPercent.setPaintTicks(true);
			burninPercent.setPaintLabels(true);
			burninPercent.addChangeListener(new ListenBurninPercent());
			addComponentWithLabel("Disregard as burn-in (%):", burninPercent);
		}

		if (!loadLogCreated) {
			loadLog = new JButton("Load", InterfaceUtils.createImageIcon(InterfaceUtils.LOG_ICON));
			loadLog.addActionListener(new ListenLoadLog());
			addComponentWithLabel("Load log file:", loadLog);
			loadLogCreated = true;
		}

	}// END: populatePanel

	private void resetFlags() {

		loadLogCreated = false;
		burninPercentCreated = false;
		setupLocationCoordinatesCreated = false;
		
	}// END: resetFlags

	private class ListenBurninPercent implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSlider source = (JSlider) ev.getSource();
			if (!source.getValueIsAdjusting()) {
				int value = (int) source.getValue();
				settings.burninPercent = (double) value;
			} // END: adjusting check
		}// END: stateChanged

	}// END: ListenBurninPercent

	private class ListenLoadLog implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] logFiles = new String[] { "log" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading tree file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(logFiles, "Log files (*.log)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.logFilename = filename;
					frame.setStatus(settings.logFilename + " selected.");

					importIndicators();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed

	}// END: ListenLoadLog

	private void importIndicators() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					LogParser logParser = new LogParser(settings.logFilename, settings.burninPercent);
					Double[][] indicators = logParser.parseIndicators();
					settings.indicators = indicators;

				} catch (IOException e) {
					String message = "I/O Exception occured when importing log file " + settings.logFilename
							+ ". I suspect wrong or malformed tree file.";
					InterfaceUtils.handleException(e, message);
				}

				//TODO: coordinates editor with exact number of rows
				if (!setupLocationCoordinatesCreated) {
					
					setupLocationCoordinates = new JButton("Setup",
							InterfaceUtils
									.createImageIcon(InterfaceUtils.LOCATIONS_ICON));
					
					setupLocationCoordinates
							.addActionListener(new ListenOpenLocationCoordinatesEditor());
					
					addComponentWithLabel(
							"Setup location attribute coordinates:",
							setupLocationCoordinates);
					
					setupLocationCoordinatesCreated = true;
				}
				
				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {

				frame.setStatus("Opened " + settings.logFilename + "\n");
				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END: populateIndicatorsAttributeCombobox

	
	
	
	private class ListenOpenLocationCoordinatesEditor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			LocationCoordinatesEditor locationCoordinatesEditor = new LocationCoordinatesEditor(
					frame);
			
			locationCoordinatesEditor.launch(settings);
//			if (locationCoordinatesEditor.isEdited()) {
//				
//			}
			
			
			}//END: actionPerformed
		}//END: ListenOpenLocationCoordinatesEditor
	
	
	
	
	
}// END: class
