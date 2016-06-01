package gui.panels;

import gui.DateEditor;
import gui.InterfaceUtils;
import gui.LocationCoordinatesEditor;
import gui.MainFrame;
import gui.SimpleFileFilter;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.LinkedHashSet;

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JSlider;
import javax.swing.JTextField;
import javax.swing.SwingWorker;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import parsers.DiscreteTreeSpreadDataParser;
import settings.parsing.DiscreteTreeSettings;
import structure.data.SpreadData;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@SuppressWarnings({ "rawtypes", "serial" })
public class DiscreteTreePanel extends SpreadPanel {

	private MainFrame frame;
	private DiscreteTreeSettings settings;

	// Buttons
	private JButton loadTree;
	private boolean loadTreeCreated = false;
	private JButton setupLocationCoordinates;
	private boolean setupLocationCoordinatesCreated = false;
	private JButton loadGeojson;
	private boolean loadGeojsonCreated = false;
	private JButton output;
	private boolean outputCreated = false;

	// Combo boxes
	private JComboBox locationAttributeSelector;
	private boolean locationAttributeSelectorCreated = false;

	// Date editor
	private DateEditor dateEditor;
	private boolean dateEditorCreated = false;

	// Text fields
	private JTextField timescaleMultiplier;
	private boolean timescaleMultiplierCreated = false;

	// Sliders
	private JSlider intervals;
	private boolean intervalsCreated = false;

	public DiscreteTreePanel(MainFrame frame) {

		this.frame = frame;
		populatePanel();

	}// END: Constructor

	public void populatePanel() {

		settings = new DiscreteTreeSettings();
		resetFlags();

		if (!loadTreeCreated) {
			loadTree = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.TREE_ICON));
			loadTree.addActionListener(new ListenLoadTree());
			addComponentWithLabel("Load tree file:", loadTree);
			loadTreeCreated = true;
		}

	}// END: populateDiscreteTreePanels

	private void resetFlags() {

		loadTreeCreated = false;
		locationAttributeSelectorCreated = false;
		setupLocationCoordinatesCreated = false;
		dateEditorCreated = false;
		intervalsCreated = false;
		loadGeojsonCreated = false;
		outputCreated = false;

	}// END: resetDiscreteTreeFlags

	private void resetUISettings() {

		settings.locationsList = null;

	}// END: resetUISettings

	private class ListenLoadTree implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] treeFiles = new String[] { "tre", "tree", "trees" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading tree file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(treeFiles,
						"Tree files (*.tree(s), *.tre)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils
						.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					// if tree reloaded reset components below
					removeChildComponents(loadTree);
					resetFlags();
					
					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.treeFilename = filename;
					frame.setStatus(settings.treeFilename + " selected.");

					populateLocationAttributeCombobox();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenOpenTree

	private void populateLocationAttributeCombobox() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			@SuppressWarnings("unchecked")
			public Void doInBackground() {

				try {

					RootedTree rootedTree = Utils
							.importRootedTree(settings.treeFilename);
					settings.rootedTree = rootedTree;

				} catch (IOException e) {

					String message = "I/O Exception occured when importing tree. I suspect wrong or malformed tree file.";
					InterfaceUtils.handleException(e, message);

				} catch (ImportException e) {

					String message = "Import exception occured when importing tree. I suspect wrong or malformed tree file.";
					InterfaceUtils.handleException(e, message);

				}

				LinkedHashSet<String> uniqueAttributes = new LinkedHashSet<String>();

				for (Node node : settings.rootedTree.getNodes()) {
					if (!settings.rootedTree.isRoot(node)) {

						uniqueAttributes.addAll(node.getAttributeNames());

					} // END: root check
				} // END: nodeloop

				// re-initialise combobox
				if (!locationAttributeSelectorCreated) {

					locationAttributeSelector = new JComboBox();
					ComboBoxModel locationAttributeSelectorModel = new DefaultComboBoxModel(
							uniqueAttributes.toArray(new String[0]));
					locationAttributeSelector
							.setModel(locationAttributeSelectorModel);
//					locationAttributeSelector
//							.addItemListener(new ListenLocationAttributeSelector());
					locationAttributeSelector
					.addActionListener(new ListenLocationAttributeSelector());
					
					
					addComponentWithLabel("Select location attribute",
							locationAttributeSelector);
					locationAttributeSelectorCreated = true;
				}

				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {

				frame.setStatus("Opened " + settings.treeFilename + "\n");
				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END: populateLocationAttributeCombobox

	private class ListenLocationAttributeSelector implements ActionListener {

		@Override
		public void actionPerformed(ActionEvent event) {

			// if selection changed reparse everything below
			removeChildComponents(locationAttributeSelector);
			resetFlags();
			
			   JComboBox<?> comboBox = (JComboBox<?>) event.getSource();
			   Object item = comboBox.getSelectedItem();
			   
				String locationAttribute = item.toString();

				if (!setupLocationCoordinatesCreated) {

					// erase locationsList
					resetUISettings();

					setupLocationCoordinates = new JButton(
							"Setup",
							InterfaceUtils
									.createImageIcon(InterfaceUtils.LOCATIONS_ICON));

					setupLocationCoordinates
							.addActionListener(new ListenOpenLocationCoordinatesEditor());

					addComponentWithLabel(
							"Setup location coordinates:",
							setupLocationCoordinates);

					setupLocationCoordinatesCreated = true;
				}

				settings.locationAttributeName = locationAttribute;
				frame.setStatus("Location attribute '" + locationAttribute
						+ "'" + " selected");
			
		}
		
//		@Override
//		public void itemStateChanged(ItemEvent event) {
//			if (event.getStateChange() == ItemEvent.SELECTED) {
//
//				// if selection changed reparse everything below
//				removeChildComponents(locationAttributeSelector);
//				resetFlags();
//
//				Object item = event.getItem();
//				String locationAttribute = item.toString();
//
//				if (!setupLocationCoordinatesCreated) {
//
//					// erase locationsList
//					resetUISettings();
//
//					setupLocationCoordinates = new JButton(
//							"Setup",
//							InterfaceUtils
//									.createImageIcon(InterfaceUtils.LOCATIONS_ICON));
//
//					setupLocationCoordinates
//							.addActionListener(new ListenOpenLocationCoordinatesEditor());
//
//					addComponentWithLabel(
//							"Setup location coordinates:",
//							setupLocationCoordinates);
//
//					setupLocationCoordinatesCreated = true;
//				}
//
//				settings.locationAttributeName = locationAttribute;
//				frame.setStatus("Location attribute '" + locationAttribute
//						+ "'" + " selected");
//
//			} // END: selected check
//		}// END: itemStateChanged


	}// END: ListenParserSelector

	private class ListenOpenLocationCoordinatesEditor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			LocationCoordinatesEditor locationCoordinatesEditor = new LocationCoordinatesEditor(
					frame, false);
			locationCoordinatesEditor.launch(settings);

			if (locationCoordinatesEditor.isEdited()) {

				populateOptionalSettings();

			} // END: edited check

		}// END: actionPerformed
	}// END: ListenOpenLocations

	private void populateOptionalSettings() {

		if (!dateEditorCreated) {
			dateEditor = new DateEditor();
			addComponentWithLabel("Most recent sampling date:", dateEditor);
			dateEditorCreated = true;
		}

		if (!timescaleMultiplierCreated) {
			timescaleMultiplier = new JTextField(
					String.valueOf(settings.timescaleMultiplier), 10);
			addComponentWithLabel("Time scale multiplier:", timescaleMultiplier);
			timescaleMultiplierCreated = true;
		}

		if (!loadGeojsonCreated) {
			loadGeojson = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.GEOJSON_ICON));
			loadGeojson.addActionListener(new ListenLoadGeojson());
			addComponentWithLabel("Load GeoJSON file:", loadGeojson);
			loadGeojsonCreated = true;
		}

		if (!intervalsCreated) {
			intervals = new JSlider(JSlider.HORIZONTAL, 1, 100,
					settings.intervals);
			// TODO: label table instead of spacing
			intervals.setMajorTickSpacing(20);
			intervals.setPaintTicks(true);
			intervals.setPaintLabels(true);
			intervals.addChangeListener(new ListenIntervals());
			addComponentWithLabel("Number of intervals:", intervals);
			intervalsCreated = true;
		}

		if (!outputCreated) {
			output = new JButton("Output",
					InterfaceUtils.createImageIcon(InterfaceUtils.SAVE_ICON));
			output.addActionListener(new ListenOutput());
			addComponentWithLabel("Generate JSON:", output);
			outputCreated = true;
		}

	}// END: populateOptionalSettings

	private class ListenIntervals implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSlider source = (JSlider) ev.getSource();
			if (!source.getValueIsAdjusting()) {

				int value = (int) source.getValue();
				settings.intervals = value;
				frame.setStatus("Selected " + value + " intervals.");

			} // END: adjusting check
		}// END: stateChanged

	}// END: ListenIntervals

	private class ListenLoadGeojson implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] geojsonFiles = new String[] { "json", "geo", "geojson" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading geoJSON file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(
						geojsonFiles, "geoJSON files (*.json), *.geojson)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils
						.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String geojsonFilename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.geojsonFilename = geojsonFilename;

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenOpenTree

	private class ListenOutput implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			JFileChooser chooser = new JFileChooser();
			chooser.setDialogTitle("Generate...");
			chooser.setMultiSelectionEnabled(false);
			chooser.setCurrentDirectory(frame.getWorkingDirectory());

			int returnVal = chooser.showSaveDialog(InterfaceUtils
					.getActiveFrame());
			if (returnVal == JFileChooser.APPROVE_OPTION) {

				File file = chooser.getSelectedFile();
				settings.outputFilename = file.getAbsolutePath();

				collectOptionalSettings();
				generateOutput();

				File tmpDir = chooser.getCurrentDirectory();
				if (tmpDir != null) {
					frame.setWorkingDirectory(tmpDir);
				}

			} // END: approve check

		}// END: actionPerformed
	}// END: ListenOutput

	private void collectOptionalSettings() {

		// settings.intervals = Integer.valueOf(intervals.getText());
		settings.timescaleMultiplier = Double.valueOf(timescaleMultiplier
				.getText());
		settings.mrsd = dateEditor.getValue();

	}// END: collectSettings

	private void generateOutput() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					DiscreteTreeSpreadDataParser parser = new DiscreteTreeSpreadDataParser(
							settings);
					SpreadData data = parser.parse();

					Gson gson = new GsonBuilder().setPrettyPrinting().create();
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
