package test;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;


public class Test {

	public static void main(String[] args) throws JsonMappingException, JsonGenerationException {
		
		 try {
		
		  ObjectMapper mapper = new ObjectMapper();
		  
		  Map<String,Object> userData = new HashMap<String,Object>();
		  Map<String,String> nameStruct = new HashMap<String,String>();
		  
		  nameStruct.put("first", "Joe");
		  nameStruct.put("last", "Sixpack");
		  
		  userData.put("name", nameStruct);
		  userData.put("gender", "MALE");
		  userData.put("verified", Boolean.FALSE);
		  
		  
			mapper.writeValue(new File("test.json"), userData);
			
			System.out.println("Finished");
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		  
	}//END: main

}//END: class
