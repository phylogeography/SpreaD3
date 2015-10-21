package parsers;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import utils.Utils;

public class LogParser {

	// two commented lines and header. This is a hack off course
	private static final int SKIPPED_LINES = 3;
	private static final int HEADER_ROW = 0;
	private String log;
	private Double burnin;

	public LogParser(String log, Double burnin) {

		this.log = log;
		this.burnin = burnin;

	}// END: Constructor

	public Double[][] parseIndicators() throws IOException {

		String[] lines = Utils.readLines(log, Utils.HASH_COMMENT);
		String[] columnNames = lines[HEADER_ROW].split("\t");

		// Utils.printArray(columnNames);

		int nrow = lines.length - 1;

		// Find columns with indicators
		List<Integer> columns = new LinkedList<Integer>();
		Pattern pattern = Pattern.compile(Utils.INDICATORS);
		for (int i = 0; i < columnNames.length; i++) {

			// Look for matches in column names
			Matcher matcher = pattern.matcher(columnNames[i]);
			if (matcher.find()) {
				columns.add(i);
			}

		}// END: column names loop

		int ncol = columns.size();
		int skip = (int) ((burnin / 100 * nrow));

		// parse indicator columns
		Double[][] indicators = new Double[nrow - skip][ncol];
		int i = 0;
		for (int row = 1; row <= nrow; row++) {

			if (row > skip) {

				String[] line = lines[row].split(Utils.BLANK_SPACE);

				for (int col = 0; col < ncol; col++) {

					if (columns.get(col) > line.length) {
						System.out
								.println("Empty or malformed input at line "
										+ (row + SKIPPED_LINES)
										+ " inside log file. Resulting output may not be correct!");
						
						// copy array with one less row
						indicators = cloneArray(indicators, i);
						break;

					} else {

						indicators[i][col] = Double.valueOf(line[columns
								.get(col)]);

					}

				}// END: col loop

				i++;
			}// END: burn-in check

		}// END: row loop

		return indicators;
	}// END: parseLog

	private Double[][] cloneArray(Double[][] src, int nrow) {

		// int length = src.length;
		Double[][] target = new Double[nrow][src[0].length];

		for (int i = 0; i < nrow; i++) {
			System.arraycopy(src[i], 0, target[i], 0, src[i].length);
		}

		return target;
	}

}// END: class
