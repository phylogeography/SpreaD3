package gui;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.util.LinkedList;

import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.table.AbstractTableModel;

@SuppressWarnings("serial")
public class JsonTableModel extends AbstractTableModel {

	private MainFrame frame;
	private LinkedList<JsonTableRecord> recordsList;

	public static final int JSON_INDEX = 0;
	public static final int POINTS_INDEX = 1;
	public static final int LINES_INDEX = 2;
	public static final int AREAS_INDEX = 3;
	public static final int COUNTS_INDEX = 4;
	public static final int GEOJSON_INDEX = 5;
	public static final int AXIS_INDEX = 6;

	public static String[] COLUMN_NAMES = { "JSON file", "Points", "Lines", "Areas", "Counts", "GeoJSON",
			"Axis attibutes" };

	private static final Class<?>[] COLUMN_TYPES = new Class<?>[] { JButton.class, // Json
			Boolean.class, // Points
			Boolean.class, // Lines
			Boolean.class, // Areas
			Boolean.class, // Counts
			Boolean.class, // GeoJSON
			Boolean.class // Axis attributes
	};

	public JsonTableModel(LinkedList<JsonTableRecord> recordsList, MainFrame frame) {

		this.frame = frame;
		this.recordsList = recordsList;

		addDefaultRow();

	}// END: Constructor

	@Override
	public void setValueAt(Object value, int row, int column) {

		switch (column) {
		case JSON_INDEX:
			// do nothing
			break;

		case POINTS_INDEX:
			recordsList.get(row).setPoints((Boolean) value);
			break;

		case LINES_INDEX:
			recordsList.get(row).setLines((Boolean) value);
			break;

		case AREAS_INDEX:
			recordsList.get(row).setAreas((Boolean) value);
			break;

		case COUNTS_INDEX:
			recordsList.get(row).setCounts((Boolean) value);
			break;

		case GEOJSON_INDEX:
			recordsList.get(row).setGeojson((Boolean) value);
			break;

		case AXIS_INDEX:

			// reset all rows
			for (int r = 0; r < getRowCount(); r++) {
				recordsList.get(r).setAxis(Boolean.FALSE);
			}

			// set this row
			recordsList.get(row).setAxis((Boolean) value);
			fireTableDataChanged();
			break;

		default:
			break;

		}// END: switch

		fireTableCellUpdated(row, column);
	}// END: setValueAt

	@Override
	public Object getValueAt(int row, int column) {
		switch (column) {

		case JSON_INDEX:
			JButton jsonFileButton = new JButton(InterfaceUtils.CHOOSE_FILE);
			jsonFileButton.addActionListener(new ListenLoadJsonFile(row));
			return jsonFileButton;

		case POINTS_INDEX:
			return recordsList.get(row).getPoints();

		case LINES_INDEX:
			return recordsList.get(row).getLines();

		case AREAS_INDEX:
			return recordsList.get(row).getAreas();

		case COUNTS_INDEX:
			return recordsList.get(row).getCounts();

		case GEOJSON_INDEX:
			return recordsList.get(row).getGeojson();

		case AXIS_INDEX:
			return recordsList.get(row).getAxis();

		default:
			return "Error";
		}
	}// END: getValueAt

	public boolean isCellEditable(int row, int column) {
		switch (column) {
		case JSON_INDEX:
			return false;
		case POINTS_INDEX:
			return true;
		case LINES_INDEX:
			return true;
		case AREAS_INDEX:
			return true;
		case COUNTS_INDEX:
			return true;
		case GEOJSON_INDEX:
			return true;
		case AXIS_INDEX:
			return true;
		default:
			return false;
		}
	}// END: isCellEditable

	public void addDefaultRow() {
		recordsList.add(new JsonTableRecord());
		fireTableDataChanged();
	}// END: addDefaultRow

	public void deleteRow(int row) {
		recordsList.remove(row);
		fireTableDataChanged();
	}// END: deleteRow

	public void setRow(int row, JsonTableRecord record) {
		recordsList.set(row, record);
		fireTableDataChanged();
	}// END: setRow

	@Override
	public int getColumnCount() {
		return COLUMN_NAMES.length;
	}// END: getColumnCount

	@Override
	public int getRowCount() {
		return recordsList.size();
	}// END: getRowCount

	@Override
	public Class<?> getColumnClass(int columnIndex) {
		return COLUMN_TYPES[columnIndex];
	}// END: getColumnClass

	@Override
	public String getColumnName(int column) {
		return COLUMN_NAMES[column];
	}// END: getColumnName

	private class ListenLoadJsonFile implements ActionListener {

		private int row;

		public ListenLoadJsonFile(int row) {
			this.row = row;
		}

		public void actionPerformed(ActionEvent ev) {

			try {

				String[] treeFiles = new String[] { ".json" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading JSON file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(treeFiles, "JSON files (*.json)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					setRow(row, new JsonTableRecord(filename));
					frame.setStatus(filename + " selected.");

				} else {
					frame.setStatus("Could not Open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenOpenTree

}// END: class
