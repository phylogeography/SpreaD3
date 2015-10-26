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
	}//END: getActiveFrame
	
	
	// ////////////////////////////////
	// ---EXCEPTION HANDLING UTILS---//
	// ////////////////////////////////

	public static void handleException(final Throwable e, final String message) {

		final Thread t = Thread.currentThread();

		if (SwingUtilities.isEventDispatchThread()) {
			showExceptionDialog(t, e, message);
		} else {
			SwingUtilities.invokeLater(new Runnable() {
				public void run() {
					showExceptionDialog(t, e, message);
				}
			});
		}// END: edt check
	}// END: uncaughtException

	public static void handleException(final Throwable e) {

		final Thread t = Thread.currentThread();

		if (SwingUtilities.isEventDispatchThread()) {
			showExceptionDialog(t, e);
		} else {
			SwingUtilities.invokeLater(new Runnable() {
				public void run() {
					showExceptionDialog(t, e);
				}
			});
		}// END: edt check
	}// END: handleException

	private static void showExceptionDialog(Thread t, Throwable e) {

		String msg = String.format("Unexpected problem on thread %s: %s",
				t.getName(), e.getMessage());

		logException(t, e);

		JOptionPane.showMessageDialog( getActiveFrame(), //
				msg, //
				"Error", //
				JOptionPane.ERROR_MESSAGE, //
				 createImageIcon( ERROR_ICON));
	}// END: showExceptionDialog

	private static void showExceptionDialog(Thread t, Throwable e,
			String message) {

		String msg = String.format("Unexpected problem on thread %s: %s" + "\n"
				+ message, t.getName(), e.getMessage());

		logException(t, e);

		JOptionPane.showMessageDialog( getActiveFrame(), //
				msg, //
				"Error", //
				JOptionPane.ERROR_MESSAGE, //
				 createImageIcon( ERROR_ICON));
	}// END: showExceptionDialog

	private static void logException(Thread t, Throwable e) {
		e.printStackTrace();
	}// END: logException
	
}//END: class
