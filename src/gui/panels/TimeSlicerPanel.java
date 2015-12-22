package gui.panels;

import gui.DateEditor;
import gui.InterfaceUtils;
import gui.JSliderDouble;
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
import parsers.TimeSlicerSpreadDataParser;
import settings.parsing.TimeSlicerSettings;
import structure.data.SpreadData;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@SuppressWarnings("serial")
public class TimeSlicerPanel extends SpreadPanel {

	private MainFrame frame;
	private TimeSlicerSettings settings;

	private static final String NO_RATE = "no rate";

	// Combo boxes
	private JComboBox<Object> analysisType;
	private boolean analysisTypeCreated = false;

	// Buttons
	private JButton sliceHeights;
	private boolean sliceHeightsCreated = false;
	private JButton loadTree;
	private boolean loadTreeCreated = false;
	private JButton loadTrees;
	private boolean loadTreesCreated = false;
	private JButton loadGeojson;
	private boolean loadGeojsonCreated = false;
	private JButton output;
	private boolean outputCreated = false;

	// Combo boxes
	private LinkedHashSet<String> traitAttributes;
	private JComboBox<Object> trait;
	private boolean traitCreated = false;
	private JComboBox<Object> rrwRate;
	private boolean rrwRateCreated = false;

	// Check boxes
	// private JCheckBox hasRRWrate;
	// private boolean hasRRWrateCreated = false;

	// private JComboBox<Object> precision;
	// private boolean precisionCreated = false;

	// Panels
	// private OptionsPanel holderPanel;

	// Date editor
	private DateEditor dateEditor;
	private boolean dateEditorCreated = false;

	// Text fields
	private JTextField timescaleMultiplier;
	private boolean timescaleMultiplierCreated = false;

	// Sliders
	private JSliderDouble hpdLevel;
	private boolean hpdLevelCreated = false;
	private JSlider burnIn;
	private boolean burnInCreated = false;

	public TimeSlicerPanel(MainFrame frame) {

		this.frame = frame;
		populatePanel();

	}// END: Constructor

	private void resetFlags() {

		analysisTypeCreated = false;
		sliceHeightsCreated = false;
		loadTreeCreated = false;
		loadTreesCreated = false;
		traitCreated = false;
		dateEditorCreated = false;
		timescaleMultiplierCreated = false;
		loadGeojsonCreated = false;
		hpdLevelCreated = false;
		burnInCreated = false;
		outputCreated = false;
		// hasRRWrateCreated = false;
		rrwRateCreated = false;
		// precisionCreated = false;

	}// END: resetFlags

	private void populatePanel() {

		this.settings = new TimeSlicerSettings();
		resetFlags();

		populateTrees();

	}// END: populatePanel

	private void populateTrees() {

		if (!loadTreesCreated) {
			loadTrees = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.TREES_ICON));
			loadTrees.addActionListener(new ListenLoadTrees());
			addComponentWithLabel("Load trees file:", loadTrees);
			loadTreesCreated = true;
		}

	}// END: populateTrees

	private class ListenLoadTrees implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] treeFiles = new String[] { "tre", "tree", "trees" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading trees file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(treeFiles,
						"Trees files (*.tree(s), *.tre)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils
						.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					// if analysis type changed reset components below
					removeChildComponents(loadTrees);
					resetFlags();

					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.treesFilename = filename;
					frame.setStatus(settings.treesFilename + " selected.");

					populateTraitCombobox();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenLoadTrees

	private void populateTraitCombobox() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				RootedTree sampleTree = null;

				try {

					sampleTree = Utils.importRootedTree(settings.treesFilename);

				} catch (IOException e) {

					String message = "I/O Exception occured when importing tree. I suspect wrong or malformed tree file.";
					InterfaceUtils.handleException(e, message);
					frame.setStatus("Exception occured");
					frame.setIdle();

				} catch (ImportException e) {

					String message = "Import exception occured when importing tree. I suspect wrong or malformed tree file.";
					InterfaceUtils.handleException(e, message);
					frame.setStatus("Exception occured");
					frame.setIdle();

				} // END: try-catch

				traitAttributes = new LinkedHashSet<String>();

				for (Node node : sampleTree.getNodes()) {
					if (!sampleTree.isRoot(node)) {

						traitAttributes.addAll(node.getAttributeNames());

					} // END: root check
				} // END: nodeloop

				// re-initialise comboboxes
				if (!traitCreated) {

					trait = new JComboBox<Object>();
					ComboBoxModel<Object> traitSelectorModel = new DefaultComboBoxModel<Object>(
							traitAttributes.toArray(new String[0]));
					trait.setModel(traitSelectorModel);
					trait.addItemListener(new ListenTrait());
					addComponentWithLabel("Select 2D trait attribute:", trait);

				}

				try {

					int assumedTrees = TimeSlicerSpreadDataParser
							.getAssumedTrees(settings.treesFilename);
					settings.assumedTrees = assumedTrees;

					// System.out.println(assumedTrees);

				} catch (IOException e) {

					String message = "I/O exception occured when guessing the size of posterior trees sample. I suspect wrong or malformed trees file.";
					InterfaceUtils.handleException(e, message);
					frame.setStatus("Exception occured");
					frame.setIdle();
				} // END: try-catch

				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {

				frame.setStatus("Opened " + settings.treeFilename + "\n");
				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END: populateTraitSelector

	private class ListenTrait implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				settings.trait = attribute;
				frame.setStatus("2D trait '" + settings.trait + "'"
						+ " selected");

				populateAnalysisType();

				// populateOptionalSettings();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenTrait

	private void populateAnalysisType() {

		// this.settings = new TimeSlicerSettings();
		// resetFlags();

		if (!analysisTypeCreated) {

			analysisType = new JComboBox<Object>();
			ComboBoxModel<Object> analysisTypeSelectorModel = new DefaultComboBoxModel<Object>(
					AnalysisTypes.values());
			analysisType.setModel(analysisTypeSelectorModel);
			analysisType.addItemListener(new ListenAnalysisType());
			addComponentWithLabel("Time slices:", analysisType);

			// set to MCC tree
			analysisType.setSelectedIndex(0);
			analysisTypeCreated = true;
			populateTree();
		}

	}// END: populatePanel

	private class ListenAnalysisType implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				// if analysis type changed reset components below
				removeChildComponents(analysisType);
				resetFlags();

				Object item = event.getItem();
				AnalysisTypes type = (AnalysisTypes) item;
				switch (type) {

				case CUSTOM:
					populateCustom();
					break;

				case MCC_TREE:
					populateTree();
					break;

				default:
					break;

				}// END: switch

				frame.setStatus(item.toString() + " selected");

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenParserSelector

	private void populateCustom() {

		if (!sliceHeightsCreated) {

			sliceHeights = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.TIME_ICON));
			sliceHeights.addActionListener(new ListenLoadSliceTimes());
			addComponentWithLabel("Load slice heights:", sliceHeights);
			sliceHeightsCreated = true;
		}

	}// END: populateCustom

	private void populateTree() {

		if (!loadTreeCreated) {

			loadTree = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.TREE_ICON));
			loadTree.addActionListener(new ListenLoadTree());
			addComponentWithLabel("Load tree file:", loadTree);
			loadTreeCreated = true;
		}

	}// END: populateTree

	private class ListenLoadSliceTimes implements ActionListener {
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

					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.sliceHeightsFilename = filename;
					frame.setStatus(settings.sliceHeightsFilename
							+ " selected.");
					// populateTrees();

					populateOptionalSettings();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenLoadSliceTimes

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

					// if analysis type changed reset components below
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
					// populateTrees();

					populateOptionalSettings();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenLoadTree

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

		if (!rrwRateCreated) {
			rrwRate = new JComboBox<Object>();

			String[] rrwRateAttributes = new String[traitAttributes.size() + 1];
			int k = 0;
			for (int i = 0; i < rrwRateAttributes.length; i++) {
				if (i == 0) {
					rrwRateAttributes[i] = NO_RATE;
				} else {
					rrwRateAttributes[i] = traitAttributes.toArray()[k++]
							.toString();
				}
			}// END: i loop

			ComboBoxModel<Object> rrwRateSelectorModel = new DefaultComboBoxModel<Object>(
					rrwRateAttributes);

			rrwRate.setModel(rrwRateSelectorModel);
			rrwRate.addItemListener(new ListenRRWrate());
			rrwRate.setSelectedIndex(0);

			addComponentWithLabel("2D trait rate attribute:", rrwRate);
			rrwRateCreated = true;
		}

		if (!hpdLevelCreated) {
			hpdLevel = new JSliderDouble(0.1, 1.0, 0.8, 20, 2);
			hpdLevel.setMajorTickSpacing(1);
			hpdLevel.setPaintTicks(true);
			hpdLevel.setPaintLabels(true);
			hpdLevel.addChangeListener(new ListenHpdLevel());
			addComponentWithLabel("HPD level for contouring:", hpdLevel);
			hpdLevelCreated = true;
		}

		if (!burnInCreated) {

			int min = 0;
			int max = settings.assumedTrees;
			int nIntervals = 5;
			int spacing = (max - min) / nIntervals;

			burnIn = new JSlider(JSlider.HORIZONTAL, min, max - 1, spacing);

			burnIn.setMajorTickSpacing(spacing);
			burnIn.setPaintTicks(true);
			burnIn.setPaintLabels(true);
			burnIn.addChangeListener(new ListenBurnIn());
			addComponentWithLabel("Discard as burnin (in #trees):", burnIn);
			burnInCreated = true;
		}

		if (!loadGeojsonCreated) {
			loadGeojson = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.GEOJSON_ICON));
			loadGeojson.addActionListener(new ListenLoadGeojson());
			addComponentWithLabel("Load GeoJSON file:", loadGeojson);
			loadGeojsonCreated = true;
		}

		if (!outputCreated) {
			output = new JButton("Output",
					InterfaceUtils.createImageIcon(InterfaceUtils.SAVE_ICON));
			output.addActionListener(new ListenOutput());
			addComponentWithLabel("Generate JSON:", output);
			outputCreated = true;
		}

	}// END: populateOptionalSettings

	private class ListenRRWrate implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				if (attribute.equalsIgnoreCase(NO_RATE)) {
					settings.rrwRate = null;
				} else {

					settings.rrwRate = attribute;
				}

				frame.setStatus("Relaxed random walk rate attribute '"
						+ settings.rrwRate + "'" + " selected");

			} // END: selected check
		}// END: itemStateChanged
	}// END: ListenRRWrate

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

					// TODO: see if we can get the progress displayed

					TimeSlicerSpreadDataParser parser = new TimeSlicerSpreadDataParser(
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

	private class ListenBurnIn implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSlider source = (JSlider) ev.getSource();
			if (!source.getValueIsAdjusting()) {

				int value = source.getValue();
				settings.burnIn = value;

				frame.setStatus("Burnin " + value + " selected.");

			} // END: adjusting check
		}// END: stateChanged

	}// END: ListenBurninPercent

	private class ListenHpdLevel implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSliderDouble source = (JSliderDouble) ev.getSource();
			if (!source.getValueIsAdjusting()) {

				double value = source.getDoubleValue();
				settings.hpdLevel = value;
				frame.setStatus("HPD " + value + " selected.");

			} // END: adjusting check
		}// END: stateChanged

	}// END: ListenBurninPercent

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

}// END: class
