package ca.jewsbury.gravity.spacetime.sim.test;

import ca.jewsbury.gravity.spacetime.Dimensional;
import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.SpaceTimeException;
import ca.jewsbury.gravity.spacetime.model.DynamicObject;
import ca.jewsbury.gravity.spacetime.model.MassiveObject;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.spacetime.properties.SpaceTimeConstants;
import ca.jewsbury.gravity.spacetime.sim.SpaceTimeSimulation;
import ca.jewsbury.gravity.spacetime.sim.model.satellite.SimpleSatelliteModel;
import junit.framework.Assert;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Nathan
 */
public class SimulationTest {
    
    private static final Logger logger = LoggerFactory.getLogger(SimulationTest.class);
    private final long TEST_CONTAINER_SIZE = 11;
    
    private SpaceTimeSimulation simulation;
    private SpaceContainer container;
    
    private Orbital earth, comet;
    
    public SimulationTest() {
    }
    
    @Before
    public void setUp() {
        container = new SpaceContainer(TEST_CONTAINER_SIZE, Dimensional.TwoD );
        Assert.assertEquals(TEST_CONTAINER_SIZE, container.getContainerSize());
        
        
        earth = new MassiveObject("earth");
        earth.setMass(30E7);
       
        
        comet = new DynamicObject("comet");
        comet.setMass(200.0);
        comet.setPosition(new SpaceTimeVector(4, 0.0 ));
        
        comet.setVelocity(new SpaceTimeVector(0.0, 1.0, 0.0));
        
        container.insertOrbital(earth);
        container.insertOrbital(comet);
        
        
        simulation = new SimpleSatelliteModel(container);
    }
    
    @Test
    public void testSimpleGravity() {
        double distance;
        logger.info("Starting gravity test.");
        logger.info(Double.toString(SpaceTimeConstants.MASS_OF_EARTH));
        SpaceTimeVector force = SpaceTimeConstants.getGravitationalForce(earth, comet);
        logger.info(force.toString());
        
        while( simulation.checkSimulationConditions() ) {
            simulation.simulationSingleStep();
            
            try {
                distance = (comet.getPosition().distanceTo(earth.getPosition()));
                if( distance <= 10000 ) {
                    logger.info("Prepare for impact.");
                    simulation.getTheUniverse().printUniverse();
                }
                logger.info( "A : " + comet.getAcceleration() );
                logger.info( "V : " + comet.getVelocity() );
                logger.info( "P : " + comet.getPosition() );
            } catch(SpaceTimeException e ) {
                //
            }
        }
        
    }
    
}
