package gui;

import java.awt.Color;
import java.awt.Cursor;
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JLabel;

import app.SpreaD3;

/**
 * @author Filip Bielejec
 * @version $Id$
 */
@SuppressWarnings("serial")
public class AboutDialog extends JDialog {

	private static final int WIDTH = 700;
	private static final int HEIGHT = 700;
	private static final int FONT_SIZE = 15;

	private static final String CITATION1 = "To cite " + SpreaD3.SHORT_NAME + " in publications, please use:";
	private static final String CITATION2 = "SpreaD3: interactive visualisation of spatiotemporal history and trait evolutionary processes. ";
	private static final String CITATION3 = "Filip Bielejec; Guy Baele; Bram Vrancken; Marc A. Suchard; Andrew Rambaut; Philippe Lemey";
	private static final String CITATION4 = "Molecular Biology and Evolution 2016; doi: 10.1093/molbev/msw082";

	public AboutDialog() {
		initUI();
	}// END: Constructor

	public final void initUI() {

		JLabel label;
		JLabel contact;
		JLabel website;
		String addres;

		setLayout(new BoxLayout(getContentPane(), BoxLayout.Y_AXIS));
		getContentPane().setBackground(Color.WHITE);
		setLocationRelativeTo(InterfaceUtils.getActiveFrame());

		add(Box.createRigidArea(new Dimension(0, 10)));

		// Setup image
		label = new JLabel(InterfaceUtils.createImageIcon(InterfaceUtils.SPREAD_ICON));
		label.setAlignmentX(0.5f);
		add(label);

		add(Box.createRigidArea(new Dimension(0, 10)));

		// Setup name
		label = new JLabel(SpreaD3.SHORT_NAME);
		label.setFont(new Font("Serif", Font.BOLD, FONT_SIZE));
		label.setAlignmentX(0.5f);
		add(label);

		add(Box.createRigidArea(new Dimension(0, 10)));

		// Setup long name
		label = new JLabel(SpreaD3.LONG_NAME);
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);

		// Setup version
		label = new JLabel(SpreaD3.SHORT_NAME + " version " + SpreaD3.VERSION + " (" + SpreaD3.DATE_STRING + ")"
				+ " -- " + SpreaD3.CODENAME);
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);

		add(Box.createRigidArea(new Dimension(0, 10)));

		// Setup authors
		label = new JLabel("Authors: " + SpreaD3.FILIP_BIELEJEC + ", " + SpreaD3.GUY_BAELE + ", "
				+ SpreaD3.ANDREW_RAMBAUT + ", " + SpreaD3.MARC_SUCHARD + " and " + SpreaD3.PHILIPPE_LEMEY);
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);

		add(Box.createRigidArea(new Dimension(0, 10)));

		// Setup thanks
		label = new JLabel("Thanks to: Stephan Nylinder");
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);

		add(Box.createRigidArea(new Dimension(0, 10)));

		// Setup citation
		label = new JLabel(CITATION1);
		label.setFont(new Font("Serif", Font.BOLD, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);

		label = new JLabel(CITATION2);
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);

		label = new JLabel(CITATION3);
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);
		
		label = new JLabel(CITATION4);
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 2));
		label.setAlignmentX(0.5f);
		add(label);
		
		add(Box.createRigidArea(new Dimension(0, 10)));

		// Setup about
		label = new JLabel("Website:");
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 3));
		label.setAlignmentX(0.5f);
		add(label);

		website = new JLabel();
		addres = "http://rega.kuleuven.be/cev/ecv/software/SpreaD3";
		website.setText("<html><p><a href=\"" + addres + "\">" + addres + "</a></p></html>");
		website.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
		website.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 3));
		// website.setVerticalAlignment(SwingConstants.CENTER);
		// website.setHorizontalAlignment(SwingConstants.CENTER);
		website.addMouseListener(new ListenBrowse(addres));
		add(website);

		add(Box.createRigidArea(new Dimension(0, 10)));

		label = new JLabel("Need help with BEAST analysis? Contact us:");
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 3));
		label.setAlignmentX(0.5f);
		add(label);

		contact = new JLabel();
		addres = "msuchard@ucla.edu";
		contact.setText("<html><center><p><a href=\"mailto:" + addres + "\">" + addres + "</a></p></center></html>");
		contact.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
		contact.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 3));
		// contact.setAlignmentX(0.0f);
		contact.addMouseListener(new ListenSendMail(addres));
		add(contact);

		add(Box.createRigidArea(new Dimension(0, 10)));

		label = new JLabel("Source code distributed under the GNU LGPL");
		label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 3));
		label.setAlignmentX(0.5f);
		add(label);

		add(Box.createRigidArea(new Dimension(0, 20)));

		// label = new JLabel(FortuneCookies.nextCookie());
		// label.setFont(new Font("Serif", Font.PLAIN, FONT_SIZE - 3));
		// label.setAlignmentX(0.5f);
		// add(label);
		//
		// add(Box.createRigidArea(new Dimension(0, 20)));

		JButton close = new JButton("Close");
		close.addActionListener(new ActionListener() {

			public void actionPerformed(ActionEvent event) {
				dispose();
			}
		});

		close.setAlignmentX(0.5f);
		add(close);

		setModalityType(ModalityType.APPLICATION_MODAL);

		setTitle("About " + SpreaD3.SHORT_NAME);
		setDefaultCloseOperation(DISPOSE_ON_CLOSE);
		setLocationRelativeTo(null);
		setSize(WIDTH, HEIGHT);
		setResizable(true);
	}// END: initUI

	private class ListenSendMail extends MouseAdapter {

		private String addres;

		public ListenSendMail(String addres) {
			this.addres = addres;
		}

		@Override
		public void mouseClicked(MouseEvent ev) {
			try {

				Desktop.getDesktop().mail(new URI("mailto:" + addres));

			} catch (IOException e) {

				// Utils.handleException(
				// e,
				// "Problem occurred while trying to open this address in your
				// system's standard email client.");

			} catch (URISyntaxException e) {

				// Utils.handleException(
				// e,
				// "Problem occurred while trying to open this address in your
				// system's standard email client.");

			} // END: try-catch block

		}// END: mouseClicked

	}// END: ListenSendMail

	private class ListenBrowse extends MouseAdapter {

		private String website;

		public ListenBrowse(String website) {
			this.website = website;
		}

		@Override
		public void mouseClicked(MouseEvent ev) {

			try {

				Desktop.getDesktop().browse(new URI(website));

			} catch (IOException e) {

				InterfaceUtils.handleException(e,
						"Problem occurred while trying to open this link in your system's standard browser.");

			} catch (URISyntaxException e) {

				InterfaceUtils.handleException(e,
						"Problem occurred while trying to open this link in your system's standard browser.");

			} // END: try-catch block

		}// END: mouseClicked

	}// END: ListenSendMail

}// END: class
