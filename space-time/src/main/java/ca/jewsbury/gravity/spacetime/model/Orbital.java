package ca.jewsbury.gravity.spacetime.model;

import org.apache.commons.collections.buffer.CircularFifoBuffer;

/**
 * Orbital.class
 *
 *
 *
 * 3-Feb-2015
 *
 * @author Nathan
 */
public interface Orbital {

    String getIdName();

    void setRadius(double radius);

    double getRadius();

    void setMass(double mass);

    double getMass();

    void setVelocity(SpaceTimeVector velocity);

    SpaceTimeVector getVelocity();

    void increaseVelocity(SpaceTimeVector delta);

    SpaceTimeVector getPosition();

    void pushLastPosition(SpaceTimeVector position);

    CircularFifoBuffer getLastPositions();

    void setPosition(SpaceTimeVector position);

    SpaceTimeVector getAcceleration();

    void setAcceleration(SpaceTimeVector acceleration);

    boolean isStatic();

    String getAsciiRender();

    void moveObject(SpaceTimeVector displacement);

    double getKineticEnergy();

    double getPotentialEnergy();

    void setPotentialEnergy(double potential);

    @Override
    int hashCode();

    @Override
    boolean equals(Object obj);
    
    double distanceToOther(Orbital other);
    
    SpaceTimeVector getUnitVectorFacingOther(Orbital other);

}
