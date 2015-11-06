package gui;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Frame;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedList;

import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JMenuBar;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.ScrollPaneConstants;
import javax.swing.event.TableModelEvent;
import javax.swing.event.TableModelListener;
import javax.swing.table.TableColumn;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import parsers.DiscreteLocationsParser;
import settings.parsing.BayesFactorsSettings;
import settings.parsing.DiscreteSpreadDataSettings;
import settings.parsing.DiscreteTreeSettings;
import structure.data.Location;
import structure.data.primitive.Coordinate;
import utils.Utils;
import exceptions.AnalysisException;

public class LocationCoordinatesEditor {

	private MainFrame frame;
	// private DiscreteTreeSettings settings;

	// Window
	private JDialog window;
	private Frame owner;

	// Menubar
	private JMenuBar menu;

	// Buttons with options
	private JButton load;
	private JButton save;
	private JButton done;

	// Data, model & stuff for JTable
	private JTable table;
	private InteractiveTableModel tableModel;
	private String[] COLUMN_NAMES = { "Location", "Latitude", "Longitude", "" };

	// Return values
	private LinkedList<Location> locationsList;
	private boolean locationsEdited = false;

	public LocationCoordinatesEditor(MainFrame frame
	// DiscreteTreeSettings settings
	) {

		this.frame = frame;
		// this.settings = settings;

		// Setup Main Menu buttons
		load = new JButton("Load", InterfaceUtils.createImageIcon(InterfaceUtils.LOCATIONS_ICON));
		save = new JButton("Save", InterfaceUtils.createImageIcon(InterfaceUtils.SAVE_ICON));
		done = new JButton("Done", InterfaceUtils.createImageIcon(InterfaceUtils.CHECK_ICON));

		// // Add Main Menu buttons listeners
		// load.addActionListener(new ListenLoad());
		// save.addActionListener(new ListenSave());
		// done.addActionListener(new ListenDone());

		// Setup menu
		menu = new JMenuBar();
		menu.setLayout(new BorderLayout());
		JPanel buttonsHolder = new JPanel();
		buttonsHolder.setOpaque(false);
		buttonsHolder.add(load);
		buttonsHolder.add(save);
		buttonsHolder.add(done);
		menu.add(buttonsHolder, BorderLayout.WEST);

		// Setup table
		tableModel = new InteractiveTableModel(COLUMN_NAMES);
		tableModel.addTableModelListener(new InteractiveTableModelListener());
		table = new JTable(tableModel);
		table.setModel(tableModel);
		table.setSurrendersFocusOnKeystroke(true);

		TableColumn hidden = table.getColumnModel().getColumn(InteractiveTableModel.HIDDEN_INDEX);
		hidden.setMinWidth(2);
		hidden.setPreferredWidth(2);
		hidden.setMaxWidth(2);
		hidden.setCellRenderer(new InteractiveRenderer(table, tableModel, InteractiveTableModel.HIDDEN_INDEX));

		JScrollPane scrollPane = new JScrollPane(table, ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS,
				ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
		RowNumberTable rowNumberTable = new RowNumberTable(table);
		scrollPane.setRowHeaderView(rowNumberTable);
		scrollPane.setCorner(JScrollPane.UPPER_LEFT_CORNER, rowNumberTable.getTableHeader());

		// Setup window
		owner = InterfaceUtils.getActiveFrame();
		// modal, other operations blocked until closed
		window = new JDialog(owner, "Setup location coordinates...", true);
		window.getContentPane().add(menu, BorderLayout.NORTH);
		window.getContentPane().add(scrollPane);
		window.pack();
		window.setLocationRelativeTo(owner);

	}// END: Constructor

	public void launch(BayesFactorsSettings settings) {

		// Add Main Menu buttons listeners
		load.addActionListener(new ListenLoad(settings));
		save.addActionListener(new ListenSave());
		done.addActionListener(new ListenDone(settings));

		// reload if previously set up
		this.locationsList = settings.locationsList;

		// create one empty row
		if (locationsList == null) {
			locationsList = createEmptyLocation();
		}

		populateTable(locationsList);

		// Display Frame
		window.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
		window.setSize(new Dimension(350, 300));
		window.setMinimumSize(new Dimension(100, 100));
		window.setResizable(true);
		window.setVisible(true);

	}// END: launch

	private LinkedList<Location> createEmptyLocation() {

		String emptyId = "";
		Location emptyLocation = new Location(emptyId);
		LinkedList<Location> emptyList = new LinkedList<Location>();
		emptyList.add(emptyLocation);

		return emptyList;
	}// END: getEmptyLocations

	public void launch(DiscreteTreeSettings settings) {

		// Add Main Menu buttons listeners
		load.addActionListener(new ListenLoad(settings));
		save.addActionListener(new ListenSave());
		done.addActionListener(new ListenDone(settings));

		// reload if previously set up
		this.locationsList = settings.locationsList;

		try {

			// get the locations from tree
			if (locationsList == null) {
				locationsList = getUniqueLocations(settings.rootedTree, settings.locationAttributeName);
			}

			populateTable(locationsList);

			// Display Frame
			window.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
			window.setSize(new Dimension(350, 300));
			window.setMinimumSize(new Dimension(100, 100));
			window.setResizable(true);
			window.setVisible(true);

		} catch (AnalysisException e) {
			InterfaceUtils.handleException(e, e.getMessage());
		} // END: try-catch

	}// END: launch

	private void populateTable(LinkedList<Location> locationsList) {

		tableModel.cleanTable();

		for (int i = 0; i < locationsList.size(); i++) {

			Location location = locationsList.get(i);
			String longitude = Utils.EMPTY_STRING;
			String latitude = Utils.EMPTY_STRING;

			Coordinate coordinate = location.getCoordinate();
			if (coordinate != null) {
				longitude = String.valueOf(coordinate.getYCoordinate());
				latitude = String.valueOf(coordinate.getXCoordinate());
			}

			tableModel.insertRow(i, new TableRecord(location.getId(), longitude, latitude));

		} // END: row loop

	}// END: populateTable

	private class InteractiveTableModelListener implements TableModelListener {
		public void tableChanged(TableModelEvent ev) {

			if (ev.getType() == TableModelEvent.UPDATE) {
				int column = ev.getColumn();
				int row = ev.getFirstRow();
				table.setColumnSelectionInterval(column + 1, column + 1);
				table.setRowSelectionInterval(row, row);
			}

		}
	}// END: InteractiveTableModelListener

	private LinkedList<Location> getUniqueLocations(RootedTree rootedTree, String locationAttributeName)
			throws AnalysisException {

		LinkedList<Location> locationsList = new LinkedList<Location>();

		String nodeState;
		Location dummy;
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				try {

					// cast is very important here, see exception handling below
					// (DO NOT use valueOf()! )
					nodeState = (String) Utils.getObjectNodeAttribute(node, locationAttributeName);

				} catch (ClassCastException e) {

					String message = "Attribute " + locationAttributeName
							+ " cannot be used as a discrete location attribute.";
					throw new AnalysisException(message);
				}

				dummy = new Location(nodeState);
				if (!locationsList.contains(dummy)) {
					locationsList.add(dummy);
				}

			} // END: root check
		} // END: nodeloop

		return locationsList;
	}// END: getUniqueLocations

	private class ListenLoad implements ActionListener {

		private DiscreteSpreadDataSettings settings;

		public ListenLoad(DiscreteSpreadDataSettings settings) {
			this.settings = settings;
		}// END: Constructor

		public void actionPerformed(ActionEvent ev) {

			try {

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading location file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String locationsFilename = file.getAbsolutePath();
					settings.setLocationsFilename(locationsFilename);

					File tmpDir = chooser.getCurrentDirectory();
					if (tmpDir != null) {

						frame.setWorkingDirectory(tmpDir);

						DiscreteLocationsParser locationsParser = new DiscreteLocationsParser(
								settings.getLocationsFilename(), settings.hasHeader());
						LinkedList<Location> parsedLocationsList = locationsParser.parseLocations();

						// remove empty locations, likely just a first row
						for (Location location : locationsList) {
							if (location.getId().isEmpty()) {
								locationsList.remove(location);
							}
						}

						for (Location location : parsedLocationsList) {

							if (locationsList.contains(location)) {

								int index = locationsList.indexOf(location);
								locationsList.set(index, location);

							} else {

								locationsList.add(location);

							} // END: contains check

						} // END: locations loop

						// update the table
						populateTable(locationsList);

					} // END: null check

					frame.setStatus("Opened " + settings.getLocationsFilename());
				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (IOException e) {

				InterfaceUtils.handleException(e, e.getMessage());
				frame.setStatus("Exception occured.");

			} catch (AnalysisException e) {

				InterfaceUtils.handleException(e, e.getMessage());
				frame.setStatus("Exception occured.");

			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenOpenLocations

	private class ListenSave implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			JFileChooser chooser = new JFileChooser();
			chooser.setDialogTitle("Saving as tab delimited file...");

			int returnVal = chooser.showSaveDialog(InterfaceUtils.getActiveFrame());
			if (returnVal == JFileChooser.APPROVE_OPTION) {

				File file = chooser.getSelectedFile();
				String filename = file.getAbsolutePath();

				try {

					writeLocations(filename, locationsList);

				} catch (AnalysisException e) {

					InterfaceUtils.handleException(e, e.getMessage());
					frame.setStatus("Exception occured.");
				}

				frame.setStatus("Saved " + filename + "\n");

			} else {
				frame.setStatus("Could not Save! \n");
			}

		}// END: actionPerformed
	}// END: ListenSaveLocationCoordinates

	private void writeLocations(String filename, LinkedList<Location> locationsList) throws AnalysisException {

		try {

			PrintWriter printWriter = new PrintWriter(filename);

			for (int i = 0; i < locationsList.size(); i++) {

				Location location = locationsList.get(i);
				String longitude = Utils.EMPTY_STRING;
				String latitude = Utils.EMPTY_STRING;

				Coordinate coordinate = location.getCoordinate();
				if (coordinate != null) {
					longitude = String.valueOf(coordinate.getYCoordinate());
					latitude = String.valueOf(coordinate.getXCoordinate());
				}

				printWriter.println(location.getId() + Utils.TAB + longitude + Utils.TAB + latitude);

			} // END: row loop
			printWriter.close();

		} catch (FileNotFoundException e) {
			InterfaceUtils.handleException(e, e.getMessage());
		}

	}// END: writeLocations

	private class ListenDone implements ActionListener {

		private DiscreteSpreadDataSettings settings;

		public ListenDone(DiscreteSpreadDataSettings settings) {
			this.settings = settings;
		}// END: Constructor

		public void actionPerformed(ActionEvent ev) {

			// save edits made manually in the editor
			saveEdits();

			window.setVisible(false);
			settings.setLocationsList(locationsList);
			locationsEdited = true;

			frame.setStatus("Loaded " + locationsList.size() + " discrete locations");

		}// END: actionPerformed
	}// END: ListenDone

	private void saveEdits() {

		for (int i = 0; i < tableModel.getRowCount(); i++) {

			String id = (String) tableModel.getValueAt(i, InteractiveTableModel.LOCATION_INDEX);
			Location location = new Location(id);

			String longitudeString = tableModel.getValueAt(i, InteractiveTableModel.LONGITUDE_INDEX);
			String latitudeString = tableModel.getValueAt(i, InteractiveTableModel.LATITUDE_INDEX);

			if (!longitudeString.isEmpty() && !latitudeString.isEmpty()) {

				Double longitude = Double.valueOf(longitudeString);
				Double latitude = Double.valueOf(latitudeString);
				Coordinate coordinate = new Coordinate(latitude, longitude);
				location = new Location(id, coordinate);

			}

			locationsList.set(i, location);

		} // END: table loop

	}// END: saveEdits

	public boolean isEdited() {
		return locationsEdited;
	}

}// END: class
