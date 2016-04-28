package parsers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.sun.corba.se.impl.javax.rmi.CORBA.Util;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import structure.data.Attribute;
import structure.data.attributable.Area;
import structure.data.attributable.Line;
import structure.data.attributable.Point;
import structure.data.primitive.Coordinate;
import structure.data.primitive.Polygon;
import utils.Utils;
import exceptions.AnalysisException;

public class ContinuousTreeParser {

	private RootedTree rootedTree;
	private String xCoordinateAttributeName;
	private String yCoordinateAttributeName;
	private boolean externalAnnotations;
	private String hpd;
	// private String mrsd;
	private double timescaleMultiplier;
	private TimeParser timeParser;

	private LinkedList<Attribute> uniqueBranchAttributes;
	private LinkedList<Attribute> uniqueNodeAttributes;
	private LinkedList<Attribute> uniqueAreaAttributes;

	private LinkedList<Line> linesList;
	private LinkedList<Point> pointsList;
	private LinkedList<Area> areasList;

	public ContinuousTreeParser(RootedTree rootedTree, //
			String xCoordinateAttributeName, //
			String yCoordinateAttributeName, //
			boolean externalAnnotations, //
			String hpd, TimeParser timeParser, //
			double timescaleMultiplier //

	) {

		this.rootedTree = rootedTree;
		this.xCoordinateAttributeName = xCoordinateAttributeName;
		this.yCoordinateAttributeName = yCoordinateAttributeName;
		this.externalAnnotations = externalAnnotations;
		this.hpd = hpd;
		this.timeParser = timeParser;
		this.timescaleMultiplier = timescaleMultiplier;

		this.uniqueBranchAttributes = new LinkedList<Attribute>();
		this.uniqueNodeAttributes = new LinkedList<Attribute>();
		this.uniqueAreaAttributes = new LinkedList<Attribute>();

		this.linesList = new LinkedList<Line>();
		this.pointsList = new LinkedList<Point>();
		this.areasList = new LinkedList<Area>();

	}// END: Constructor

	public void parseTree() throws AnalysisException {

		HashMap<Node, Point> pointsMap = new HashMap<Node, Point>();

		// hack, remove digits to get name
		String prefix = xCoordinateAttributeName.replaceAll("\\d*$", "");

		String modalityAttributeName = "";

		try {

			modalityAttributeName = prefix.concat("_").concat(hpd).concat("%").concat("HPD_modality");

		} catch (Exception e) {
			throw new AnalysisException(
					"Troble creating HPD modality attribute name. I suspect this is not a continuously annotated tree.");
		}

		int index = 0;
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				// node parsed first
				Coordinate nodeCoordinate = null;
				Double nodeCoordinateX = null;
				Double nodeCoordinateY = null;
				int tryingCoordinate = 0;

				try {

					tryingCoordinate = Utils.X_INDEX;
					nodeCoordinateX = (Double) Utils.getObjectNodeAttribute(node, xCoordinateAttributeName);

					tryingCoordinate = Utils.Y_INDEX;
					nodeCoordinateY = (Double) Utils.getObjectNodeAttribute(node, yCoordinateAttributeName);

				} catch (AnalysisException e) {

					String coordinateName = (tryingCoordinate == Utils.X_INDEX ? xCoordinateAttributeName
							: yCoordinateAttributeName);

					String nodeType = (rootedTree.isExternal(node) ? "external" : "internal");

					String message = coordinateName + " attribute could not be found on the " + nodeType
							+ " child node. Resulting visualisation may be incomplete!";

					System.out.println(message);
					continue;
				} // END: try-catch

				nodeCoordinate = new Coordinate(nodeCoordinateY, // latitude
						nodeCoordinateX // longitude
				);

				// ---POINTS PARSED FIRST DO NOT CHANGE ORDER---//

				Point nodePoint = pointsMap.get(node);
				if (nodePoint == null) {

					nodePoint = createPoint(node, nodeCoordinate);
					pointsMap.put(node, nodePoint);

				} // END: null check

				// parent node parsed second

				// TODO : this spills to the root node, resulting in exception
				// if not anotated
				// root node will be annotated with locations but not with e.g.
				// rate (facepalm)
				Node parentNode = rootedTree.getParent(node);

				Double parentCoordinateX = null;
				Double parentCoordinateY = null;
				tryingCoordinate = 0;

				try {

					tryingCoordinate = Utils.X_INDEX;
					parentCoordinateX = (Double) Utils.getObjectNodeAttribute(parentNode, xCoordinateAttributeName);

					tryingCoordinate = Utils.Y_INDEX;
					parentCoordinateY = (Double) Utils.getObjectNodeAttribute(parentNode, yCoordinateAttributeName);

				} catch (AnalysisException e) {

					String coordinateName = (tryingCoordinate == Utils.X_INDEX ? xCoordinateAttributeName
							: yCoordinateAttributeName);

					String nodeType = (rootedTree.isExternal(parentNode) ? "external" : "internal");

					String message = coordinateName + " attribute was found on the " + nodeType
							+ " child node but could not be found on the " + nodeType
							+ " parent node. Resulting visualisation may be incomplete!";

					System.out.println(message);
					continue;
				} // END: try-catch

				Coordinate parentCoordinate = new Coordinate(parentCoordinateY, // lat
						parentCoordinateX // long
				);
				Point parentPoint = pointsMap.get(parentNode);
				if (parentPoint == null) {

					parentPoint = createPoint(parentNode, parentCoordinate);
					pointsMap.put(parentNode, parentPoint);

				} // END: null check

				// ---LINES PARSED SECOND DO NOT CHANGE ORDER---//

				Line line = new Line(parentPoint.getId(), //
						nodePoint.getId(), //
						parentPoint.getStartTime(), //
						nodePoint.getStartTime(), //
						nodePoint.getAttributes() //
				);

				linesList.add(line);

				// ---AREAS PARSED LAST DO NOT CHANGE ORDER---//

				boolean parseNode = true;
				if (rootedTree.isExternal(node)) {

					parseNode = false;
					if (externalAnnotations) {
						parseNode = true;
					}

				} else {
					parseNode = true;
				} // END: parse logic

				if (parseNode) {

					Integer modality = 0;

					try {

						modality = (Integer) Utils.getObjectNodeAttribute(node, modalityAttributeName);

					} catch (AnalysisException e) {

						String nodeType = (rootedTree.isExternal(node) ? "external" : "internal");

						String message = modalityAttributeName + " attribute could not be found on the " + nodeType
								+ " node. Resulting visualisation may be incomplete!";
						System.out.println(message);
						continue;
					}

					for (int m = 1; m <= modality; m++) {

						// trait1_80%HPD_1
						String xCoordinateHPDName = xCoordinateAttributeName.concat("_").concat(hpd).concat("%")
								.concat(Utils.HPD.toUpperCase() + "_" + m);

						String yCoordinateHPDName = yCoordinateAttributeName.concat("_").concat(hpd).concat("%")
								.concat(Utils.HPD.toUpperCase() + "_" + m);

						Object[] xCoordinateHPD = null;
						Object[] yCoordinateHPD = null;
						tryingCoordinate = 0;

						try {

							tryingCoordinate = Utils.X_INDEX;
							xCoordinateHPD = Utils.getObjectArrayNodeAttribute(node, xCoordinateHPDName);

							tryingCoordinate = Utils.Y_INDEX;
							yCoordinateHPD = Utils.getObjectArrayNodeAttribute(node, yCoordinateHPDName);

						} catch (AnalysisException e) {

							String coordinateName = (tryingCoordinate == Utils.X_INDEX ? xCoordinateHPDName
									: yCoordinateHPDName);

							String message = coordinateName
									+ " attribute could not be found on the child node. Resulting visualisation may be incomplete!";

							System.out.println(message);
							continue;
						} // END: try-catch

						List<Coordinate> coordinateList = new ArrayList<Coordinate>();
						for (int c = 0; c < xCoordinateHPD.length; c++) {

							Double xCoordinate = (Double) xCoordinateHPD[c];
							Double yCoordinate = (Double) yCoordinateHPD[c];

							Coordinate coordinate = new Coordinate(
									// xCoordinate,
									// yCoordinate
									yCoordinate, // lat
									xCoordinate // long
							);
							coordinateList.add(coordinate);

						} // END: c loop

						// if(rootedTree.isExternal(node)) {
						// System.out.println(rootedTree.getTaxon(node));
						// Utils.printArray(xCoordinateHPD);
						// System.out.println();
						// Utils.printArray(yCoordinateHPD);
						// }

						Polygon polygon = new Polygon(coordinateList);

						HashMap<String, Object> areaAttributesMap = new HashMap<String, Object>();
						areaAttributesMap.putAll(nodePoint.getAttributes());
						areaAttributesMap.put(Utils.HPD.toUpperCase(), hpd);

						Area area = new Area(polygon, nodePoint.getStartTime(), areaAttributesMap);
						areasList.add(area);

					} // END: modality loop

				} // parse check

			} else {

				System.out.println("At the root node");

				Double rootCoordinateX = null;
				Double rootCoordinateY = null;
				int tryingCoordinate = 0;

				try {

					tryingCoordinate = Utils.X_INDEX;
					rootCoordinateX = (Double) Utils.getObjectNodeAttribute(node, xCoordinateAttributeName);

					tryingCoordinate = Utils.Y_INDEX;
					rootCoordinateY = (Double) Utils.getObjectNodeAttribute(node, yCoordinateAttributeName);

				} catch (AnalysisException e) {

					String coordinateName = (tryingCoordinate == Utils.X_INDEX ? xCoordinateAttributeName
							: yCoordinateAttributeName);

					String message = coordinateName + " attribute was found on the root node."
							+ "Resulting visualisation may be incomplete!";

					System.out.println(message);
					continue;
				} // END: try-catch

				Coordinate rootCoordinate = new Coordinate(rootCoordinateY, // lat
						rootCoordinateX // long
				);

				Point rootPoint = createPoint(node, rootCoordinate);
				pointsMap.put(node, rootPoint);

			} // END: root check
		} // END: nodes loop

		pointsList.addAll(pointsMap.values());

		// ---collect attributes from lines---//

		Map<String, Attribute> branchAttributesMap = new HashMap<String, Attribute>();

		for (Line line : linesList) {

			for (Entry<String, Object> entry : line.getAttributes().entrySet()) {

				String attributeId = entry.getKey();
				Object attributeValue = entry.getValue();

				if (branchAttributesMap.containsKey(attributeId)) {

					Attribute attribute = branchAttributesMap.get(attributeId);

					if (attribute.getScale().equals(Attribute.ORDINAL)) {

						attribute.getDomain().add(attributeValue);

					} else {

						double value = Utils.round(Double.valueOf(attributeValue.toString()), 100);

						if (value < attribute.getRange()[Attribute.MIN_INDEX]) {
							attribute.getRange()[Attribute.MIN_INDEX] = value;
						} // END: min check

						if (value > attribute.getRange()[Attribute.MAX_INDEX]) {
							attribute.getRange()[Attribute.MAX_INDEX] = value;
						} // END: max check

					} // END: scale check

				} else {

					Attribute attribute;
					if (attributeValue instanceof Double) {

						Double[] range = new Double[2];
						range[Attribute.MIN_INDEX] = (Double) attributeValue;
						range[Attribute.MAX_INDEX] = (Double) attributeValue;

						attribute = new Attribute(attributeId, range);

					} else {

						HashSet<Object> domain = new HashSet<Object>();
						domain.add(attributeValue);

						attribute = new Attribute(attributeId, domain);

					} // END: isNumeric check

					branchAttributesMap.put(attributeId, attribute);

				} // END: key check

			} // END: attributes loop

		} // END: lines loop

		uniqueBranchAttributes.addAll(branchAttributesMap.values());

		// ---collect attributes from nodes---//

		Map<String, Attribute> nodeAttributesMap = new HashMap<String, Attribute>();

		for (Point point : pointsList) {

			for (Entry<String, Object> entry : point.getAttributes().entrySet()) {

				String attributeId = entry.getKey();
				Object attributeValue = entry.getValue();

				if (nodeAttributesMap.containsKey(attributeId)) {

					Attribute attribute = nodeAttributesMap.get(attributeId);

					if (attribute.getScale().equals(Attribute.ORDINAL)) {

						attribute.getDomain().add(attributeValue);

					} else {

						double value = Utils.round(Double.valueOf(attributeValue.toString()), 100);

						if (value < attribute.getRange()[Attribute.MIN_INDEX]) {
							attribute.getRange()[Attribute.MIN_INDEX] = value;
						} // END: min check

						if (value > attribute.getRange()[Attribute.MAX_INDEX]) {
							attribute.getRange()[Attribute.MAX_INDEX] = value;
						} // END: max check

					} // END: scale check

				} else {

					Attribute attribute;
					if (attributeValue instanceof Double) {

						Double[] range = new Double[2];
						range[Attribute.MIN_INDEX] = (Double) attributeValue;
						range[Attribute.MAX_INDEX] = (Double) attributeValue;

						attribute = new Attribute(attributeId, range);

					} else {

						HashSet<Object> domain = new HashSet<Object>();
						domain.add(attributeValue);

						attribute = new Attribute(attributeId, domain);

					} // END: isNumeric check

					nodeAttributesMap.put(attributeId, attribute);

				} // END: key check

			} // END: attributes loop

		} // END: points loop

		uniqueNodeAttributes.addAll(nodeAttributesMap.values());

		// ---collect attributes from areas---//

		Map<String, Attribute> areasAttributesMap = new HashMap<String, Attribute>();

		for (Area area : areasList) {

			for (Entry<String, Object> entry : area.getAttributes().entrySet()) {

				String attributeId = entry.getKey();
				Object attributeValue = entry.getValue();

				if (areasAttributesMap.containsKey(attributeId)) {

					Attribute attribute = areasAttributesMap.get(attributeId);

					if (attribute.getScale().equals(Attribute.ORDINAL)) {

						attribute.getDomain().add(attributeValue);

					} else {

						double value = Utils.round(Double.valueOf(attributeValue.toString()), 100);

						if (value < attribute.getRange()[Attribute.MIN_INDEX]) {
							attribute.getRange()[Attribute.MIN_INDEX] = value;
						} // END: min check

						if (value > attribute.getRange()[Attribute.MAX_INDEX]) {
							attribute.getRange()[Attribute.MAX_INDEX] = value;
						} // END: max check

					} // END: scale check

				} else {

					Attribute attribute;
					if (attributeValue instanceof Double) {

						Double[] range = new Double[2];
						range[Attribute.MIN_INDEX] = (Double) attributeValue;
						range[Attribute.MAX_INDEX] = (Double) attributeValue;

						attribute = new Attribute(attributeId, range);

					} else {

						HashSet<Object> domain = new HashSet<Object>();
						domain.add(attributeValue);

						attribute = new Attribute(attributeId, domain);

					} // END: isNumeric check

					areasAttributesMap.put(attributeId, attribute);

				} // END: key check

			} // END: attributes loop

		} // END: points loop

		uniqueAreaAttributes.addAll(areasAttributesMap.values());

	}// END: parseTree

	private Point createPoint(Node node, Coordinate coordinate) throws AnalysisException {

		Double height = Utils.getNodeHeight(rootedTree, node) * timescaleMultiplier;
		String startTime = timeParser.getNodeDate(height);

		Map<String, Object> attributes = new LinkedHashMap<String, Object>();
		for (String attributeName : node.getAttributeNames()) {

			Object nodeAttribute = node.getAttribute(attributeName);

			if (!(nodeAttribute instanceof Object[])) {

				// remove invalid characters
				attributeName = attributeName.replaceAll("%", "");
				attributeName = attributeName.replaceAll("!", "");

				attributes.put(attributeName, nodeAttribute);
			} // END: multivariate check

		} // END: attributes loop

		// annotate with node name
		Object value;
		if (this.rootedTree.isExternal(node)) {
			value = this.rootedTree.getTaxon(node).toString();
		} else if (this.rootedTree.isRoot(node)) {
			value = "root";
		} else {
			value = "internal";
		}

		String attributeName = "nodeName";
		attributes.put(attributeName, value);

		// external nodes have no posterior annotated, need to fix that
		if (rootedTree.isExternal(node)) {
			attributes.put(Utils.POSTERIOR, 1.0);
		}

		Point point = new Point(coordinate, startTime, attributes);

		return point;
	}// END: createPoint

	public LinkedList<Line> getLinesList() {
		return linesList;
	}

	public LinkedList<Point> getPointsList() {
		return pointsList;
	}

	public LinkedList<Area> getAreasList() {
		return areasList;
	}

	public LinkedList<Attribute> getLineAttributes() {
		return uniqueBranchAttributes;
	}

	public LinkedList<Attribute> getPointAttributes() {
		return uniqueNodeAttributes;
	}

	public LinkedList<Attribute> getAreaAttributes() {
		return uniqueAreaAttributes;
	}

}// END: class
