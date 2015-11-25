package settings.rendering;

public class KmlRendererSettings {

	public static final int R = 0;
	public static final int G = 1;
	public static final int B = 2;

	public String jsonFilename = null;
	public String outputFilename = "output.kml";

	// //////////////
	// ---POINTS---//
	// //////////////

	// ---SUBSET---//
	public String pointsSubset = null;
	public Double pointsCutoff = null;
	public String pointsValue = null;

	// ---COLOR---//

	// For continuous attributes
	public String pointColorMapping = null;

	public Double minPointRed = 50.0;
	public Double maxPointRed = 100.0;

	public Double minPointGreen = 100.0;
	public Double maxPointGreen = 250.0;

	public Double minPointBlue = 50.0;
	public Double maxPointBlue = 100.0;

	// For discrete attributes
	public String pointColors = null;

	// Fixed
	public double[] pointColor = new double[] { 50, // R,
			250, // G
			50 // B
	};

	// ---ALPHA---//

	// For continuous attributes
	public String pointAlphaMapping = null;
	public Double minPointAlpha = 100.0;
	public Double maxPointAlpha = 150.0;

	// Fixed
	public double pointAlpha = 100;
	public boolean pointAlphaChanged = false;

	// ---AREA---//

	// For continuous attributes
	public String pointAreaMapping = null;
	public Double minPointArea = 1000.0;
	public Double maxPointArea = 10000.0;

	// For discrete attributes

	// Fixed
	public Double pointArea = 1000.0;

	// /////////////
	// ---LINES---//
	// /////////////

	// ---SUBSETTING---//

	public String linesSubset = null;
	public Double linesCutoff = null;
	public String linesValue = null;

	// ---COLOR---//

	// For continuous attributes
	public String lineColorMapping = null;
	public Double minLineRed = 100.0;
	public Double maxLineRed = 250.0;
	public Double minLineGreen = 50.0;
	public Double maxLineGreen = 100.0;
	public Double minLineBlue = 50.0;
	public Double maxLineBlue = 100.0;

	// For discrete attributes
	public String lineColors = null;

	// Fixed
	public double[] lineColor = new double[] { 50, // R,
			250, // G
			50 // B
	};

	// ---ALPHA---//

	// For continuous attributes
	public String lineAlphaMapping = null;
	public Double minLineAlpha = 100.0;
	public Double maxLineAlpha = 150.0;

	// Fixed
	public double lineAlpha = 255;
	public boolean lineAlphaChanged = false;

	// ---ALTITUDE---//

	// For continuous attributes
	public String lineAltitudeMapping = null;
	public Double minLineAltitude = 50000.0;
	public Double maxLineAltitude = 500000.0;

	// Fixed
	public Double lineAltitude = 500000.0;

	// ---WIDTH---//

	// For continuous attributes
	public String lineWidthMapping = null;
	public Double minLineWidth = 2.0;
	public Double maxLineWidth = 10.0;

	// Fixed
	public Double lineWidth = 2.0;

	// /////////////
	// ---AREAS---//
	// /////////////

	// ---SUBSETTING---//

	// public String areasSubset = null;
	// public Double areasCutoff = null;
	// public String areasValue = null;

	// ---COLOR---//

	// For continuous attributes
	public String areaColorMapping = null;
	
	public Double minAreaRed = 100.0;
	public Double minAreaGreen = 50.0;	
	public Double minAreaBlue = 50.0;
	
	public Double maxAreaRed = 250.0;
	public Double maxAreaGreen = 100.0;
	public Double maxAreaBlue = 100.0;

	// For discrete attributes
	public String areaColors = null;
	
	// Fixed
	public double[] areaColor = new double[] { 50, // R,
			50, // G
			250 // B
	};

	// ---ALPHA---//

	// Fixed
	public double areaAlpha = 100;

	// //////////////
	// --COUNTS---//
	// //////////////

	// ---AREA---//

	// For continuous attributes
	public Double minCountArea = 20000.0;
	public Double maxCountArea = 200000.0;

	// ---COLOR---//

	// Fixed
	public double[] countColor = new double[] { 250, // R,
			50, // G
			50 // B
	};

	// ---ALPHA---//

	// Fixed
	public double countAlpha = 100;

}// END: class
