package gui;

import gui.panels.AnalysisTypes;

import java.awt.GridBagConstraints;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JComboBox;
import javax.swing.JPanel;
import javax.swing.JSpinner;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SpinnerDateModel;
import javax.swing.SwingUtilities;

import org.joda.time.LocalDate;

@SuppressWarnings("serial")
public class DateEditor extends JPanel {

	// TODO : change to Joda's LocalDate

	private Date today;
	private JSpinner spinner;
	private SimpleDateFormat formatter;
	private JComboBox<Object> dateFormat;
	private boolean dateFormatCreated = false;

	private JTextField decimalDate;
	private boolean decimalFormatCreated = false;

	// private GridBagConstraints c;

	public DateEditor() {

		dateFormat = new JComboBox<Object>();
		ComboBoxModel<Object> dateFormatSelectorModel = new DefaultComboBoxModel<Object>(
				DateFormats.values());
		dateFormat.setModel(dateFormatSelectorModel);
		dateFormat.addItemListener(new ListenDateFormat());
		add(dateFormat);

		today = new Date();

		// set to default
		dateFormat.setSelectedIndex(0);
		populateDateFormat();

	}// END: Constructor

	private void resetEditor() {

		// remove previous
		if (decimalFormatCreated) {
			remove(decimalDate);
			decimalFormatCreated = false;
		}

		// remove previous
		if (dateFormatCreated) {
			remove(spinner);
			dateFormatCreated = false;
		}

	}// END: resetEditor

	private class ListenDateFormat implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				// if analysis type changed reset components below
				
				
				Object item = event.getItem();
				DateFormats type = (DateFormats) item;
				switch (type) {

				case DATE_FORMAT:
//					populateDateFormat();
					
					if (SwingUtilities.isEventDispatchThread()) {
						populateDateFormat();
					} else {
						SwingUtilities.invokeLater(new Runnable() {
							public void run() {
								populateDateFormat();
							}
						});
					}// END: edt check
					
					break;

				case DECIMAL_FORMAT:
					if (SwingUtilities.isEventDispatchThread()) {
						populateDecimalFormat();
						
					} else {
						SwingUtilities.invokeLater(new Runnable() {
							public void run() {
								populateDecimalFormat();
							}
						});
					}// END: edt check
//					populateDecimalFormat();
					break;

				default:
					break;

				}// END: switch

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenParserSelector

	private void populateDateFormat() {

		if (!dateFormatCreated) {

			resetEditor();

			formatter = new SimpleDateFormat("yyyy/MM/dd", Locale.US);

			spinner = new JSpinner(new SpinnerDateModel(today, null, null,
					Calendar.MONTH));
			spinner.setEditor(new JSpinner.DateEditor(spinner, "yyyy/MM/dd"));
			add(spinner);

			dateFormatCreated = true;
			callRepaint();
		}

	}// END: populateDateFormat

	private void populateDecimalFormat() {

		if (!decimalFormatCreated) {

			resetEditor();

			decimalDate = new JTextField(convertToDecimalDate(today), 10);
			add(decimalDate);
			decimalFormatCreated = true;
			callRepaint();
		}

	}// END: populateDecimalFormat

	public String getValue() {

		String date = null;

		if (dateFormatCreated) {

			date = formatter.format(spinner.getValue());

		} else if (decimalFormatCreated) {

			date = decimalDate.getText();

		} else {

			System.err.println("Something went horribly wrong!");
		}

		return date;
	}// END: getValue

	private String convertToDecimalDate(Date date) {

		LocalDate localDate = new LocalDate(date);

		int year = localDate.getYear();
		int month = localDate.getMonthOfYear();
		int day = localDate.getDayOfMonth();
		double decimalDate = year + (double) month / 12.0 + (double) day
				/ 365.0;

		DecimalFormat df = new DecimalFormat("#.##");
		String decimalDateString = df.format(decimalDate);

		return decimalDateString;
	}// END: convertToDecimalDate

	private void callRepaint() {
		this.repaint();
	}//END: callRepaint
	
}// END: class
