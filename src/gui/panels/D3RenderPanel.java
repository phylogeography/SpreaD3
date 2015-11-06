package gui.panels;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;

import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.SwingWorker;

import gui.InterfaceUtils;
import gui.MainFrame;
import gui.OptionsPanel;
import gui.SimpleFileFilter;
import renderers.d3.D3Renderer;
import settings.rendering.D3RendererSettings;

@SuppressWarnings("serial")
public class D3RenderPanel extends OptionsPanel {

	private MainFrame frame;

	private D3RendererSettings settings;

	// Buttons
	private JButton loadJson;
	private boolean loadJsonCreated = false;
	private JButton render;
	private boolean renderCreated = false;

	public D3RenderPanel(MainFrame frame) {

		this.frame = frame;

		populatePanel();

	}// END: Constructor

	public void populatePanel() {

		this.settings = new D3RendererSettings();

		resetFlags();

		if (!loadJsonCreated) {
			loadJson = new JButton("Load",
					InterfaceUtils.createImageIcon(InterfaceUtils.JSON_ICON));
			loadJson.addActionListener(new ListenLoadJson());
			addComponentWithLabel("Load JSON file:", loadJson);
			loadJsonCreated = true;
		}

	}// END: populateHolderPanel

	private class ListenLoadJson implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			try {

				String[] jsonFiles = new String[] { "json", "spread" };

				final JFileChooser chooser = new JFileChooser();
				chooser.setDialogTitle("Loading JSON file...");
				chooser.setMultiSelectionEnabled(false);
				chooser.addChoosableFileFilter(new SimpleFileFilter(jsonFiles,
						"JSON files (*.json, *.spread)"));
				chooser.setCurrentDirectory(frame.getWorkingDirectory());

				int returnVal = chooser.showOpenDialog(InterfaceUtils
						.getActiveFrame());
				if (returnVal == JFileChooser.APPROVE_OPTION) {

					File file = chooser.getSelectedFile();
					String filename = file.getAbsolutePath();

					File tmpDir = chooser.getCurrentDirectory();

					if (tmpDir != null) {
						frame.setWorkingDirectory(tmpDir);
					}

					settings.jsonFilename = filename;
					frame.setStatus(settings.jsonFilename + " selected.");
					populateRender();

				} else {
					frame.setStatus("Could not open! \n");
				}

			} catch (Exception e) {
				InterfaceUtils.handleException(e, e.getMessage());
			} // END: try-catch block

		}// END: actionPerformed
	}// END: ListenLoadJson

	private void populateRender() {
		if (!renderCreated) {
			render = new JButton("Render",
					InterfaceUtils.createImageIcon(InterfaceUtils.SAVE_ICON));
			render.addActionListener(new ListenRender());
			addComponentWithLabel("Parse JSON:", render);
			renderCreated = true;
		}
	}// END: populateRender

	private class ListenRender implements ActionListener {
		public void actionPerformed(ActionEvent ev) {

			JFileChooser chooser = new JFileChooser();
			chooser.setDialogTitle("Generate...");
			chooser.setMultiSelectionEnabled(false);
			chooser.setCurrentDirectory(frame.getWorkingDirectory());

			int returnVal = chooser.showSaveDialog(InterfaceUtils
					.getActiveFrame());
			if (returnVal == JFileChooser.APPROVE_OPTION) {

				File file = chooser.getSelectedFile();
				settings.outputFilename = file.getAbsolutePath();

				render();

				File tmpDir = chooser.getCurrentDirectory();
				if (tmpDir != null) {
					frame.setWorkingDirectory(tmpDir);
				}

			}// END: approve check

		}// END: actionPerformed
	}// END: ListenRender

	private void render() {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					D3Renderer d3Renderer = new D3Renderer(settings);
					d3Renderer.render();

				} catch (Exception e) {

					InterfaceUtils.handleException(e, e.getMessage());
					frame.setStatus("Exception occured.");
					frame.setIdle();

				}// END: try-catch

				return null;
			}// END: doInBackground

			// Executed in event dispatch thread
			public void done() {

				frame.setStatus("Generated " + settings.outputFilename);
				frame.setIdle();

			}// END: done
		};

		worker.execute();

	}// END: generateOutput

	private void resetFlags() {

		loadJsonCreated = false;
		renderCreated = false;

	}// END: resetFlags

}// END: class
