package gui;

import jam.framework.Exportable;
import jam.panels.ActionPanel;
import jam.table.TableRenderer;
import settings.reading.JsonMergerSettings;

import java.awt.BorderLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;

import javax.swing.AbstractAction;
import javax.swing.Action;
import javax.swing.DefaultCellEditor;
import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.TableColumn;

@SuppressWarnings("serial")
public class MergePanel extends JPanel implements Exportable {

	// parent frame
	private MainFrame frame;
	private JsonMergerSettings settings;

	// table
	private JScrollPane scrollPane;
	private TableColumn column;
	private int rowCount;
	private JTable jsonTable = null;

	private JsonTableModel jsonTableModel;

	private Action addJsonAction = new AbstractAction("+") {
		public void actionPerformed(ActionEvent ae) {

			jsonTableModel.addDefaultRow();
			adjustTable();

		}// END: actionPerformed

	};

	private Action removeJsonAction = new AbstractAction("-") {
		public void actionPerformed(ActionEvent ae) {
			if (rowCount > 1) {

				jsonTableModel.deleteRow(rowCount - 1);
				// frame.fireTaxaChanged();
				adjustTable();

			}
		}// END: actionPerformed
	};

	public MergePanel(MainFrame frame) {

		this.frame = frame;
		this.settings = new JsonMergerSettings();

		jsonTable = new JTable();
		jsonTable.getTableHeader().setReorderingAllowed(false);
		jsonTable.addMouseListener(new JTableButtonMouseListener(jsonTable));

		jsonTableModel = new JsonTableModel(this.settings.recordsList, frame);
		jsonTable.setModel(jsonTableModel);

		setLayout(new BorderLayout());

		scrollPane = new JScrollPane(jsonTable, JScrollPane.VERTICAL_SCROLLBAR_ALWAYS,
				JScrollPane.HORIZONTAL_SCROLLBAR_ALWAYS);
		RowNumberTable rowNumberTable = new RowNumberTable(jsonTable);
		scrollPane.setRowHeaderView(rowNumberTable);
		scrollPane.setCorner(JScrollPane.UPPER_LEFT_CORNER, rowNumberTable.getTableHeader());
		scrollPane.getViewport().setOpaque(false);
		add(scrollPane, BorderLayout.CENTER);

		setJSONColumn();
		setPointsColumn();
		setLinesColumn();
		setAreasColumn();
		setCountsColumn();
		setGeojsonColumn();

		ActionPanel actionPanel = new ActionPanel(false);
		actionPanel.setAddAction(addJsonAction);
		actionPanel.setRemoveAction(removeJsonAction);
		add(actionPanel, BorderLayout.SOUTH);

		adjustTable();

	}// END: Constructor

	private void setJSONColumn() {

		column = jsonTable.getColumnModel().getColumn(JsonTableModel.JSON_INDEX);
		// // pass dataList for labels on buttons
		column.setCellRenderer(new JTableButtonCellRenderer(
		// dataList, TreesTableModel.TAXA_SET_INDEX
		));
		column.setCellEditor(new JTableButtonCellEditor());

	}// END: setJSONColumn

	private void setPointsColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.POINTS_INDEX);
		column.setCellRenderer(new JTableCheckboxCellRenderer());
	}// END: setPointsColumn

	private void setLinesColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.LINES_INDEX);
		column.setCellRenderer(new JTableCheckboxCellRenderer());
	}// END: setLinesColumn

	private void setAreasColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.AREAS_INDEX);
		column.setCellRenderer(new JTableCheckboxCellRenderer());
	}// END: setAreasColumn

	private void setCountsColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.COUNTS_INDEX);
		column.setCellRenderer(new JTableCheckboxCellRenderer());
	}// END: setCountsColumn
	
	private void setGeojsonColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.GEOJSON_INDEX);
		column.setCellRenderer(new JTableCheckboxCellRenderer());
	}// END: setGeojsonColumn

	private void adjustTable() {
		
		rowCount = settings.recordsList.size();
		addJsonAction.setEnabled(true);
		if (rowCount == 1) {
			removeJsonAction.setEnabled(false);
		} else {
			removeJsonAction.setEnabled(true);
		}

		ColumnResizer.adjustColumnPreferredWidths(jsonTable);
	}// END: adjustTable

	@Override
	public JComponent getExportableComponent() {
		return this;
	}// END: getExportableComponent

}// END: class
