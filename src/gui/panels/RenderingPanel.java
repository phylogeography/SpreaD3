package gui.panels;

import java.awt.BorderLayout;
import java.awt.GridBagConstraints;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JComboBox;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.SwingConstants;

import gui.MainFrame;
import gui.OptionsPanel;
import gui.RendererTypes;

@SuppressWarnings({ "rawtypes", "unchecked", "serial" })
public class RenderingPanel extends OptionsPanel {

	// Main frame
	private MainFrame frame;

	// Scroll panes
	private JScrollPane scrollPane;

	// Panels
	private OptionsPanel optionPanel;
	private OptionsPanel holderPanel;

	// Combo boxes
	private JComboBox rendererSelector;
	private ComboBoxModel rendererSelectorModel;

	public RenderingPanel(MainFrame frame) {

		this.frame = frame;

		optionPanel = new OptionsPanel(12, 12, SwingConstants.NORTH);
		holderPanel = new OptionsPanel(12, 12, SwingConstants.CENTER);
		
		rendererSelector = new JComboBox();
		rendererSelectorModel = new DefaultComboBoxModel(RendererTypes.values());
		rendererSelector.setModel(rendererSelectorModel);
		
		optionPanel.addComponentWithLabel("Select renderer:", rendererSelector);
		optionPanel.addSeparator();
		optionPanel.addComponent(holderPanel);

		setOpaque(false);
		setLayout(new BorderLayout());

		JPanel tmpPanel = new JPanel();
		GridBagConstraints gridBagConstraints = new GridBagConstraints();
		gridBagConstraints.fill = GridBagConstraints.HORIZONTAL;
		gridBagConstraints.gridx = 0;
		gridBagConstraints.gridy = 0;
		tmpPanel.add(optionPanel, gridBagConstraints);

		scrollPane = new JScrollPane(tmpPanel,
				JScrollPane.VERTICAL_SCROLLBAR_ALWAYS,
				JScrollPane.HORIZONTAL_SCROLLBAR_ALWAYS);
		scrollPane.getViewport().setOpaque(false);
		add(scrollPane, BorderLayout.CENTER);

		// Listeners
		rendererSelector.addItemListener(new ListenRendererSelector());

		// Call first item in selector
		rendererSelector.setSelectedIndex(0);
		populateD3Panels();

	}// END: Constructor

	private class ListenRendererSelector implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				RendererTypes type = (RendererTypes) item;
				switch (type) {

				case D3:
					populateD3Panels();
					break;

				case KML:
					populateKmlPanels();
					break;

				default:
					break;

				}// END: switch

				frame.setStatus(item.toString() + " selected");

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenParserSelector

	// //////////
	// ---D3---//
	// //////////

	private void populateD3Panels() {

		holderPanel.removeAll();
		holderPanel.add(new D3RenderPanel(frame));
		
		
	}// END: populateD3Panels

	// ///////////
	// ---KML---//
	// ///////////

	private void populateKmlPanels() {

		holderPanel.removeAll();
		holderPanel.add(new KmlRendererPanel(frame));
		
	}// END: populateKmlPanels

}// END: class
