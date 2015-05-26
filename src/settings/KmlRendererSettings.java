package settings;

public class KmlRendererSettings {

	public static final int R = 0;
	public static final int G = 1;
	public static final int B = 2;
	
	public String json=null;
	public String output = null;
	
	///////////////
	//---LINES---//
	///////////////
	
	// ---COLOR---//
	
	// For continuous attributes
	public String lineColorMapping = null;
	//TODO: min and max values should be created, not parsed
	public Double minLineRed = 50.0; public Double maxLineRed = 100.0;
	public Double minLineGreen = 100.0; public Double maxLineGreen = 250.0;
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
	public Double minLineAlpha = 50.0; public Double maxLineAlpha = 100.0;
	
	// Fixed
	public double lineAlpha = 100;
	public boolean lineAlphaChanged = false;
	
	
	
	// ---ALTITUDE---//
	
	// For continuous attributes
	public String lineAltitudeMapping = null;
	public Double minLineAltitude = 500.0;  public Double maxLineAltitude = 500000.0;
	
	// Fixed
	public Double lineAltitude = 500000.0;
	
	// ---WIDTH---//
	
	// For continuous attributes
	public String lineWidthMapping = null;
	public Double minLineWidth = 1.0;  public Double maxLineWidth = 10.0;
	
	// Fixed
	public Double lineWidth = 2.0;
	
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
	
}//END: class
