package renderers.d3;

import java.awt.Desktop;
import java.awt.Toolkit;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import org.apache.commons.io.FileUtils;
import settings.rendering.D3RendererSettings;

public class D3Renderer {

	private static final String D3_RENDERER_DIR = "/renderers/d3/d3renderer";
	private static final String D3_DATA_DIR = "/data/data.json";
	private static final String HTML = "index.html";

	private D3RendererSettings settings;

	public D3Renderer(D3RendererSettings settings) {

		this.settings = settings;

	}// END: Constructor

	public void render() throws IOException {

		// Copy d3renderer dir to path/output
		String d3rendererPath;
		String runningJarName = getRunningJarName();
		if (runningJarName != null) {
			d3rendererPath = "jar:" + this.getClass().getResource(D3_RENDERER_DIR).getPath();
		} else {
			d3rendererPath = this.getClass().getResource(D3_RENDERER_DIR).getPath();
		}

		File srcDir = new File(d3rendererPath);
		File destDir = new File(settings.output);
		FileUtils.copyDirectory(srcDir, destDir);

		// copy input.json to path/output/data/data.json
		srcDir = new File(settings.json);
		destDir = new File(settings.output.concat(D3_DATA_DIR));
		FileUtils.copyFile(srcDir, destDir);

		// point system default browser to index.html
		String htmlPath = settings.output.concat("/").concat(HTML);
		openInBrowser(htmlPath);

	}// END: render

	private String getRunningJarName() {

		String className = this.getClass().getName().replace('.', '/');
		String classJar = this.getClass().getResource("/" + className + ".class").toString();

		if (classJar.startsWith("jar:")) {
			String vals[] = classJar.split("/");
			for (String val : vals) {
				if (val.contains("!")) {
					return val.substring(0, val.length() - 1);
				}
			}
		}

		return null;
	}// END: getRunningJarName

	public static void openInBrowser(String url) {

		try {

			File htmlFile = new File(url);
			URI uri = htmlFile.toURI();
			Desktop desktop = Desktop.isDesktopSupported() ? Desktop.getDesktop() : null;

			if (desktop != null && desktop.isSupported(Desktop.Action.BROWSE)) {
				desktop.browse(uri);
			}

		} catch (MalformedURLException e) {

			handleBrowseException(url);

		} catch (IOException e) {

			handleBrowseException(url);

		} // END: try-catch

	}// END: openInBrowser

	private static void handleBrowseException(String url) {

		// Copy URL to the clipboard so the user can paste it into their browser
		StringSelection stringSelection = new StringSelection(url);
		Clipboard clpbrd = Toolkit.getDefaultToolkit().getSystemClipboard();
		clpbrd.setContents(stringSelection, null);

		// Notify the user of the failure
		System.out.println("This program just tried to open a webpage: " + url);
		System.out.println("The URL has been copied to your clipboard, simply paste into your browser to access.");
	}// END: handleBrowseException

}// END: class
