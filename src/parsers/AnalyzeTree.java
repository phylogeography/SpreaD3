package parsers;

import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import data.structure.Coordinate;

public class AnalyzeTree implements Runnable {

	private RootedTree currentTree;
	private double[] sliceHeights;
	private ConcurrentHashMap<Double, LinkedList<Coordinate>> slicesMap;
	
	public AnalyzeTree(ConcurrentHashMap<Double, LinkedList<Coordinate>> slicesMap, //
			RootedTree currentTree, //
			double[] sliceHeights //
			) {
	
	this.currentTree = currentTree;
	this.sliceHeights = sliceHeights;
	
	
	this.slicesMap = slicesMap;
	
	}//END: Constructor

	public void run() {

		
		for (Node node : currentTree.getNodes()) {
			if (!currentTree.isRoot(node)) {
		
		
		
				for (int i = 0; i < sliceHeights.length; i++) {
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
				}// END: i loop
		
		
			}// END: root node check
		}// END: node loop
		
		
		
		
		
		
		
		
		
	}//END: run

}//END: class
