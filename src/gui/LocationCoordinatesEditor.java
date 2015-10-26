package gui;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Frame;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;
import java.util.HashSet;
import java.util.Set;

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
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.TableColumn;

import settings.parsing.DiscreteTreeSettings;
import jebl.evolution.graphs.Node;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.trees.RootedTree;

public class LocationCoordinatesEditor {

	private MainFrame frame;
	private File workingDirectory;
	private DiscreteTreeSettings settings;
	
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
	
	public LocationCoordinatesEditor(MainFrame frame, //
			File workingDirectory, //
			DiscreteTreeSettings settings
			) {
		
		this.frame = frame;
		this.workingDirectory = workingDirectory;
		
		
		// Add Main Menu buttons listeners
//		load.addActionListener(new ListenOpenLocations());
//		save.addActionListener(new ListenSaveLocationCoordinates());
//		done.addActionListener(new ListenOk());

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

		TableColumn hidden = table.getColumnModel().getColumn(
				InteractiveTableModel.HIDDEN_INDEX);
		hidden.setMinWidth(2);
		hidden.setPreferredWidth(2);
		hidden.setMaxWidth(2);
		hidden.setCellRenderer(new InteractiveRenderer(
				table, tableModel, InteractiveTableModel.HIDDEN_INDEX));

		JScrollPane scrollPane = new JScrollPane(table,
				ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS,
				ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
		RowNumberTable rowNumberTable = new RowNumberTable(table);
		scrollPane.setRowHeaderView(rowNumberTable);
		scrollPane.setCorner(JScrollPane.UPPER_LEFT_CORNER, rowNumberTable
				.getTableHeader());
		
		// Setup window
		owner = InterfaceUtils.getActiveFrame();
		window = new JDialog(owner, "Setup location coordinates...");
		window.getContentPane().add(menu, BorderLayout.NORTH);
		window.getContentPane().add(scrollPane);
		window.pack();
		window.setLocationRelativeTo(owner);
		
		
	}//END: Constructor
	
	
	public void launch(
			) {

//		try {


//			if(treeFilename == null) {
//				Utils.handleError("Must open a file first.");
//				return;
//			}

			RootedTree tree =  settings.rootedTree;

//			Object[] uniqueTreeStates = getUniqueTreeStates(tree, stateAttName);

//			for (int i = 0; i < uniqueTreeStates.length; i++) {
//
//				tableModel.insertRow(i, new TableRecord(String
//						.valueOf(uniqueTreeStates[i]), "", ""));
//
//			}// END: row loop

			// Display Frame
			window.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
			window.setSize(new Dimension(350, 300));
			window.setMinimumSize(new Dimension(100, 100));
			window.setResizable(true);
			window.setVisible(true);

//		} catch (Exception e) {
//			InterfaceUtils.handleException(e, e.getMessage());
//		}// END: try-catch block

	}// END: launch
	
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

}// END: class
