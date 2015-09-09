package data.structure.attributable;

import java.util.LinkedHashMap;
import java.util.Map;

public class Line {

	private final String startNodeId;
	private final String endNodeId;

	private final String startTime;
	private final String endTime;
	
	private final Map<String, Object> attributes = new LinkedHashMap<String, Object>();
	
	public Line(String startNodeId, //
			String endNodeId, //
			String startTime, //
			String endTime, //
			Map<String, Object> attributes //
	) {

		this.startNodeId = startNodeId;
		this.endNodeId = endNodeId;

		this.startTime = startTime;
		this.endTime = endTime;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}// END: Constructor

	public Line(String startNodeId, //
			String endNodeId, //
			Map<String, Object> attributes //
	) {

		this.startNodeId = startNodeId;
		this.endNodeId = endNodeId;

		this.startTime = null;
		this.endTime = null;

		if (attributes != null) {
			this.attributes.putAll(attributes);
		}

	}

	public String getStartTime() {
		return startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public String getStartNodeId() {
		return startNodeId;
	}

	public String getEndNodeId() {
		return endNodeId;
	}

	public Map<String, Object> getAttributes() {
		return attributes;
	}

}// END: class
