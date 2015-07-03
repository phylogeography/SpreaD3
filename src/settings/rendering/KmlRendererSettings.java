package settings.rendering;

public class KmlRendererSettings {

	public static final int R = 0;
	public static final int G = 1;
	public static final int B = 2;
	
	public String json = null;
	public String output = "output.kml";
	
	///////////////
	//---LINES---//
	///////////////
	
	// ---COLOR---//
	
	// For continuous attributes
	public String lineColorMapping = null;
	//TODO: parse min and max values
	public Double minLineRed = 100.0; public Double maxLineRed = 250.0;
	public Double minLineGreen = 50.0; public Double maxLineGreen = 100.0;
	public Double minLineBlue = 50.0; public Double maxLineBlue = 100.0;
	
	// For discrete attributes
	public String lineColors = null;
	
	// Fixed
	public double[] lineColor = new double[] { 50,// R,
			250,// G
			50 // B
	};
	
	// ---ALPHA CHANNEL---//
	
	// For continuous attributes
	public String lineAlphaMapping;
	public Double minLineAlpha = 100.0; public Double maxLineAlpha = 150.0;
	
	// Fixed
	public double lineAlpha = 255;
	public boolean lineAlphaChanged = false;
	
	
	
	// ---ALTITUDE---//
	
	// For continuous attributes
	public String lineAltitudeMapping = null;
	public Double minLineAltitude = 50000.0;  public Double maxLineAltitude = 500000.0;
	
	// Fixed
	public Double lineAltitude = 500000.0;
	
	// ---WIDTH---//
	
	// For continuous attributes
	public String lineWidthMapping = null;
	public Double minLineWidth = 2.0;  public Double maxLineWidth = 10.0;
	
	// Fixed
	public Double lineWidth = 2.0;
	
	
	// ---SUBSETTING---//
	
	public String linesSubset = null;
	public Double linesCutoff = null;
	public String linesValue = null;
	
	
	
	
	//////////////////
	//---POLYGONS---//
	//////////////////

	// ---COLOR---//
	
	// For continuous attributes
	public String polygonColorMapping = null;
	public Double minPolygonRed = 50.0; public Double maxPolygonRed = 100.0;
	public Double minPolygonGreen = 50.0; public Double maxPolygonGreen = 100.0;
	public Double minPolygonBlue = 100.0; public Double maxPolygonBlue = 250.0;

	// For discrete attributes
	public String polygonColors = null;
	
	// Fixed
	public double[] polygonColor = new double[] { 50,// R,
			50,// G
			250 // B
	};
	
	
	// ---ALPHA CHANNEL---//
	
	// For continuous attributes
	public String polygonAlphaMapping = null;
	public Double minPolygonAlpha = 50.0; public Double maxPolygonAlpha = 100.0;
	
	// Fixed
	public double polygonAlpha = 100;
	public boolean polygonAlphaChanged = false;

	
	// --CIRCULAR POLYGONS AREA---//
	
	// For continuous attributes
	public String polygonAreaMapping= null;
	public Double minPolygonArea = 20000.0; public Double maxPolygonRadius = 200000.0;
	
	// For discrete attributes
    //TODO: make a joint CSS [?] style sheet for all these settings
	
	// Fixed
	public Double polygonArea = 20000.0;
	
	// ---SUBSETTING---//
	
	public String polygonsSubset = null;
	public Double polygonsCutoff = null;
	public String polygonsValue = null;
	
	
}//END: class
