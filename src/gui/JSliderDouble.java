
package gui;

import javax.swing.JSlider;


public class JSliderDouble extends JSlider {

	int orientation;
	double from; 
	double to; 
	double by; 
	double currentValue;
	
	public JSliderDouble(int orientation, double from, double to, double by, double currentValue) {
		
		this.orientation = orientation;
		this.from = from;
		this.to = to;
		this.by = by;
		this.currentValue = currentValue;
		
		
	}//END: Constructor
	
	public JSlider initiSlider() {

		JSlider slider = new JSlider(orientation);
		
		return null;
	}
	
	
}//END: class