#!/bin/bash

if [ $# -ne 2 ]; then 
	echo "Usage $0 <mccTree> <most recent tipdate (yyyy-mm-dd)>" 
	exit 
fi

# mrsd = 2014-03-27

mccTree="$1"
mrsd="$2"

JAR="/bioSoft/spread2_0.0.1.jar"
#DIR=`pwd` #not necessary

################################################################################
#								DISCRETE TRAIT								   #
################################################################################

#########
#parsing# 
#########
locationsFile="locations.txt"
intervals=10
trait="location" 
#trait on website = 'states' -> many first time users will find 
#'exceptions.AnalysisException: Attribute states missing from the node.' on 
# their way. Explicitly mention this should refer to the exact trait name 
# in the manual
outFormatParse="json"
outFileParsing="discrete_parsed".${outFormatParse}

#java -jar ${JAR} -parse -locations ${locationsFile} -tree ${mccTree} \
#-locationtrait ${trait} -intervals ${intervals} -mrsd ${mrsd} \
#-output ${outFileParsing}

# in the JSON file it seems the polygon start times are not corresponding with the 
# node ages?

###########
#rendering# 
###########
outFormatRender="kml"
outFileRendering="discrete_rendered".${outFormatRender}

java -jar ${JAR} -render ${outFormatRender} -json ${outFileParsing} \
-output ${outFileRendering}


#In rendering mode
#Exception in thread "main" java.lang.IllegalArgumentException: Invalid format: ""
#	at org.joda.time.format.DateTimeParserBucket.doParseMillis(DateTimeParserBucket.java:187)
#	at org.joda.time.format.DateTimeFormatter.parseMillis(DateTimeFormatter.java:780)
#	at org.joda.time.convert.StringConverter.getInstantMillis(StringConverter.java:65)
#	at org.joda.time.base.BaseDateTime.<init>(BaseDateTime.java:175)
#	at org.joda.time.DateTime.<init>(DateTime.java:257)
#	at renderers.kml.KmlRenderer.generateLine(KmlRenderer.java:649)
#	at renderers.kml.KmlRenderer.generateLines(KmlRenderer.java:302)
#	at renderers.kml.KmlRenderer.generateLayer(KmlRenderer.java:142)
#	at renderers.kml.KmlRenderer.render(KmlRenderer.java:97)
#	at app.Spread2ConsoleApp.run(Spread2ConsoleApp.java:1241)
#	at app.Spread2App.main(Spread2App.java:35)
#

