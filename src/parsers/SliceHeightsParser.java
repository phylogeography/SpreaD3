package parsers;

import java.io.IOException;

import utils.Utils;

public class SliceHeightsParser {

	private String sliceHeights;

	public SliceHeightsParser(String sliceHeights) {
		this.sliceHeights = sliceHeights;
	}// END: Constructor

	public double[] parseSliceHeights() throws IOException {

		String[] lines = Utils.readLines(sliceHeights, Utils.HASH_COMMENT);
		int nrow = lines.length;

		double[] sliceHeights = new double[nrow];
		for (int i = 0; i < nrow; i++) {
			sliceHeights[i] = Double.parseDouble(lines[i]);
		}// END: i loop

		return sliceHeights;
	}// END: parseSliceHeights

}// END: class
