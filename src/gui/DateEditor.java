package gui;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import javax.swing.JPanel;
import javax.swing.JSpinner;
import javax.swing.SpinnerDateModel;

@SuppressWarnings("serial")
public class DateEditor extends JPanel {

	// TODO : add decimal format

	private Date today;
	private JSpinner spinner;
	private SimpleDateFormat formatter;

	public DateEditor() {

		formatter = new SimpleDateFormat("yyyy/MM/dd", Locale.US);
		today = new Date();

		spinner = new JSpinner(new SpinnerDateModel(today, null, null, Calendar.MONTH));

		spinner.setEditor(new JSpinner.DateEditor(spinner, "yyyy/MM/dd"));
		spinner.setOpaque(false);

		add(spinner);
		setOpaque(false);
	}

	public String getValue() {
		return formatter.format(spinner.getValue());
	}

}
