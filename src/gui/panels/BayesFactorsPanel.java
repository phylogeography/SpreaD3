package gui.panels;

import exceptions.AnalysisException;
import gui.InterfaceUtils;
import gui.LocationCoordinatesEditor;
import gui.MainFrame;
import gui.SimpleFileFilter;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JSlider;
import javax.swing.SwingWorker;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import parsers.BayesFactorSpreadDataParser;
import parsers.LogParser;
import settings.parsing.BayesFactorsSettings;
import structure.data.SpreadData;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@SuppressWarnings("serial")
public class BayesFactorsPanel extends SpreadPanel {

	private BayesFactorsSettings settings;
	private MainFrame frame;

	// Buttons
	private JButton loadLog;
	private boolean loadLogCreated = false;
	private JButton setupLocationCoordinates;
	private boolean setupLocationCoordinatesCreated = false;
	private JButton loadGeojson;
	private boolean loadGeojsonCreated = false;
	private JButton output;
	private boolean outputCreated = false;
	
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
			burninPercentCreated = true;
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
		loadGeojsonCreated = false;
		outputCreated = false;
		
	}// END: resetFlags

	private class ListenBurninPercent implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSlider source = (JSlider) ev.getSource();
			if (!source.getValueIsAdjusting()) {
				
				int value = (int) source.getValue();
				settings.burninPercent = (double) value;
				frame.setStatus("Selected " + value + " as burn-in %.");
				
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

					// if log reloaded reset components below
					removeChildComponents(loadLog);
					resetFlags();
					
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
				
				} catch (AnalysisException e) {
					
					InterfaceUtils.handleException(e, e.getMessage());
				
				}//END: try-catch

				if (!setupLocationCoordinatesCreated) {

					setupLocationCoordinates = new JButton("Setup",
							InterfaceUtils.createImageIcon(InterfaceUtils.LOCATIONS_ICON));

					setupLocationCoordinates.addActionListener(new ListenOpenLocationCoordinatesEditor());

					addComponentWithLabel("Setup location attribute coordinates:", setupLocationCoordinates);

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

			LocationCoordinatesEditor locationCoordinatesEditor = new LocationCoordinatesEditor(frame, true);
			locationCoordinatesEditor.launch(settings);

			if (locationCoordinatesEditor.isEdited()) {

				// remaining optional settings
				
				if (!loadGeojsonCreated) {
					loadGeojson = new JButton("Load", InterfaceUtils.createImageIcon(InterfaceUtils.GEOJSON_ICON));
					loadGeojson.addActionListener(new ListenLoadGeojson());
					addComponentWithLabel("Load GeoJSON file:", loadGeojson);
					loadGeojsonCreated = true;
				}
				
				if (!outputCreated) {
					output = new JButton("Output", InterfaceUtils.createImageIcon(InterfaceUtils.SAVE_ICON));
					output.addActionListener(new ListenOutput());
					addComponentWithLabel("Generate output:", output);
					outputCreated = true;
				}
				
			} // END: edited check

		}// END: actionPerformed
	}// END: ListenOpenLocationCoordinatesEditor

	
	private class ListenLoadGeojson implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] geojsonFiles = new String[] { "json", "geo", "geojson" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading geoJSON file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(
						new SimpleFileFilter(geojsonFiles, "geoJSON files (*.json), *.geojson)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String geojsonFilename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.geojsonFilename = geojsonFilename;
					// populateLocationAttributeCombobox(discreteTreeSettings.treeFilename);

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenLoadGeojson
	
	private class ListenOutput implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			JFileChooser chooser = new JFileChooser();
			chooser.setDialogTitle("Generate...");
			chooser.setMultiSelectionEnabled(false);
			chooser.setCurrentDirectory(frame.getWorkingDirectory());

			int returnVal = chooser.showSaveDialog(InterfaceUtils.getActiveFrame());
			if (returnVal == JFileChooser.APPROVE_OPTION) {

				File file = chooser.getSelectedFile();
				settings.outputFilename = file.getAbsolutePath();

//				collectSettings();
				generateOutput();

				File tmpDir = chooser.getCurrentDirectory();
				if (tmpDir != null) {
					frame.setWorkingDirectory(tmpDir);
				}

			} // END: approve check

		}// END: actionPerformed
	}// END: ListenOutput
	
	private void generateOutput() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					BayesFactorSpreadDataParser parser = new BayesFactorSpreadDataParser(settings);
					SpreadData data = parser.parse();
					Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().setPrettyPrinting().create();
					
					String s = gson.toJson(data);

					File file = new File(settings.outputFilename);
					FileWriter fw;
					fw = new FileWriter(file);
					fw.write(s);
					fw.close();

					System.out.println("Created JSON file");

				} catch (Exception e) {

					InterfaceUtils.handleException(e, e.getMessage());
					frame.setStatus("Exception occured.");
					frame.setIdle();

				} // END: try-catch

				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {

				frame.setStatus("Generated " + settings.outputFilename);
				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END: generateOutput
	
}// END: class
