package utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;

public class Utils {

	// ///////////////////////////
	// ---TODO: PARSING UTILS---//
	// ///////////////////////////

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

	// /////////////////////////
	// ---TODO: PRINT UTILS---//
	// /////////////////////////

	public static void printArray(Object[] x) {
		for (int i = 0; i < x.length; i++) {
			System.out.print(x[i] + " ");
		}
		System.out.println();
	}// END: printArray

}// END: class
