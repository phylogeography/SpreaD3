package parsers;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
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
import data.structure.TimeLine;
import exceptions.AnalysisException;

public class TimeSlicerParser {

	private TimeSlicerSettings settings;

	public TimeSlicerParser(TimeSlicerSettings settings) {

		this.settings = settings;

	}// END: Constructor

	public SpreadData parse() throws IOException, ImportException, AnalysisException {

		TimeLine timeLine = null;
		LinkedList<Location> locationsList = null;
		LinkedList<Polygon> polygonsList = null;
		LinkedList<Line> linesList = null;

		// ---IMPORT---//

		// import slice heights
		
		double sliceHeights[] = null;
		if(settings.sliceHeights != null) {
			
			SliceHeightsParser sliceHeightsParser = new SliceHeightsParser(settings.sliceHeights);
			sliceHeights = sliceHeightsParser.parseSliceHeights();
			
		} else if(settings.tree != null) {
			
		RootedTree rootedTree = Utils.importRootedTree(settings.tree);
		sliceHeights = generateSliceHeights(rootedTree,
					settings.intervals);
			
		} else {
			
			throw new AnalysisException("Error parsing slice heights!");
			
		}//END: settings check
		
		// sort them in ascending order
		Arrays.sort(sliceHeights);
	
		System.out.println("Using as slice heights: ");
		Utils.printArray(sliceHeights);	
		
		// import trees
		NexusImporter treesImporter = new NexusImporter(new FileReader(
				settings.trees));

		// ---PARSE AND FILL STRUCTURES---//

		System.out.println("Parsing polygons");
		
		TimeSlicerPolygonsParser polygonsParser = new TimeSlicerPolygonsParser(
				sliceHeights,
				treesImporter, //
				settings.traits, //
//				settings.locationTrait, //
				settings.burnIn, //
				settings.gridSize, //
				settings.hpdLevel, //
//				settings.traits //
				settings.mrsd, //
				settings.timescaleMultiplier //
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

		SpreadData data = new SpreadData(timeLine, locationsList, layersList);

		return data;
	}// END: parse

	private double[] generateSliceHeights(RootedTree rootedTree,
			int numberOfIntervals) {

		double rootHeight = rootedTree.getHeight(rootedTree.getRootNode());
		double[] timeSlices = new double[numberOfIntervals];

		for (int i = 0; i < numberOfIntervals; i++) {

			timeSlices[i] = rootHeight
					- (rootHeight / (double) numberOfIntervals) * ((double) i);
		}

		return timeSlices;
	}// END: generateSliceHeights
	
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
