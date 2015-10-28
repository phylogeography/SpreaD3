package gui;

import gui.panels.DiscreteTreePanel;
import jam.framework.Exportable;
import jam.panels.OptionsPanel;

import java.awt.BorderLayout;
import java.awt.GridBagConstraints;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;

import javax.swing.ComboBoxModel;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JComboBox;
import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.SwingConstants;

@SuppressWarnings({ "rawtypes", "unchecked", "serial" })
public class DataPanel extends JPanel implements Exportable {

	// Mian frame
	private MainFrame frame;

	// Scroll panes
	private JScrollPane scrollPane;

	// Panels
	private JPanel tmpPanel;
	private OptionsPanel optionPanel;
	private OptionsPanel holderPanel;

	// Combo boxes
	private JComboBox parserSelector;
	private ComboBoxModel parserSelectorModel;


	public DataPanel(MainFrame frame) {

		this.frame = frame;

		optionPanel = new OptionsPanel(12, 12, SwingConstants.NORTH);
		holderPanel = new OptionsPanel(12, 12, SwingConstants.CENTER);

		parserSelector = new JComboBox();
		optionPanel.addComponentWithLabel("Select input type:", parserSelector);
		parserSelectorModel = new DefaultComboBoxModel(ParserTypes.values());
		parserSelector.setModel(parserSelectorModel);

		optionPanel.addSeparator();
		optionPanel.addComponent(holderPanel);

		setOpaque(false);
		setLayout(new BorderLayout());
		// add(optionPanel, BorderLayout.NORTH);

		tmpPanel = new JPanel();
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
		parserSelector.addItemListener(new ListenParserSelector());
		parserSelector.setSelectedIndex(0);

		// Call first item in selector
		populateDiscreteTreePanels();

	}// END: Constructor

	private class ListenParserSelector implements ItemListener {

		@Override
		public void itemStateChanged(ItemEvent event) {
			if (event.getStateChange() == ItemEvent.SELECTED) {

				Object item = event.getItem();
				ParserTypes type = (ParserTypes) item;
				switch (type) {

				case DISCRETE_TREE:
					populateDiscreteTreePanels();
					break;

				case BAYES_FACTOR:
					populateBayesFactorPanels();
					break;

				case CONTINUOUS_TREE:
					populateContinuousTreePanels();
					break;

				case TIME_SLICER:
					populateTimeSlicerPanels();
					break;

				default:
					break;

				}// END: switch

				frame.setStatus(item.toString() + " selected");

			} // END: selected check
		}// END: itemStateChanged

	}// END: ListenParserSelector

	// /////////////////////
	// ---DISCRETE TREE---//
	// /////////////////////

	private void populateDiscreteTreePanels() {

		DiscreteTreePanel panel = new DiscreteTreePanel(frame, holderPanel);
		panel.populateHolderPanel();
		
	}//END: populateDiscreteTreePanels
	
	// ////////////////////
	// ---BAYES FACTOR---//
	// ////////////////////

	private void populateBayesFactorPanels() {

		holderPanel.removeAll();

		System.out.println("TODO");
	}

	// ///////////////////////
	// ---CONTINUOUS TREE---//
	// ///////////////////////

	private void populateContinuousTreePanels() {

		holderPanel.removeAll();

		System.out.println("TODO");
	}

	// ///////////////////
	// ---TIME SLICER---//
	// ///////////////////

	private void populateTimeSlicerPanels() {

		holderPanel.removeAll();

		System.out.println("TODO");
	}

	@Override
	public JComponent getExportableComponent() {
		return this;
	}// END: getExportableComponent

}// END: class
