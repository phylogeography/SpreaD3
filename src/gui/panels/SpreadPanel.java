package gui.panels;

import java.awt.Component;

import jam.panels.OptionsPanel;

@SuppressWarnings("serial")
public class SpreadPanel extends OptionsPanel {
	
	public void removeChildComponents(Component parentComponent) {

		Component[] components =  getComponents();
		int parentIndex = 0;
		int componentIndex = 0;
		for (Component component : components) {

//			System.out.println(component.toString());
			if (component.equals(parentComponent)) {

				parentIndex = componentIndex;

//				System.out.println("this is the parent component " + "index "
//						+ parentIndex);

				break;
			}// END: parent check

			componentIndex++;
		}// END: components loop

		componentIndex = 0;
		for (Component component : components) {

			if (componentIndex > parentIndex) {
				 remove(component);
			}// END: parent index check

			componentIndex++;
		}// END: components loop

	}// END: removeChildComponents
	
}//END: class
