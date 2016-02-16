package app;

import gui.InterfaceUtils;
import gui.MainFrame;
import gui.MenuBarFactory;
import jam.framework.SingleDocApplication;

import java.awt.Font;
import java.awt.Image;

import javax.swing.ImageIcon;
import javax.swing.UIManager;

public class Spread2UIApp {

	public Spread2UIApp() {
		
		boolean lafLoaded = false;

		// Setup Look & Feel
		if (System.getProperty("os.name").toLowerCase().startsWith("mac os x")) {

			// Mac stuff
			System.setProperty("apple.awt.showGrowBox", "true");
			System.setProperty("apple.awt.brushMetalLook", "true");
			System.setProperty("apple.laf.useScreenMenuBar", "true");

			System.setProperty("apple.awt.graphics.UseQuartz", "true");
			System.setProperty("apple.awt.antialiasing", "true");
			System.setProperty("apple.awt.rendering", "VALUE_RENDER_QUALITY");

			System.setProperty("apple.laf.useScreenMenuBar", "true");
			System.setProperty("apple.awt.draggableWindowBackground", "true");
			System.setProperty("apple.awt.showGrowBox", "true");

			UIManager.put("SystemFont", new Font("Lucida Grande", Font.PLAIN,
					13));
			UIManager.put("SmallSystemFont", new Font("Lucida Grande",
					Font.PLAIN, 11));

			try {

				// UIManager.setLookAndFeel(UIManager
				// .getSystemLookAndFeelClassName());

				UIManager
						.setLookAndFeel("ch.randelshofer.quaqua.QuaquaLookAndFeel");
				lafLoaded = true;

			} catch (Exception e) {
				//
			}

		} else {

			try {

				// UIManager.setLookAndFeel(UIManager
				// .getSystemLookAndFeelClassName());

				UIManager
						.setLookAndFeel("com.sun.java.swing.plaf.nimbus.NimbusLookAndFeel");
				lafLoaded = true;

			} catch (Exception e) {
				//
			}

		}

		if (!lafLoaded) {

			try {

				UIManager.setLookAndFeel(UIManager
						.getSystemLookAndFeelClassName());
				System.out
						.println("Specified l&f not found. Loading system default l&f");

			} catch (Exception e) {

				e.printStackTrace();

			}
		}

		ImageIcon spreadIcon = InterfaceUtils.createImageIcon(InterfaceUtils.SPREAD_ICON);
		SingleDocApplication app = new SingleDocApplication(new MenuBarFactory(), //
				SpreaD3.LONG_NAME, //
				SpreaD3.VERSION.concat(" ").concat(
						SpreaD3.DATE_STRING), //
						spreadIcon //
		);

		Image spreadImage = InterfaceUtils.CreateImage(InterfaceUtils.SPREAD_ICON);
		MainFrame frame = new MainFrame(SpreaD3.SHORT_NAME);
		frame.setIconImage(spreadImage);
		app.setDocumentFrame(frame);
		
	}//END: Constructor
	
}//END: class
