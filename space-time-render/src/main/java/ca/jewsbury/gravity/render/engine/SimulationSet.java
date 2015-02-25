package ca.jewsbury.gravity.render.engine;

import org.json.JSONObject;

/**
 * SimulationSet.class
 *
 *
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public class SimulationSet {

    private final String displayName;
    protected JSONObject simulationDefinition;

    public SimulationSet(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
    
    public JSONObject getSimulationDefinition() {
        return simulationDefinition;
    }
    
    public void setSimulationDefinition(JSONObject json) {
        this.simulationDefinition = json;
    }
}
