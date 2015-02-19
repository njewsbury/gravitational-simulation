package ca.jewsbury.gravity.spacetime.model;

import org.apache.commons.collections.buffer.CircularFifoBuffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * StaticObject.class
 *
 *
 *
 * 3-Feb-2015
 *
 * @author Nathan
 */
public abstract class SpaceObject implements Orbital {

    private final Logger logger = LoggerFactory.getLogger(SpaceObject.class);
    private final int SAVE_LAST_POSITIONS = 1000;

    protected final boolean STATIC_OBJECT = true;
    protected final boolean DYNAMIC_OBJECT = false;

    protected final String idName;

    protected double radius; //meters [[m]]
    protected double mass; //kilograms [[kg]]

    protected CircularFifoBuffer lastPositions;
    protected SpaceTimeVector position; //meters
    protected SpaceTimeVector velocity; //meters per second [[m/s]]
    protected SpaceTimeVector acceleration; //meters per second squared [[ m/s^2 ]]

    public SpaceObject(String idName) {
        this.idName = idName;

        position = new SpaceTimeVector();
        lastPositions = new CircularFifoBuffer(SAVE_LAST_POSITIONS);
        velocity = new SpaceTimeVector();
        acceleration = new SpaceTimeVector();
        radius = 1.0;
        mass = 1.0;
    }

    /**
     * velocity + delta
     *
     * @param delta
     */
    @Override
    public void increaseVelocity(SpaceTimeVector delta) {
        if (!isStatic()) {
            this.velocity.translate(delta);
        } else {
            logger.warn("Attempted to increase the velocity of a static object.");
        }
    }

    @Override
    public void moveObject() {
        SpaceTimeVector lastPosition;
        if(!isStatic()) {
            lastPosition = new SpaceTimeVector(position);
            this.lastPositions.add(lastPosition);
            
            if(!acceleration.isZero()) {
                velocity.translate(acceleration);
            }
            if(!velocity.isZero()) {
                position.translate(velocity);
            }
        } // else :: static objects dont move!
    }
    
    @Override
    public void pushLastPosition(SpaceTimeVector position) {
        this.lastPositions.add(position);
    }
    
    @Override
    public double getKineticEnergy() {
        double kineticEnergy = 0.0;
        
        if(!this.isStatic()) {
            kineticEnergy = (0.5)*this.mass*(this.velocity.getVectorSquared());
        }        
        return kineticEnergy;
    }
    
    @Override
    public double getPotentialEnergy() {
        return 0.0;
    }

    /* *** ACCESSORS AND MUTATORS *** */
    
    @Override
    public String getIdName() {
        return idName;
    }
    
    @Override
    public String getAsciiRender() {
        return " " + Character.toString(idName.charAt(0)).toUpperCase() + " ";        
    }

    @Override
    public double getRadius() {
        return radius;
    }

    @Override
    public void setRadius(double radius) {
        this.radius = radius;
    }

    @Override
    public double getMass() {
        return mass;
    }

    @Override
    public void setMass(double mass) {
        this.mass = mass;
    }

    @Override
    public SpaceTimeVector getVelocity() {
        return velocity;
    }

    @Override
    public void setVelocity(SpaceTimeVector velocity) {
        this.velocity = velocity;
    }
    
    @Override
    public CircularFifoBuffer getLastPositions() {
        return lastPositions;
    }

    @Override
    public SpaceTimeVector getPosition() {
        return position;
    }

    @Override
    public void setPosition(SpaceTimeVector position) {
        this.position = position;
    }

    @Override
    public SpaceTimeVector getAcceleration() {
        return acceleration;
    }

    @Override
    public void setAcceleration(SpaceTimeVector acceleration) {
        this.acceleration = acceleration;
    }

}
