package gui;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.io.File;
import java.io.IOException;

import javax.swing.AbstractAction;
import javax.swing.Action;
import javax.swing.JComponent;
import javax.swing.JFileChooser;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JProgressBar;
import javax.swing.JTabbedPane;
import javax.swing.SwingUtilities;
import javax.swing.plaf.BorderUIResource;

import gui.panels.DataPanel;
import gui.panels.RenderingPanel;
import jam.framework.DocumentFrame;
import jam.framework.Exportable;
import utils.FortuneCookies;

@SuppressWarnings("serial")
public class MainFrame extends DocumentFrame implements FileMenuHandler {

	// tabs, there shall be three
	private JTabbedPane tabbedPane = new JTabbedPane();

	private final String DATA_TAB_NAME = "Data";
	private DataPanel dataPanel;
	private final String RENDERING_TAB_NAME = "Rendering";
	private RenderingPanel renderingPanel;
	private final String MERGE_TAB_NAME = "Merge";
	private MergePanel mergePanel;

	// labels
	private JLabel statusLabel;
	private JProgressBar progressBar;

	// Directories
	private File workingDirectory = null;

	public MainFrame(String title) {

		super();

		setTitle(title);
		// settings = new Settings();

	}// END: Constructor

	@Override
	protected void initializeComponents() {

		setSize(new Dimension(1300, 600));
		setMinimumSize(new Dimension(260, 100));

		dataPanel = new DataPanel(this);
		tabbedPane.addTab(DATA_TAB_NAME, null, dataPanel);

		renderingPanel = new RenderingPanel(this);
		tabbedPane.addTab(RENDERING_TAB_NAME, null, renderingPanel);

		mergePanel = new MergePanel(this);
		tabbedPane.addTab(MERGE_TAB_NAME, null, mergePanel);

		statusLabel = new JLabel(FortuneCookies.nextCookie());

		JPanel progressPanel = new JPanel(new BorderLayout(0, 0));
		progressBar = new JProgressBar();
		progressPanel.add(progressBar, BorderLayout.CENTER);

		JPanel statusPanel = new JPanel(new BorderLayout(0, 0));
		statusPanel.add(statusLabel, BorderLayout.CENTER);
		statusPanel.add(progressPanel, BorderLayout.EAST);
		statusPanel.setBorder(new BorderUIResource.EmptyBorderUIResource(new Insets(0, 6, 0, 6)));

		JPanel tabbedPanePanel = new JPanel(new BorderLayout(0, 0));
		tabbedPanePanel.add(tabbedPane, BorderLayout.CENTER);
		tabbedPanePanel.add(statusPanel, BorderLayout.SOUTH);
		tabbedPanePanel.setBorder(new BorderUIResource.EmptyBorderUIResource(new Insets(12, 12, 12, 12)));

		getContentPane().setLayout(new java.awt.BorderLayout(0, 0));
		getContentPane().add(tabbedPanePanel, BorderLayout.CENTER);

		tabbedPane.setSelectedComponent(dataPanel);

	}// END: initializeComponents

	// //////////////////////
	// ---SHARED METHODS---//
	// //////////////////////

	public void setStatus(final String status) {

		if (SwingUtilities.isEventDispatchThread()) {

			statusLabel.setText(status);

		} else {

			SwingUtilities.invokeLater(new Runnable() {
				public void run() {

					statusLabel.setText(status);

				}
			});
		} // END: edt check

	}// END: setStatus

	public void setBusy() {

		if (SwingUtilities.isEventDispatchThread()) {

			// simulationPanel.setBusy();
			progressBar.setIndeterminate(true);

		} else {

			SwingUtilities.invokeLater(new Runnable() {
				public void run() {

					// simulationPanel.setBusy();
					progressBar.setIndeterminate(true);

				}
			});
		} // END: edt check

	}// END: setBusy

	public void setIdle() {

		if (SwingUtilities.isEventDispatchThread()) {

			// simulationPanel.setIdle();
			progressBar.setIndeterminate(false);

		} else {

			SwingUtilities.invokeLater(new Runnable() {
				public void run() {

					// simulationPanel.setIdle();
					progressBar.setIndeterminate(false);

				}
			});
		} // END: edt check

	}// END: setIdle

	public File getWorkingDirectory() {
		return workingDirectory;
	}// END: getWorkingDirectory

	public void setWorkingDirectory(File workingDirectory) {
		this.workingDirectory = workingDirectory;
	}// END: setWorkingDirectory

	// /////////////////
	// ---MAIN MENU---//
	// /////////////////

	@Override
	public Action getSaveSettingsAction() {
		return new AbstractAction("Merge...") {
			public void actionPerformed(ActionEvent ae) {
				
				// shift focus to the merge pane
				tabbedPane.setSelectedIndex(2);
				
				JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Merge...");
				chooser.setMultiSelectionEnabled(false);
				chooser.setCurrentDirectory( getWorkingDirectory());

				int returnVal = chooser.showSaveDialog(InterfaceUtils.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String outputFilename = file.getAbsolutePath();

					mergePanel.generateOutput( outputFilename);

					File tmpDir = chooser.getCurrentDirectory();
					if (tmpDir != null) {
						 setWorkingDirectory(tmpDir);
					}

				} // END: approve check
			
			}//END: actionPerformed
		};
	}// END: getSaveSettingsAction

	@Override
	public Action getLoadSettingsAction() {
		return null;
	}

	public JComponent getExportableComponent() {
		JComponent exportable = null;
		Component component = tabbedPane.getSelectedComponent();

		if (component instanceof Exportable) {
			exportable = ((Exportable) component).getExportableComponent();
		} else if (component instanceof JComponent) {
			exportable = (JComponent) component;
		}

		return exportable;
	}// END: getExportableComponent

	@Override
	protected boolean readFromFile(File arg0) throws IOException {
		return false;
	}// END: readFromFile

	@Override
	protected boolean writeToFile(File arg0) throws IOException {
		return false;
	}// END: writeToFile

}// END: class
