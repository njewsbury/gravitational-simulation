package ca.jewsbury.gravity.spacetime.model.integration;

import ca.jewsbury.gravity.spacetime.model.IntegrationModel;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;

/**
 *
 * @author Nathan
 */
public class SymplecticModel extends IntegrationModel {

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
