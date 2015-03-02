package ca.jewsbury.gravity.util.factory;

import ca.jewsbury.gravity.render.engine.SimulationSet;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * SimulationSet Factory
 *
 * Given a JSON file creates all required SimulationSets matching that JSON
 * definition. Adds all the found definitions to a HashMap to pass back to the
 * render frame.
 *
 * @author Nathan
 */
public class SimulationSetFactory {

    private static final Logger logger = LoggerFactory.getLogger(SimulationSetFactory.class);

    public static Map<String, SimulationSet> generateSimulationSetFromFile(String resourceName) {
        Map<String, SimulationSet> simSet = new HashMap<String, SimulationSet>();
        SimulationSet singleSimulation;
        JSONObject singleJson;
        JSONArray jsonArray;
        JSONTokener parser;
        Reader reader;

        if (StringUtils.isNotBlank(resourceName)) {
            reader = new BufferedReader(new InputStreamReader( SimulationSetFactory.class.getClassLoader().getResourceAsStream(resourceName)));
            
            try {
                if( !reader.ready()) { 
                    throw new IOException("Input stream reader is null.");
                }
                parser = new JSONTokener(reader);
                jsonArray = new JSONArray(parser);

                if (jsonArray.length() > 0) {
                    logger.debug("Parsed out default JSON.");
                    for (int i = 0; i < jsonArray.length(); i++) {
                        singleJson = jsonArray.getJSONObject(i);
                        if (singleJson != null && singleJson.get("simulationName") != null) {
                            singleSimulation = new SimulationSet(singleJson.getString("simulationName"));
                            singleSimulation.setSimulationDefinition(singleJson);
                            simSet.put(singleSimulation.getDisplayName(), singleSimulation);
                        }
                    }
                } else {
                    logger.warn("Unable to properly parse *.json file.");
                }
            } catch( IOException e ) {
                logger.error("Unable to open json resource file :: " + e.getMessage());
            } catch (JSONException e) {
                logger.error("Unable to parse resource file. :: " + e.getMessage());
            }

        }
        return simSet;
    }
}
