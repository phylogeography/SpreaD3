package parsers;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import utils.Utils;
import data.structure.Coordinate;
import data.structure.Location;
import exceptions.IllegalCharacterException;

public class DiscreteLocationsParser {

	private String locations;
	private LinkedList<Location> locationsList;
	
	public DiscreteLocationsParser(String locations) {
		this.locations = locations;
	}//END: Constructor
	
	public LinkedList<Location> parseLocations() throws IOException, IllegalCharacterException {
		
//		List<Location> 
		this.locationsList = new LinkedList<Location>();
		
		// create list from the coordinates file
		String[] lines = Utils.readLines(locations);
		int nrow = lines.length;

		for (int i = 0; i < nrow; i++) {

			String[] line = lines[i].split("\t");
			String locationName = line[0];

			String illegalCharacter = "+";
			if (locationName.contains(illegalCharacter)) {
				
				throw new IllegalCharacterException(locationName,
						illegalCharacter);
			
			}

			Double latitude = Double.valueOf(line[1]);
			Double longitude = Double.valueOf(line[2]);

			Coordinate coordinate = new Coordinate( latitude, longitude) ;
			
			//create Location and add to the list of Locations
			Location location = new Location(locationName, "", coordinate, null);
			locationsList.add(location);

		}// END: i loop
		
		return locationsList;
	}//END: parseLocations
	
//	public List<Location> getLocationsList() {
//		return locationsList;
//	}//END: getLocationsList
	
}//END: class
