package parsers;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import jebl.evolution.graphs.Node;
import jebl.evolution.io.ImportException;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;
import data.structure.Location;
import data.structure.attributable.Line;
import data.structure.attributable.Point;
import data.structure.primitive.Coordinate;
import exceptions.AnalysisException;
import exceptions.LocationNotFoundException;

public class DiscreteTreeParser {

	private String locationTrait;
	private List<Location> locationsList;
//	private LinkedList<Point> pointsList;
	private RootedTree rootedTree;
	private String mrsd;
	private double timescaleMultiplier;
	
	private LinkedList<Line> linesList;
	private LinkedList<Point> pointsList;
	
	public DiscreteTreeParser(RootedTree rootedTree, //
			String locationTrait, //
			List<Location> locationsList, //
//			LinkedList<Point> pointsList, //
			String mrsd, //
			double timescaleMultiplier //
	) {

		this.locationTrait = locationTrait;
		this.locationsList = locationsList;
//		this.pointsList = pointsList;
		this.rootedTree = rootedTree;
		this.mrsd = mrsd;
		this.timescaleMultiplier = timescaleMultiplier;
		
		// structures
		this.linesList = new LinkedList<Line>();
		this.pointsList = new LinkedList<Point>();
		
	}// END: Constructor

	public void parseTree() throws IOException, ImportException,
			LocationNotFoundException, AnalysisException {

		HashMap<Node, Point> pointsMap = new HashMap<Node, Point>();
		
		TimeParser timeParser = new TimeParser(mrsd);
		timeParser.parseTime();

		int index = 0;
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {
				
				Node parentNode = rootedTree.getParent(node);

				String parentState = (String) Utils.getObjectNodeAttribute(
						parentNode, locationTrait);
				if (parentState.contains("+")) {
					String message = "Found tied state " + parentState + ".";
					parentState = Utils.breakTiesRandomly(parentState);
					message += (" randomly choosing " + parentState + ".");
					System.out.println(message);
				}// END: tie check

				String nodeState = (String) Utils.getObjectNodeAttribute(node,
						locationTrait);
				if (nodeState.contains("+")) {
					String message = "Found tied state " + nodeState + ".";
					nodeState = Utils.breakTiesRandomly(nodeState);
					message += (" Randomly choosing " + nodeState + ".");
					System.out.println(message);
				}// END: tie check

				
				if(!parentState.equalsIgnoreCase(nodeState)) {
					
					Point parentPoint = pointsMap.get(parentNode);
					if(parentPoint == null) {
						PointParser parentPointParser = new PointParser(index, //
								parentState, //
								parentNode, //
								rootedTree, //
								timescaleMultiplier, //
								timeParser, //
								locationsList);
						
						 parentPoint = parentPointParser.parsePoint();
						pointsMap.put(parentNode, parentPoint);
						index++;
					}
					
					Point nodePoint = pointsMap.get(node); 
					if(nodePoint==null) {
						PointParser nodePointParser = new PointParser(index, //
								parentState, //
								parentNode, //
								rootedTree, //
								timescaleMultiplier, //
								timeParser, //
								locationsList);

						nodePoint = nodePointParser.parsePoint();
						
						pointsMap.put(node, nodePoint);
						index++;
					}
					
					Line line = new Line(parentPoint.getId(), //
							nodePoint.getId(), //
							parentPoint.getStartTime(), //
							nodePoint.getStartTime(), //
							nodePoint.getAttributes()//
							);
					
					linesList.add(line);
					
				}//END: state check
				
			}// END: root check
		}// END: node loop
		
		pointsList.addAll(pointsMap.values());
		
	}// END: parseLines

	public LinkedList<Line> getLinesList() {
		return linesList;
	}
	
	public LinkedList<Point> getPointsList() {
		return pointsList;
	}
	
}// END: class
