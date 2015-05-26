package utils;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Map.Entry;

import data.structure.Coordinate;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.io.NexusImporter;
import jebl.evolution.io.TreeImporter;
import jebl.evolution.trees.RootedTree;

public class Utils {

	// Use this for all random numbers
	private static final Random random = new Random();
	public static final double EARTH_RADIUS = 6371.0;
	
	// /////////////////////
	// ---PARSING UTILS---//
	// /////////////////////

	public static final String DURATION = "duration";
	public static final String DISTANCE = "distance";
	
	public static Double getNodeHeight(RootedTree tree, Node node) {

		Double nodeHeight = tree.getHeight(node);

		if (nodeHeight == null) {
			throw new RuntimeException(
					"Height attribute missing from the node. \n");
		}

		return nodeHeight;
	}// END: getHeight

	public static Object getObjectNodeAttribute(Node node, String attributeName) {

		Object nodeAttribute = node.getAttribute(attributeName);

		if (nodeAttribute == null) {
			throw new RuntimeException("Attribute " + attributeName
					+ " missing from the node. \n");
		}

		return nodeAttribute;
	}// END: getObjectNodeAttribute

	public static Object[] getObjectArrayNodeAttribute(Node node,
			String attributeName) {

		Object[] nodeAttributeArray = (Object[]) node
				.getAttribute(attributeName);

		if (nodeAttributeArray == null) {
			throw new RuntimeException("Attribute " + attributeName
					+ " missing from the node. \n");
		}

		return nodeAttributeArray;
	}// END: getObjectArrayNodeAttribute

	public static String[] readLines(String filename) throws IOException {

		FileReader fileReader = new FileReader(filename);
		BufferedReader bufferedReader = new BufferedReader(fileReader);
		List<String> lines = new ArrayList<String>();

		String line = null;
		while ((line = bufferedReader.readLine()) != null) {
			lines.add(line);
		}

		bufferedReader.close();

		return lines.toArray(new String[lines.size()]);
	}// END: readLines

	public static String breakTiesRandomly(String tiedState) {

		String[] array = tiedState.split("\\+");
		String state = (String) Utils.pickRand(array);
		
		return state;
	}//END: breakTiesRandomly
	
	public static RootedTree importRootedTree(String tree) throws IOException, ImportException {
		TreeImporter importer = new NexusImporter(new FileReader(
				tree));
		RootedTree rootedTree = (RootedTree) importer.importNextTree();
		
		return rootedTree;
	}//END: importRootedTree
	
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

	public static void printMap(Map<?, ?> map) {

		Iterator<?> it = map.entrySet().iterator();
		while (it.hasNext()) {
			Entry<?, ?> pairs = (Entry<?, ?>) it.next();
			System.out.println(pairs.getKey() + " = " + pairs.getValue());
		}
	}// END: printMap
	
	// ///////////////////////////
	// ---RANDOM NUMB3R UTILS---//
	// ///////////////////////////

	public static Object pickRand(Object[] array) {
		int rnd = random.nextInt(array.length);
		return array[rnd];
	}//END: pickRand

	// ///////////////////////
	// ---GEOGRAPHY UTILS---//
	// ///////////////////////
	
	public static double rhumbDistance(
			Coordinate startCoordinate, Coordinate endCoordinate
			) {
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

		double dPhi = Math.log(Math.tan(rlat2 / 2 + Math.PI / 4)
				/ Math.tan(rlat1 / 2 + Math.PI / 4));
		double q = (!Double.isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(rlat1); // E-W
		// line
		// gives
		// dPhi=0
		// if dLon over 180° take shorter rhumb across 180° meridian:
		if (dLon > Math.PI)
			dLon = 2 * Math.PI - dLon;
		double distance = Math.sqrt(dLat * dLat + q * q * dLon * dLon)
				* Utils.EARTH_RADIUS;

		return distance;
	}//END: rhumbDistance
	
}// END: class
