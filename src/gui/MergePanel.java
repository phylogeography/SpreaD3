package gui;

import java.awt.BorderLayout;
import java.awt.event.ActionEvent;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.swing.AbstractAction;
import javax.swing.Action;
import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.SwingWorker;
import javax.swing.table.TableColumn;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sun.org.apache.xerces.internal.util.SynchronizedSymbolTable;

import exceptions.AnalysisException;
import gui.panels.AnalysisTypes;
import jam.framework.Exportable;
import jam.panels.ActionPanel;
import parsers.ContinuousTreeSpreadDataParser;
import readers.JsonMerger;
import settings.reading.JsonMergerSettings;
import structure.data.SpreadData;
import utils.Utils;

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

		jsonTableModel = new JsonTableModel(this.settings.recordsList, this.frame);
		jsonTable.setModel(jsonTableModel);

		setLayout(new BorderLayout());

		scrollPane = new JScrollPane(jsonTable, JScrollPane.VERTICAL_SCROLLBAR_ALWAYS,
				JScrollPane.HORIZONTAL_SCROLLBAR_ALWAYS);
		RowNumberTable rowNumberTable = new RowNumberTable(jsonTable);
		scrollPane.setRowHeaderView(rowNumberTable);
		scrollPane.setCorner(JScrollPane.UPPER_LEFT_CORNER, rowNumberTable.getTableHeader());
		scrollPane.getViewport().setOpaque(false);
		add(scrollPane, BorderLayout.CENTER);

		setJsonColumn();
		setPointsColumn();
		setLinesColumn();
		setAreasColumn();
		setCountsColumn();
		setGeojsonColumn();
        setAxisAttributesColumn();
		
		ActionPanel actionPanel = new ActionPanel(false);
		actionPanel.setAddAction(addJsonAction);
		actionPanel.setRemoveAction(removeJsonAction);
		add(actionPanel, BorderLayout.SOUTH);

		adjustTable();

	}// END: Constructor

	private void setJsonColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.JSON_INDEX);
		column.setCellRenderer(new JTableButtonCellRenderer(this.settings.recordsList));
	}// END: setJSONColumn

	private void setPointsColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.POINTS_INDEX);
	}// END: setPointsColumn

	private void setLinesColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.LINES_INDEX);
	}// END: setLinesColumn

	private void setAreasColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.AREAS_INDEX);
	}// END: setAreasColumn

	private void setCountsColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.COUNTS_INDEX);
	}// END: setCountsColumn

	private void setGeojsonColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.GEOJSON_INDEX);
	}// END: setGeojsonColumn

	private void setAxisAttributesColumn() {
		column = jsonTable.getColumnModel().getColumn(JsonTableModel.AXIS_INDEX);
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

	public void generateOutput(final String outputFilename) {

		frame.setBusy();

		SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {

			// Executed in background thread
			public Void doInBackground() {

				try {

					List<String> points = new ArrayList<String>();
					List<String> lines = new ArrayList<String>();
					List<String> areas = new ArrayList<String>();
					List<String> counts = new ArrayList<String>();
					List<String> geojsons = new ArrayList<String>();
                    String axisFile = "";
					
					for (JsonTableRecord record : settings.recordsList) {

						if (record.getPoints()) {
							points.add(record.getJsonFileName());
						}

						if (record.getLines()) {
							lines.add(record.getJsonFileName());
						}

						if (record.getAreas()) {
							areas.add(record.getJsonFileName());
						}

						if (record.getCounts()) {
							counts.add(record.getJsonFileName());
						}

						if (record.getGeojson()) {
							geojsons.add(record.getJsonFileName());
						}

						if (record.getAxis()) {
							axisFile = record.getJsonFileName();
						}
						
					} // END: records loop

					if (points.size() != 0) {
						String[] pointsFiles = new String[points.size()];
						for (int i = 0; i < points.size(); i++) {
							pointsFiles[i] = points.get(i);
						}
						settings.pointsFiles = pointsFiles;
					}

					if (lines.size() != 0) {
						String[] linesFiles = new String[lines.size()];
						for (int i = 0; i < lines.size(); i++) {
							linesFiles[i] = lines.get(i);
						}
						settings.linesFiles = linesFiles;
					}

					if (areas.size() != 0) {
						String[] areasFiles = new String[areas.size()];
						for (int i = 0; i < areas.size(); i++) {
							areasFiles[i] = areas.get(i);
						}
						settings.areasFiles = areasFiles;
					}

					if (counts.size() != 0) {
						String[] countsFiles = new String[counts.size()];
						for (int i = 0; i < counts.size(); i++) {
							countsFiles[i] = counts.get(i);
						}
						settings.countsFiles = countsFiles;
					}

					if (geojsons.size() != 0) {
						String[] geojsonFiles = new String[geojsons.size()];
						for (int i = 0; i < geojsons.size(); i++) {
							geojsonFiles[i] = geojsons.get(i);
						}
						settings.geojsonFiles = geojsonFiles;
					}

					if(!axisFile.isEmpty()) {
						settings.axisAttributesFile = axisFile;
					}
					
					
					settings.outputFilename = outputFilename;

					JsonMerger merger = new JsonMerger(settings);
					SpreadData data = merger.merge();

					// ---EXPORT TO JSON---//

					Gson gson = new GsonBuilder().setPrettyPrinting().create();
					String s = gson.toJson(data);

					File file = new File(outputFilename);
					FileWriter fw;

					fw = new FileWriter(file);
					fw.write(s);
					fw.close();

				} catch (Exception e) {

					String message = "Unexpected exception occured when merging";
					if (e instanceof AnalysisException) {
						message += (": " + e.getMessage());
					}

					InterfaceUtils.handleException(e, message);
					frame.setStatus("Exception occured.");
					frame.setIdle();

				}

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

	@Override
	public JComponent getExportableComponent() {
		return this;
	}// END: getExportableComponent

}// END: class
