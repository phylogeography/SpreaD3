package tests;

import renderers.kml.KmlRenderer;
import settings.rendering.KmlRendererSettings;

public class TestKmlRenderer {

	public static void main(String[] args) {

		try {

			// ---SETTINGS---//

			KmlRendererSettings settings = new KmlRendererSettings();
			
			settings.jsonFilename = new String("/home/filip/Dropbox/JavaScriptProjects/d3-renderer/public/ebov.json");
			
			settings.outputFilename = new String("/home/filip/Desktop/ebov.kml");

			// ---RENDER---//

			KmlRenderer renderer = new KmlRenderer(settings);
			renderer.render();
			
			System.out.println("Rendered KML");

		} catch (Exception e) {
			e.printStackTrace();
		}

	}// END: main

	
}
