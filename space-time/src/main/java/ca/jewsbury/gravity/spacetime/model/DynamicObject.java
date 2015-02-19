package ca.jewsbury.gravity.spacetime.model;

/**
 * DynamicObject.class
 *
 * 
 *
 * 3-Feb-2015
 * @author Nathan
 */
public class DynamicObject extends SpaceObject implements Orbital {

    public DynamicObject(String idName) {
        super(idName);
    }
    
    @Override
    public boolean isStatic() {
        return super.DYNAMIC_OBJECT;
    }

}
