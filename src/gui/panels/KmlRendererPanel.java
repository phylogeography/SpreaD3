package gui.panels;

import gui.InterfaceUtils;
import gui.JSliderDouble;
import gui.MainFrame;
import gui.SimpleFileFilter;

import java.awt.Color;
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

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JPanel;
import javax.swing.JSlider;
import javax.swing.SwingWorker;
import javax.swing.border.TitledBorder;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import renderers.kml.KmlRenderer;
import settings.rendering.KmlRendererSettings;
import structure.data.Attribute;
import structure.data.SpreadData;
import colorpicker.swing.ColorPicker;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;

@SuppressWarnings({ "unchecked", "rawtypes", "serial" })
public class KmlRendererPanel extends SpreadPanel {

	public static final int PANEL_HEIGHT = 100;
	public static final int PANEL_SUPER_HEIGHT = 160;
	public static final int PANEL_WIDTH = 250;

	private MainFrame frame;

	private KmlRendererSettings settings;
	private SpreadData data;
	private LinkedList<String> pointAttributeNames;
	private LinkedList<String> lineAttributeNames;

	// Panels
	private JPanel settingsHolder;
	private boolean renderSettingsCreated = false;

	// Buttons
	private JButton loadJson;
	private boolean loadJsonCreated = false;
	private JButton render;
	private JButton pointStartColor;
	private JButton pointEndColor;
	private JButton pointColor;
	private JButton lineColor;
	private JButton lineStartColor;
	private JButton lineEndColor;
	private JButton areaColor;
	private JButton areaStartColor;
	private JButton areaEndColor;
	private JButton countColor;

	// Combo boxes
	private JComboBox pointColorMapping;
	private JComboBox pointAreaMapping;
	private JComboBox lineColorMapping;
	private JComboBox lineAltitudeMapping;
	private JComboBox areaColorMapping;

	// Sliders
	private JSlider pointArea;
	private JSlider lineAltitude;
	private JSlider lineWidth;

	// Constraints
	private GridBagConstraints c;

	public KmlRendererPanel(MainFrame frame) {

		this.frame = frame;
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

	private void resetFlags() {
		loadJsonCreated = false;
		renderSettingsCreated = false;
		// renderCreated = false;
	}// END: resetFlags

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

					// if JSON reloaded reset all settings
					removeChildComponents(loadJson);
					resetFlags();

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

				} catch (JsonSyntaxException e) {

					InterfaceUtils.handleException(e,
							"Wrong or malformed JSON input file.");
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

			c = new GridBagConstraints();
			c.anchor = GridBagConstraints.NORTH;
			c.fill = GridBagConstraints.HORIZONTAL;
			settingsHolder = new JPanel();
			settingsHolder.setLayout(new GridBagLayout());

			populatePoints();
			populateLines();
			populateAreas();
			populateCounts();

			addComponent(settingsHolder);

			render = new JButton("Render",
					InterfaceUtils.createImageIcon(InterfaceUtils.SAVE_ICON));
			render.addActionListener(new ListenRender());
			addComponentWithLabel("Render to KML:", render);
			// renderCreated = true;

			renderSettingsCreated = true;

			revalidate();

		}

	}// END: populateRender

	// //////////////
	// ---POINTS---//
	// //////////////

	private void populatePoints() {

		JPanel tmpPanel;

		// color mapping
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_SUPER_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Points color attribute:"));
		pointStartColor = new  JButton("Start color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		pointStartColor.addActionListener(new ListenPointStartColor());
		tmpPanel.add(pointStartColor);
		pointEndColor = new  JButton("End color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		pointEndColor.addActionListener(new ListenPointEndColor());
		tmpPanel.add(pointEndColor);
		pointColorMapping = new JComboBox();
		ComboBoxModel comboBoxModel = new DefaultComboBoxModel(
				pointAttributeNames.toArray());
		pointColorMapping.setModel(comboBoxModel);
		pointColorMapping.addItemListener(new ListenPointColorMapping());
		tmpPanel.add(pointColorMapping);
		c.gridx = 0;
		c.gridy = 0;
		settingsHolder.add(tmpPanel, c);

		// color
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Points fixed color:"));
		pointColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		pointColor.addActionListener(new ListenPointColor());
		tmpPanel.add(pointColor);
		c.gridx = 0;
		c.gridy = 1;
		settingsHolder.add(tmpPanel, c);

		// area mapping
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Points area attribute:"));
		pointAreaMapping = new JComboBox();
		comboBoxModel = new DefaultComboBoxModel(pointAttributeNames.toArray());
		pointAreaMapping.setModel(comboBoxModel);
		pointAreaMapping.addItemListener(new ListenPointAreaMapping());
		tmpPanel.add(pointAreaMapping);
		c.gridx = 0;
		c.gridy = 2;
		settingsHolder.add(tmpPanel, c);

		// area
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Points fixed area:"));
		pointArea = new JSlider(JSlider.HORIZONTAL,
				settings.minPointArea.intValue(),
				settings.maxPointArea.intValue(), settings.pointArea.intValue());
		pointArea.setMajorTickSpacing(2000);
		pointArea.setPaintTicks(true);
		pointArea.setPaintLabels(true);
		pointArea.addChangeListener(new ListenPointArea());
		tmpPanel.add(pointArea);
		c.gridx = 0;
		c.gridy = 3;
		settingsHolder.add(tmpPanel, c);

	}// END: populatePoints

	private class ListenPointArea implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSlider source = (JSlider) ev.getSource();
			if (!source.getValueIsAdjusting()) {

				int value = source.getValue();
				settings.pointArea = (double) value;
				frame.setStatus("Point area " + value + " selected.");

			} // END: adjusting check
		}// END: stateChanged

	}// END: ListenBurninPercent

	private class ListenPointAreaMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				settings.pointAreaMapping = attribute;

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenPointAreaMapping

	private class ListenPointColorMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				settings.pointColorMapping = attribute;

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenPointColorSelector

	private class ListenPointStartColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color( //
					settings.minPointRed.intValue(), //
					settings.minPointGreen.intValue(), //
					settings.minPointBlue.intValue(), //
					settings.minPointAlpha.intValue() //
			);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.minPointRed = Double.valueOf(c.getRed());
				settings.minPointGreen = Double.valueOf(c.getGreen());
				settings.minPointBlue = Double.valueOf(c.getBlue());
				settings.minPointAlpha = Double.valueOf(c.getAlpha());
			}

		}// END: actionPerformed
	}// END: ListenPointStartColor

	private class ListenPointEndColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color( //
					settings.maxPointRed.intValue(), //
					settings.maxPointGreen.intValue(), //
					settings.maxPointBlue.intValue(), //
					settings.maxPointAlpha.intValue() //
			);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.maxPointRed = (double) c.getRed();
				settings.maxPointGreen = (double) c.getGreen();
				settings.maxPointBlue = (double) c.getBlue();
				settings.maxPointAlpha = (double) c.getAlpha();
			}

		}// END: actionPerformed
	}// END: ListenPointEndColor

	private class ListenPointColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.pointColor[KmlRendererSettings.R],
					(int) settings.pointColor[KmlRendererSettings.G],
					(int) settings.pointColor[KmlRendererSettings.B],
					(int) settings.pointAlpha);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.pointColor = new double[] { c.getRed(), c.getGreen(),
						c.getBlue() };

				settings.pointAlpha = c.getAlpha();
			}

		}// END: actionPerformed
	}// END: ListenPointColor

	// /////////////
	// ---LINES---//
	// /////////////

	private void populateLines() {

		JPanel tmpPanel;

		// color mapping
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_SUPER_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Lines color attribute:"));

		lineStartColor = new  JButton("Start color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		lineStartColor.addActionListener(new ListenLineStartColor());
		tmpPanel.add(lineStartColor);
		lineEndColor = new  JButton("End color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		lineEndColor.addActionListener(new ListenLineEndColor());
		tmpPanel.add(lineEndColor);

		lineColorMapping = new JComboBox();
		ComboBoxModel comboBoxModel = new DefaultComboBoxModel(
				lineAttributeNames.toArray());
		lineColorMapping.setModel(comboBoxModel);
		lineColorMapping.addItemListener(new ListenLineColorMapping());
		tmpPanel.add(lineColorMapping);
		c.gridx = 1;
		c.gridy = 0;
		settingsHolder.add(tmpPanel, c);

		// color
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Lines fixed color:"));
		lineColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		lineColor.addActionListener(new ListenLineColor());
		tmpPanel.add(lineColor);
		c.gridx = 1;
		c.gridy = 1;
		settingsHolder.add(tmpPanel, c);

		// altitude maping
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Lines altitude attribute:"));
		lineAltitudeMapping = new JComboBox();
		comboBoxModel = new DefaultComboBoxModel(lineAttributeNames.toArray());
		lineAltitudeMapping.setModel(comboBoxModel);
		lineAltitudeMapping.addItemListener(new ListenLineAltitudeMapping());
		tmpPanel.add(lineAltitudeMapping);
		c.gridx = 1;
		c.gridy = 2;
		settingsHolder.add(tmpPanel, c);

		// altitude
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Lines fixed altitude:"));
		lineAltitude = new JSlider(JSlider.HORIZONTAL,
				settings.minLineAltitude.intValue(),
				settings.maxLineAltitude.intValue(),
				settings.lineAltitude.intValue());
		lineAltitude.setMajorTickSpacing(200000);
		lineAltitude.setPaintTicks(true);
		lineAltitude.setPaintLabels(true);
		lineAltitude.addChangeListener(new ListenLineAltitude());
		tmpPanel.add(lineAltitude);
		c.fill = GridBagConstraints.HORIZONTAL;
		c.gridx = 1;
		c.gridy = 3;
		settingsHolder.add(tmpPanel, c);

		// width
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Lines fixed width:"));
		lineWidth = new JSlider(JSlider.HORIZONTAL,
				settings.minLineWidth.intValue(),
				settings.maxLineWidth.intValue(), settings.lineWidth.intValue());
		lineWidth.setMajorTickSpacing(1);
		lineWidth.setPaintTicks(true);
		lineWidth.setPaintLabels(true);
		lineWidth.addChangeListener(new ListenLineWidth());
		tmpPanel.add(lineWidth);
		c.gridx = 1;
		c.gridy = 4;
		settingsHolder.add(tmpPanel, c);

	}// END: populateLines

	private class ListenLineWidth implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSlider source = (JSlider) ev.getSource();
			if (!source.getValueIsAdjusting()) {

				int value = source.getValue();
				settings.lineWidth = (double) value;
				frame.setStatus("Line width " + value + " selected.");

			} // END: adjusting check
		}// END: stateChanged

	}// END: ListenLineAltitude

	private class ListenLineAltitude implements ChangeListener {

		@Override
		public void stateChanged(ChangeEvent ev) {

			JSlider source = (JSlider) ev.getSource();
			if (!source.getValueIsAdjusting()) {

				int value = source.getValue();
				settings.lineAltitude = (double) value;
				frame.setStatus("Line altitude " + value + " selected.");

			} // END: adjusting check
		}// END: stateChanged

	}// END: ListenLineAltitude

	private class ListenLineAltitudeMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				settings.lineAltitudeMapping = attribute;

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenLineAltitudeMapping

	private class ListenLineColorMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				settings.lineColorMapping = attribute;

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenLineColorMapping


	private class ListenLineStartColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color( //
					settings.minLineRed.intValue(), //
					settings.minLineGreen.intValue(), //
					settings.minLineBlue.intValue(), //
					settings.minLineAlpha.intValue() //
			);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.minLineRed = Double.valueOf(c.getRed());
				settings.minLineGreen = Double.valueOf(c.getGreen());
				settings.minLineBlue = Double.valueOf(c.getBlue());
				settings.minLineAlpha = Double.valueOf(c.getAlpha());
			}

		}// END: actionPerformed
	}// END: ListenLineStartColor

	private class ListenLineEndColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color( //
					settings.maxLineRed.intValue(), //
					settings.maxLineGreen.intValue(), //
					settings.maxLineBlue.intValue(), //
					settings.maxLineAlpha.intValue() //
			);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.maxLineRed = (double) c.getRed();
				settings.maxLineGreen = (double) c.getGreen();
				settings.maxLineBlue = (double) c.getBlue();
				settings.maxLineAlpha = (double) c.getAlpha();
			}

		}// END: actionPerformed
	}// END: ListenLineEndColor


	private class ListenLineColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.lineColor[KmlRendererSettings.R],
					(int) settings.lineColor[KmlRendererSettings.G],
					(int) settings.lineColor[KmlRendererSettings.B],
					(int) settings.lineAlpha);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.lineColor = new double[] { c.getRed(), c.getGreen(),
						c.getBlue() };

				settings.lineAlpha = c.getAlpha();
			}

		}// END: actionPerformed
	}// END: ListenLineColor

	// //////////////
	// ---AREAS---//
	// //////////////

	private void populateAreas() {

		JPanel tmpPanel;

		// color mapping
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_SUPER_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Area color attribute:"));

		areaStartColor = new  JButton("Start color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		areaStartColor.addActionListener(new ListenAreaStartColor());
		tmpPanel.add(areaStartColor);
		areaEndColor = new  JButton("End color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		areaEndColor.addActionListener(new ListenAreaEndColor());
		tmpPanel.add(areaEndColor);

		areaColorMapping = new JComboBox();
		ComboBoxModel comboBoxModel = new DefaultComboBoxModel(
				pointAttributeNames.toArray());
		areaColorMapping.setModel(comboBoxModel);
		areaColorMapping.addItemListener(new ListenAreaColorMapping());
		tmpPanel.add(areaColorMapping);
		c.gridx = 2;
		c.gridy = 0;
		settingsHolder.add(tmpPanel, c);

		// area color
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Areas fixed color:"));
		areaColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		areaColor.addActionListener(new ListenAreaColor());
		tmpPanel.add(areaColor);
		c.gridx = 2;
		c.gridy = 1;
		settingsHolder.add(tmpPanel, c);

	}// END: populateAreas

	private class ListenAreaColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.areaColor[KmlRendererSettings.R],
					(int) settings.areaColor[KmlRendererSettings.G],
					(int) settings.areaColor[KmlRendererSettings.B],
					(int) settings.areaAlpha);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.areaColor = new double[] { c.getRed(), c.getGreen(),
						c.getBlue() };

				settings.areaAlpha = c.getAlpha();
			}

		}// END: actionPerformed
	}// END: ListenAreaColor

	private class ListenAreaColorMapping implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				String attribute = item.toString();

				settings.areaColorMapping = attribute;

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenLineColorMapping


	private class ListenAreaStartColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color( //
					settings.minAreaRed.intValue(), //
					settings.minAreaGreen.intValue(), //
					settings.minAreaBlue.intValue(), //
					settings.minAreaAlpha.intValue() //
			);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.minAreaRed = Double.valueOf(c.getRed());
				settings.minAreaGreen = Double.valueOf(c.getGreen());
				settings.minAreaBlue = Double.valueOf(c.getBlue());
				settings.minAreaAlpha = Double.valueOf(c.getAlpha());
			}

		}// END: actionPerformed
	}// END: ListenPointStartColor

	private class ListenAreaEndColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color( //
					settings.maxAreaRed.intValue(), //
					settings.maxAreaGreen.intValue(), //
					settings.maxAreaBlue.intValue(), //
					settings.maxAreaAlpha.intValue() //
			);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.maxAreaRed = (double) c.getRed();
				settings.maxAreaGreen = (double) c.getGreen();
				settings.maxAreaBlue = (double) c.getBlue();
				settings.maxAreaAlpha = (double) c.getAlpha();
			}

		}// END: actionPerformed
	}// END: ListenPointEndColor





	// //////////////
	// ---COUNTS---//
	// //////////////

	private void populateCounts() {

		JPanel tmpPanel;

		// color
		tmpPanel = new JPanel();
		tmpPanel.setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
		tmpPanel.setBorder(new TitledBorder("Counts fixed color:"));
		countColor = new JButton("Color",
				InterfaceUtils.createImageIcon(InterfaceUtils.COLOR_WHEEL_ICON));
		countColor.addActionListener(new ListenCountColor());
		tmpPanel.add(countColor);
		c.gridx = 3;
		c.gridy = 0;
		settingsHolder.add(tmpPanel, c);

	}// END: populateCounts

	private class ListenCountColor implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			Color defaultColor = new Color(
					(int) settings.countColor[KmlRendererSettings.R],
					(int) settings.countColor[KmlRendererSettings.G],
					(int) settings.countColor[KmlRendererSettings.B],
					(int) settings.countAlpha);

			Color c = ColorPicker.showDialog(InterfaceUtils.getActiveFrame(),
					"Choose color...", defaultColor, true);

			if (c != null) {
				settings.countColor = new double[] { c.getRed(), c.getGreen(),
						c.getBlue() };

				settings.countAlpha = c.getAlpha();
			}

		}// END: actionPerformed
	}// END: ListenPointColor

	private class ListenRender implements ActionListener {
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

				render();

				File tmpDir = chooser.getCurrentDirectory();
				if (tmpDir != null) {
					frame.setWorkingDirectory(tmpDir);
				}

			}// END: approve check

		}// END: actionPerformed
	}// END: ListenRender

	private void render() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					KmlRenderer renderer = new KmlRenderer(settings);
					renderer.render();

				} catch (Exception e) {

					InterfaceUtils.handleException(e, e.getMessage());
					frame.setStatus("Exception occured.");
					frame.setIdle();

				}// END: try-catch

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
