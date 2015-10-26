package gui;

import java.awt.Component;

import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;

@SuppressWarnings("serial")
public class InteractiveRenderer extends DefaultTableCellRenderer {

	private JTable table;
	private InteractiveTableModel tableModel;
	protected int interactiveColumn;

	public InteractiveRenderer(JTable table, InteractiveTableModel tableModel,
			int interactiveColumn) {

		this.table = table;
		this.tableModel = tableModel;
		this.interactiveColumn = interactiveColumn;

	}// END: Constructor

	public Component getTableCellRendererComponent(JTable table, Object value,
			boolean isSelected, boolean hasFocus, int row, int column) {

		Component c = super.getTableCellRendererComponent(table, value,
				isSelected, hasFocus, row, column);

		if (column == interactiveColumn && hasFocus) {
			if ((tableModel.getRowCount() - 1) == row
					&& !tableModel.hasEmptyRow()) {
				tableModel.addEmptyRow();
			}

			highlightLastRow(row);
		}

		return c;
	}// END: getTableCellRendererComponent

	private void highlightLastRow(int row) {

		int lastrow = tableModel.getRowCount();
		if (row == lastrow - 1) {
			table.setRowSelectionInterval(lastrow - 1, lastrow - 1);
		} else {
			table.setRowSelectionInterval(row + 1, row + 1);
		}

		table.setColumnSelectionInterval(0, 0);
	}// END: highlightLastRow

}// END: getTableCellRendererComponent