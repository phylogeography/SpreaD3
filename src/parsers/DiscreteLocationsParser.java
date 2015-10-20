package parsers;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedList;

import structure.data.Attribute;
import structure.data.Location;
import structure.data.primitive.Coordinate;
import utils.Utils;
import exceptions.IllegalCharacterException;

public class DiscreteLocationsParser {

	private static final int LATITUDE_COLUMN = 1;
	private static final int LONGITUDE_COLUMN = 2;

	private String locations;
	private LinkedList<Location> locationsList;
	private boolean header;

	private Attribute xCoordinate;
	private Attribute yCoordinate;

	public DiscreteLocationsParser(String locations, boolean header) {

		this.locations = locations;
		this.header = header;

	}// END: Constructor

	public LinkedList<Location> parseLocations() throws IOException,
			IllegalCharacterException {

		this.locationsList = new LinkedList<Location>();

		double[] xCoordinateRange = new double[2];
		xCoordinateRange[Attribute.MIN_INDEX] = Double.MAX_VALUE;
		xCoordinateRange[Attribute.MAX_INDEX] = Double.MIN_VALUE;

		double[] yCoordinateRange = new double[2];
		yCoordinateRange[Attribute.MIN_INDEX] = Double.MAX_VALUE;
		yCoordinateRange[Attribute.MAX_INDEX] = Double.MIN_VALUE;

		// create list from the coordinates file
		String[] lines = Utils.readLines(locations, Utils.HASH_COMMENT);

		if (header) {
			lines = Arrays.copyOfRange(lines, 1, lines.length);
		}

		int nrow = lines.length;
		for (int i = 0; i < nrow; i++) {

			String[] line = lines[i].split("\t");
			String locationName = line[0];

			String illegalCharacter = "+";
			if (locationName.contains(illegalCharacter)) {

				throw new IllegalCharacterException(locationName,
						illegalCharacter);

			}

			Double latitude = Double.valueOf(line[LATITUDE_COLUMN]);
			Double longitude = Double.valueOf(line[LONGITUDE_COLUMN]);

			Coordinate coordinate = new Coordinate(latitude, longitude);

			// create Location and add to the list of Locations
			Location location = new Location(locationName, "", coordinate);
			locationsList.add(location);

			// update coordinates range

			if (latitude < xCoordinateRange[Attribute.MIN_INDEX]) {
				xCoordinateRange[Attribute.MIN_INDEX] = latitude;
			} // END: min check

			if (latitude > xCoordinateRange[Attribute.MAX_INDEX]) {
				xCoordinateRange[Attribute.MAX_INDEX] = latitude;
			} // END: max check

			if (longitude < yCoordinateRange[Attribute.MIN_INDEX]) {
				yCoordinateRange[Attribute.MIN_INDEX] = longitude;
			} // END: min check

			if (longitude > yCoordinateRange[Attribute.MAX_INDEX]) {
				yCoordinateRange[Attribute.MAX_INDEX] = longitude;
			} // END: max check

		}// END: i loop

		xCoordinate = new Attribute("xCoordinate", xCoordinateRange);
		yCoordinate = new Attribute("yCoordinate", yCoordinateRange);

		return locationsList;
	}// END: parseLocations

	public Attribute getxCoordinateAttribute() {
		return xCoordinate;
	}

	public Attribute getyCoordinateAttribute() {
		return yCoordinate;
	}

}// END: class
