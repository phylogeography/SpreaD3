package utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;
import structure.data.primitive.Coordinate;
import exceptions.AnalysisException;

public class Utils {

	// Use this for all random numbers
	private static final Random random = new Random();
	public static final double EARTH_RADIUS = 6371.0;

	// /////////////////////
	// ---PARSING UTILS---//
	// /////////////////////

	public static final String BLANK_SPACE = "\\s+";
	public static final String TAB = "\t";
	public static final String HASH_COMMENT = "#";
	public static final String INDICATORS = "indicators";
	public static final String DURATION = "duration";
	public static final String DISTANCE = "distance";
	public static final String LOCATION = "location";
	public static final String POSTERIOR = "posterior";
	// public static final String HPD = "hpd";
	public static final String START = "start";
	public static final String END = "end";
	public static final String ONE = "1";
	public static final String TWO = "2";
	public static final String RATE = "rate";
	public static final String PRECISION = "precision";
	public static final int LATITUDE_INDEX = 0;
	public static final int LONGITUDE_INDEX = 1;
	public static final String HPD = "hpd";
	public static final String TRAIT = "trait";
	public static final int YEAR_INDEX = 0;
	public static final int MONTH_INDEX = 1;
	public static final int DAY_INDEX = 2;

	public static String splitString(String string, String c) {
		 String[] id = string.split(c);
		 return id[id.length - 1];
	}//END: splitString
	
	public static Double getNodeHeight(RootedTree tree, Node node) {

		Double nodeHeight = tree.getHeight(node);

//		if (nodeHeight == null) {
//			throw new RuntimeException("Height attribute missing from the node. \n");
//		}

		return nodeHeight;
	}// END: getHeight

	public static Object getNodeAttribute(Node node, String traitName) throws AnalysisException {

		Object nodeAttribute = node.getAttribute(traitName);

		if (nodeAttribute == null) {
			throw new AnalysisException("Attribute " + traitName + " missing from the node. \n");
		}

		return nodeAttribute;
	}// END: getNodeTrait

	public static Object getObjectNodeAttribute(Node node, String attributeName) throws AnalysisException {

		Object nodeAttribute = node.getAttribute(attributeName);

		if (nodeAttribute == null) {
			throw new AnalysisException("Attribute " + attributeName + " missing from the node. \n");
		}

		return nodeAttribute;
	}// END: getObjectNodeAttribute

	public static Object[] getObjectArrayNodeAttribute(Node node, String attributeName) throws AnalysisException {

		Object[] nodeAttributeArray = (Object[]) node.getAttribute(attributeName);

		if (nodeAttributeArray == null) {
			throw new AnalysisException("Attribute " + attributeName + " missing from the node. \n");
		}

		return nodeAttributeArray;
	}// END: getObjectArrayNodeAttribute

	public static Double[] getDoubleArrayNodeAttribute(Node node, String attributeName) throws AnalysisException {

		Object[] o = getObjectArrayNodeAttribute(node, attributeName);

		Double[] array = new Double[o.length];
		for (int i = 0; i < o.length; i++) {
			array[i] = Double.valueOf(o[i].toString());
		}

		return array;
	}// END: getDoubleArrayNodeAttribute

	public static Object[] getObjectArrayTreeAttribute(RootedTree tree, String attributeName) {

		Object o = tree.getAttribute(attributeName);

		if (o == null) {
			throw new RuntimeException("Attribute " + attributeName + " missing from the tree. \n");
		}

		return (Object[]) o;
	}// END: getObjectArrayTreeAttribute

	public static Double[] getDoubleArrayTreeAttribute(RootedTree tree, String attributeName) {

		Object[] o = getObjectArrayTreeAttribute(tree, attributeName);

		Double[] array = new Double[o.length];
		for (int i = 0; i < o.length; i++) {
			array[i] = Double.valueOf(o[i].toString());
		}

		return array;
	}// END: getDoubleArrayNodeAttribute

	public static String[] readLines(String filename, String comment) throws IOException {

		FileReader fileReader = new FileReader(filename);
		BufferedReader bufferedReader = new BufferedReader(fileReader);
		List<String> lines = new ArrayList<String>();

		String line = null;
		while ((line = bufferedReader.readLine()) != null) {

			// skip commented lines
			if (!line.contains(comment)) {
				lines.add(line);
			} // END: commented line check

		} // END: lines loop

		bufferedReader.close();

		return lines.toArray(new String[lines.size()]);
	}// END: readLines

	public static String breakTiesRandomly(String tiedState) {

		String[] array = tiedState.split("\\+");
		String state = (String) Utils.pickRand(array);

		return state;
	}// END: breakTiesRandomly

	public static RootedTree importRootedTree(String tree) throws IOException, ImportException {
		TreeImporter importer = new NexusImporter(new FileReader(tree));
		RootedTree rootedTree = (RootedTree) importer.importNextTree();

		return rootedTree;
	}// END: importRootedTree

	// ///////////////////
	// ---PRINT UTILS---//
	// ///////////////////

	public static void printArray(double[] x) {
		for (int i = 0; i < x.length; i++) {
			System.out.print(x[i] + " ");
		}
		System.out.println();
	}// END: printArray

	public static void printArray(Object[] x) {
		for (int i = 0; i < x.length; i++) {
			System.out.print(x[i] + " ");
		}
		System.out.println();
	}// END: printArray

	public static void headArray(Object[] x, int nrow) {
		for (int i = 0; i < nrow; i++) {
			System.out.print(x[i] + " ");
		}
		System.out.println();
	}// END: printArray

	public static void printMap(Map<?, ?> map) {

		Iterator<?> it = map.entrySet().iterator();
		while (it.hasNext()) {
			Entry<?, ?> pairs = (Entry<?, ?>) it.next();
			System.out.println(pairs.getKey() + " = " + pairs.getValue());
		}
	}// END: printMap

	public static void printList(List<?> x) {
		for (int i = 0; i < x.size(); i++) {
			System.out.print(x.get(i) + " ");
		}
		System.out.println();
	}// END: printArray

	public static void print2DArray(Object[][] array) {
		int nRow = array[0].length;  
		int nCol = array.length;  
		for (int row = 0; row < nRow; row++) {
			for (int col = 0; col < nCol; col++) {
				System.out.print(array[row][col] + " ");
			}
			System.out.print("\n");
		}
	}// END: print2DArray
	
	public static void print2DArray(int[][] array) {
		int nRow = array.length;  
		int nCol = array[0].length;  
		for (int row = 0; row < nRow; row++) {
			for (int col = 0; col < nCol; col++) {
				System.out.print(array[row][col] + " ");
			}
			System.out.print("\n");
		}
	}// END: print2DArray
	
	public static void printProgressBar(double progressPercentage, int barLength) {

		System.out.print("\r[");
		int i = 0;
		for (; i < (int) (progressPercentage * (barLength - 1)); i++) {
			System.out.print("*");
		}

		for (; i < barLength - 1; i++) {
			System.out.print(" ");
		}

		System.out.print("]");
	}// END: updateProgress

	// ///////////////////////////
	// ---MATH UTILS---//
	// ///////////////////////////

	public static double round(double value, double precision) {
		return (double) Math.round(value * precision) / precision;
	}//END: round

	// ///////////////////////////
	// ---RANDOM NUMB3R UTILS---//
	// ///////////////////////////

	public static Object pickRand(Object[] array) {
		int rnd = random.nextInt(array.length);
		return array[rnd];
	}// END: pickRand

	// ///////////////////////
	// ---GEOGRAPHY UTILS---//
	// ///////////////////////

	public static double rhumbDistance(Coordinate startCoordinate, Coordinate endCoordinate) {
		/**
		 * Returns the distance from start point to the end point in km,
		 * travelling along a rhumb line
		 * 
		 * @param startCoordinate
		 * @param endCoordinate
		 * @return distance in km
		 */
		double rlon1 = Math.toRadians(startCoordinate.getLongitude());
		double rlat1 = Math.toRadians(startCoordinate.getLatitude());
		double rlon2 = Math.toRadians(endCoordinate.getLongitude());
		double rlat2 = Math.toRadians(endCoordinate.getLatitude());

		double dLat = (rlat2 - rlat1);
		double dLon = Math.abs(rlon2 - rlon1);

		double dPhi = Math.log(Math.tan(rlat2 / 2 + Math.PI / 4) / Math.tan(rlat1 / 2 + Math.PI / 4));
		double q = (!Double.isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(rlat1); // E-W
		// line
		// gives
		// dPhi=0
		// if dLon over 180° take shorter rhumb across 180° meridian:
		if (dLon > Math.PI)
			dLon = 2 * Math.PI - dLon;
		double distance = Math.sqrt(dLat * dLat + q * q * dLon * dLon) * Utils.EARTH_RADIUS;

		return distance;
	}// END: rhumbDistance

}// END: class
