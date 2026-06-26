package renderers.d3;

import java.awt.Desktop;
import java.awt.Toolkit;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import org.apache.commons.io.FileUtils;

import settings.rendering.D3RendererSettings;

public class D3Renderer {

	private static final String D3_RENDERER_DIR = "renderers/d3/d3renderer/";
	private static final String MAIN_JS = "main.js";
	private static final String HTML = "index.html";

	// Marker line in main.js whose value is replaced with the inlined input JSON.
	private static final String DATA_MARKER = "var SPREAD3_DATA = null;";

	private D3RendererSettings settings;

	public D3Renderer(D3RendererSettings settings) {

		this.settings = settings;

	}// END: Constructor

	public void render() throws IOException {

		// Copy d3renderer dir to path/output
		String runningJarName = getRunningJarName();
		if (runningJarName != null) {

			JarFile jarfile = new JarFile(runningJarName);
			Enumeration<JarEntry> enumeration = jarfile.entries();

			while (enumeration.hasMoreElements()) {

				String destdir = settings.outputFilename;
				JarEntry je = enumeration.nextElement();

				if (je.toString().startsWith(D3_RENDERER_DIR)) {

					// System.out.println(je.getName());

					File fl = new File(destdir, je.getName());
					if (!fl.exists()) {
						fl.getParentFile().mkdirs();
						fl = new File(destdir, je.getName());
					}

					if (je.isDirectory()) {
						continue;
					}

					java.io.InputStream is = jarfile.getInputStream(je);
					java.io.FileOutputStream fo = new java.io.FileOutputStream(fl);

					while (is.available() > 0) {
						fo.write(is.read());
					}

					fo.close();
					is.close();
				}

			} // END: entries loop
			jarfile.close();

			// inline input.json into main.js (so it loads from file:// without CORS)
			File jsonFile = new File(settings.jsonFilename);
			File mainJsFile = new File(
					settings.outputFilename.concat("/").concat(D3_RENDERER_DIR).concat(MAIN_JS));
			inlineDataIntoMainJs(mainJsFile, jsonFile);

			// point system default browser to index.html
			String htmlPath = settings.outputFilename.concat("/").concat(D3_RENDERER_DIR).concat(HTML);
			openInBrowser(htmlPath);

		} else {// running from IDE

			String d3rendererPath = this.getClass().getResource("/".concat(D3_RENDERER_DIR)).getPath();
			File srcDir = new File(d3rendererPath);
			File destDir = new File(settings.outputFilename);
			FileUtils.copyDirectory(srcDir, destDir);

			// inline input.json into main.js (so it loads from file:// without CORS)
			File jsonFile = new File(settings.jsonFilename);
			File mainJsFile = new File(settings.outputFilename.concat("/").concat(MAIN_JS));
			inlineDataIntoMainJs(mainJsFile, jsonFile);

			// point system default browser to index.html
			String htmlPath = settings.outputFilename.concat("/").concat(HTML);
			openInBrowser(htmlPath);

		}

	}// END: render

	// Replace the SPREAD3_DATA marker line in main.js with the input JSON so the
	// data is embedded in the script and no separate data.json fetch is needed.
	private void inlineDataIntoMainJs(File mainJsFile, File jsonFile) throws IOException {

		String mainJs = FileUtils.readFileToString(mainJsFile, StandardCharsets.UTF_8);
		String json = FileUtils.readFileToString(jsonFile, StandardCharsets.UTF_8).trim();

		if (!mainJs.contains(DATA_MARKER)) {
			throw new IOException("Could not find data marker '" + DATA_MARKER
					+ "' in " + mainJsFile.getPath());
		}

		// java.lang.String#replace treats both arguments as literals, so JSON
		// content (e.g. '$' or backslashes) needs no escaping.
		String replacement = "var SPREAD3_DATA = " + json + ";";
		mainJs = mainJs.replace(DATA_MARKER, replacement);

		FileUtils.writeStringToFile(mainJsFile, mainJs, StandardCharsets.UTF_8);
	}// END: inlineDataIntoMainJs

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
