package ca.jewsbury.gravity.render.engine;

import ca.jewsbury.gravity.util.enumerated.SpaceObjectProperty;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * DefaultSimulationSet.class
 *
 *
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public class DefaultSimulationSet extends SimulationSet {

    private final Logger logger = LoggerFactory.getLogger(DefaultSimulationSet.class);
    public static final String DEFAULT_IDENTIFIER = "Default";

    public DefaultSimulationSet() {
        super(DEFAULT_IDENTIFIER);
        initializeDefaultJson();
    }

    private void initializeDefaultJson() {
        JSONArray defaultObjects = new JSONArray();
        JSONObject spaceObject;
        simulationDefinition = new JSONObject();

        try {
            spaceObject = new JSONObject();
            spaceObject.put(SpaceObjectProperty.OBJECT_ID.getJsonProperty(), "earth");
            spaceObject.put(SpaceObjectProperty.OBJECT_MASS.getJsonProperty(), 100);
            spaceObject.put(SpaceObjectProperty.OBJECT_RADIUS.getJsonProperty(), 50);
            spaceObject.put(SpaceObjectProperty.IS_STATIC.getJsonProperty(), true);
            //
            spaceObject.put(SpaceObjectProperty.INITIAL_X.getJsonProperty(), 0.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_Y.getJsonProperty(), 0.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_Z.getJsonProperty(), 0.0);
            //
            spaceObject.put(SpaceObjectProperty.INITIAL_VX.getJsonProperty(), 0.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_VY.getJsonProperty(), 0.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_VZ.getJsonProperty(), 0.0);
            defaultObjects.put(spaceObject);

            spaceObject = new JSONObject();
            spaceObject.put(SpaceObjectProperty.OBJECT_ID.getJsonProperty(), "comet");
            spaceObject.put(SpaceObjectProperty.OBJECT_MASS.getJsonProperty(), 10);
            spaceObject.put(SpaceObjectProperty.OBJECT_RADIUS.getJsonProperty(), 20);
            spaceObject.put(SpaceObjectProperty.IS_STATIC.getJsonProperty(), false);
            //
            spaceObject.put(SpaceObjectProperty.INITIAL_X.getJsonProperty(), 200.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_Y.getJsonProperty(), 0.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_Z.getJsonProperty(), 0.0);
            //
            spaceObject.put(SpaceObjectProperty.INITIAL_VX.getJsonProperty(), 1.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_VY.getJsonProperty(), -2.0);
            spaceObject.put(SpaceObjectProperty.INITIAL_VZ.getJsonProperty(), 0.0);
            defaultObjects.put(spaceObject);

            simulationDefinition.put("objectList", defaultObjects);
        } catch (JSONException e) {
            logger.error("Unable to build default JSON definition.", e);
        }

    }
}
