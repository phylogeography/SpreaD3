package data;

import generator.Generator;
import generator.JSONGenerator;
import generator.KMLGenerator;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


import data.structure.Coordinate;
import data.structure.Line;
import data.structure.Polygon;

/**
 * @author Andrew Rambaut
 * @author Filip Bielejec
 * @version $Id$
 */
public class SpreadData {

	private HashMap<String, Object> dataMap;
	
	public SpreadData() {

		dataMap = new HashMap<String, Object>();

	}// END: Constructor

}// END: class
