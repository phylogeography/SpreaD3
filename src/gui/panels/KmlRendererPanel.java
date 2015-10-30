package gui.panels;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.ComponentOrientation;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;
import java.util.LinkedList;

import javax.swing.BoxLayout;
import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.GroupLayout;
import javax.swing.GroupLayout.ParallelGroup;
import javax.swing.GroupLayout.SequentialGroup;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JPanel;
import javax.swing.JSlider;
import javax.swing.SwingConstants;
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

@SuppressWarnings({ "unchecked", "rawtypes", "serial" })
public class KmlRendererPanel extends OptionsPanel {

	private MainFrame frame;

	private KmlRendererSettings settings;
	private SpreadData data;
	private LinkedList<String> pointAttributeNames;
	private LinkedList<String> lineAttributeNames;

	// Panels
//	private OptionsPanel tmpPanelsHolder;
//	private JPanel tmpPanel;
//	private SpinningPanel spinningPanel;
	private JPanel spinningPanelsHolder;

	// Flags
	private boolean loadJsonCreated = false;
	private boolean renderSettingsCreated = false;

	// Buttons
	private JButton loadJson;
	private JButton pointColor;
	private JButton lineColor;
	private JButton areaColor;
	private JButton countColor;

	// Combo boxes
	private JComboBox pointColorMapping;
	private JComboBox pointAreaMapping;
	private JComboBox lineColorMapping;
	private JComboBox lineAltitudeMapping;

	// Sliders
	private JSlider pointArea;
	private JSlider lineAltitude;
	private JSlider lineWidth;

	// Constraints
	private GridBagConstraints constraints;

	public KmlRendererPanel(MainFrame frame) {

		this.frame = frame;

		// setOpaque(false);
		// setLayout(new BorderLayout());

		populatePanel();

	}// END: Constructor

	public void populatePanel() {

		this.settings = new KmlRendererSettings();

		resetFlags();

		if (!loadJsonCreated) {
			loadJson = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.JSON_ICON));
			loadJson.addActionListener(new ListenLoadJson());
			addComponentWithLabel("Load JSON file:", loadJson);
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
				chooser.addChoosableFileFilter(new SimpleFileFilter(jsonFiles,
						"JSON files (*.json, *.spread)"));
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

					Reader reader;
					reader = new FileReader(settings.jsonFilename);
					Gson gson = new GsonBuilder().create();
					data = gson.fromJson(reader, SpreadData.class);

					pointAttributeNames = new LinkedList<String>();
					for (Attribute attribute : data.getPointAttributes()) {
						pointAttributeNames.add(attribute.getId());
					}

					lineAttributeNames = new LinkedList<String>();
					for (Attribute attribute : data.getLineAttributes()) {
						lineAttributeNames.add(attribute.getId());
					}

					populateRender();

				} catch (FileNotFoundException e) {
					InterfaceUtils.handleException(e,
							"File could not be found.");
					frame.setStatus("Exception occured.");
					frame.setIdle();
				}

				// } catch (Exception e) {
				// InterfaceUtils.handleException(e,
				// "Wrong or malformed JSON input file.");
				// frame.setStatus("Exception occured.");
				// frame.setIdle();
				// }

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

			constraints = new GridBagConstraints();
			spinningPanelsHolder = new JPanel();
			spinningPanelsHolder.setLayout(new GridBagLayout());
			spinningPanelsHolder.setComponentOrientation( ComponentOrientation.LEFT_TO_RIGHT );
			
			populatePoints();
			populateLines();
			populateAreas();
			populateCounts();

			renderSettingsCreated = true;
			addComponent(spinningPanelsHolder);

		}

	}// END: populateRender

	// //////////////
	// ---POINTS---//
	// //////////////

	private void populatePoints() {

		GridBagConstraints c = new GridBagConstraints();
		JPanel tmpPanel;
		
		// spinner and holder
		JPanel tmpPanelsHolder = new JPanel();
		tmpPanelsHolder.setLayout(new GridBagLayout());
		SpinningPanel spinningPanel = new SpinningPanel(tmpPanelsHolder, "   Points",
				new Dimension(MainFrame.SPINNING_PANEL_WIDTH,
						MainFrame.SPINNING_PANEL_HEIGHT));

		// color mapping
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color attribute:"));
		pointColorMapping = new JComboBox();
		ComboBoxModel comboBoxModel = new DefaultComboBoxModel(
				pointAttributeNames.toArray());
		pointColorMapping.setModel(comboBoxModel);
		pointColorMapping.addItemListener(new ListenPointColorMapping());
		tmpPanel.add(pointColorMapping);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 0;
		tmpPanelsHolder.add(tmpPanel, c);

		// color
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color:"));
		pointColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		pointColor.addActionListener(new ListenPointColor());
		tmpPanel.add(pointColor);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 1;
		tmpPanelsHolder.add(tmpPanel, c);

		// area mapping
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Area attribute:"));
		pointAreaMapping = new JComboBox();
		comboBoxModel = new DefaultComboBoxModel(pointAttributeNames.toArray());
		pointAreaMapping.setModel(comboBoxModel);
		pointAreaMapping.addItemListener(new ListenPointAreaMapping());
		tmpPanel.add(pointAreaMapping);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 2;
		tmpPanelsHolder.add(tmpPanel, c);

		// area
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Area:"));
		pointArea = new JSlider(JSlider.HORIZONTAL,
				settings.minPointArea.intValue(),
				settings.maxPointArea.intValue(), settings.pointArea.intValue());
		pointArea.setMajorTickSpacing(1000);
		pointArea.setMinorTickSpacing(500);
		pointArea.setPaintTicks(true);
		pointArea.setPaintLabels(true);
		tmpPanel.add(pointArea);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 3;
		tmpPanelsHolder.add(tmpPanel, c);

		spinningPanel.showBottom(true);
		constraints.fill = GridBagConstraints.VERTICAL;
		constraints.gridx = 0;
		constraints.gridy = 0;
		spinningPanelsHolder.add(spinningPanel, constraints);

	}// END: populatePoints

	private class ListenPointAreaMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenPointAreaMapping

	private class ListenPointColorMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenPointColorSelector

	private class ListenPointColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.pointColor[KmlRendererSettings.R],
					(int) settings.pointColor[KmlRendererSettings.G],
					(int) settings.pointColor[KmlRendererSettings.B]);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			// if (c != null) {
			// polygonsMinColor = c;
			// }

		}// END: actionPerformed
	}// END: ListenPointColor

	// /////////////
	// ---LINES---//
	// /////////////

	private void populateLines() {
		
		GridBagConstraints c = new GridBagConstraints();
		JPanel tmpPanel;
		
		// spinner and holder
		JPanel tmpPanelsHolder = new JPanel();
		tmpPanelsHolder.setLayout(new GridBagLayout());
		SpinningPanel spinningPanel = new SpinningPanel(tmpPanelsHolder, "   Lines",
				new Dimension(MainFrame.SPINNING_PANEL_WIDTH,
						MainFrame.SPINNING_PANEL_HEIGHT));

		// color mapping
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color attribute:"));
		lineColorMapping = new JComboBox();
		ComboBoxModel comboBoxModel = new DefaultComboBoxModel(
				lineAttributeNames.toArray());
		lineColorMapping.setModel(comboBoxModel);
		lineColorMapping.addItemListener(new ListenLineColorMapping());
		tmpPanel.add(lineColorMapping);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 0;
		tmpPanelsHolder.add(tmpPanel, c);

		// color
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color:"));
		lineColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		lineColor.addActionListener(new ListenLineColor());
		tmpPanel.add(lineColor);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 1;
		tmpPanelsHolder.add(tmpPanel,c);

		// altitude maping
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Altitude attribute:"));
		lineAltitudeMapping = new JComboBox();
		comboBoxModel = new DefaultComboBoxModel(lineAttributeNames.toArray());
		lineAltitudeMapping.setModel(comboBoxModel);
		lineAltitudeMapping.addItemListener(new ListenLineAltitudeMapping());
		tmpPanel.add(lineAltitudeMapping);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 2;
		tmpPanelsHolder.add(tmpPanel,c);

		// altitude
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Altitude:"));
		lineAltitude = new JSlider(JSlider.HORIZONTAL,
				settings.minLineAltitude.intValue(),
				settings.maxLineAltitude.intValue(),
				settings.lineAltitude.intValue());
		lineAltitude.setMajorTickSpacing(100000);
		lineAltitude.setPaintTicks(true);
		lineAltitude.setPaintLabels(true);
		tmpPanel.add(lineAltitude);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 3;
		tmpPanelsHolder.add(tmpPanel, c);

		// width
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Width:"));
		lineWidth = new JSlider(JSlider.HORIZONTAL,
				settings.minLineWidth.intValue(),
				settings.maxLineWidth.intValue(), settings.lineWidth.intValue());
		lineWidth.setMajorTickSpacing(1);
		lineWidth.setPaintTicks(true);
		lineWidth.setPaintLabels(true);
		tmpPanel.add(lineWidth);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 4;
		tmpPanelsHolder.add(tmpPanel,c);

		spinningPanel.showBottom(true);
		constraints.fill = GridBagConstraints.VERTICAL;
		constraints.gridx = 1;
		constraints.gridy = 0;
		spinningPanelsHolder.add(spinningPanel, constraints);

	}// END: populateLines

	private class ListenLineAltitudeMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenLineAltitudeMapping

	private class ListenLineColorMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenLineColorMapping

	private class ListenLineColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.lineColor[KmlRendererSettings.R],
					(int) settings.lineColor[KmlRendererSettings.G],
					(int) settings.lineColor[KmlRendererSettings.B]);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			// if (c != null) {
			// polygonsMinColor = c;
			// }

		}// END: actionPerformed
	}// END: ListenLineColor

	// //////////////
	// ---AREAS---//
	// //////////////

	private void populateAreas() {

		GridBagConstraints c = new GridBagConstraints();
		JPanel tmpPanel;
		
		// spinner and holder
		JPanel tmpPanelsHolder = new JPanel();
		tmpPanelsHolder.setLayout(new GridBagLayout());
		SpinningPanel spinningPanel = new SpinningPanel(tmpPanelsHolder, "   Areas",
				new Dimension(MainFrame.SPINNING_PANEL_WIDTH,
						MainFrame.SPINNING_PANEL_HEIGHT));

		// color
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color:"));
		areaColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		areaColor.addActionListener(new ListenAreaColor());
		tmpPanel.add(areaColor);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 0;
		tmpPanelsHolder.add(tmpPanel, c);

		constraints.fill = GridBagConstraints.VERTICAL;
		constraints.gridx = 2;
		constraints.gridy = 0;
		spinningPanel.showBottom(true);
		spinningPanelsHolder.add(spinningPanel, constraints);

	}// END: populateAreas

	private class ListenAreaColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.areaColor[KmlRendererSettings.R],
					(int) settings.areaColor[KmlRendererSettings.G],
					(int) settings.areaColor[KmlRendererSettings.B]);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			// if (c != null) {
			// polygonsMinColor = c;
			// }

		}// END: actionPerformed
	}// END: ListenAreaColor

	// //////////////
	// ---COUNTS---//
	// //////////////

	private void populateCounts() {

		GridBagConstraints c = new GridBagConstraints();
		JPanel tmpPanel;
		
		// spinner and holder
		JPanel tmpPanelsHolder = new JPanel();
		tmpPanelsHolder.setLayout(new GridBagLayout());
		SpinningPanel spinningPanel = new SpinningPanel(tmpPanelsHolder, "   Counts",
				new Dimension(MainFrame.SPINNING_PANEL_WIDTH,
						MainFrame.SPINNING_PANEL_HEIGHT));

		// color
		tmpPanel = new JPanel();
		tmpPanel.setBorder(new TitledBorder("Color:"));
		countColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		countColor.addActionListener(new ListenCountColor());
		tmpPanel.add(countColor);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 0;
		c.gridy = 0;
		tmpPanelsHolder.add(tmpPanel,c);

		constraints.fill = GridBagConstraints.VERTICAL;
		constraints.gridx = 3;
		constraints.gridy = 0;
		spinningPanel.showBottom(true);
		spinningPanelsHolder.add(spinningPanel, constraints);

	}// END: populateCounts

	private class ListenCountColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.countColor[KmlRendererSettings.R],
					(int) settings.countColor[KmlRendererSettings.G],
					(int) settings.countColor[KmlRendererSettings.B]);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			// if (c != null) {
			// polygonsMinColor = c;
			// }

		}// END: actionPerformed
	}// END: ListenPointColor

	private void resetFlags() {
		loadJsonCreated = false;
		renderSettingsCreated = false;
	}// END: resetFlags

}// END: class
