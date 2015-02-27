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
    
    public static final int PUSH_REQUEST_LIMIT = 15;

}
