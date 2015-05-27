package parsers;

import java.awt.Color;
import java.io.IOException;
import java.util.LinkedHashMap;

import settings.rendering.KmlRendererSettings;
import utils.Utils;

public class DiscreteColorsParser {

	private String colors;
	private LinkedHashMap<Object, Color> colorMap;
	
	public DiscreteColorsParser(String colors) {
		this.colors = colors;
	}//END: Constructor
	
	public LinkedHashMap<Object, Color> parseColors() throws IOException {
		
		this.colorMap = new LinkedHashMap<Object, Color>();
		
		String[] lines = Utils.readLines(colors);
		int nrow = lines.length;

		for (int i = 0; i < nrow; i++) {

			String[] line = lines[i].split("\\s+");
			int ncol = line.length;

			if(ncol == 4) {
			
			String attribute = line[0];
			Integer red = Integer.valueOf(line[1]);
			Integer green = Integer.valueOf(line[2]);
			Integer blue = Integer.valueOf(line[3]);
			
			Color color = new Color(red, green, blue);
			colorMap.put(attribute, color);
		
			} else if (ncol == 5) {
				
				String attribute = line[0];
				Integer red = Integer.valueOf(line[1]);
				Integer green = Integer.valueOf(line[2]);
				Integer blue = Integer.valueOf(line[3]);
				Integer alpha = Integer.valueOf(line[4]);
				
				Color color = new Color(red, green, blue, alpha);
				colorMap.put(attribute, color);
				
			} else {
				
				throw new RuntimeException("Color format does not fit RGB or RGBA values, " + ncol + " column(s) found.");
				
			}
			
		}// END: i loop
		
		return colorMap;
	}//END: parseLocations
	
}//END: class
