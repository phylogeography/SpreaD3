package gui;

import java.awt.Frame;
import java.awt.Image;
import java.awt.Toolkit;
import java.net.URL;

import javax.swing.ImageIcon;

import app.Spread2App;

public class InterfaceUtils {

	public static final String SPREAD_ICON = "/gui/icons/spread.png";
	
	
	
	
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
	}
	
}//END: class
