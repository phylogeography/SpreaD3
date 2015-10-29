package gui.panels;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.util.LinkedList;

import javax.swing.BoxLayout;
import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JPanel;
import javax.swing.SwingWorker;
import javax.swing.border.TitledBorder;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import colorpicker.swing.ColorPicker;
import gui.InterfaceUtils;
import gui.MainFrame;
import gui.SimpleFileFilter;
import gui.SpinningPanel;
import jam.panels.OptionsPanel;
import settings.rendering.KmlRendererSettings;
import structure.data.Attribute;
import structure.data.SpreadData;

@SuppressWarnings({ "unchecked", "rawtypes" })
public class KmlRendererPanel {

	private MainFrame frame;
	private OptionsPanel holderPanel;

	private KmlRendererSettings settings;
	private SpreadData data;
	private LinkedList<String> pointAttributeNames;

	// Panels
	private int spinningPanelHeight = 20;
	private JPanel tmpPanelsHolder;
	private JPanel tmpPanel;
	private SpinningPanel spinningPanel;

	// Flags
	private boolean loadJsonCreated = false;
	private boolean renderSettingsCreated = false;

	// Buttons
	private JButton loadJson;
	private JButton pointColor;

	// Combo boxes
	private JComboBox pointColorMapping;

	private GridBagConstraints c;

	public KmlRendererPanel(MainFrame frame, OptionsPanel holderPanel) {

		this.frame = frame;
		this.holderPanel = holderPanel;

	}// END: Constructor

	public void populateHolderPanel() {

		this.settings = new KmlRendererSettings();

		holderPanel.removeAll();
		resetFlags();
		c = new GridBagConstraints();

		if (!loadJsonCreated) {
			loadJson = new JButton("Load", InterfaceUtils.createImageIcon(InterfaceUtils.JSON_ICON));
			loadJson.addActionListener(new ListenLoadJson());
			holderPanel.addComponentWithLabel("Load JSON file:", loadJson);
			loadJsonCreated = true;
		}

	}// END: populateHolderPanel

	private class ListenLoadJson implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] jsonFiles = new String[] { "json", "spread" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading JSON file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(jsonFiles, "JSON files (*.json, *.spread)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.jsonFilename = filename;
					frame.setStatus(settings.jsonFilename + " selected.");
					importSpreadData();

				} else {
					frame.setStatus("Could not open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed

	}// END: ListenLoadJson

	private void importSpreadData() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					Reader reader = new FileReader(settings.jsonFilename);
					Gson gson = new GsonBuilder().create();
					data = gson.fromJson(reader, SpreadData.class);

					pointAttributeNames = new LinkedList<String>();
					for (Attribute attribute : data.getPointAttributes()) {
						pointAttributeNames.add(attribute.getId());
					}

					populateRender();

				} catch (Exception e) {
					InterfaceUtils.handleException(e, "Wrong or malformed JSON input file.");
					frame.setStatus("Exception occured.");
					frame.setIdle();
				}

				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {

				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END: importSpreadData

	private void populateRender() {

		if (!renderSettingsCreated) {

			populatePoints();
			populateLines();
			populateAreas();
			populateCounts();

			renderSettingsCreated = true;
		}

	}// END: populateRender

	private void populatePoints() {

		// spinnes and holder for selectors
		tmpPanelsHolder = new JPanel();
		spinningPanel = new SpinningPanel(tmpPanelsHolder, "   Points",
				new Dimension(holderPanel.getWidth(), spinningPanelHeight));

		// selector
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color attribute:"));
		pointColorMapping = new JComboBox();
		ComboBoxModel comboBoxModel = new DefaultComboBoxModel(pointAttributeNames.toArray());
		pointColorMapping.setModel(comboBoxModel);
		pointColorMapping.addItemListener(new ListenPointColorMapping());
		tmpPanel.add(pointColorMapping);
		tmpPanelsHolder.add(tmpPanel);

		// next selector
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color:"));
		pointColor = new JButton("Color", InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		pointColor.addActionListener(new ListenPointColor());
		tmpPanel.add(pointColor);
		tmpPanelsHolder.add(tmpPanel);

		spinningPanel.showBottom(true);
		holderPanel.add(spinningPanel);
	}// END: populatePoints

	private class ListenPointColorMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				// setupLocationCoordinates = new JButton("Setup",
				// InterfaceUtils
				// .createImageIcon(InterfaceUtils.LOCATIONS_ICON));
				// setupLocationCoordinates
				// .addActionListener(new
				// ListenOpenLocationCoordinatesEditor());
				//
				// if (!setupLocationCoordinatesCreated) {
				// holderPanel.addComponentWithLabel(
				// "Setup location attribute coordinates:",
				// setupLocationCoordinates);
				// setupLocationCoordinatesCreated = true;
				// }
				//
				// settings.locationAttributeName = locationAttribute;
				// frame.setStatus("Location attribute '" + locationAttribute
				// + "'" + " selected");

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenPointColorSelector

	private class ListenPointColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color((int) settings.pointColor[KmlRendererSettings.R],
					(int) settings.pointColor[KmlRendererSettings.G], (int) settings.pointColor[KmlRendererSettings.B]);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(), "Choose color...", defaultColor, true);
			
			// if (c != null) {
			// polygonsMinColor = c;
			// }

		}// END: actionPerformed
	}// END: ListenPointColor

	private void populateCounts() {
		// TODO Auto-generated method stub

	}

	private void populateAreas() {
		// TODO Auto-generated method stub

	}

	private void populateLines() {
		// TODO Auto-generated method stub

	}

	// TODO: reset flags here
	private void resetFlags() {

		loadJsonCreated = false;
		renderSettingsCreated = false;

	}// END: resetFlags

}// END: class
