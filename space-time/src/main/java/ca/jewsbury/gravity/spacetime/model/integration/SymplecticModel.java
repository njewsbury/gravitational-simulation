package ca.jewsbury.gravity.spacetime.model.integration;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Nathan
 */
public class SymplecticModel implements Integrator {

    private final Logger logger = LoggerFactory.getLogger(VerletModel.class);
    private final SpaceContainer container;

    public SymplecticModel(SpaceContainer container) {
        this.container = container;
    }

    @Override
    public void moveContainedObjects(double timeDelta) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void updateSinglePosition(Orbital orbital, double timeDelta) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void updateOrbitalProperties(Orbital orbital, double timeDelta) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
