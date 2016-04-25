package parsers;

import java.io.IOException;

import utils.Utils;

public class SliceHeightsParser {

	private String sliceHeights;

	public SliceHeightsParser(String sliceHeights) {
		this.sliceHeights = sliceHeights;
	}// END: Constructor

	public Double[] parseSliceHeights() throws IOException {

		String[] lines = Utils.readLines(sliceHeights, Utils.HASH_COMMENT);
		int nrow = lines.length;

		Double[] sliceHeights = new Double[nrow];
		for (int i = 0; i < nrow; i++) {
			sliceHeights[i] = Double.parseDouble(lines[i]);
		}// END: i loop

		return sliceHeights;
	}// END: parseSliceHeights

}// END: class
