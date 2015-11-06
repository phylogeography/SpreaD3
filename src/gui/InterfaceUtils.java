package gui;

import java.awt.Frame;
import java.awt.Image;
import java.awt.Toolkit;
import java.net.URL;

import javax.swing.ImageIcon;
import javax.swing.JOptionPane;
import javax.swing.SwingUtilities;

import app.Spread2App;

public class InterfaceUtils {

	public static final String SPREAD_ICON = "/gui/icons/spread.png";
	public static final String ERROR_ICON = "/gui/icons/error.png";
	public static final String TREE_ICON = "/gui/icons/tree.png";
	public static final String LOCATIONS_ICON = "/gui/icons/locations.png";
	public static final String CHECK_ICON = "/gui/icons/check.png";
	public static final String SAVE_ICON = "/gui/icons/save.png";
	public static final String GEOJSON_ICON = "/gui/icons/geojson.png";
	public static final String JSON_ICON = "/gui/icons/json.png";
	public static final String COLOR_WHEEL_ICON = "/gui/icons/colorwheel.png";
	public static final String LOG_ICON = "/gui/icons/log.png";
	public static final String TIME_ICON = "/gui/icons/time.png";
	public static final String TREES_ICON = "/gui/icons/trees.png";	
	
	
	public static Image CreateImage(String path) {
		URL imgURL = Spread2App.class.getResource(path);
		Toolkit kit = Toolkit.getDefaultToolkit();
		Image img = kit.createImage(imgURL);

		if (img != null) {
			return img;
		} else {
			System.out.println("Couldn't find file: " + path + "\n");
			return null;
		}

	}// END: CreateImage

	public static ImageIcon createImageIcon(String path) {

		ImageIcon icon = null;
		URL imgURL = Spread2App.class.getResource(path);
		if (imgURL != null) {
			icon = new ImageIcon(imgURL);
		} else {
			System.err.println("Couldn't find file: " + path + "\n");
		}

		return icon;
	}// END: CreateImageIcon

	public static Frame getActiveFrame() {
		Frame result = null;
		Frame[] frames = Frame.getFrames();
		for (int i = 0; i < frames.length; i++) {
			Frame frame = frames[i];
			if (frame.isVisible()) {
				result = frame;
				break;
			}
		}
		return result;
	}// END: getActiveFrame

	// ////////////////////////////////
	// ---EXCEPTION HANDLING UTILS---//
	// ////////////////////////////////

	public static void handleException(final Throwable e, final String message) {

		final Thread t = Thread.currentThread();

		if (SwingUtilities.isEventDispatchThread()) {

			logException(t, e);
			showExceptionDialog(message);

		} else {
			SwingUtilities.invokeLater(new Runnable() {
				public void run() {

					logException(t, e);
					showExceptionDialog(message);

				}
			});
		}// END: edt check
	}// END: uncaughtException

	private static void showExceptionDialog(String message) {
		JOptionPane.showMessageDialog(getActiveFrame(), //
				message, //
				"Error", //
				JOptionPane.ERROR_MESSAGE, //
				createImageIcon(ERROR_ICON));
	}// END: showExceptionDialog

	private static void logException(Thread t, Throwable e) {

		String msg = String.format("Unexpected problem on thread %s: %s",
				t.getName(), e.getMessage());
		System.out.println(msg);

		System.out.println("Stack trace:");
		e.printStackTrace();

	}// END: logException

}// END: class
