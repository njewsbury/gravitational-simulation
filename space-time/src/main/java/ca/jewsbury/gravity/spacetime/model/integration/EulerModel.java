package ca.jewsbury.gravity.spacetime.model.integration;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.model.IntegrationModel;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.spacetime.properties.SpaceTimeConstants;
import java.util.Collection;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * EulerModel.class
 *
 *
 *
 * 16-Feb-2015
 *
 * @author Nathan
 */
public class EulerModel extends IntegrationModel {

    private final Logger logger = LoggerFactory.getLogger(EulerModel.class);

    @Override
    public void moveSingleObject(Orbital moveable) {
        SpaceTimeVector acceleration, velocity, position;
        SpaceTimeVector lastPosition;
        
        if (moveable != null && !moveable.isStatic()) {
            position = moveable.getPosition();
            velocity = moveable.getVelocity();
            acceleration = moveable.getAcceleration();

            lastPosition = new SpaceTimeVector(position);
            moveable.pushLastPosition(lastPosition);
            if (position != null && velocity != null) {
                position.translate(velocity);
            }
            if (velocity != null && acceleration != null) {
                velocity.translate(acceleration);
            }
        }
    }
}
