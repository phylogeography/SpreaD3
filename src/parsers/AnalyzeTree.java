package parsers;

import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

import math.MultivariateNormalDistribution;

import utils.Utils;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import data.structure.Coordinate;

public class AnalyzeTree implements Runnable {

	private RootedTree rootedTree;
	private double[] sliceHeights;
	private ConcurrentHashMap<Double, LinkedList<Coordinate>> slicesMap;
	
	private String locationTrait;
	
	public AnalyzeTree(ConcurrentHashMap<Double, LinkedList<Coordinate>> slicesMap, //
			RootedTree currentTree, //
			double[] sliceHeights, //
			String locationTrait//
			) {
	
	this.rootedTree = currentTree;
	this.sliceHeights = sliceHeights;
	this.locationTrait = locationTrait;
	
	this.slicesMap = slicesMap;
	
	}//END: Constructor

	public void run() {

//		String latitudeName = locationTrait.concat(Utils.ONE);
//		String longitudeName = locationTrait.concat(Utils.TWO);
		
		Double[] precisionArray = Utils.getDoubleArrayTreeAttribute(
				rootedTree, Utils.PRECISION);
		
		double treeNormalization = getTreeLength(rootedTree,
				rootedTree.getRootNode());
		
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {
		
				Node parentNode = rootedTree.getParent(node);

//				Double parentLongitude = (Double) Utils.getObjectNodeAttribute(
//						parentNode, longitudeName);
//
//				Double parentLatitude = (Double) Utils.getObjectNodeAttribute(
//						parentNode, latitudeName);
//
				Double parentHeight = Utils.getNodeHeight(rootedTree, parentNode);
//
//				Double nodeLongitude = (Double) Utils.getObjectNodeAttribute(node,
//						longitudeName);
//
//				Double nodeLatitude = (Double) Utils.getObjectNodeAttribute(node,
//						latitudeName);
//
				Double nodeHeight = Utils.getNodeHeight(rootedTree, node);
//
//				Coordinate parentCoordinate = new Coordinate(parentLatitude, parentLongitude);
//
//				Coordinate nodeCoordinate = new Coordinate(nodeLatitude, nodeLongitude);
		
				
				Double[] location =  Utils.getDoubleArrayNodeAttribute(node,
						locationTrait);		
				
				Double[] parentLocation = Utils
						.getDoubleArrayNodeAttribute(parentNode,
								locationTrait);

				double rate = (double) Utils
						.getObjectNodeAttribute(node, Utils.RATE);
				
				
				
				
				
				for (int i = 0; i < sliceHeights.length; i++) {
		
					
					
					
					
					double sliceHeight = sliceHeights[i];
					if (nodeHeight < sliceHeight && sliceHeight <= parentHeight) {
						
						Double[] imputedLocation = imputeValue(location,
								parentLocation, sliceHeight, nodeHeight,
								parentHeight, rate,
								treeNormalization, precisionArray);
						
						
						
						if (slicesMap.containsKey(sliceHeight)) {

//							slicesMap.get(sliceHeight).add(
//									new Coordinates(imputedLocation[1], // longitude
//											imputedLocation[0], // latitude
//											0.0 // altitude
//									));

							// start new entry if no such key in the map
						} else {

//							List<Coordinate> coords = new ArrayList<Coordinates>();
//							coords.add(new Coordinates(imputedLocation[1], // longitude
//									imputedLocation[0], // latitude
//									0.0 // altitude
//							));
//
//							slicesMap.put(sliceHeight, coords);

						}// END: key check
						
						
						
						
					}// END: sliceTime check
		
		
		
		
		
		
		
		
		
		
		
		
		
		
				}// END: i loop
		
		
			}// END: root node check
		}// END: node loop
		
		
		
		
		
		
		
		
		
	}//END: run

	private Double[] imputeValue(Double[] location, Double[] parentLocation,
			double sliceHeight, double nodeHeight, double parentHeight,
			double rate, double treeNormalization,
			Double[] precisionArray) {

		int dim = (int) Math.sqrt(1 + 8 * precisionArray.length) / 2;
		double[][] precision = new double[dim][dim];
		int c = 0;
		for (int i = 0; i < dim; i++) {
			for (int j = i; j < dim; j++) {
				precision[j][i] = precision[i][j] = precisionArray[c++]
						* treeNormalization;
			}
		}

		dim = location.length;;
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

//			if (trueNoise) {
				for (int j = i; j < dim; j++)
					scaledPrecision[j][i] = scaledPrecision[i][j] = precision[i][j]
							* scaledWeightTotal;
//			}
		}

//		if (trueNoise) {
			mean = MultivariateNormalDistribution
					.nextMultivariateNormalPrecision(mean, scaledPrecision);
//		}

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

		}//END: getTreeLength
	
}//END: class
