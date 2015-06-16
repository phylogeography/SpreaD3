package parsers;

import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import math.MultivariateNormalDistribution;
import utils.Utils;

public class AnalyzeTree implements Runnable {

	private RootedTree rootedTree;
	private double[] sliceHeights;
	private ConcurrentHashMap<Double, LinkedList<double[]>> slicesMap;
	private String locationTrait;

	public AnalyzeTree(
			ConcurrentHashMap<Double, LinkedList<double[]>> slicesMap, //
			RootedTree currentTree, //
			double[] sliceHeights, //
			String locationTrait //
	) {

		this.rootedTree = currentTree;
		this.sliceHeights = sliceHeights;
		this.locationTrait = locationTrait;
		this.slicesMap = slicesMap;

	}// END: Constructor

	public void run() {

		Double[] precisionArray = Utils.getDoubleArrayTreeAttribute(rootedTree,
				Utils.PRECISION);

		double treeNormalization = getTreeLength(rootedTree,
				rootedTree.getRootNode());

		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				Node parentNode = rootedTree.getParent(node);

				Double parentHeight = Utils.getNodeHeight(rootedTree,
						parentNode);

				Double nodeHeight = Utils.getNodeHeight(rootedTree, node);

				Double[] location = Utils.getDoubleArrayNodeAttribute(node,
						locationTrait);

				Double[] parentLocation = Utils.getDoubleArrayNodeAttribute(
						parentNode, locationTrait);

				double rate = (double) Utils.getObjectNodeAttribute(node,
						Utils.RATE);

				for (int i = 0; i < sliceHeights.length; i++) {

					double sliceHeight = sliceHeights[i];
					if (nodeHeight < sliceHeight && sliceHeight <= parentHeight) {

						Double[] imputedLocation = imputeValue(
								location, //
								parentLocation, //
								sliceHeight, //
								nodeHeight, //
								parentHeight, //
								rate, //
								treeNormalization, //
								precisionArray //
						);

						double latitude = imputedLocation[Utils.LATITUDE_INDEX];
						double longitude = imputedLocation[Utils.LONGITUDE_INDEX];
						double[] coordinate = new double[2];
						coordinate[Utils.LATITUDE_INDEX] = latitude;
						coordinate[Utils.LONGITUDE_INDEX] = longitude;
						
						if (slicesMap.containsKey(sliceHeight)) {

							slicesMap.get(sliceHeight).add(coordinate);

						} else {

							LinkedList<double[]> coords = new LinkedList<double[]>();
							coords.add(coordinate);

							slicesMap.put(sliceHeight, coords);

						}// END: key check

					}// END: sliceTime check

				}// END: i loop

			}// END: root node check
		}// END: node loop

	}// END: run

	private Double[] imputeValue(
			Double[] location, //
			Double[] parentLocation, //
			double sliceHeight, //
			double nodeHeight, //
			double parentHeight, //
			double rate, //
			double treeNormalization, //
			Double[] precisionArray//
			) {

		int dim = (int) Math.sqrt(1 + 8 * precisionArray.length) / 2;
		double[][] precision = new double[dim][dim];
		int c = 0;
		for (int i = 0; i < dim; i++) {
			for (int j = i; j < dim; j++) {
				precision[j][i] = precision[i][j] = precisionArray[c++]
						* treeNormalization;
			}
		}

		dim = location.length;
		
		double[] nodeValue = new double[2];
		double[] parentValue = new double[2];

		for (int i = 0; i < dim; i++) {

			nodeValue[i] = location[i];
			parentValue[i] = parentLocation[i];

		}

		final double scaledTimeChild = (sliceHeight - nodeHeight) * rate;
		final double scaledTimeParent = (parentHeight - sliceHeight) * rate;
		final double scaledWeightTotal = (1.0 / scaledTimeChild)
				+ (1.0 / scaledTimeParent);

		if (scaledTimeChild == 0) {
			return location;
		}

		if (scaledTimeParent == 0) {
			return parentLocation;
		}
		// Find mean value, weighted average
		double[] mean = new double[dim];
		double[][] scaledPrecision = new double[dim][dim];

		for (int i = 0; i < dim; i++) {
			mean[i] = (nodeValue[i] / scaledTimeChild + parentValue[i]
					/ scaledTimeParent)
					/ scaledWeightTotal;

			// if (trueNoise) {
			for (int j = i; j < dim; j++)
				scaledPrecision[j][i] = scaledPrecision[i][j] = precision[i][j]
						* scaledWeightTotal;
			// }
		}

		// if (trueNoise) {
		mean = MultivariateNormalDistribution.nextMultivariateNormalPrecision(
				mean, scaledPrecision);
		// }

		Double[] result = new Double[dim];
		for (int i = 0; i < dim; i++) {
			result[i] = mean[i];
		}

		return result;
	}// END: imputeValue

	private double getTreeLength(RootedTree tree, Node node) {

		int childCount = tree.getChildren(node).size();
		if (childCount == 0)
			return tree.getLength(node);

		double length = 0;
		for (int i = 0; i < childCount; i++) {
			length += getTreeLength(tree, tree.getChildren(node).get(i));
		}
		if (node != tree.getRootNode())
			length += tree.getLength(node);
		
		return length;
	}// END: getTreeLength

}// END: class
