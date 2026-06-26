package gui;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JCheckBoxMenuItem;
import javax.swing.JMenu;
import javax.swing.UIManager;

import com.formdev.flatlaf.FlatDarkLaf;
import com.formdev.flatlaf.FlatLaf;
import com.formdev.flatlaf.FlatLightLaf;

import jam.framework.AbstractFrame;
import jam.framework.MenuFactory;

/**
 * View menu exposing a light/dark theme toggle for the FlatLaf look & feel.
 */
public class ViewMenuFactory implements MenuFactory {

	public ViewMenuFactory() {
	}// END: Constructor

	@Override
	public void populateMenu(JMenu menu, AbstractFrame frame) {

		menu.setMnemonic('V');

		final JCheckBoxMenuItem darkTheme = new JCheckBoxMenuItem("Dark theme");
		darkTheme.setSelected(UIManager.getLookAndFeel() instanceof FlatDarkLaf);

		darkTheme.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent ev) {
				try {

					if (darkTheme.isSelected()) {
						UIManager.setLookAndFeel(new FlatDarkLaf());
					} else {
						UIManager.setLookAndFeel(new FlatLightLaf());
					}

					// repaint every open window with the new theme
					FlatLaf.updateUI();

				} catch (Throwable e) {
					// FlatLaf unavailable; leave the current look & feel
				}
			}// END: actionPerformed
		});

		menu.add(darkTheme);

	}// END: populateMenu

	@Override
	public String getMenuName() {
		return "View";
	}

	@Override
	public int getPreferredAlignment() {
		return LEFT;
	}

}// END: class
