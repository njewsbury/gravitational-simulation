package ca.jewsbury.gravity.spacetime.model;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
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

    public abstract void moveSingleObject(Orbital moveable);
}
