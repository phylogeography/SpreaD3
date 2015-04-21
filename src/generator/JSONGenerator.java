package generator;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import com.fasterxml.jackson.databind.ObjectMapper;

import data.SpreadData;

public class JSONGenerator implements Generator {

	@Override
	public void generate(SpreadData data, File file) throws IOException {

		ObjectMapper mapper = new ObjectMapper();
		mapper.writeValue(file, data);
		
	}//END: generate

}//END: class
