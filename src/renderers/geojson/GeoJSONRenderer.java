package renderers.geojson;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import data.SpreadData;
import data.structure.*;
import exceptions.MissingAttributeException;
import kmlframework.kml.KmlException;
import renderers.Renderer;
import settings.Settings;
import settings.rendering.GeoJSONRendererSettings;
import settings.rendering.KmlRendererSettings;

import java.io.*;
import java.util.ArrayList;
import java.util.LinkedList;

/**
 * @author Guy Baele
 */
public class GeoJSONRenderer implements Renderer {

    private SpreadData data;
    private GeoJSONRendererSettings settings;
    private LinkedList<Location> locations;
    private LinkedList<Layer> layers;

    public GeoJSONRenderer (SpreadData data, GeoJSONRendererSettings settings) {

        this.data = data;
        this.settings = settings;
        this.locations = (LinkedList)data.getLocations();
        this.layers = (LinkedList)data.getLayers();

    }

    @Override
    public void render() throws  IOException, MissingAttributeException {

        PrintWriter writer = new PrintWriter(new File("test.geo.json"));

        //GeoJSON only has 1 layer, write as FeatureCollection array?
        for (Layer l : layers) {

            writer.write("{\"type\":\"FeatureCollection\",\"features\":[\n");

            //Get the polygons and lines
            ArrayList<Polygon> polygonList = (ArrayList)l.getPolygons();
            ArrayList<Line> lineList = (ArrayList)l.getLines();

            //Get an idea of the times
            ArrayList<Double> times = new ArrayList<Double>();

            //Write the polygons to file
            for (int j = 0; j < polygonList.size(); j++) {

                Polygon p = polygonList.get(j);

                if (!times.contains(p.getTime())) {
                    times.add(p.getTime());
                }

                writer.write("{\"type\":\"Feature\",");
                //writer.write("\"id\":" + p.getLocationId());
                //writer.write("\"time\":" + p.getTime());
                writer.write("\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[");

                ArrayList<Coordinate> coordinateList = (ArrayList)p.getCoordinates();
                for (int i = 0; i < coordinateList.size(); i++) {
                    Coordinate c = coordinateList.get(i);
                    writer.write("[");
                    //longitude first, then latitude, then altitude
                    writer.write(c.getLongitude() + "," + c.getLatitude());
                    writer.write("]");
                    if (i < coordinateList.size()-1) {
                        writer.write(",");
                    }
                }

                writer.write("]]}}");

                if (j < polygonList.size()-1) {
                    writer.write(",\n");
                }

            }

            if (lineList.size() > 0) {
                writer.write(",\n");
            }

            //Write the lines to file
            for (int j = 0; j < lineList.size(); j++) {

                Line line = lineList.get(j);
                writer.write("{\"type\":\"Feature\",");
                writer.write("\"geometry\":{\"type\":\"LineString\",\"coordinates\":[");

                Coordinate startCoordinate = line.getStartCoordinate();
                Coordinate endCoordinate = line.getEndCoordinate();

                writer.write("[");
                //longitude first, then latitude, then altitude
                writer.write(startCoordinate.getLongitude() + "," + startCoordinate.getLatitude());
                writer.write("],[");
                writer.write(endCoordinate.getLongitude() + "," + endCoordinate.getLatitude());
                writer.write("]");

                writer.write("]}}");

                if (j < lineList.size()-1) {
                    writer.write(",\n");
                }

            }

            writer.write("\n]}\n");

            /*System.out.println("Sampled times:");
            for (double t : times) {
                System.out.println(t);
            }*/

        }

        writer.flush();
        writer.close();

    }

    public static void main(String[] args) {

        /*
        use all default settings
        -render -json /path/test_host.json -output test.kml
         */

        Settings settings = new Settings();
        settings.render = true;
        settings.kmlRendererSettings = new KmlRendererSettings();
        settings.kmlRendererSettings.json = "/Users/guybaele/Documents/workspace/SPREAD2/src/test_host.json";

        try {

            Reader reader = new FileReader(settings.kmlRendererSettings.json);
            Gson gson = new GsonBuilder().create();
            SpreadData input = gson.fromJson(reader, SpreadData.class);

            //KmlRenderer renderer = new KmlRenderer(input, settings.kmlRendererSettings);
            //renderer.render();

            GeoJSONRenderer geojson = new GeoJSONRenderer(input, settings.geoJSONRendererSettings);
            geojson.render();

        } catch (FileNotFoundException fnf) {
            System.err.println(fnf);
//        } catch (KmlException ke) {
//            System.err.println(ke);
        } catch (IOException ioe) {
            System.err.println(ioe);
        } catch (MissingAttributeException mae) {
            System.err.println(mae);
        }

        System.out.println("Rendered GeoJSON");

    }

}
