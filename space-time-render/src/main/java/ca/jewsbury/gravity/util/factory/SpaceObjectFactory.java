package ca.jewsbury.gravity.util.factory;

import ca.jewsbury.gravity.spacetime.model.DynamicObject;
import ca.jewsbury.gravity.spacetime.model.MassiveObject;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.util.enumerated.SpaceObjectProperty;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * SpaceObjectFactory.class
 *
 * Given a particular JSON Object, create the associated Orbital object with
 * its defined properties.
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public abstract class SpaceObjectFactory {

    private static final Logger logger = LoggerFactory.getLogger(SpaceObjectFactory.class);
    private static int unknownObjectCount = 0;

    public static Orbital generateSpaceObject(JSONObject json)
            throws JSONException {
        Orbital newObject = null;
        SpaceTimeVector position, velocity;

        String objectId;
        boolean isStatic, isReference;
        double x, y, z;
        double vx, vy, vz;
        double mass, radius;

        if (json != null) {
            if (json.length() > 0) {
                try {
                    objectId = json.getString(SpaceObjectProperty.OBJECT_ID.getJsonProperty());
                } catch (JSONException e) {
                    logger.warn("Caught JSON Exception parsing objectId. :: " + e.getMessage());
                    objectId = "unknownObject" + unknownObjectCount;
                    unknownObjectCount++;
                }

                try {
                    isStatic = json.getBoolean(SpaceObjectProperty.IS_STATIC.getJsonProperty());
                } catch (JSONException e) {
                    logger.warn("Caught JSONException parsing isStatic. Setting to true. :: " + e.getMessage());
                    isStatic = true;
                }
                
                try {
                    isReference = json.getBoolean(SpaceObjectProperty.IS_REFERENCE.getJsonProperty());
                } catch( JSONException e ) {
                    isReference = false;
                }

                x = getValueFromJson(json, SpaceObjectProperty.INITIAL_X.getJsonProperty(), 0.0);
                y = getValueFromJson(json, SpaceObjectProperty.INITIAL_Y.getJsonProperty(), 0.0);
                z = getValueFromJson(json, SpaceObjectProperty.INITIAL_Z.getJsonProperty(), 0.0);

                vx = getValueFromJson(json, SpaceObjectProperty.INITIAL_VX.getJsonProperty(), 0.0);
                vy = getValueFromJson(json, SpaceObjectProperty.INITIAL_VY.getJsonProperty(), 0.0);
                vz = getValueFromJson(json, SpaceObjectProperty.INITIAL_VZ.getJsonProperty(), 0.0);

                mass = getValueFromJson(json, SpaceObjectProperty.OBJECT_MASS.getJsonProperty(), 1.0);
                radius = getValueFromJson(json, SpaceObjectProperty.OBJECT_RADIUS.getJsonProperty(), 1.0);

                if (StringUtils.isNotBlank(objectId)) {
                    position = new SpaceTimeVector(x, y, z);
                    velocity = new SpaceTimeVector(vx, vy, vz);

                    if (isStatic) {
                        newObject = new MassiveObject(objectId);
                    } else {
                        newObject = new DynamicObject(objectId);
                    }
                    newObject.setReferenceObject(isReference);
                    newObject.setMass(mass);
                    newObject.setRadius(radius);
                    newObject.setPosition(position);
                    newObject.setVelocity(velocity);
                } else {
                    logger.warn("Unable to build SpaceObject, ObjectID was null.");
                }
            } else {
                logger.error("JSON Definition is missing parameters.\n" + json.toString(1));
            }
        } else {
            logger.error("Given JSON was null.");
        }
        return newObject;
    }

    private static double getValueFromJson(JSONObject json, String key, double fallback) {
        double rtnVal = fallback;
        double temp;

        if (key != null && json != null) {
            try {
                temp = json.getDouble(key);
                rtnVal = temp;
            } catch (JSONException e) {
                logger.warn("Caught JSON Exception parsing '" + key + "' :: " + e.getMessage());
            }
        }
        return rtnVal;
    }
}
