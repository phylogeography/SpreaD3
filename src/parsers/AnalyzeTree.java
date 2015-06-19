package parsers;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import math.MultivariateNormalDistribution;
import utils.Trait;
import utils.Utils;
import exceptions.AnalysisException;

public class AnalyzeTree implements Runnable {

	ConcurrentHashMap<String, HashMap<Double, List<double[]>>> traitsMap;

	private RootedTree rootedTree;
	private double[] sliceHeights;
	// private String locationTrait;
	private String[] traits;

	public AnalyzeTree(
			ConcurrentHashMap<String, HashMap<Double, List<double[]>>> traitsMap, //
			RootedTree currentTree, //
			double[] sliceHeights, //
			String[] traits //
	) {

		this.traitsMap = traitsMap;
		this.rootedTree = currentTree;
		this.sliceHeights = sliceHeights;
		this.traits = traits;

	}// END: Constructor

	public void run() {

		try {

			// parse once per tree

			Double[] precisionArray = Utils.getDoubleArrayTreeAttribute(
					rootedTree, Utils.PRECISION);

			int dim = (int) Math.sqrt(1 + 8 * precisionArray.length) / 2;

			double treeNormalization = getTreeLength(rootedTree,
					rootedTree.getRootNode());

			for (Node node : rootedTree.getNodes()) {
				if (!rootedTree.isRoot(node)) {

					// parse once per node

					Node parentNode = rootedTree.getParent(node);

					Double parentHeight = Utils.getNodeHeight(rootedTree,
							parentNode);

					Double nodeHeight = Utils.getNodeHeight(rootedTree, node);

					double rate = (double) Utils.getObjectNodeAttribute(node,
							Utils.RATE);

					for (String traitName : traits) {

						HashMap<Double, List<double[]>> traitMap;
						if (traitsMap.containsKey(traitName)) {

							traitMap = traitsMap.get(traitName);

						} else {

							traitMap = new HashMap<Double, List<double[]>>();
							traitsMap.put(traitName, traitMap);

						}// END: key check

						Trait trait = Utils.getNodeTrait(node, traitName);
						Trait parentTrait = Utils.getNodeTrait(parentNode,
								traitName);

						if (!trait.isNumber() || !parentTrait.isNumber()) {

							// can only throw unchecked exceptions in a Runnable
							throw new RuntimeException("Trait " + traitName
									+ " is not numeric!");

						} else {

							if (trait.getDim() != dim
									|| parentTrait.getDim() != dim) {

								// can only throw unchecked exceptions in a
								// Runnable
								throw new RuntimeException("Trait " + traitName
										+ " is not " + dim + " dimensional!");
							}
						}// END: exception handling

						for (int i = 0; i < sliceHeights.length; i++) {

							double sliceHeight = sliceHeights[i];
							if (nodeHeight < sliceHeight
									&& sliceHeight <= parentHeight) {

								double[] imputedLocation = imputeValue(
										trait.getValue(), //
										parentTrait.getValue(), //
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

								if (traitMap.containsKey(sliceHeight)) {

									traitMap.get(sliceHeight).add(coordinate);

								} else {

									LinkedList<double[]> coords = new LinkedList<double[]>();
									coords.add(coordinate);

									traitMap.put(sliceHeight, coords);

								}// END: key check

							}// END: sliceTime check

						}// END: i loop

					}// END: traits loop

				}// END: root node check
			}// END: node loop

		} catch (AnalysisException e) {
			// Pass it to handlers
			throw new RuntimeException(e.getMessage());
		}// END: try-catch

	}// END: run

	private double[] imputeValue(double[] trait, //
			double[] parentTrait, //
			double sliceHeight, //
			double nodeHeight, //
			double parentHeight, //
			double rate, //
			double treeNormalization, //
			Double[] precisionArray //
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

		double[] nodeValue = new double[dim];
		double[] parentValue = new double[dim];

		for (int i = 0; i < dim; i++) {

			nodeValue[i] = trait[i];
			parentValue[i] = parentTrait[i];

		}

		final double scaledTimeChild = (sliceHeight - nodeHeight) * rate;
		final double scaledTimeParent = (parentHeight - sliceHeight) * rate;
		final double scaledWeightTotal = (1.0 / scaledTimeChild)
				+ (1.0 / scaledTimeParent);

		if (scaledTimeChild == 0) {
			return trait;
		}

		if (scaledTimeParent == 0) {
			return parentTrait;
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

		double[] result = new double[dim];
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
