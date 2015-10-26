package gui;

import jam.framework.Exportable;
import jam.panels.OptionsPanel;

import java.awt.BorderLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.LinkedHashSet;

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JComponent;
import javax.swing.JFileChooser;
import javax.swing.JPanel;
import javax.swing.SwingConstants;
import javax.swing.SwingWorker;
import javax.swing.border.TitledBorder;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.trees.RootedTree;
import settings.Settings;
import utils.Utils;

@SuppressWarnings({ "rawtypes", "unchecked", "serial" })
public class DataPanel extends JPanel implements Exportable {

	private Settings settings;
	private MainFrame frame;

	// Panels
	private OptionsPanel holderPanel;
	private OptionsPanel optionPanel;

	// Buttons
	private JButton loadTree;

	// Combo boxes
	private JComboBox parserSelector;
	private ComboBoxModel parserSelectorModel;
	private JComboBox locationAttributeSelector;

	// Directories
	// private File workingDirectory = null;

	public DataPanel(MainFrame frame, Settings settings) {

		this.frame = frame;
		this.settings = settings;

		optionPanel = new OptionsPanel(12, 12, SwingConstants.CENTER);
		holderPanel = new OptionsPanel(12, 12, SwingConstants.CENTER);

		parserSelector = new JComboBox();
		optionPanel.addComponentWithLabel("Select input type:", parserSelector);
		parserSelectorModel = new DefaultComboBoxModel(ParserTypes.values());
		parserSelector.setModel(parserSelectorModel);

		optionPanel.addSeparator();
		optionPanel.addComponent(holderPanel);

		setOpaque(false);
		setLayout(new BorderLayout());
		add(optionPanel, BorderLayout.NORTH);

		// Listeners
		parserSelector.addItemListener(new ListenParserSelector());
		parserSelector.setSelectedIndex(0);

		// Call first item in selector
		populateDiscreteTreePanels();

	}// END: Constructor

	private class ListenParserSelector implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				ParserTypes type = (ParserTypes) item;
				switch (type) {

				case DISCRETE_TREE:
					populateDiscreteTreePanels();
					break;

				case BAYES_FACTOR:
					populateBayesFactorPanels();
					break;

				case CONTINUOUS_TREE:
					populateContinuousTreePanels();
					break;

				case TIME_SLICER:
					populateTimeSlicerPanels();
					break;

				default:
					break;

				}// END: switch

				frame.setStatus(item.toString() + " selected");

			}// END: selected check
		}// END: itemStateChanged

	}// END: ListenParserSelector

	// /////////////////////
	// ---DISCRETE TREE---//
	// /////////////////////

	private void populateDiscreteTreePanels() {

		holderPanel.removeAll();

		loadTree = new JButton("Load",
				InterfaceUtils.createImageIcon(InterfaceUtils.TREE_ICON));
		loadTree.addActionListener(new ListenLoadTree());
		holderPanel.addComponentWithLabel("Load tree file:", loadTree);

		// tmpPanel.add(loadTree);
		// optionPanel.add(tmpPanel);

	}// END: populateDiscreteTreePanels

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
					String treeFilename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					populateLocationAttributeCombobox(treeFilename);

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			}// END: try-catch block

		}// END: actionPerformed
	}// END: ListenOpenTree

	private void populateLocationAttributeCombobox(final String treeFilename) {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					NexusImporter importer = new NexusImporter(new FileReader(
							treeFilename));
					RootedTree tree = (RootedTree) importer.importNextTree();

					LinkedHashSet<String> uniqueAttributes = new LinkedHashSet<String>();

					for (Node node : tree.getNodes()) {
						if (!tree.isRoot(node)) {

							uniqueAttributes.addAll(node.getAttributeNames());

						}// END: root check
					}// END: nodeloop

					// re-initialise combobox
					locationAttributeSelector = new JComboBox();
					ComboBoxModel locationAttributeSelectorModel = new DefaultComboBoxModel(
							uniqueAttributes.toArray(new String[0]));
					locationAttributeSelector
							.setModel(locationAttributeSelectorModel);
					locationAttributeSelector
							.addItemListener(new ListenLocationAttributeSelector());
					holderPanel.addComponentWithLabel(
							"Select location attribute",
							locationAttributeSelector);

				} catch (FileNotFoundException e) {
					
					InterfaceUtils.handleException(e, e.getMessage());
					frame.setIdle();
					frame.setStatus("Exception occured.");
					
				} catch (IOException e) {
					
					InterfaceUtils.handleException(e, e.getMessage());
					frame.setIdle();
					frame.setStatus("Exception occured.");
					
				} catch (ImportException e) {
					
					InterfaceUtils.handleException(e, e.getMessage());
					frame.setIdle();
					frame.setStatus("Exception occured.");
					
				}// END: try-catch block

				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {
				
				frame.setStatus("Opened " + treeFilename + "\n");
				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END: populateLocationAttributeCombobox

	private class ListenLocationAttributeSelector implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();

				// TODO

				frame.setStatus("Location attribute '" + item.toString() + "'"
						+ " selected");

			}// END: selected check
		}// END: itemStateChanged

	}// END: ListenParserSelector

	// ////////////////////
	// ---BAYES FACTOR---//
	// ////////////////////

	private void populateBayesFactorPanels() {

		holderPanel.removeAll();

		System.out.println("TODO");
	}

	// ///////////////////////
	// ---CONTINUOUS TREE---//
	// ///////////////////////

	private void populateContinuousTreePanels() {

		holderPanel.removeAll();

		System.out.println("TODO");
	}

	// ///////////////////
	// ---TIME SLICER---//
	// ///////////////////

	private void populateTimeSlicerPanels() {

		holderPanel.removeAll();

		System.out.println("TODO");
	}

	@Override
	public JComponent getExportableComponent() {
		return this;
	}// END: getExportableComponent

}// END: class
