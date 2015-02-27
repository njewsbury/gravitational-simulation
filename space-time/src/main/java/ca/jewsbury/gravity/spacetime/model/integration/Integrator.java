package ca.jewsbury.gravity.spacetime.model.integration;

import ca.jewsbury.gravity.spacetime.model.Orbital;

/**
 * Integrator.class
 *
 *
 *
 * 16-Feb-2015
 *
 * @author Nathan
 */
public interface Integrator {

    void moveContainedObjects(double timeDelta);

    void updateSinglePosition(Orbital orbital, double timeDelta);

    void updateOrbitalProperties(Orbital orbital, double timeDelta);

}
