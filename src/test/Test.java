package test;

import java.awt.*;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

/**
 * @see http://stackoverflow.com/questions/7920068
 * @see http://stackoverflow.com/questions/4526779
 */
public class Test extends JPanel {

	private static final int CHECK_COL = 1;
	private static final Object[][] DATA = { { "One", Boolean.FALSE }, { "Two", Boolean.FALSE },
			{ "Three", Boolean.FALSE }, { "Four", Boolean.FALSE }, { "Five", Boolean.FALSE }, { "Six", Boolean.FALSE },
			{ "Seven", Boolean.FALSE }, { "Eight", Boolean.FALSE }, { "Nine", Boolean.FALSE },
			{ "Ten", Boolean.FALSE } };
	private static final String[] COLUMNS = { "Number", "CheckBox" };
	private DataModel dataModel = new DataModel(DATA, COLUMNS);
	private JTable table = new JTable(dataModel);
	private ControlPanel cp = new ControlPanel();

	public Test() {
		super(new BorderLayout());
		this.add(new JScrollPane(table));
		this.add(cp, BorderLayout.SOUTH);
		table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
		table.setPreferredScrollableViewportSize(new Dimension(250, 175));
	}

	private class DataModel extends DefaultTableModel {

		public DataModel(Object[][] data, Object[] columnNames) {
			super(data, columnNames);
		}

		@Override
		public void setValueAt(Object aValue, int row, int col) {
			if (col == CHECK_COL) {
				for (int r = 0; r < getRowCount(); r++) {
					super.setValueAt(false, r, CHECK_COL);
				}
			}
			super.setValueAt(aValue, row, col);
//			cp.button.setEnabled(any());
		}

//		private boolean any() {
//			boolean result = false;
//			for (int r = 0; r < getRowCount(); r++) {
//				Boolean b = (Boolean) getValueAt(r, CHECK_COL);
//				result |= b;
//			}
//			return result;
//		}

		@Override
		public Class<?> getColumnClass(int col) {
			if (col == CHECK_COL) {
				return getValueAt(0, CHECK_COL).getClass();
			}
			return super.getColumnClass(col);
		}

		@Override
		public boolean isCellEditable(int row, int col) {
			return col == CHECK_COL;
		}
	}

	private class ControlPanel extends JPanel {

//		JButton button = new JButton("Button");

		public ControlPanel() {
//			button.setEnabled(false);
//			this.add(new JLabel("Selection:"));
//			this.add(button);
		}
	}

	private static void createAndShowUI() {
		JFrame frame = new JFrame("CheckOne");
		frame.add(new Test());
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.pack();
		frame.setLocationRelativeTo(null);
		frame.setVisible(true);
	}

	public static void main(String[] args) {
		java.awt.EventQueue.invokeLater(new Runnable() {

			@Override
			public void run() {
				createAndShowUI();
			}
		});
	}
}