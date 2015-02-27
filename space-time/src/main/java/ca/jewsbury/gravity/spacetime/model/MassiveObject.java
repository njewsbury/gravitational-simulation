package ca.jewsbury.gravity.spacetime.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * MassiveObject.class
 *
 *
 *
 * 3-Feb-2015
 *
 * @author Nathan
 */
public class MassiveObject extends SpaceObject implements Orbital {

    private Logger logger = LoggerFactory.getLogger(MassiveObject.class);
    
    public MassiveObject(String idName) {
        super(idName);
    }

    @Override
    public boolean isStatic() {
        return super.STATIC_OBJECT;
    }
    /*
    @Override
    public void setPosition(SpaceTimeVector pos ) {
       logger.error("Attempted to set massive object position.");
    }
    
    @Override
    public void moveObject(SpaceTimeVector pos ) {
        logger.error("Attempted to move a massive object.");
    }
    */
}
