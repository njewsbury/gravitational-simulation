package ca.jewsbury.gravity.util.factory;

import ca.jewsbury.gravity.render.engine.SimulationSet;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Nathan
 */
public class SimulationSetFactory {
    
    private static final Logger logger = LoggerFactory.getLogger(SimulationSetFactory.class);

    public static Map<String, SimulationSet> generateSimulationSetFromFile(URL resource) {
        Map<String, SimulationSet> simSet = new HashMap<String, SimulationSet>();
        SimulationSet singleSimulation;
        JSONObject singleJson;
        JSONArray jsonArray;
        JSONTokener parser;
        
        if (resource != null) {
            try {
                parser = new JSONTokener(new FileReader(new File(resource.getFile())));
                jsonArray = new JSONArray(parser);

                if (jsonArray.length() > 0) {
                    logger.debug("Parsed out default JSON.");
                    for( int i = 0; i < jsonArray.length(); i++ ) {
                        singleJson = jsonArray.getJSONObject(i);
                        if( singleJson != null && singleJson.get("simulationName") != null ) {
                            singleSimulation = new SimulationSet(singleJson.getString("simulationName"));
                            singleSimulation.setSimulationDefinition(singleJson);
                            simSet.put(singleSimulation.getDisplayName(), singleSimulation);
                        }
                    }
                } else {
                    logger.warn("Unable to properly parse *.json file.");
                }
            } catch (FileNotFoundException e) {
                logger.error("Unable to locate resource file '" + resource.getFile() + "'");
            } catch (JSONException e) {
                logger.error("Unable to parse resource file. :: " + e.getMessage());
            }

        }
        return simSet;
    }
}
