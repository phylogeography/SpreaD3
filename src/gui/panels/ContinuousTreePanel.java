package gui.panels;

import gui.DateEditor;
import gui.InterfaceUtils;
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
import javax.swing.JTextField;
import javax.swing.SwingWorker;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import parsers.ContinuousTreeSpreadDataParser;
import settings.parsing.ContinuousTreeSettings;
import structure.data.SpreadData;
import utils.Utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@SuppressWarnings("serial")
public class ContinuousTreePanel extends SpreadPanel {

	private MainFrame frame;
	private ContinuousTreeSettings settings;

	// Buttons
	private JButton loadTree;
	private boolean loadTreeCreated = false;
	private JButton loadGeojson;
	private boolean loadGeojsonCreated = false;
	private JButton output;
	private boolean outputCreated = false;

	// Combo boxes
	private JComboBox<Object> xCoordinate;
	private boolean xCoordinateEdited = false;
	private JComboBox<Object> yCoordinate;
	private boolean yCoordinateEdited = false;
	private boolean coordinateAttributeComboboxesCreated = false;

	// Date editor
	private DateEditor dateEditor;
	private boolean dateEditorCreated = false;

	// Text fields
	private JTextField timescaleMultiplier;
	private boolean timescaleMultiplierCreated = false;

	public ContinuousTreePanel(MainFrame frame) {

		this.frame = frame;
		populatePanel();

	}// END: Constructor

	private void populatePanel() {

		this.settings = new ContinuousTreeSettings();
		resetFlags();

		if (!loadTreeCreated) {
			loadTree = new JButton("Load", InterfaceUtils.createImageIcon(InterfaceUtils.TREE_ICON));
			loadTree.addActionListener(new ListenLoadTree());
			addComponentWithLabel("Load tree file:", loadTree);
			loadTreeCreated = true;
		}

	}// END: populatePanel

	private void resetFlags() {

		loadTreeCreated = false;
		coordinateAttributeComboboxesCreated = false;
		xCoordinateEdited = false;
		yCoordinateEdited = false;
		loadGeojsonCreated = false;
		outputCreated = false;

	}// END: resetFlags

	private class ListenLoadTree implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] treeFiles = new String[] { "tre", "tree", "trees" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading tree file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(treeFiles, "Tree files (*.tree(s), *.tre)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils.getActiveFrame());
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
					populateCoordinateAttributeComboboxes();

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenOpenTree

	private void populateCoordinateAttributeComboboxes() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					RootedTree rootedTree = Utils.importRootedTree(settings.treeFilename);
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

				// re-initialise comboboxes
				if (!coordinateAttributeComboboxesCreated) {

					xCoordinate = new JComboBox<Object>();
					ComboBoxModel<Object> xCoordinateSelectorModel = new DefaultComboBoxModel<Object>(
							uniqueAttributes.toArray(new String[0]));
					xCoordinate.setModel(xCoordinateSelectorModel);
					xCoordinate.addItemListener(new ListenXCoordinate());
					addComponentWithLabel("Select x coordinate attribute", xCoordinate);

					yCoordinate = new JComboBox<Object>();
					ComboBoxModel<Object> yCoordinateSelectorModel = new DefaultComboBoxModel<Object>(
							uniqueAttributes.toArray(new String[0]));
					yCoordinate.setModel(yCoordinateSelectorModel);
					yCoordinate.addItemListener(new ListenYCoordinate());
					addComponentWithLabel("Select y coordinate attribute", yCoordinate);

					coordinateAttributeComboboxesCreated = true;
				} // END: created check

				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {

				frame.setStatus("Opened " + settings.treeFilename + "\n");
				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END; populateCoordinateAttributeComboboxes

	private class ListenXCoordinate implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String locationAttribute = item.toString();

				settings.xCoordinate = locationAttribute;
				xCoordinateEdited = true;
				frame.setStatus("Location attribute '" + settings.xCoordinate + "'" + " selected");
				populateOptionalSettings();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenXCoordinate

	private class ListenYCoordinate implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String locationAttribute = item.toString();

				settings.yCoordinate = locationAttribute;
				yCoordinateEdited = true;
				frame.setStatus("Location attribute '" + settings.yCoordinate + "'" + " selected");
				populateOptionalSettings();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenYCoordinate

	private void populateOptionalSettings() {

		if (xCoordinateEdited && yCoordinateEdited) {

			if (!dateEditorCreated) {
				dateEditor = new DateEditor();
				addComponentWithLabel("Most recent sampling date:", dateEditor);
				dateEditorCreated = true;
			}

			if (!timescaleMultiplierCreated) {
				timescaleMultiplier = new JTextField(String.valueOf(settings.timescaleMultiplier), 10);
				addComponentWithLabel("Time scale multiplier:", timescaleMultiplier);
				timescaleMultiplierCreated = true;
			}

			if (!loadGeojsonCreated) {
				loadGeojson = new JButton("Load", InterfaceUtils.createImageIcon(InterfaceUtils.GEOJSON_ICON));
				loadGeojson.addActionListener(new ListenLoadGeojson());
				addComponentWithLabel("Load GeoJSON file:", loadGeojson);
				loadGeojsonCreated = true;
			}

			if (!outputCreated) {
				output = new JButton("Output", InterfaceUtils.createImageIcon(InterfaceUtils.SAVE_ICON));
				output.addActionListener(new ListenOutput());
				addComponentWithLabel("Generate JSON:", output);
				outputCreated = true;
			}

		} // END: coord check

	}// END: populateOptionalSettings

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
					frame.setStatus(settings.geojsonFilename + " selected.");
					
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

			int returnVal = chooser.showSaveDialog(InterfaceUtils.getActiveFrame());
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

		settings.timescaleMultiplier = Double.valueOf(timescaleMultiplier.getText());
		settings.mrsd = dateEditor.getValue();

	}// END: collectSettings

	private void generateOutput() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					ContinuousTreeSpreadDataParser parser = new ContinuousTreeSpreadDataParser(settings);
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
