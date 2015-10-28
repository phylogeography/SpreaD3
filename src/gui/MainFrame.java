package gui;

import jam.framework.DocumentFrame;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Insets;
import java.io.File;
import java.io.IOException;

import javax.swing.Action;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JProgressBar;
import javax.swing.JTabbedPane;
import javax.swing.SwingUtilities;
import javax.swing.plaf.BorderUIResource;

import app.Spread2App;

@SuppressWarnings("serial")
public class MainFrame extends DocumentFrame implements FileMenuHandler {

	// tabs, there shall be two
	private JTabbedPane tabbedPane = new JTabbedPane();

	private final String DATA_TAB_NAME = "Data";
	private DataPanel dataPanel;

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

		statusLabel = new JLabel("Welcome to " + Spread2App.SHORT_NAME);

		JPanel progressPanel = new JPanel(new BorderLayout(0, 0));
		progressBar = new JProgressBar();
		progressPanel.add(progressBar, BorderLayout.CENTER);

		JPanel statusPanel = new JPanel(new BorderLayout(0, 0));
		statusPanel.add(statusLabel, BorderLayout.CENTER);
		statusPanel.add(progressPanel, BorderLayout.EAST);
		statusPanel.setBorder(new BorderUIResource.EmptyBorderUIResource(
				new Insets(0, 6, 0, 6)));

		JPanel tabbedPanePanel = new JPanel(new BorderLayout(0, 0));
		tabbedPanePanel.add(tabbedPane, BorderLayout.CENTER);
		tabbedPanePanel.add(statusPanel, BorderLayout.SOUTH);
		tabbedPanePanel.setBorder(new BorderUIResource.EmptyBorderUIResource(
				new Insets(12, 12, 12, 12)));

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
		}// END: edt check

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
		}// END: edt check

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
		}// END: edt check

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
	public Action getLoadSettingsAction() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Action getSaveSettingsAction() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JComponent getExportableComponent() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	protected boolean readFromFile(File arg0) throws IOException {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	protected boolean writeToFile(File arg0) throws IOException {
		// TODO Auto-generated method stub
		return false;
	}

}// END: class
