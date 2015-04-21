package utils;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;

public class Utils {

	public static Double getNodeHeight(RootedTree tree, Node node) {
		Double nodeHeight = tree.getHeight(node);
		if (nodeHeight == null) {
			throw new RuntimeException(
					"Height attribute missing from the node. \n");
		}

		return nodeHeight;
	}
	
}//END: class
