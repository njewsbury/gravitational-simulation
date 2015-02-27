package ca.jewsbury.gravity.spacetime.properties;

import ca.jewsbury.gravity.spacetime.SpaceTimeException;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * SpaceTimeConstants.class
 *
 *
 *
 * 3-Feb-2015
 *
 * @author Nathan
 */
public abstract class SpaceTimeConstants {

    private static final Logger logger = LoggerFactory.getLogger(SpaceTimeConstants.class);
    
    public static final double GRAVITATIONAL_CONSTANT = 10;
    //public static final double GRAVITATIONAL_CONSTANT = 6.67384E-11; //[[m^3 kg^-1 s^-2 ]]
    public static final double MASS_OF_EARTH = 5.972E24; //[[kg]]
    public static final double MEAN_RADIUS_OF_EARTH = 6.371E6; //[[m]]
    
    public static final double EARTH_SURFACE_GRAVITY = 9.81; //[[m/s^2]]
    
    public static final int PUSH_REQUEST_LIMIT = 50;
    
    
    /* UTIL FUNCTIONS */

    /**
     * Calculate the force of gravity between two objects.  O[1] is the reference frame object,
     * and O[2] is the other object, acting or being acted on.
     * 
     * The root equation for this is :: |F| = (-G*M1*M2) / (|R2-R1|^2)
     * The unit vector representing the direction of the force is:
     * F^ = (R2^ - R1^) / (|R2 - R1|)
     * 
     * This is wrong, calculate the Gravitational potential, then use the
     * negative gradient to solve for acceleration.
     * 
     * @param referenceFrame
     * @param other
     * @return 
     */
    @Deprecated
    public static SpaceTimeVector getGravitationalForce(Orbital referenceFrame, Orbital other) {
        SpaceTimeVector direction, force = null;
        double distance, magnitude;
        
        try {
            if (referenceFrame != null && other != null && referenceFrame != other) {
                distance = referenceFrame.getPosition().distanceTo(other.getPosition());
                magnitude = (-GRAVITATIONAL_CONSTANT) * referenceFrame.getMass() * other.getMass();
                magnitude = (magnitude / (distance*distance));
            
                direction = new SpaceTimeVector(referenceFrame.getPosition()); //R1^
                direction.parityOperator(); // -R1^
                direction.translate(other.getPosition()); // R2^ - R1^
                direction.transform((1.0/distance)); // ( R2^ - R1^ ) / |distance|
                
                force = new SpaceTimeVector(direction);
                force.transform(magnitude);  
                
            }
        } catch (SpaceTimeException e) {
            logger.error(e.getMessage());
        }
        return force;
    }
    
    public static double getGravitationalPotential(Orbital pointMass, Orbital orbital) {
        double distance, magnitude = 0.0;
        
        try {
            if( pointMass != null && orbital != null && pointMass != orbital ) {
                distance = orbital.getPosition().distanceTo(pointMass.getPosition());
                magnitude = (- GRAVITATIONAL_CONSTANT * pointMass.getMass()) / (distance);
            }
        } catch(SpaceTimeException e ) {
            logger.error(e.getMessage());
        }
        return magnitude;
    }
}
