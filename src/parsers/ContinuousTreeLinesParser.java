package parsers;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;

import jebl.evolution.graphs.Node;
import jebl.evolution.trees.RootedTree;
import utils.Trait;
import utils.Utils;
import data.structure.Coordinate;
import data.structure.Line;
import exceptions.AnalysisException;

public class ContinuousTreeLinesParser {

	private RootedTree rootedTree;
	private String locationTrait;
	private String mrsd;
	private String[] traits;
	
	public ContinuousTreeLinesParser(RootedTree rootedTree, //
			String locationTrait, //
			String traits[], //
			String mrsd //
			) {
		
		this.rootedTree = rootedTree;
		this.locationTrait = locationTrait;
		this.traits = traits;
		this.mrsd = mrsd;
		
	}//END: Constructor
	
	public LinkedList<Line> parseLines() throws AnalysisException {
		
		LinkedList<Line> linesList = new LinkedList<Line>();
		String latitudeName = locationTrait.concat(Utils.ONE);
		String longitudeName = locationTrait.concat(Utils.TWO);

		TimeParser timeParser = new TimeParser(mrsd);
		timeParser.parseTime();
		
		for (Node node : rootedTree.getNodes()) {
			if (!rootedTree.isRoot(node)) {

				Node parentNode = rootedTree.getParent(node);

				Double parentLongitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, longitudeName);

				Double parentLatitude = (Double) Utils.getObjectNodeAttribute(
						parentNode, latitudeName);

				Double parentHeight = Utils.getNodeHeight(rootedTree, parentNode);
				
				String startTime = timeParser.getNodeDate(parentHeight);
				
				Double nodeLongitude = (Double) Utils.getObjectNodeAttribute(node,
						longitudeName);

				Double nodeLatitude = (Double) Utils.getObjectNodeAttribute(node,
						latitudeName);

				Double nodeHeight = Utils.getNodeHeight(rootedTree, node);

				String endTime = timeParser.getNodeDate(nodeHeight);
				
				Coordinate parentCoordinate = new Coordinate(parentLatitude, parentLongitude);

				Coordinate nodeCoordinate = new Coordinate(nodeLatitude, nodeLongitude);

				Map<String, Trait> attributes = new LinkedHashMap<String, Trait>();
				
				if (traits != null) {
					for (String traitName : traits) {

						Trait parentTrait = Utils.getNodeTrait(parentNode, traitName); 
						attributes.put(Utils.START + traitName, parentTrait);

						Trait nodeTrait = Utils.getNodeTrait(node, traitName); 
						attributes.put(Utils.END + traitName, nodeTrait);

					}// END: traits loop
				}// END: null check

                // branch attribute traits
				
				double branchDuration = parentHeight - nodeHeight;
				Trait branchDurationTrait = new Trait(branchDuration);
				attributes.put(Utils.DURATION, branchDurationTrait);
				
				double distance = Utils.rhumbDistance(parentCoordinate, nodeCoordinate);
				Trait distanceTrait = new Trait(distance);
				attributes.put(Utils.DISTANCE, distanceTrait);
				
				Line line = new Line(parentCoordinate, nodeCoordinate, startTime, endTime, attributes);
				linesList.add(line);

			}// END: root check
		}// END: nodes loop
		
		return linesList;
	}//END: parseLines
	
//	private LocalDate getTime(double nodeHeight, LocalDate mrsd) {
//		
//		String[] fields = convertToYearMonthDay(nodeHeight);
//		Integer years =  Integer.valueOf(fields[Utils.YEAR_INDEX]);
//		Integer months =  Integer.valueOf(fields[Utils.MONTH_INDEX]);
//		Integer days =  Integer.valueOf(fields[Utils.DAY_INDEX]);
//		LocalDate endTime = mrsd.minusYears(years).minusMonths(months).minusDays(days);
//		
//		return endTime;
//	}
//	
//	 private String[] convertToYearMonthDay(double fractionalDate) {
//
//	        String[] yearMonthDay = new String[3];
//
//	        int year = (int) fractionalDate;
//	        String yearString;
//
//	        if (year < 10) {
//	            yearString = "000"+year;
//	        } else if (year < 100) {
//	            yearString = "00"+year;
//	        } else if (year < 1000) {
//	            yearString = "0"+year;
//	        } else {
//	            yearString = ""+year;
//	        }
//
//	        yearMonthDay[0]  = yearString;
//
//	        double fractionalMonth = fractionalDate - year;
//
//	        int month = (int) (12.0 * fractionalMonth);
//	        String monthString;
//
//	        if (month < 10) {
//	            monthString = "0"+month;
//	        } else {
//	            monthString = ""+month;
//	        }
//
//	        yearMonthDay[1] = monthString;
//
//	        int day = (int) Math.round(30*(12*fractionalMonth - month));
//	        String dayString;
//
//	        if (day < 10) {
//	            dayString = "0"+day;
//	        } else {
//	            dayString = ""+day;
//	        }
//
//	        yearMonthDay[2] = dayString;
//
//	        return yearMonthDay;
//
//	    }
	
}//END: class
