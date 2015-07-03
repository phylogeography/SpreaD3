package parsers;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;

import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.trees.RootedTree;
import settings.parsing.TimeSlicerSettings;
import utils.Utils;
import data.SpreadData;
import data.structure.Layer;
import data.structure.Line;
import data.structure.Location;
import data.structure.Polygon;
import exceptions.AnalysisException;

public class TimeSlicerParser {

	private TimeSlicerSettings settings;

	public TimeSlicerParser(TimeSlicerSettings settings) {

		this.settings = settings;

	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException, AnalysisException {

		LinkedList<Location> locationsList = null;
		LinkedList<Polygon> polygonsList = null;
		LinkedList<Line> linesList = null;

		// ---IMPORT---//

		RootedTree rootedTree = Utils.importRootedTree(settings.tree);
		NexusImporter treesImporter = new NexusImporter(new FileReader(
				settings.trees));

		// ---PARSE AND FILL STRUCTURES---//

		System.out.println("Parsing polygons");
		
		TimeSlicerPolygonsParser polygonsParser = new TimeSlicerPolygonsParser(
				rootedTree, //
				treesImporter, //
				settings.traits, //
				settings.intervals, //
//				settings.locationTrait, //
				settings.burnIn, //
				settings.gridSize, //
				settings.hpdLevel, //
//				settings.traits //
				settings.mrsd
		);

		int assumedTrees = getAssumedTrees(settings.trees);
		
		if(settings.burnIn >= assumedTrees) {
			throw new AnalysisException("Trying to burn too many trees!");
		}
		
		polygonsParser.setAssumedTrees(assumedTrees);
		polygonsList = polygonsParser.parsePolygons();

		System.out.println("Parsed polygons");

		LinkedList<Layer> layersList = new LinkedList<Layer>();

		Layer layer = new Layer(settings.trees, "Time Slicer visualisation",
				linesList, polygonsList);

		layersList.add(layer);

		SpreadData data = new SpreadData(locationsList, layersList);

		return data;
	}// END: parse

	private int getAssumedTrees(String file) throws IOException {
		// TODO: this method is a hack
		InputStream is = new BufferedInputStream(new FileInputStream(file));

		try {

			String mark = ";";
			int markCount = 0;
			int markBorder = 6;

			byte[] c = new byte[1024];
			int count = 0;
			int readChars = 0;
			boolean empty = true;

			while ((readChars = is.read(c)) != -1) {

				empty = false;
				for (int i = 0; i < readChars; i++) {

					if (String.valueOf((char) c[i]).equalsIgnoreCase(mark)) {

						markCount++;

					}

					if (c[i] == '\n' && markCount > markBorder) {
						count++;
					}

				}

			}// END: loop

			count = count - 1;
			return (count == 0 && !empty) ? 1 : count;

		} finally {
			is.close();
		}
	}// END: countStringInFile

}// END: class
