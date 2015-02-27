package ca.jewsbury.gravity.spacetime.sim.model.satellite;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.SpaceTimeException;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.spacetime.properties.SpaceTimeConstants;
import ca.jewsbury.gravity.spacetime.sim.SimulationInterrupt;
import ca.jewsbury.gravity.spacetime.sim.SpaceTimeSimulation;
import java.util.Collection;
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
@Deprecated
public class SimpleModel extends SpaceTimeSimulation {

    private static final Logger logger = LoggerFactory.getLogger(SimpleModel.class);
    
    public SimpleModel(SpaceContainer container) {
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
        SpaceTimeVector singleAcceleration, totalAcceleration;
        Orbital active;
        double totalPotential, potential;
        
        if( objectList != null && objectList.size() > 0 ) {
            orbitalCollection = objectList.values();
            totalObjects = orbitalCollection.toArray( new Orbital[ orbitalCollection.size() ]);
            
            for( int i = 0; i < totalObjects.length; i++ ) {
                active = totalObjects[i];
                totalAcceleration = new SpaceTimeVector();
                totalPotential = 0.0;
                if( active != null && !active.isStatic() ) {
                    for( int j = 0; j < totalObjects.length; j++ ) {
                        if( i != j && totalObjects[j] != null) {
                            //
                            potential = SpaceTimeConstants.getGravitationalPotential(totalObjects[j], active);
                            totalPotential += potential;
                            singleAcceleration = findSingleAcceleration(totalObjects[j], active, potential);
                            //
                            totalAcceleration.translate(singleAcceleration);
                        }                        
                    }
                    active.setPotentialEnergy(totalPotential);
                    active.setAcceleration(totalAcceleration);
                }
            }
            for (Orbital current : totalObjects) {
                if (current != null) {
                    current.moveObject();
                }
            }
        }        
    }
    
    private SpaceTimeVector findSingleAcceleration( Orbital pointMass, Orbital active, double potential ) {
        SpaceTimeVector direction, singleVector = new SpaceTimeVector();
        double distance;
        
        if( pointMass != null && active != null ) {
            try {
                distance = active.getPosition().distanceTo(pointMass.getPosition());
                
                direction = new SpaceTimeVector(active.getPosition()); // R1
                direction.parityOperator(); //-R1
                direction.translate(pointMass.getPosition()); //R2-R1
                direction.normalize(); // r-hat
                
                potential = (potential / distance ); // -GM/r^2
                
                singleVector.translate(direction); //r-hat
                singleVector.transform(potential); //a vector
                
            } catch(SpaceTimeException e ) {
                logger.warn("Encountered exception finding acceleration :: " + e.getMessage());
            }
        }
        
        return singleVector;
    }

    @Override
    public void simulationInterrupt(SimulationInterrupt interrupt) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
