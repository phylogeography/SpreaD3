package gui;

import jam.framework.Exportable;

import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.TableColumn;

@SuppressWarnings("serial")
public class MergePanel extends JPanel implements Exportable {
	
	// parent frame
	private MainFrame frame;
	
	// table	
	private JScrollPane scrollPane;
	private TableColumn column;
	private int rowCount;
	private JTable jsonTable = null;
	

	
	
	
	public MergePanel(MainFrame frame) {
		
		this.frame = frame;
		
		
		
		
	}//END: Constructor
	
	
	
	
	
	
	@Override
	public JComponent getExportableComponent() {
		return this;
	}// END: getExportableComponent
	
}//END: class
