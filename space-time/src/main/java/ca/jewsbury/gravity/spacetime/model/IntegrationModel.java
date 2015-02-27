package ca.jewsbury.gravity.spacetime.model;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.SpaceTimeException;
import ca.jewsbury.gravity.spacetime.properties.SpaceTimeConstants;
import java.util.Collection;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * IntegrationModel.class
 *
 *
 *
 * 16-Feb-2015
 *
 * @author Nathan
 */
public abstract class IntegrationModel {

    private final Logger logger = LoggerFactory.getLogger(IntegrationModel.class);
    private final SpaceContainer container;

    public IntegrationModel(SpaceContainer container) {
        this.container = container;
    }

    public abstract void moveUniverseObjects();
    /*{

     for (Orbital current : totalObjects) {
     if (current != null) {
     moveSingleObject(current);
     }
     }
     }
     }
     */

    protected void updateAcceleration(Orbital obj) {
        Map<String, Orbital> objectList = container.getObjectList();
        Collection<Orbital> orbitalCollection;
        Orbital[] totalObjects;
        SpaceTimeVector singleAcceleration, totalAcceleration;
        double totalPotential, potential;

        if (objectList != null && objectList.size() > 0) {
            orbitalCollection = objectList.values();
            totalObjects = orbitalCollection.toArray(new Orbital[orbitalCollection.size()]);

            if (obj != null && !obj.isStatic()) {
                totalAcceleration = new SpaceTimeVector();
                totalPotential = 0.0;

                for (int j = 0; j < totalObjects.length; j++) {
                    if ( totalObjects[j] != null && !obj.equals(totalObjects[j])) {
                        //
                        potential = SpaceTimeConstants.getGravitationalPotential(totalObjects[j], obj);
                        totalPotential += potential;
                        singleAcceleration = findSingleAcceleration(totalObjects[j], obj, potential);

                        //
                        totalAcceleration.translate(singleAcceleration);
                    }
                }
                    //logger.info("Setting total potential :: " + totalPotential );
                //logger.info("Setting total acceller. :: " + totalAcceleration.toString());
                obj.setPotentialEnergy(totalPotential);
                obj.setAcceleration(totalAcceleration);
            }

        }
    }

    private SpaceTimeVector findSingleAcceleration(Orbital pointMass, Orbital active, double potential) {
        SpaceTimeVector direction, singleVector = new SpaceTimeVector();
        double distance;

        if (pointMass != null && active != null) {
            try {
                distance = active.getPosition().distanceTo(pointMass.getPosition());

                direction = new SpaceTimeVector(active.getPosition()); // R1
                direction.parityOperator(); //-R1
                direction.translate(pointMass.getPosition()); //R2-R1
                direction.normalize(); // r-hat

                potential = (potential / distance); // -GM/r^2

                singleVector.translate(direction); //r-hat
                singleVector.transform(potential); //a vector
                singleVector.parityOperator();

            } catch (SpaceTimeException e) {
                logger.warn("Encountered exception finding acceleration :: " + e.getMessage());
            }
        }

        return singleVector;
    }

    /*
     public void moveUniverseObjects(SpaceContainer container) {
     Map<String, Orbital> objectList = container.getObjectList();
     SpaceTimeVector singleObjectForce, totalObjectForce;
     Collection<Orbital> orbitalCollection;
     Orbital forceFeeler, activeOrbital;
     Orbital[] allOrbitals;

     if (objectList != null && objectList.size() > 0) {
     orbitalCollection = objectList.values();
     allOrbitals = orbitalCollection.toArray(new Orbital[orbitalCollection.size()]);

     for (int i = 0; i < allOrbitals.length; i++) {
     forceFeeler = allOrbitals[i];
     if (forceFeeler != null) {
     totalObjectForce = new SpaceTimeVector();

     for (int j = 0; j < allOrbitals.length; j++) {
     if (j != i && allOrbitals[j] != null) {
     activeOrbital = allOrbitals[j];
     //logger.info("Calculating force on '" + forceFeeler.getIdName() + "' by '" + activeOrbital.getIdName() + "'");
     singleObjectForce = SpaceTimeConstants.getGravitationalForce(activeOrbital, forceFeeler);
     if (singleObjectForce != null && !singleObjectForce.isZero()) {
     totalObjectForce.translate(singleObjectForce);
     }
     }
     }
     forceFeeler.setAcceleration(totalObjectForce);
     }
     }

     for (Orbital current : allOrbitals) {
     if (current != null) {
     moveSingleObject(current);
     }
     }
     }
     }
     */
    public abstract void moveSingleObject(Orbital moveable);
}
