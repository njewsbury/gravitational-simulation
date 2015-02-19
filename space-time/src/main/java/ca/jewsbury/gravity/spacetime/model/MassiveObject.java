package ca.jewsbury.gravity.spacetime.model;

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

    public MassiveObject(String idName) {
        super(idName);
    }

    @Override
    public boolean isStatic() {
        return super.STATIC_OBJECT;
    }

}
