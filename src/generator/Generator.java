package generator;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;

import data.SpreadData;


/**
 * @author Andrew Rambaut
 * @version $Id$
 */
public interface Generator {
	
	public void generate(SpreadData data, File file) throws IOException;
	
}//END: interface
