package gui.panels;

import gui.DateEditor;
import gui.InterfaceUtils;
import gui.JSliderDouble;
import gui.MainFrame;
import gui.SimpleFileFilter;
import jam.panels.OptionsPanel;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.io.File;
import java.io.IOException;
import java.util.Hashtable;
import java.util.LinkedHashSet;

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JLabel;
import javax.swing.JSlider;
import javax.swing.JTextField;
import javax.swing.SwingWorker;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import settings.parsing.TimeSlicerSettings;
import utils.Utils;

@SuppressWarnings("serial")
public class TimeSlicerPanel extends OptionsPanel {

	private MainFrame frame;
	private TimeSlicerSettings settings;

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

	// Combo boxes
	private JComboBox<Object> trait;
	private boolean traitCreated = false;

	// Panels
	private OptionsPanel holderPanel;

	// Date editor
	private DateEditor dateEditor;
	private boolean dateEditorCreated = false;

	// Text fields
	private JTextField timescaleMultiplier;
	private boolean timescaleMultiplierCreated = false;

	// Sliders
	private JSliderDouble hpdLevel;
	private boolean hpdLevelCreated = false;

	public TimeSlicerPanel(MainFrame frame) {

		this.frame = frame;
		populatePanel();

	}// END: Constructor

	private void resetFlags() {

		sliceHeightsCreated = false;
		loadTreeCreated = false;
		loadTreesCreated = false;
		traitCreated = false;
		dateEditorCreated = false;
		timescaleMultiplierCreated = false;
		loadGeojsonCreated = false;

	}// END: resetFlags

	private void resetAllFlags() {

		analysisTypeCreated = false;
		resetFlags();

	}// END: resetFlags

	private void populatePanel() {

		this.settings = new TimeSlicerSettings();
		resetAllFlags();

		if (!analysisTypeCreated) {

			analysisType = new JComboBox<Object>();
			ComboBoxModel<Object> analysisTypeSelectorModel = new DefaultComboBoxModel<Object>(
					AnalysisTypes.values());
			analysisType.setModel(analysisTypeSelectorModel);
			analysisType.addItemListener(new ListenAnalysisType());
			addComponentWithLabel("Time slices: ", analysisType);
			// analysisTypeEdited = true;

			// holder for components below analysis selector
			holderPanel = new OptionsPanel();
			addComponent(holderPanel);

			// set to MCC tree
			analysisType.setSelectedIndex(0);
			populateTree();
		}

	}// END: populatePanel

	private class ListenAnalysisType implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

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

			holderPanel.removeAll();
			resetFlags();

			sliceHeights = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.TIME_ICON));
			sliceHeights.addActionListener(new ListenLoadSliceTimes());
			holderPanel.addComponentWithLabel("Load slice heights:",
					sliceHeights);
			sliceHeightsCreated = true;
		}

	}// END: populateCustom

	private void populateTree() {

		if (!loadTreeCreated) {

			holderPanel.removeAll();
			resetFlags();

			loadTree = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.TREE_ICON));
			loadTree.addActionListener(new ListenLoadTree());
			holderPanel.addComponentWithLabel("Load tree file:", loadTree);
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
					populateTrees();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenOpenTree

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

					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.treeFilename = filename;
					frame.setStatus(settings.treeFilename + " selected.");
					populateTrees();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenLoadTree

	private void populateTrees() {

		if (!loadTreesCreated) {
			loadTrees = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.TREES_ICON));
			loadTrees.addActionListener(new ListenLoadTrees());
			holderPanel.addComponentWithLabel("Load trees file:", loadTrees);
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
	}// END: ListenLoadTree

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

				} catch (ImportException e) {

					String message = "Import exception occured when importing tree. I suspect wrong or malformed tree file.";
					InterfaceUtils.handleException(e, message);

				}

				LinkedHashSet<String> traitAttributes = new LinkedHashSet<String>();

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
					holderPanel.addComponentWithLabel("Select 2D trait: ",
							trait);

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
				populateOptionalSettings();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenTrait

	private void populateOptionalSettings() {

		if (!dateEditorCreated) {
			dateEditor = new DateEditor();
			holderPanel.addComponentWithLabel("Most recent sampling date:",
					dateEditor);
			dateEditorCreated = true;
		}

		if (!timescaleMultiplierCreated) {
			timescaleMultiplier = new JTextField(
					String.valueOf(settings.timescaleMultiplier), 10);
			holderPanel.addComponentWithLabel("Time scale multiplier:",
					timescaleMultiplier);
			timescaleMultiplierCreated = true;
		}

		if (!loadGeojsonCreated) {
			loadGeojson = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.GEOJSON_ICON));
			loadGeojson.addActionListener(new ListenLoadGeojson());
			holderPanel
					.addComponentWithLabel("Load GeoJSON file:", loadGeojson);
			loadGeojsonCreated = true;
		}

		if (!hpdLevelCreated) {

			hpdLevel = new JSliderDouble(0.1, 1.0, 0.8, 10, 1);
			hpdLevel.setMajorTickSpacing(1);
			hpdLevel.setPaintTicks(true);
			hpdLevel.setPaintLabels(true);
			hpdLevel.addChangeListener(new ListenHpdLevel());

			holderPanel.addComponentWithLabel("HPD level for contouring:",
					hpdLevel);

		}

	}// END: populateOptionalSettings

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
