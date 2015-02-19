package ca.jewsbury.gravity.util;

import ca.jewsbury.gravity.spacetime.model.DynamicObject;
import ca.jewsbury.gravity.spacetime.model.MassiveObject;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * SpaceObjectFactory.class
 *
 *
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public abstract class SpaceObjectFactory {

    private static final Logger logger = LoggerFactory.getLogger(SpaceObjectFactory.class);

    public static Orbital generateSpaceObject(JSONObject json)
            throws JSONException {
        Orbital newObject = null;
        SpaceTimeVector position, velocity;

        String objectId;
        boolean isStatic;
        double x, y, z;
        double vx, vy, vz;
        double mass, radius;

        if (json != null) {
            if (json.length() == SpaceObjectProperty.values().length) {
                objectId = json.getString(SpaceObjectProperty.OBJECT_ID.getJsonProperty());
                isStatic = json.getBoolean(SpaceObjectProperty.IS_STATIC.getJsonProperty());
                
                x = json.getDouble(SpaceObjectProperty.INITIAL_X.getJsonProperty());
                y = json.getDouble(SpaceObjectProperty.INITIAL_Y.getJsonProperty());
                z = json.getDouble(SpaceObjectProperty.INITIAL_Z.getJsonProperty());

                vx = json.getDouble(SpaceObjectProperty.INITIAL_VX.getJsonProperty());
                vy = json.getDouble(SpaceObjectProperty.INITIAL_VY.getJsonProperty());
                vz = json.getDouble(SpaceObjectProperty.INITIAL_VZ.getJsonProperty());

                mass = json.getDouble(SpaceObjectProperty.OBJECT_MASS.getJsonProperty());
                radius = json.getDouble(SpaceObjectProperty.OBJECT_RADIUS.getJsonProperty());

                if (StringUtils.isNotBlank(objectId)) {
                    position = new SpaceTimeVector(x, y, z);
                    velocity = new SpaceTimeVector(vx, vy, vz);
                    
                    if (isStatic) {
                        newObject = new MassiveObject(objectId);
                    } else {
                        newObject = new DynamicObject(objectId);
                    }
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
}
