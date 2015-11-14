package gui;

import java.awt.Color;
import java.awt.Component;
import java.util.LinkedList;

import javax.swing.JButton;
import javax.swing.JTable;
import javax.swing.UIManager;
import javax.swing.border.LineBorder;
import javax.swing.table.TableCellRenderer;

import utils.Utils;

/**
 * @author Filip Bielejec
 * @version $Id$
 */
@SuppressWarnings("serial")
public class JTableButtonCellRenderer extends JButton implements TableCellRenderer {

	private LinkedList<JsonTableRecord> recordsList;

	public JTableButtonCellRenderer(LinkedList<JsonTableRecord> recordsList) {

		super();
		this.recordsList = recordsList;

		setOpaque(true);
	}// END: Constructor

	@Override
	public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected, boolean hasFocus,
			int row, int column) {

		JButton button = (JButton) value;

		if (isSelected) {
			button.setForeground(table.getSelectionForeground());
			button.setBackground(table.getSelectionBackground());
		} else {
			button.setForeground(table.getForeground());
			button.setBackground(UIManager.getColor("Button.background"));
		}

		if (hasFocus) {
			button.setBorder(new LineBorder(Color.BLUE));
		} else {
			button.setBorder(button.getBorder());
		}

		// label on button
		String label = InterfaceUtils.CHOOSE_FILE;
		if (!recordsList.get(row).getJsonFileName().isEmpty()) {

			label = recordsList.get(row).getJsonFileName();
			label = Utils.splitString(label, "/");
			
		}
		button.setText(label);

		return button;
	}// END: getTableCellRendererComponent

}// END: class
