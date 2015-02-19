package ca.jewsbury.gravity.spacetime.sim.model.satellite;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.spacetime.properties.SpaceTimeConstants;
import ca.jewsbury.gravity.spacetime.sim.SimulationInterrupt;
import ca.jewsbury.gravity.spacetime.sim.SpaceTimeSimulation;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * SimpleSatelliteModel.class
 *
 * 
 *
 * 3-Feb-2015
 * @author Nathan
 */
public class SimpleSatelliteModel extends SpaceTimeSimulation {

    private static final Logger logger = LoggerFactory.getLogger(SimpleSatelliteModel.class);
    
    public SimpleSatelliteModel(SpaceContainer container) {
        super( container );        
        logger.info("Simple satellite model created!");
    }
    
    @Override
    public boolean checkSimulationConditions() {
        boolean continueSimulation = true;
        
        if( super.seconds >= 100 ) {
            continueSimulation = false;
        } else {
            if( super.getTheUniverse() == null ) {
                continueSimulation = false;
            } else {
                if( super.getTheUniverse().getObjectList() == null 
                        || super.getTheUniverse().getObjectList().size() <= 0 ) {
                    continueSimulation = false;
                }
            }
        }
        return continueSimulation;
    }

    @Override
    protected void moveUniverseObjects() {
        Map<String, Orbital> objectList = super.getTheUniverse().getObjectList();
        Collection<Orbital> orbitalCollection;
        Orbital[] totalObjects;
        SpaceTimeVector singleObjectForce, totalForce;
        Orbital active;
        
        if( objectList != null && objectList.size() > 0 ) {
            orbitalCollection = objectList.values();
            totalObjects = orbitalCollection.toArray( new Orbital[ orbitalCollection.size() ]);
            totalForce = new SpaceTimeVector();
            
            for( int i = 0; i < totalObjects.length; i++ ) {
                active = totalObjects[i];
                
                if( active != null && !active.isStatic() ) {
                    for( int j = 0; j < totalObjects.length; j++ ) {
                        if( i != j && totalObjects[j] != null) {
                            singleObjectForce = SpaceTimeConstants.getGravitationalForce(totalObjects[j], active);
                            if( singleObjectForce != null && !singleObjectForce.isZero() ) {
                                totalForce.translate(singleObjectForce);
                            }
                        }                        
                    }
                    active.setAcceleration(totalForce);
                }
            }
            for (Orbital current : totalObjects) {
                if (current != null) {
                    current.moveObject();
                }
            }
        }        
    }

    @Override
    public void simulationInterrupt(SimulationInterrupt interrupt) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
