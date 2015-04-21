package utils;

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
