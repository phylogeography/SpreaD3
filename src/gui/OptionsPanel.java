package gui;

import javax.swing.*;
import java.awt.*;

/*
 * OptionsPanel.
 *
 * @author Andrew Rambaut
 * @version $Id: OptionsPanel.java 958 2008-11-30 14:32:20Z rambaut $
 */
public class OptionsPanel extends JPanel {

	protected GridBagLayout gridbag = new GridBagLayout();
	private final int hGap;
	private final int vGap;
	private final int alignment;

	public OptionsPanel() {
		this(4, 4, SwingConstants.LEFT);
	}

	public OptionsPanel(int hGap, int vGap) {
		this(hGap, vGap, SwingConstants.LEFT);
	}

	public OptionsPanel(int hGap, int vGap, int alignment) {
		this.hGap = hGap;
		this.vGap = vGap;
		this.alignment = alignment;

		setBorder(BorderFactory.createEmptyBorder(3, 6, 6, 6));
		setLayout(gridbag);
		setOpaque(false);
	}

	public void addLabel(String text) {
		JLabel label = new JLabel(text);
		adjustComponent(label);
		addSpanningComponent(label);
	}

	public void addSpanningComponent(JComponent comp) {

		adjustComponent(comp);

		GridBagConstraints c = new GridBagConstraints();
		c.insets = new Insets(vGap / 2, 0, vGap / 2, 0);
		c.weightx = 1.0;
		c.weighty = 0.0;
		c.fill = GridBagConstraints.HORIZONTAL;
		c.anchor = GridBagConstraints.PAGE_START;

		c.gridwidth = GridBagConstraints.REMAINDER;

		// it is now up to the calling code to add a border
		// comp.setBorder(new EmptyBorder(6, 24, 6, 24));
		gridbag.setConstraints(comp, c);
		add(comp);
	}

	public void addSeparator() {

		GridBagConstraints c = new GridBagConstraints();
		c.insets = new Insets(0, 0, 0, 0);
		c.weightx = 1.0;
		c.weighty = 0.0;
		c.fill = GridBagConstraints.HORIZONTAL;

		c.gridwidth = GridBagConstraints.REMAINDER;
		c.anchor = GridBagConstraints.PAGE_START;
		JSeparator separator = new JSeparator();
		adjustComponent(separator);
		separator.setOpaque(false);
		gridbag.setConstraints(separator, c);
		add(separator);
	}

	public void addFlexibleSpace() {

		GridBagConstraints c = new GridBagConstraints();
		c.insets = new Insets(0, 0, 0, 0);
		c.weightx = 0.0;
		c.weighty = 1.0;
		c.fill = GridBagConstraints.NONE;

		c.gridwidth = GridBagConstraints.REMAINDER;
		JSeparator separator = new JSeparator();
		separator.setPreferredSize(new Dimension(0, 0));
		gridbag.setConstraints(separator, c);
		add(separator);
	}

	public void addComponent(JComponent comp) {
		addComponent(comp, false);
	}

	public void addComponent(JComponent comp, boolean fill) {
		JPanel panel = new JPanel();
		panel.setOpaque(false);
		addComponents(panel, false, comp, fill);
	}

	public JLabel addComponentWithLabel(String text, JComponent comp) {
		return addComponentWithLabel(text, comp, false);
	}

	public JLabel addComponentWithLabel(String text, JComponent comp, boolean fill) {

		JLabel label = new JLabel(text, javax.swing.SwingConstants.RIGHT);
		label.setLabelFor(comp);
		label.setOpaque(false);
		addComponents(label, false, comp, fill);

		return label;
	}

	public void addComponents(JComponent comp1, JComponent comp2) {
		addComponents(comp1, false, comp2, false);
	}

	public void addComponents(JComponent comp1, boolean fill1, JComponent comp2, boolean fill2) {

		adjustComponent(comp1);
		adjustComponent(comp2);

		GridBagConstraints c = new GridBagConstraints();
		c.weightx = (alignment != SwingConstants.LEFT ? 1.0 : 0.0);
		c.weighty = 0.0;
		c.fill = fill1 ? GridBagConstraints.HORIZONTAL : GridBagConstraints.NONE;

		c.insets = new Insets(vGap / 2, 0, vGap / 2, hGap / 2);
		c.gridwidth = 1;
		c.anchor = GridBagConstraints.EAST;
		gridbag.setConstraints(comp1, c);
		add(comp1);

		c.weightx = (alignment != SwingConstants.RIGHT ? 1.0 : 0.0);
		c.insets = new Insets(vGap / 2, hGap / 2, vGap / 2, 0);
		c.fill = fill2 ? GridBagConstraints.HORIZONTAL : GridBagConstraints.NONE;
		c.gridwidth = GridBagConstraints.REMAINDER;
		c.anchor = GridBagConstraints.WEST;
		gridbag.setConstraints(comp2, c);
		add(comp2);
	}

	protected void adjustComponent(JComponent comp) {
		// do nothing
	}
}
