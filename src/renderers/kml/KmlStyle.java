package renderers.kml;

import java.awt.Color;

/**
 * @author Andrew Rambaut
 * @version $Id$
 */
public class KmlStyle extends kmlframework.kml.Style {

	private final Color strokeColor;
	private final Double strokeWidth;
	private final Color fillColor;

	public KmlStyle(final Color fillColor) {
		this(null, null, fillColor);
	}

	public KmlStyle(final Color strokeColor, final Double strokeWidth) {
		this(strokeColor, strokeWidth, null);
	}

	public KmlStyle(final Color strokeColor, final Double strokeWidth,
			final Color fillColor) {
		this.strokeColor = strokeColor;
		this.strokeWidth = strokeWidth;
		this.fillColor = fillColor;
	}

	public Color getStrokeColor() {
		return strokeColor;
	}

	public double getStrokeWidth() {
		return strokeWidth;
	}

	public Color getFillColor() {
		return fillColor;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((fillColor == null) ? 0 : fillColor.hashCode());
		result = prime * result
				+ ((strokeColor == null) ? 0 : strokeColor.hashCode());
		result = prime * result
				+ ((strokeWidth == null) ? 0 : strokeWidth.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		KmlStyle other = (KmlStyle) obj;
		if (fillColor == null) {
			if (other.fillColor != null)
				return false;
		} else if (!fillColor.equals(other.fillColor))
			return false;
		if (strokeColor == null) {
			if (other.strokeColor != null)
				return false;
		} else if (!strokeColor.equals(other.strokeColor))
			return false;
		if (strokeWidth == null) {
			if (other.strokeWidth != null)
				return false;
		} else if (!strokeWidth.equals(other.strokeWidth))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return "KmlStyle [strokeColor=" + strokeColor + ", strokeWidth="
				+ strokeWidth + ", fillColor=" + fillColor + "]";
	}

}//END: class
